/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateplugin-tests', function (Y) {
    var createContentActionEvent, registerTest, createContentEvent,
        loadTest, nextServiceTest, registerContentTypeTest,
        Assert = Y.Assert, Mock = Y.Mock;

    createContentActionEvent = new Y.Test.Case({
        name: 'eZ Create Content plugin create content action event tests',

        setUp: function () {
            var defaultLanguageCode = 'eng-GB';

            this.appMock = new Y.Test.Mock();
            Y.Mock.expect(this.appMock, {
                method: 'get',
                args: ['contentCreationDefaultLanguageCode'],
                returns: defaultLanguageCode,
            });
            this.service = new Y.eZ.ViewService({
                app: this.appMock,
            });
            this.service.contentType = new Mock();

            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);

            this.plugin = new Y.eZ.Plugin.ContentCreate({host: this.service});
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            this.view.destroy();
            delete this.service;
            delete this.view;
            delete this.plugin;
            delete this.app;
        },

        'Should not load the content types if the view is not expanded': function () {
            Mock.expect(this.service.contentType, {
                method: 'loadAllContentTypes',
                args: [Mock.Value.Function],
                callCount: 0,
            });
            this.view.set('expanded', false);
            this.view.fire('whatever:createContentAction');

            Mock.verify(this.service.contentType);
        },

        'Should load the content type groups and content types': function () {
            var loadedGroups = [];

            Mock.expect(this.service.contentType, {
                method: 'loadAllContentTypes',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(false, loadedGroups);
                },
            });
            this.view.set('expanded', true);
            this.view.fire('whatever:createContentAction');

            Y.Assert.isFalse(
                this.view.get('loadingError'),
                "The loading error flag of the view should be set to false"
            );

            Assert.areSame(
                loadedGroups,
                this.view.get('contentTypeGroups'),
                "The groups should be available in the view"
            );
        },

        'Should handle the error while loading the content types': function () {
            Mock.expect(this.service.contentType, {
                method: 'loadAllContentTypes',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(true);
                },
            });

            this.view.set('expanded', true);
            this.view.fire('whatever:createContentAction');

            Y.Assert.isTrue(
                this.view.get('loadingError'),
                "The loading error flag of the view should be set to true"
            );
        },
    });

    createContentEvent = new Y.Test.Case({
        name: 'eZ Create Content plugin create content event tests',

        setUp: function () {
            var defaultLanguageCode = 'eng-GB';
            this.app = new Mock();

            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['contentCreationDefaultLanguageCode'],
                returns: defaultLanguageCode,
            });
            this.service = new Y.eZ.ViewService({
                app: this.app,
            });
            this.plugin = new Y.eZ.Plugin.ContentCreate({host: this.service});
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;
            delete this.app;
        },

        "Should navigate to the create content route with event paramters": function () {
            var type = {}, location = {}, languageCode = 'ger-DE',
                createRouteUri = "/create";

            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['createContent'],
                returns: createRouteUri,
            });
            Mock.expect(this.app, {
                method: 'navigate',
                args: [createRouteUri],
            });
            this.service.set('location', location);
            this.service.fire('whatever:createContent', {
                contentType: type,
                languageCode: languageCode,
            });

            Mock.verify(this.app);

            Assert.areSame(
                type, this.plugin.get('contentType'),
                "The content type should be stored in the plugin"
            );
            Assert.areSame(
                location, this.plugin.get('parentLocation'),
                "The location should be stored in the plugin"
            );
            Assert.areNotSame(
                languageCode, this.plugin.get('languageCode'),
                "The languageCode event parameter should be ignored"
            );
        },
    });

    nextServiceTest = new Y.Test.Case({
        name: 'eZ Create Content plugin setNextViewServiceParameters test',

        setUp: function () {
            var defaultLanguageCode = 'fre-FR';
            this.app = new Mock();

            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['contentCreationDefaultLanguageCode'],
                returns: defaultLanguageCode,
            });
            this.service = new Y.eZ.ViewService({
                app: this.app,
            });
            this.plugin = new Y.eZ.Plugin.ContentCreate({host: this.service});
        },

        tearDown: function () {
            this.plugin.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.service;
            delete this.app;
        },

        "Should not do anything by default": function () {
            var nextService = new Y.Base(),
                languageCode = 'fre-FR';

            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['contentCreationDefaultLanguageCode'],
                returns: languageCode
            });

            this.plugin.setNextViewServiceParameters(nextService);
            Assert.isUndefined(
                nextService.get('contentType'),
                "The content type should not be set"
            );
            Assert.isUndefined(
                nextService.get('parentLocation'),
                "The parent location should not be set"
            );
            Assert.isUndefined(
                nextService.get('languageCode'),
                "The language code should not be set"
            );
        },

        "Should configure the next service if the create parameter were retrieved": function () {
            var nextService = new Y.Base(),
                type = {}, location = {}, languageCode = 'fre-FR';

            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['contentCreationDefaultLanguageCode'],
                returns: languageCode
            });

            this.plugin.setAttrs({
                contentType: type,
                languageCode: languageCode,
                parentLocation: location
            });
            this.plugin.setNextViewServiceParameters(nextService);
            Assert.areSame(
                type, nextService.get('contentType'),
                "The content type should be passed to the next service"
            );
            Assert.areSame(
                languageCode, nextService.get('languageCode'),
                "The languageCode should be passed to the next service"
            );
            Assert.areSame(
                location, nextService.get('parentLocation'),
                "The location should be passed to the next service"
            );
        }
    });

    loadTest = new Y.Test.Case({
        name: 'eZ Create Content plugin create load tests',

        setUp: function () {
            var defaultLanguageCode = 'fre-FR';

            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['contentCreationDefaultLanguageCode'],
                returns: defaultLanguageCode,
            });

            this.service = new Y.eZ.ViewService({
                app: this.app,
            });
            this.plugin = new Y.eZ.Plugin.ContentCreate({host: this.service});
        },

        tearDown: function () {
            this.plugin.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.service;
        },

        "Should reinitialize its attribute on load": function () {
            var callback = false,
                plugin = this.plugin;

            plugin.set('contentType', {});
            plugin.set('parentLocation', {});
            plugin.parallelLoad(function () {
                callback = true;
                Assert.isUndefined(
                    plugin.get('contentType'),
                    "The content type should be reinitialized"
                );
                Assert.isUndefined(
                    plugin.get('parentLocation'),
                    "The parent location should be reinitialized"
                );
            });

            Assert.isTrue(callback, "The callback should have been called");
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentCreate;
    registerTest.components = ['locationViewViewService'];

    registerContentTypeTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerContentTypeTest.Plugin = Y.eZ.Plugin.ContentType;
    registerContentTypeTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName('eZ Content Create Plugin tests');
    Y.Test.Runner.add(createContentActionEvent);
    Y.Test.Runner.add(createContentEvent);
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(nextServiceTest);
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(registerContentTypeTest);
}, '', {
    requires: ['test', 'base', 'ez-contentcreateplugin', 'ez-pluginregister-tests', 'view', 'ez-viewservice']
});

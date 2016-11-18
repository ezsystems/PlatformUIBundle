/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-objectrelationloadplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Object Relation Load Plugin event tests",

        setUp: function () {
            Y.eZ.Content = function () {};
            this.relatedContent = new Y.Mock();
            this.destinationHref = "/my/content/24";
            this.fieldDefinitionIdentifier = 'super_attribut_relation';
            this.relationId = 42;

            this.content = new Mock();
            Mock.expect(this.content, {
                method: 'relations',
                args: ['ATTRIBUTE', this.fieldDefinitionIdentifier],
                returns: [{destination: this.destinationHref}],
            });

            this.capi = {};
            this.service = new Y.Base();

            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.set('destinationContent', null);
            this.view.addTarget(this.service);

            this.service.set('capi', this.capi);

            this.plugin = new Y.eZ.Plugin.ObjectRelationLoad({
                host: this.service,
            });
            this.plugin._set('relatedContent', this.relatedContent);
        },

        tearDown: function () {
            delete Y.eZ.Content;
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
            delete this.relatedContent;
        },

        _mockRelatedContent: function (loadError) {
            Mock.expect(this.relatedContent, {
                method: 'set',
                args: ['id', this.destinationHref],
            });
            Mock.expect(this.relatedContent, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capi,
                        options.api,
                        'the CAPI should be passed in the options'
                    );
                    callback(loadError);
                }, this),
            });
        },

        "Should load the related content on `loadFieldRelatedContent` event": function () {
            var initialLoadingError = this.view.get('loadingError');

            this._mockRelatedContent(false);
            this.view.fire('loadFieldRelatedContent', {
                fieldDefinitionIdentifier: this.fieldDefinitionIdentifier,
                content: this.content,
            });
            Mock.verify(this.content);
            Assert.areSame(
                this.relatedContent,
                this.view.get('destinationContent'),
                "The view should get the related content"
            );
            Assert.areSame(
                initialLoadingError,
                this.view.get('loadingError'),
                "The loadingError should stay the same"
            );
            Y.Mock.verify(this.relatedContent);
        },

        "Should pick the source content from the view service `content` attribute": function () {
            var initialLoadingError = this.view.get('loadingError');

            this.service.set('content', this.content);
            this._mockRelatedContent(false);

            this.view.fire('loadFieldRelatedContent', {
                fieldDefinitionIdentifier: this.fieldDefinitionIdentifier,
            });
            Mock.verify(this.content);
            Assert.areSame(
                this.relatedContent,
                this.view.get('destinationContent'),
                "The view should get the related content"
            );
            Assert.areSame(
                initialLoadingError,
                this.view.get('loadingError'),
                "The loadingError should stay the same"
            );
            Mock.verify(this.relatedContent);
        },

        "Should handle loading error while loading related content": function () {
            var initialDest = this.view.get('destinationContent');

            this._mockRelatedContent(true);

            this.view.fire('loadFieldRelatedContent', {
                fieldDefinitionIdentifier: this.fieldDefinitionIdentifier,
                content: this.content,
            });
            Assert.areSame(
                initialDest,
                this.view.get('destinationContent'),
                "The destinationContent should stay the same"
            );
            Assert.isTrue(this.view.get('loadingError'), "The loadingError should be true");
            Y.Mock.verify(this.relatedContent);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ObjectRelationLoad;
    registerTest.components = [
        'locationViewViewService', 'contentEditViewService', 'contentPeekViewService',
    ];

    Y.Test.Runner.setName("eZ Object Relation Load Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-objectrelationloadplugin', 'ez-pluginregister-tests']});

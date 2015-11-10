/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-copycontentplugin-tests', function (Y) {
    var copyTests, copiedContentInstanceTest, registerTest,
        Assert = Y.Assert;

    copyTests = new Y.Test.Case({
        name: "eZ Copy Content Plugin tests",

        setUp: function () {
            var that = this;
            this.capiMock = new Y.Test.Mock();
            this.locationMock = new Y.Test.Mock();
            this.contentMock = new Y.Test.Mock();
            this.copiedContentMock = new Y.Test.Mock();
            this.responseMock = new Y.Test.Mock();
            this.contentServiceMock = new Y.Test.Mock();
            this.locationId = 'location/2/2/2/2';
            this.parentLocationId = 'location/1/2/3/4';
            this.contentId = 'content/1/2/3';
            this.finalLocation = 'finalLocation/4/5/6/7';
            this.parentContentName = 'Mum';
            this.contentName = 'content';
            this.languageCode = 'FR-fre';
            this.error = false;

            Y.Mock.expect(this.copiedContentMock, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        options.api,
                        that.capiMock,
                        "option should have the JS REST client instance"
                    );
                    callback();
                }
            });

            Y.Mock.expect(this.copiedContentMock, {
                method: 'set',
                args: ['id', this.finalLocation],
            });

            Y.Mock.expect(this.copiedContentMock, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: function (string) {
                    if (string == 'resources') {
                        return {MainLocation: that.finalLocation};
                    } else if (string == 'mainLanguageCode') {
                        return that.languageCode;
                    } else {
                        Y.Assert.fail('Wrong argument passed to copiedContent.get()');
                    }
                }
            });

            Y.Mock.expect(this.responseMock, {
                method: 'getHeader',
                args: ['location'],
                returns: this.finalLocation
            });

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentServiceMock
            });

            Y.Mock.expect(this.locationMock, {
                method: 'get',
                args: ['id'],
                returns: this.locationId
            });

            Y.Mock.expect(this.contentMock, {
                method: 'copy',
                args: [Y.Mock.Value.Object, this.parentLocationId, Y.Mock.Value.Function],
                run: function (options, parentLocationId, callback) {
                    Assert.areSame(
                        options.api,
                        that.capiMock,
                        "option should have the JS REST client instance"
                    );
                    callback(that.error, that.responseMock);
                }
            });

            Y.Mock.expect(this.contentMock, {
                method: 'get',
                args: ['name'],
                returns: this.contentName
            });

            Y.Mock.expect(this.contentServiceMock, {
                method: 'copyContent',
                args: [this.locationId, this.parentLocationId, Y.Mock.Value.Function],
                run: function (locationId, parentLocationId, callback) {
                    callback(that.error, that.responseMock);
                }
            });

            this.app = new Y.Mock();
            this.activeView = new Y.View({});
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['activeView'],
                returns: this.activeView
            });
            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', Y.Mock.Value.Boolean],
            });
            Y.Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['viewLocation', Y.Mock.Value.Object],
                run: function (viewLocation, idObject) {
                    Assert.areSame(
                        idObject.id,
                        that.finalLocation,
                        "The application should have redirect the user to the new content's location"
                    );
                    Assert.areSame(
                        idObject.languageCode,
                        that.languageCode,
                        "The application should have redirect the user to the new content's location with the good language"
                    );
                }
            });

            this.service = new Y.Base();
            this.service.set('app', this.app);
            this.service.set('capi', this.capiMock);
            this.service.set('location', this.locationMock);
            this.service.set('content', this.contentMock);


            this.view = new Y.View();
            this.view.addTarget(this.service);

            this.plugin = new Y.eZ.Plugin.CopyContent({
                host: this.service,
                copiedContent: this.copiedContentMock,
            });
        },

        _assertOnNotification: function (e, firstState, secondState, firstTimeout, secondTimeout, parentLocationId, locationId) {
            Assert.areEqual(
                firstState, e.notification.state,
                "The notification state should be 'started'"
            );
            Assert.isString(
                e.notification.text,
                "The notification text should be a String"
            );
            Assert.areSame(
                firstTimeout, e.notification.timeout,
                "The notification timeout should be set to 0"
            );
            Assert.areSame(
                'copy-notification-' + parentLocationId + '-' + locationId,
                e.notification.identifier,
                "The notification identifier should match"
            );
            this.plugin.once('notify', function (e) {
                Assert.areEqual(
                    secondState, e.notification.state,
                    "The notification state should be 'error'"
                );
                Assert.isString(
                    e.notification.text,
                    "The notification text should be a String"
                );
                Assert.areSame(
                    secondTimeout, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
                Assert.areSame(
                    'copy-notification-' + parentLocationId + '-' + locationId,
                    e.notification.identifier,
                    "The notification identifier should match"
                );
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.plugin;
            delete this.service;
            delete this.app;
            delete this.locationMock;
            delete this.capiMock;
            delete this.contentServiceMock;
            delete this.responseMock;
        },

        "Should launch the universal discovery widget when receiving an copyAction event": function () {
            var contentDiscovered = false,
                containerContentType = new Y.Mock(),
                nonContainerContentType = new Y.Mock();

            Y.Mock.expect(containerContentType, {
                method: 'get',
                args: ['isContainer'],
                returns: true
            });
            Y.Mock.expect(nonContainerContentType, {
                method: 'get',
                args: ['isContainer'],
                returns: false
            });

            this.service.on('contentDiscover', function (e) {
                contentDiscovered = true;
                Y.Assert.isObject(e.config, "contentDiscover config should be an object");
                Y.Assert.isFunction(e.config.contentDiscoveredHandler, "config should have a function named contentDiscoveredHandler");
                Y.Assert.isFunction(e.config.isSelectable, "config should have a function named isSelectable");

                Y.Assert.isTrue(
                    e.config.isSelectable({contentType: containerContentType}),
                    "isSelectable should return TRUE if selected content is container"
                );
                Y.Assert.isFalse(
                    e.config.isSelectable({contentType: nonContainerContentType}),
                    "isSelectable should return FALSE if selected content is container"
                );
            });
            this.view.fire('whatever:copyAction');
            Assert.isTrue(contentDiscovered, "The contentDiscover event should have been fired");
        },

        "Should notify when trying to copy a content but get an error": function () {
            var that = this,
                notified = false,
                parentLocationMock = new Y.Mock(),
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection : {location : parentLocationMock, contentInfo: parentContentInfoMock }};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });
            this.error = true;
            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('notify', function (e) {
                notified = true;
                that._assertOnNotification(e,'started', 'error', 5, 0, that.parentLocationId, that.locationId);
            });
            this.view.fire('whatever:copyAction');
            Assert.isTrue(notified, "The notify event should have been fired");
        },

        "Should notify when trying to move a content and redirect to new content's location": function () {
            var that = this,
                notified = false,
                parentLocationMock = new Y.Mock(),
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection : {location : parentLocationMock, contentInfo: parentContentInfoMock}};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });
            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('notify', function (e) {
                notified = true;
                that._assertOnNotification(e,'started', 'done', 5, 5, that.parentLocationId, that.locationId);
            });
            this.view.fire('whatever:copyAction');
            Assert.isTrue(notified, "The notify event should have been fired");
        },

        "Should fire copiedContent event after moving a content": function () {
            var that = this,
                eventFired = false,
                parentLocationMock = new Y.Mock(),
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection: {location: parentLocationMock, contentInfo: parentContentInfoMock}};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });
            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('copiedContent', function (e) {
                eventFired = true;
                Assert.areSame(
                    that.copiedContentMock, e.copiedContent,
                    "copiedContent event should store the copiedContent"
                );
                Assert.areSame(
                    that.contentMock, e.originalContent,
                    "copiedContent event should store the originalContent"
                );
            });
            this.view.fire('whatever:copyAction');
            Assert.isTrue(eventFired, "The copiedContent event should have been fired");
        },

        "Should notify when trying to move a content and redirect to new content's location but fail loading the content": function () {
            var that = this,
                notified = false,
                parentLocationMock = new Y.Mock(),
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection : {location : parentLocationMock, contentInfo: parentContentInfoMock }};

            Y.Mock.expect(this.copiedContentMock, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        options.api,
                        that.capiMock,
                        "option should have the JS REST client instance"
                    );
                    callback(true);
                }
            });
            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });
            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('notify', function (e) {
                notified = true;
                that._assertOnNotification(e,'started', 'done', 5, 5, that.parentLocationId, that.locationId);
            });
            this.view.fire('whatever:copyAction');
            Assert.isTrue(notified, "The notify event should have been fired");
        },
    });

    copiedContentInstanceTest = new Y.Test.Case({
        name: "eZ Copy Content Plugin tests",

        setUp: function () {
            Y.eZ.Content = function () {};
            this.service = new Y.Base();
            this.plugin = new Y.eZ.Plugin.CopyContent({
                host: this.service,
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
            delete Y.eZ.Content;
        },

        "Should instanciate the copiedContent attribute": function () {
            Assert.isInstanceOf(Y.eZ.Content, this.plugin.get('copiedContent'), 'copiedContent Attribute should be an instance of Y.eZ.Content');
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.CopyContent;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Copy Content Plugin tests");
    Y.Test.Runner.add(copyTests);
    Y.Test.Runner.add(copiedContentInstanceTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-copycontentplugin', 'ez-pluginregister-tests']});

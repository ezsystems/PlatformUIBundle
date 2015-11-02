/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationcreateplugin-tests', function (Y) {
    var tests, registerTest, createLocationTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Location Create Plugin event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();

            this.plugin = new Y.eZ.Plugin.LocationCreate({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        "Should trigger content discovery widget on `createLocation` event": function () {
            var contentDiscoverTriggered = false,
                afterCreateCallback = function () {},
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
                contentDiscoverTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.contentDiscoveredHandler,
                    'The `contentDiscoveredHandler` param should be function'
                );
                Assert.isTrue(e.config.multiple, 'The `multiple` param in config should be set to TRUE');
                Assert.isFunction(
                    e.config.data.afterCreateCallback,
                    '`afterCreateCallback` function should be provided in config.data'
                );
                Assert.areSame(
                    afterCreateCallback,
                    e.config.data.afterCreateCallback,
                    '`afterCreateCallback` function in config.data should be the one passed in `createLocation` event'
                );
                Assert.isFunction(e.config.isSelectable, "config should have a function named isSelectable");
                Assert.isTrue(
                    e.config.isSelectable({contentType: containerContentType}),
                    "isSelectable should return TRUE if selected content is container"
                );
                Assert.isFalse(
                    e.config.isSelectable({contentType: nonContainerContentType}),
                    "isSelectable should return FALSE if selected content is container"
                );
            });

            this.service.fire('createLocation', {afterCreateCallback: afterCreateCallback});

            Assert.isTrue(
                contentDiscoverTriggered,
                "The `contentDiscover` event should have been fired"
            );
        },
    });

    createLocationTest = new Y.Test.Case({
        name: "eZ Location Create Plugin event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.addTarget(this.service);
            this.capi = new Mock();
            this.contentServiceMock = new Mock();
            this.contentJson = {
                'id': '/content/Sergio/Aguero',
                'name': 'Sergio Aguero'
            };
            this.content = this._getContentMock(this.contentJson);

            this.service.set('capi', this.capi);
            this.service.set('content', this.content);

            Mock.expect(this.capi, {
                'method': 'getContentService',
                'returns': this.contentServiceMock
            });

            Mock.expect(this.contentServiceMock, {
                'method': 'newLocationCreateStruct',
                'args': [Mock.Value.String],
                'run': function (parentLocationId) {
                    return {id: parentLocationId};
                }
            });

            this.plugin = new Y.eZ.Plugin.LocationCreate({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        _getLocationMock: function (attrs) {
            var locationMock = new Mock();

            Mock.expect(locationMock, {
                'method': 'get',
                'args': [Mock.Value.String],
                'run': function (attr) {
                    switch (attr) {
                        case 'id':
                            return attrs.id;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute');
                            break;
                    }
                }
            });

            return locationMock;
        },

        _getContentMock: function (attrs) {
            return this._getContentInfoMock(attrs);
        },

        _getContentInfoMock: function (attrs) {
            var contentInfoMock = new Mock();

            Mock.expect(contentInfoMock, {
                'method': 'get',
                'args': [Mock.Value.String],
                'run': function (attr) {
                    switch (attr) {
                        case 'id':
                            return attrs.id;
                        case 'name':
                            return attrs.name;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute');
                            break;
                    }
                }
            });

            return contentInfoMock;
        },

        _getSelection: function () {
            this.parentLocation1 = {'id': '/location/Man/City'};
            this.parentContent1 = {'id': '/content/Man/City', 'name': 'Man City'};
            this.parentLocation2 = {'id': '/location/Uruguay'};
            this.parentContent2 = {'id': '/content/Uruguay', 'name': 'Uruguay'};

            return [
                {
                    location: this._getLocationMock(this.parentLocation1),
                    contentInfo: this._getContentInfoMock(this.parentContent1)
                },
                {
                    location: this._getLocationMock(this.parentLocation2),
                    contentInfo: this._getContentInfoMock(this.parentContent2)
                }
            ];
        },

        "Should create locations and fire notifications": function () {
            var afterCreateCallbackCalled = false,
                afterCreateCallback = function () {
                    afterCreateCallbackCalled = true;
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this;

            this.service.on('contentDiscover', function (e) {
                var config = {
                    selection: that._getSelection(),
                    target: {
                        get: function (attr) {
                            switch (attr) {
                                case 'data':
                                    return {afterCreateCallback: afterCreateCallback};
                            }
                        }
                    }
                };

                e.config.contentDiscoveredHandler(config);
            });

            Mock.expect(this.content, {
                'method': 'addLocation',
                'args': [Mock.Value.Object, Mock.Value.Object, Mock.Value.Function],
                'run': function (options, parentLocation, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        'CAPI should be passed as param'
                    );

                    callback(false);
                }
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.contentJson.id) >= 0),
                        "The notification should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.contentJson.id) >= 0),
                        "The notification should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                }
            });

            this.service.fire('createLocation', {afterCreateCallback: function () {}});

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(errorNotificationFired, 'Should not fire notification with `error` state');
            Assert.isTrue(afterCreateCallbackCalled, 'Should call afterCallback function');
        },

        "Should create some locations and for fails fire notifications": function () {
            var afterCreateCallbackCalled = false,
                afterCreateCallback = function () {
                    afterCreateCallbackCalled = true;
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this;

            this.service.on('contentDiscover', function (e) {
                var config = {
                    selection: that._getSelection(),
                    target: {
                        get: function (attr) {
                            switch (attr) {
                                case 'data':
                                    return {afterCreateCallback: afterCreateCallback};
                            }
                        }
                    }
                };

                e.config.contentDiscoveredHandler(config);
            });

            Mock.expect(this.content, {
                'method': 'addLocation',
                'args': [Mock.Value.Object, Mock.Value.Object, Mock.Value.Function],
                'run': function (options, parentLocation, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        'CAPI should be passed as param'
                    );

                    if (parentLocation.get('id') === that.parentLocation1.id) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.contentJson.id) >= 0),
                        "The notification should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.contentJson.id) >= 0),
                        "The notification should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                }
            });

            this.service.fire('createLocation', {afterCreateCallback: function () {}});

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(successNotificationFired, 'Should fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
            Assert.isTrue(afterCreateCallbackCalled, 'Should call afterCallback function');
        },

        "Should not create any location and fire notification about fail": function () {
            var afterCreateCallbackCalled = false,
                afterCreateCallback = function () {
                    afterCreateCallbackCalled = true;
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this;

            this.service.on('contentDiscover', function (e) {
                var config = {
                    selection: that._getSelection(),
                    target: {
                        get: function (attr) {
                            switch (attr) {
                                case 'data':
                                    return {afterCreateCallback: afterCreateCallback};
                            }
                        }
                    }
                };

                e.config.contentDiscoveredHandler(config);
            });

            Mock.expect(this.content, {
                'method': 'addLocation',
                'args': [Mock.Value.Object, Mock.Value.Object, Mock.Value.Function],
                'run': function (options, parentLocation, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        'CAPI should be passed as param'
                    );

                    callback(true);
                }
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.contentJson.id) >= 0),
                        "The notification should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                }
            });

            this.service.fire('createLocation', {afterCreateCallback: function () {}});

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(successNotificationFired, 'Should fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
            Assert.isFalse(afterCreateCallbackCalled, 'Should call afterCallback function');
        }
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LocationCreate;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Location Create Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(createLocationTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-locationcreateplugin', 'ez-pluginregister-tests']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationremoveplugin-tests', function (Y) {
    var eventTest, registerTest, removeLocationTest,
        Assert = Y.Assert, Mock = Y.Mock;

    eventTest = new Y.Test.Case({
        name: "eZ Location Remove Plugin event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();

            this.plugin = new Y.eZ.Plugin.LocationRemove({
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

        "Should trigger confirm box open on `removeLocations` event": function () {
            var confirmBoxOpenTriggered = false;

            this.service.on('confirmBoxOpen', function (e) {
                confirmBoxOpenTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.confirmHandler,
                    'The `confirmHandler` param should be function'
                );
                Assert.isFunction(
                    e.config.cancelHandler,
                    'The `cancelHandler` param should be function'
                );
            });

            this.service.fire('removeLocations', {});

            Assert.isTrue(
                confirmBoxOpenTriggered,
                "The `confirmBoxOpen` event should have been fired"
            );
        },

        "Should call `afterRemoveLocationsCallback` function with FALSE when cancelHandler is triggered": function () {
            var confirmBoxOpenTriggered = false,
                afterRemoveLocationsCallbackCalled = false,
                afterRemoveLocationsCallback = function (locationsRemoved) {
                    afterRemoveLocationsCallbackCalled = true;
                    Assert.isFalse(locationsRemoved, 'Callback function should be called with FALSE param');
                };

            this.service.on('confirmBoxOpen', function (e) {
                confirmBoxOpenTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.confirmHandler,
                    'The `confirmHandler` param should be function'
                );
                Assert.isFunction(
                    e.config.cancelHandler,
                    'The `cancelHandler` param should be function'
                );

                e.config.cancelHandler();
            });

            this.service.fire('removeLocations', {
                locations: [],
                afterRemoveLocationsCallback: afterRemoveLocationsCallback
            });

            Assert.isTrue(
                confirmBoxOpenTriggered,
                "The `confirmBoxOpen` event should have been fired"
            );
            Assert.isTrue(afterRemoveLocationsCallbackCalled, 'Should call afterRemoveLocationsCallback function');
        },
    });

    removeLocationTest = new Y.Test.Case({
        name: "eZ Location Remove Plugin remove location event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.addTarget(this.service);
            this.capi = new Mock();
            this.contentJson = {
                'id': '/content/The/Memory/Remains',
                'name': 'One',
                'resources': {
                    'MainLocation': '/content/main/location/id'
                },
                'mainLanguageCode': 'eng-GB'
            };
            this.firstLocation = this._getLocationMock({id: '/first/location'});
            this.secondLocation = this._getLocationMock({id: '/second/location'});
            this.thirdLocation = this._getLocationMock({id: '/third/location/currently/displayed'});
            this.content = this._getContentMock(this.contentJson);

            this.service.set('capi', this.capi);
            this.service.set('content', this.content);
            this.service.set('location', this.thirdLocation);

            this.plugin = new Y.eZ.Plugin.LocationRemove({
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

        _getContentMock: function (attrs) {
            var contentMock = new Mock();

            Mock.expect(contentMock, {
                'method': 'get',
                'args': [Mock.Value.String],
                'run': function (attr) {
                    switch (attr) {
                        case 'id':
                            return attrs.id;
                        case 'name':
                            return attrs.name;
                        case 'resources':
                            return attrs.resources;
                        case 'mainLanguageCode':
                            return attrs.mainLanguageCode;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute `' + attr + '` from content mock');
                            break;
                    }
                }
            });

            return contentMock;
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
                            Assert.fail('Trying to `get` incorrect attribute from location mock');
                            break;
                    }
                }
            });

            return locationMock;
        },

        "Should remove locations and fire notifications": function () {
            var afterRemoveLocationsCallbackCalled = false,
                afterRemoveLocationsCallback = function (locationsRemoved) {
                    afterRemoveLocationsCallbackCalled = true;
                    Assert.isTrue(locationsRemoved, 'Callback function should be called with TRUE param');
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this,
                locationsForRemoval = [this.firstLocation, this.secondLocation];

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            Y.Array.each(locationsForRemoval, function (locationMock) {
                Mock.expect(locationMock, {
                    method: 'destroy',
                    args: [Mock.Value.Object, Mock.Value.Function],
                    run: function (options, callback) {
                        Assert.areSame(
                            options.api,
                            that.capi,
                            "The CAPI should be passed"
                        );
                        Assert.isTrue(
                            options.remove,
                            "The remove parameter should be set to TRUE"
                        );

                        callback(false);
                    }
                });
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
                        "The notification identifier should contain id of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(locationsForRemoval.length) >= 0),
                        "The notification identifier should contain number of locations for removal"
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
                        "The notification identifier should contain id of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(locationsForRemoval.length) >= 0),
                        "The notification identifier should contain number of locations for removal"
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

            this.service.fire('removeLocations', {
                locations: locationsForRemoval,
                afterRemoveLocationsCallback: afterRemoveLocationsCallback
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(errorNotificationFired, 'Should not fire notification with `error` state');
            Assert.isTrue(afterRemoveLocationsCallbackCalled, 'Should call afterRemoveLocationsCallback function');
        },

        "Should remove locations, fire notifications and navigate to main location": function () {
            var afterRemoveLocationsCallbackCalled = false,
                afterRemoveLocationsCallback = function (locationsRemoved) {
                    afterRemoveLocationsCallbackCalled = true;
                    Assert.isTrue(locationsRemoved, 'Callback function should be called with TRUE param');
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this,
                locationsForRemoval = [this.secondLocation, this.thirdLocation],
                appNavigateCalled = false;

            this.service.set('app', {
                navigateTo: function (routeName, params) {
                    appNavigateCalled = true;

                    Assert.areEqual('viewLocation', routeName, 'The route name should be `viewLocation`');
                    Assert.areEqual(
                        params.id,
                        that.contentJson.resources.MainLocation,
                        'Id of main location of content should be passed as id param'
                    );
                    Assert.areEqual(
                        params.languageCode,
                        that.contentJson.mainLanguageCode,
                        'Main language code of content should be passed as language param'
                    );
                }
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            Y.Array.each(locationsForRemoval, function (locationMock) {
                Mock.expect(locationMock, {
                    method: 'destroy',
                    args: [Mock.Value.Object, Mock.Value.Function],
                    run: function (options, callback) {
                        Assert.areSame(
                            options.api,
                            that.capi,
                            "The CAPI should be passed"
                        );
                        Assert.isTrue(
                            options.remove,
                            "The remove parameter should be set to TRUE"
                        );

                        callback(false);
                    }
                });
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
                        "The notification identifier should contain id of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(locationsForRemoval.length) >= 0),
                        "The notification identifier should contain number of locations for removal"
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
                        "The notification identifier should contain id of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(locationsForRemoval.length) >= 0),
                        "The notification identifier should contain number of locations for removal"
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

            this.service.fire('removeLocations', {
                locations: locationsForRemoval,
                afterRemoveLocationsCallback: afterRemoveLocationsCallback
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(errorNotificationFired, 'Should not fire notification with `error` state');
            Assert.isFalse(afterRemoveLocationsCallbackCalled, 'Should not call afterRemoveLocationsCallback function');
            Assert.isTrue(appNavigateCalled, 'The app should navigate to location view of main location');
        },

        "Should not remove locations and fire notifications": function () {
            var afterRemoveLocationsCallbackCalled = false,
                afterRemoveLocationsCallback = function (locationsRemoved) {
                    afterRemoveLocationsCallbackCalled = true;
                    Assert.isFalse(locationsRemoved, 'Callback function should be called with FALSE param');
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this,
                locationsForRemoval = [this.firstLocation, this.secondLocation];

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            Y.Array.each(locationsForRemoval, function (locationMock) {
                Mock.expect(locationMock, {
                    method: 'destroy',
                    args: [Mock.Value.Object, Mock.Value.Function],
                    run: function (options, callback) {
                        Assert.areSame(
                            options.api,
                            that.capi,
                            "The CAPI should be passed"
                        );
                        Assert.isTrue(
                            options.remove,
                            "The remove parameter should be set to TRUE"
                        );

                        callback(true);
                    }
                });
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
                        "The notification identifier should contain id of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(locationsForRemoval.length) >= 0),
                        "The notification identifier should contain number of locations for removal"
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
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.contentJson.id) >= 0),
                        "The notification identifier should contain id of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(locationsForRemoval.length) >= 0),
                        "The notification identifier should contain number of locations for removal"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 0,
                        "The timeout of notification should be set to 0"
                    );
                }
            });

            this.service.fire('removeLocations', {
                locations: locationsForRemoval,
                afterRemoveLocationsCallback: afterRemoveLocationsCallback
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
            Assert.isTrue(afterRemoveLocationsCallbackCalled, 'Should call afterRemoveLocationsCallback function');
        },

        "Should remove location and handle errors for one that failed": function () {
            var afterRemoveLocationsCallbackCalled = false,
                afterRemoveLocationsCallback = function (locationsRemoved) {
                    afterRemoveLocationsCallbackCalled = true;
                    Assert.isTrue(locationsRemoved, 'Callback function should be called with TRUE param');
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this,
                locationsForRemoval = [this.firstLocation, this.secondLocation];

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            Mock.expect(this.firstLocation, {
                method: 'destroy',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        "The CAPI should be passed"
                    );
                    Assert.isTrue(
                        options.remove,
                        "The remove parameter should be set to TRUE"
                    );

                    callback(true);
                }
            });

            Mock.expect(this.secondLocation, {
                method: 'destroy',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        "The CAPI should be passed"
                    );
                    Assert.isTrue(
                        options.remove,
                        "The remove parameter should be set to TRUE"
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
                        "The notification identifier should contain id of content"
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
                        "The notification identifier should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.contentJson.id) >= 0),
                        "The notification identifier should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 0,
                        "The timeout of notification should be set to 0"
                    );
                }
            });

            this.service.fire('removeLocations', {
                locations: locationsForRemoval,
                afterRemoveLocationsCallback: afterRemoveLocationsCallback
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
            Assert.isTrue(afterRemoveLocationsCallbackCalled, 'Should call afterRemoveLocationsCallback function');
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LocationRemove;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Location Remove Plugin tests");
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(removeLocationTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-locationremoveplugin', 'ez-pluginregister-tests']});

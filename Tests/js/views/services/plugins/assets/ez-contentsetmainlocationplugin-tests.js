/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentsetmainlocationplugin-tests', function (Y) {
    var eventTest, registerTest, setMainLocationTest,
        Assert = Y.Assert, Mock = Y.Mock;

    eventTest = new Y.Test.Case({
        name: "eZ Content Set Main Location Plugin event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();

            this.plugin = new Y.eZ.Plugin.ContentSetMainLocation({
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

        "Should trigger confirm box open on `setMainLocation` event": function () {
            var confirmBoxOpenTriggered = false;

            this.service.on('confirmBoxOpen', function (e) {
                confirmBoxOpenTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.confirmHandler,
                    'The `confirmHandler` param should be function'
                );
            });

            this.service.fire('setMainLocation', {});

            Assert.isTrue(
                confirmBoxOpenTriggered,
                "The `confirmBoxOpen` event should have been fired"
            );
        },
    });

    setMainLocationTest = new Y.Test.Case({
        name: "eZ Content Set Main Location Plugin set main location event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.addTarget(this.service);
            this.capi = new Mock();
            this.contentJson = {
                'id': '/content/Lonely/Day',
                'name': 'Lonely Day',
                'mainLanguageCode': 'pol-PL'
            };
            this.newMainLocationId = '/locations/SOAD/Hypnotize/Lonely/Day';
            this.oldMainLocationId = '/location/Metallica/S&M/Nothing/Else/Matters';
            this.content = this._getContentMock(this.contentJson);

            this.service.set('capi', this.capi);
            this.service.set('content', this.content);

            this.plugin = new Y.eZ.Plugin.ContentSetMainLocation({
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
                        case 'mainLanguageCode':
                            return attrs.mainLanguageCode;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute from content mock');
                            break;
                    }
                }
            });

            return contentMock;
        },

        "Should set main location and fire notifications": function () {
            var afterSetMainLocationCallbackCalled = false,
                afterSetMainLocationCallback = function () {
                    afterSetMainLocationCallbackCalled = true;
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this;

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            Mock.expect(this.content, {
                method: 'setMainLocation',
                args: [Mock.Value.Object, this.newMainLocationId, Mock.Value.Function],
                run: function (options, locationId, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        "The CAPI should be passed"
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
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.newMainLocationId) >= 0),
                        "The notification identifier should contain id of location"
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
                        (e.notification.identifier.indexOf(that.newMainLocationId) >= 0),
                        "The notification identifier should contain id of location"
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

            this.service.fire('setMainLocation', {
                locationId: this.newMainLocationId,
                afterSetMainLocationCallback: afterSetMainLocationCallback
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(errorNotificationFired, 'Should not fire notification with `error` state');
            Assert.isTrue(afterSetMainLocationCallbackCalled, 'Should call afterSetMainLocationCallback function');
        },

        "Should not set main location and fire error notification": function () {
            var afterSetMainLocationCallbackCalled = false,
                afterSetMainLocationCallback = function () {
                    afterSetMainLocationCallbackCalled = true;
                },
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this;

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            Mock.expect(this.content, {
                method: 'setMainLocation',
                args: [Mock.Value.Object, this.newMainLocationId, Mock.Value.Function],
                run: function (options, locationId, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        "The CAPI should be passed"
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
                        "The notification identifier should contain id of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.newMainLocationId) >= 0),
                        "The notification identifier should contain id of location"
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
                        (e.notification.identifier.indexOf(that.newMainLocationId) >= 0),
                        "The notification identifier should contain id of location"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 0,
                        "The timeout of notification should be set to 0"
                    );
                }
            });

            this.service.fire('setMainLocation', {
                locationId: this.newMainLocationId,
                afterSetMainLocationCallback: afterSetMainLocationCallback
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
            Assert.isTrue(afterSetMainLocationCallbackCalled, 'Should call afterSetMainLocationCallback function');
        },

    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentSetMainLocation;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Content Set Main Location Plugin tests");
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(setMainLocationTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-contentsetmainlocationplugin', 'ez-pluginregister-tests']});

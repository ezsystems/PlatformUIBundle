/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-visibilityswitcherplugin-tests', function (Y) {
    var tests,
        registerTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Visibility switcher event tests",

        setUp: function () {
            var that = this;

            this.capi = {};
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);
            this.plugin = new Y.eZ.Plugin.VisibilitySwitcherPlugin({
                host: this.service,
            });
            this.locationMock = new Mock();
            this.errorInCallback = false;
            this.afterCreateCallback = function (error) {
                if (error) {
                    that.errorInCallback = true;
                }
            };
            this.startNotificationFired = false;
            this.successNotificationFired = false;
            this.errorNotificationFired = false;
            this.locationId = "/my/location";

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    that.startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.locationId) >= 0),
                        "The notification should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    that.successNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.locationId) >= 0),
                        "The notification should contain id of content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'error') {
                    that.errorNotificationFired = true;
                }
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

        _configureLocationMock: function (hidden, error) {
            var that=this,
                runFunction = function (options, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        'CAPI should be passed as param'
                    );
                    callback(error);
                };

            Mock.expect(this.locationMock, {
                'method': 'get',
                args: [Mock.Value.String],
                'run': function (attr) {
                    switch (attr) {
                        case 'id':
                            return that.locationId;
                        case 'hidden':
                            return hidden;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute: ' + attr);
                            break;
                    }
                }
            });

            Mock.expect(this.locationMock, {
                'method': 'hide',
                args: [Mock.Value.Object, Mock.Value.Function],
                'run': runFunction
            });

            Mock.expect(this.locationMock, {
                'method': 'unhide',
                args: [Mock.Value.Object, Mock.Value.Function],
                'run': runFunction
            });
        },

        _assertNotificationSuccess: function () {
            Assert.isTrue(this.startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(this.successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(this.errorNotificationFired, 'Should not fire notification with `error` state');
            Assert.isFalse(this.errorInCallback, 'Should call afterCallback function with no error');
        },

        _assertNotificationFailure: function() {
            Assert.isTrue(this.startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(this.successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(this.errorNotificationFired, 'Should fire notification with `error` state');
            Assert.isTrue(this.errorInCallback, 'Should not call afterCallback function with error');
        },

        "Should hide the location on `switchVisibility` event": function () {
            this._configureLocationMock(true, false);

            this.view.fire('switchVisibility',{
                location: this.locationMock,
                callback: this.afterCreateCallback
            });

            this._assertNotificationSuccess();
        },

        "Should error while hiding the location on `switchVisibility` event": function () {
            this._configureLocationMock(true, true);

            this.view.fire('switchVisibility',{
                location: this.locationMock,
                callback: this.afterCreateCallback
            });

            this._assertNotificationFailure();
        },

        "Should unhide the location on `switchVisibility` event": function () {
            this._configureLocationMock(false, false);

            this.view.fire('switchVisibility',{
                location: this.locationMock,
                callback: this.afterCreateCallback
            });

            this._assertNotificationSuccess();
        },

        "Should error while unhiding the location on `switchVisibility` event": function () {
            this._configureLocationMock(false, true);

            this.view.fire('switchVisibility',{
                location: this.locationMock,
                callback: this.afterCreateCallback
            });

            this._assertNotificationFailure();
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.VisibilitySwitcherPlugin;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Visibility Switcher Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-visibilityswitcherplugin', 'ez-pluginregister-tests']});

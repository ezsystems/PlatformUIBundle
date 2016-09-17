/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationhubplugin-tests', function (Y) {
    var registerTest,
        eventsTest, errorNotificationTest,
        Assert = Y.Assert, Mock = Y.Mock;

    eventsTest = new Y.Test.Case({
        name: 'eZ Notification Hub Plugin event tests',

        setUp: function () {
            var that = this,
                App = Y.Base.create('testApp', Y.Base, [], {
                    showSideView: function (name, config) {
                        that.showSideViewName = name;
                        that.showSideViewConfig = config;
                    },
                    hideSideView: function (name) {
                        that.hideSideViewName = name;
                    },
                });
            this.app = new App();
            this.plugin = new Y.eZ.Plugin.NotificationHub({
                host: this.app,
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
            this.app.destroy();
            delete this.app;
            delete this.showSideViewName;
            delete this.showSideViewConfig;
            delete this.hideSideViewName;
        },

        "Should show the notification hub side view": function () {
            var notification = {
                    identifier: 'music',
                    text: 'Some music',
                    state: 'playing',
                };

            this.app.fire('whatever:notify', {notification: notification});
            Assert.areEqual(
                "notificationHub", this.showSideViewName,
                "The notification hub should have been shown"
            );
            Assert.areSame(
                notification, this.showSideViewConfig.notification,
                "The notification hub should receive the notification"
            );
        },

        "Should show the notification hub when the app is ready": function () {
            this.app.fire('ready');
            Assert.areEqual(
                "notificationHub", this.showSideViewName,
                "The notification hub should have been shown"
            );
        },
    });

    errorNotificationTest = new Y.Test.Case({
        name: 'eZ Notification Hub Plugin error notification tests',

        setUp: function () {
            this.app = new Mock(new Y.Base());
            this.plugin = new Y.eZ.Plugin.NotificationHub({
                host: this.app,
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.app.destroy();
        },

        "Should check whether the user session is still logged in": function () {
            Mock.expect(this.app, {
                method: 'isLoggedIn',
                args: [Mock.Value.Function],
            });

            this.app.fire('notify', {
                notification: {
                    state: 'error',
                }
            });
            Assert.isTrue(
                this.app.get('loading'),
                "The loading flag should be set to true"
            );
            Mock.verify(this.app);
        },

        "Should logout the user and redirect to the login form": function () {
            Mock.expect(this.app, {
                method: 'isLoggedIn',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(true);
                },
            });
            Mock.expect(this.app, {
                method: 'logOut',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback();
                },
            });
            Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['loginForm'],
            });

            this.app.fire('notify', {
                notification: {
                    state: 'error',
                }
            });

            Assert.isTrue(
                this.app.get('loading'),
                "The loading flag should be set to true"
            );
            Mock.verify(this.app);
        },

        "Should show the notification": function () {
            var notification = {state: 'error'};

            Mock.expect(this.app, {
                method: 'isLoggedIn',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(false);
                },
            });
            Mock.expect(this.app, {
                method: 'showSideView',
                args: ['notificationHub', Mock.Value.Object],
                run: function (identifer, parameter) {
                    Assert.areSame(
                        notification,
                        parameter.notification,
                        "The notification info should be passed to showSideView"
                    );
                },
            });

            this.app.fire('notify', {
                notification: notification,
            });

            Assert.isFalse(
                this.app.get('loading'),
                "The loading flag should be set back to false"
            );
            Mock.verify(this.app);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.NotificationHub;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Notification Hub Plugin tests");
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(errorNotificationTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-notificationhubplugin', 'ez-pluginregister-tests']});

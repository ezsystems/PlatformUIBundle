/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationhubplugin-tests', function (Y) {
    var registerTest,
        eventsTest,
        Assert = Y.Assert;

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

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.NotificationHub;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Notification Hub Plugin tests");
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-notificationhubplugin', 'ez-pluginregister-tests']});

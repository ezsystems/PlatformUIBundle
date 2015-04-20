/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-confirmboxplugin-tests', function (Y) {
    var registerTest,
        eventsTest,
        Assert = Y.Assert;

    eventsTest = new Y.Test.Case({
        name: 'eZ Confirm Box Plugin event tests',

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
            this.plugin = new Y.eZ.Plugin.ConfirmBox({
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

        "Should show the confirm box side view": function () {
            var eventConfig = {};

            this.app.fire('whatever:confirmBoxOpen', {config: eventConfig});
            Assert.areEqual(
                "confirmBox", this.showSideViewName,
                "The confirm box should have been shown"
            );
            Assert.areEqual(
                eventConfig, this.showSideViewConfig,
                "The confirm box should have been shown with the event config"
            );
        },

        "Should hide the confirm box side view": function () {
            this.app.fire('whatever:confirmBoxClose');
            Assert.areEqual(
                "confirmBox", this.hideSideViewName,
                "The confirm box should have been hidden"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ConfirmBox;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Confirm Box Plugin tests");
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-confirmboxplugin', 'ez-pluginregister-tests']});

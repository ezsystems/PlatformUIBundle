/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryplugin-tests', function (Y) {
    var registerTest,
        eventsTest,
        Assert = Y.Assert;

    eventsTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Plugin event tests',

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
            this.plugin = new Y.eZ.Plugin.UniversalDiscovery({
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

        "Should show the universal discovery side view": function () {
            var eventConfig = {};

            this.app.fire('whatever:contentDiscover', {config: eventConfig});
            Assert.areEqual(
                "universalDiscovery", this.showSideViewName,
                "The universal discovery should have been shown"
            );
            Assert.areEqual(
                eventConfig, this.showSideViewConfig,
                "The universal discovery should have been shown with the event config"
            );
        },

        "Should set the app routingEnabled attribute to false on contentDiscover": function () {
            var eventConfig = {};

            this.app.fire('whatever:contentDiscover', {config: eventConfig});
            Assert.areEqual(
                false, this.app.get('routingEnabled'),
                "routingEnabled should be false"
            );
        },

        "Should hide the universal discovery side view (contentDiscovered)": function () {
            this.app.fire('whatever:contentDiscovered');
            Assert.areEqual(
                "universalDiscovery", this.hideSideViewName,
                "The universal discovery should have been hidden"
            );
        },

        "Should hide the universal discovery side view (cancelDiscover)": function () {
            this.app.fire('whatever:cancelDiscover');
            Assert.areEqual(
                "universalDiscovery", this.hideSideViewName,
                "The universal discovery should have been hidden"
            );
        },

        "Should set the app routingEnabled attribute to true on contentDiscovered": function () {
            this.app.fire('whatever:contentDiscovered');
            Assert.areEqual(
                true, this.app.get('routingEnabled'),
                "routingEnabled should be true"
            );
        },

        "Should set the app routingEnabled attribute to true on cancelDiscover": function () {
            this.app.fire('whatever:cancelDiscover');
            Assert.areEqual(
                true, this.app.get('routingEnabled'),
                "routingEnabled should be true"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.UniversalDiscovery;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Universal Discovery Plugin tests");
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-universaldiscoveryplugin', 'ez-pluginregister-tests']});

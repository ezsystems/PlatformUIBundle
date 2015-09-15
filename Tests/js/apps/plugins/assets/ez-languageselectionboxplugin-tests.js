/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageselectionboxplugin-tests', function (Y) {
    var registerTest,
        eventsTest,
        Assert = Y.Assert;

    eventsTest = new Y.Test.Case({
        name: 'eZ Language Selection Box Plugin event tests',

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
            this.plugin = new Y.eZ.Plugin.LanguageSelectionBox({
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

        "Should show the language selection box side view": function () {
            var eventConfig = {};

            this.app.fire('whatever:languageSelect', {config: eventConfig});
            Assert.areEqual(
                "languageSelectionBox", this.showSideViewName,
                "The language selection box should have been shown"
            );
            Assert.areEqual(
                eventConfig, this.showSideViewConfig,
                "The language selection box should have been shown with the event config"
            );
        },

        "Should hide the language selection box side view (languageSelected)": function () {
            this.app.fire('whatever:languageSelected');
            Assert.areEqual(
                "languageSelectionBox", this.hideSideViewName,
                "The language selection box should have been hidden"
            );
        },

        "Should hide the language selection box side view (cancelLanguageSelection)": function () {
            this.app.fire('whatever:cancelLanguageSelection');
            Assert.areEqual(
                "languageSelectionBox", this.hideSideViewName,
                "The language selection box should have been hidden"
            );
        },

    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LanguageSelectionBox;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Language Selection Box Plugin tests");
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-languageselectionboxplugin', 'ez-pluginregister-tests']});

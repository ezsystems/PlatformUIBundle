/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-domstateplugin-tests', function (Y) {
    var registerTest,
        minimizeTest, navigationModeTest,
        Assert = Y.Assert;

    minimizeTest = new Y.Test.Case({
        name: "eZ DOM State Plugin test: minimizeDiscoveryBarAction event",

        setUp: function () {
            this.minimizedClass = 'is-discoverybar-minimized';
            this.app = new Y.Base();
            this.app.set('container', Y.one('.app-container'));
            this.plugin = new Y.eZ.Plugin.DomState({
                host: this.app
            });
        },

        tearDown: function () {
            Y.one('.app-container').removeClass(this.minimizedClass);
            this.app.destroy();
            this.plugin.destroy();
            delete this.app;
            delete this.plugin;
        },

        "Should add the minimized class": function () {
            var container = this.app.get('container');

            this.app.fire('whatever:minimizeDiscoveryBarAction');
            Assert.isTrue(
                container.hasClass(this.minimizedClass),
                "The app container should have the discovery bar minimized class"
            );
        },

        "Should remove the minimized class": function () {
            var container = this.app.get('container');

            this["Should add the minimized class"]();
            this.app.fire('whatever:minimizeDiscoveryBarAction');
            Assert.isFalse(
                container.hasClass(this.minimizedClass),
                "The app container should have the discovery bar minimized class"
            );
        },
    });

    navigationModeTest = new Y.Test.Case({
        name: "eZ DOM State Plugin test: navigationModeChange event",

        setUp: function () {
            this.modeClass = 'mode-class';
            this.app = new Y.Base();
            this.app.set('container', Y.one('.app-container'));
            this.plugin = new Y.eZ.Plugin.DomState({
                host: this.app
            });
        },

        tearDown: function () {
            Y.one('.app-container').removeClass(this.modeClass);
            this.app.destroy();
            this.plugin.destroy();
            delete this.app;
            delete this.plugin;
        },

        "Should add the mode class": function () {
            var container = this.app.get('container');

            this.app.fire( 'whatever:navigationModeChange', {
                navigation: {
                    value: true,
                    modeClass: this.modeClass
                }
            });
            Assert.isTrue(
                container.hasClass(this.modeClass),
                "The app container should have the mode class"
            );
        },

        "Should remove the mode class": function () {
            var container = this.app.get('container');

            this["Should add the mode class"]();
            this.app.fire( 'whatever:navigationModeChange', {
                navigation: {
                    value: false,
                    modeClass: this.modeClass
                }
            });
            Assert.isFalse(
                container.hasClass(this.modeClass),
                "The app container should not have the mode class"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.DomState;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ DOM State Plugin tests");
    Y.Test.Runner.add(minimizeTest);
    Y.Test.Runner.add(navigationModeTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-domstateplugin', 'ez-pluginregister-tests']});

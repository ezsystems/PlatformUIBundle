/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-positionplugin-tests', function (Y) {
    var registerTest,
        heightChangeTest,
        Assert = Y.Assert, Mock = Y.Mock;

    heightChangeTest = new Y.Test.Case({
        name: 'eZ Position Plugin heightChange tests',

        setUp: function () {
            var App = Y.Base.create('testApp', Y.Base, [], {}, {
                    ATTRS: {
                        container: {
                            getter: function () {
                                return Y.one('.app-container');
                            },
                        },
                        activeView: {},
                    }
                });
            this.app = new App();
            this.plugin = new Y.eZ.Plugin.Position({
                host: this.app,
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
            this.app.destroy();
            delete this.app;
        },

        "Should handle the initial *:heightChange event": function () {
            this["Should handle the *:heightChange event"]();
        },

        "Should handle the *:heightChange event": function () {
            var marginTop = parseInt(Y.one('.ez-mainviews').getStyle('marginTop'), 10),
                offset = -42;

            this.app.fire('whatever:heightChange', {
                height: {
                    offset: offset,
                }
            });

            Assert.areEqual(
                marginTop + offset,
                parseInt(Y.one('.ez-mainviews').getStyle('marginTop'), 10),
                "The top margin of ez-mainviews should have been adjusted"
            );
        },

        "Should inform the activeView": function () {
            var view = new Mock(),
                offset = 42;

            Mock.expect(view, {
                method: 'refreshTopPosition',
                args: [offset]
            });
            this.app.set('activeView', view);
            this.app.fire('navigationHubView:heightChange', {
                height: {
                    offset: offset,
                }
            });

            Mock.verify(view);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.Position;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Position Plugin tests");
    Y.Test.Runner.add(heightChangeTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-positionplugin', 'ez-pluginregister-tests']});

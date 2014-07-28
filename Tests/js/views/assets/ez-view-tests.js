/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-view-tests', function (Y) {
    var viewTest, pluginTests, Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ View view tests",

        setUp: function () {
            this.TestView = Y.Base.create('TestView', Y.eZ.View, [], {}, {
                ATTRS: {
                    notAView: {},
                    subEzView: {
                        value: new Y.eZ.View()
                    },
                    subPlainView: {
                        value: new Y.View()
                    }
                }
            });
        },

        "Should set the 'active' attribute to the sub ez views": function () {
            var view = new this.TestView();

            view.set('active', true);

            Assert.isTrue(
                view.get('subEzView').get('active'),
                "The active attribute of the subEzView should be set to true"
            );

            Assert.isUndefined(
                view.get('subPlainView').get('active'),
                "The active attribute of the subPlainView should be undefined"
            );
        }
    });

    pluginTests = new Y.Test.Case({
        name: "eZ View plugin tests",

        setUp: function () {
            this.testView = 'testView';
            this.TestView = Y.Base.create(this.testView, Y.eZ.View, [], {});
            this.plugin1 = "plugin1";
            this.plugin2 = "plugin2";
            this.Plugin1 = Y.Base.create('plugin1', Y.Plugin.Base, [], {}, {
                NS: this.plugin1
            });
            this.Plugin2 = Y.Base.create('plugin2', Y.Plugin.Base, [], {}, {
                NS: this.plugin2
            });

            Y.eZ.PluginRegistry.registerPlugin(this.Plugin1, [this.testView]);
            Y.eZ.PluginRegistry.registerPlugin(this.Plugin2, ['anotherView']);
        },

        tearDown: function () {
            Y.eZ.PluginRegistry.reset();
        },

        "Should plug registered plugins": function () {
            var view = new this.TestView();

            Assert.isObject(
                view.hasPlugin(this.plugin1),
                "The view should be plugged with the plugin1"
            );
        },

        "Should not plug registered plugin for others components": function () {
            var view = new this.TestView();

            Assert.isUndefined(
                view.hasPlugin(this.plugin2),
                "The view should not be plugged with the plugin2"
            );
        },
    });

    Y.Test.Runner.setName("eZ View view tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(pluginTests);
}, '', {requires: ['test', 'base', 'plugin', 'ez-view']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-view-tests', function (Y) {
    var viewTest, pluginTests, addEventsTest, Assert = Y.Assert;

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
        },
    });

    addEventsTest = new Y.Test.Case({
        name: "eZ View addEvent tests",

        tearDown: function() {
            this.view.destroy();
            delete this.view;
        },

        _testEventsInDom: function () {
            var link1 = this.view.get('container').one('.event1'),
                link2 = this.view.get('container').one('.event2');


            link1.simulate('click');
            Assert.isTrue(
                this.view.get('event1Fired'),
                "click on .event1 should have been caught"
            );

            link2.simulate('click');
            Assert.isTrue(
                this.view.get('event2Fired'),
                "click on .event2 should have been caught"
            );
        },

        _getTestView: function (parent) {

            this.TestView = Y.Base.create('TestView', parent, [], {
                initializer: function() {
                    this._addDOMEventHandlers({'.event2': {'click': '_event2'}});
                },

                _event1: function() {
                    this.set('event1Fired', true);
                },
                _event2: function() {
                    this.set('event2Fired', true);
                },
            }, {
                ATTRS: {
                    event1Fired: {
                        value: false
                    },
                    event2Fired: {
                        value: false
                    },
                }
            });

            return new this.TestView({
                events: {'.event1': {'click': '_event1'}},
                container: '.container',
            });
        },

        "Should add events to the DOM event handler": function () {
            this.view = this._getTestView(Y.eZ.View);

            this._testEventsInDom();
        },

        "Should add events to the DOM event handler and attach events": function () {
            this.ParentTestView = Y.Base.create('ParentTestView', Y.eZ.View, [], {
                initializer: function() {
                    // Creating the container in the parent view
                    this.get('container');
                },
            }, {});

            this.view = this._getTestView(this.ParentTestView);

            this._testEventsInDom();
        },
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
    Y.Test.Runner.add(addEventsTest);
}, '', {requires: ['test', 'base', 'plugin', 'ez-view', 'node-event-simulate', 'event-tap']});

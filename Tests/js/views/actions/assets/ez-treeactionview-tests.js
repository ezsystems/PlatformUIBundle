/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-treeactionview-tests', function (Y) {
    var buttonTest, viewTest, treeTest,
        Assert = Y.Assert;

    buttonTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            setUp: function () {
                this.actionId = "tree";
                this.hint = "Cherry tree";
                this.label = "Tree";
                this.disabled = false;

                this.view = new Y.eZ.TreeActionView({
                    container: '.container',
                    actionId: this.actionId,
                    hint: this.hint,
                    label: this.label,
                    disabled: this.disabled,
                });

                this.templateVariablesCount = 4;
            },

            tearDown: function () {
                this.view.destroy();
                this.view.get('container').empty();
            },

            "Should not render several times": function () {
                var templateCount = 0,
                    origTpl;

                origTpl = this.view.template;
                this.view.template = function () {
                    templateCount++;
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
                this.view.render();
                Assert.areEqual(
                    1,
                    templateCount,
                    "render should not render a previously rendered view"
                );
            },

            "Should add the buttonactionview class on the container": function () {
                this["Test render"]();

                Assert.isTrue(
                    this.view.get('container').hasClass('ez-view-buttonactionview'),
                    "The container should get the button action view class"
                );
            },
        })
    );

    viewTest = new Y.Test.Case({
        name: "eZ Tree Action View test",

        setUp: function () {
            this.view = new Y.eZ.TreeActionView({
                container: '.container',
                actionId: "tree",
                hint: "Fool's Garden",
                label: "Lemon tree",
            });
        },

        "Should toggle the expanded parameters when the treeAction event is fired": function () {
            this.view.render();
            Assert.isFalse(
                this.view.get('expanded'),
                "The `expanded` attribute should be false by default"
            );

            this.view.fire('treeAction');
            Assert.isTrue(
                this.view.get('expanded'),
                "The `expanded` attribute should be true"
            );

            this.view.fire('treeAction');
            Assert.isFalse(
                this.view.get('expanded'),
                "The `expanded` attribute should be false"
            );
        },

        "Should set expanded to false when clicking outside of the view": function () {
            this.view.render();
            this.view.set('expanded', true);

            Y.one('#external-element').simulate('click');

            Assert.isFalse(
                this.view.get('expanded'),
                "The `expanded` attribute should have been set to false"
            );
        },

        tearDown: function () {
            this.view.destroy();
            this.view.get('container').empty();
        },
    });

    treeTest = new Y.Test.Case({
        name: "eZ Tree Action View tree tests",

        init: function () {
            Y.Template.register(
                'tree-ez-partial', Y.one('#ez_tree').getHTML()
            );
        },

        destroy: function () {
            Y.Handlebars.registerPartial('ez_tree', undefined);
            Y.Template.register('tree-ez-partial', undefined);
        },

        _buildNode: function (id, leaf, canHaveChildren) {
            return {
                id: id,
                state: {
                    leaf: leaf,
                },
                canHaveChildren: canHaveChildren
            };
        },

        setUp: function () {
            var Tree;

            this.view = new Y.eZ.TreeActionView({
                container: '.container',
                actionId: "tree",
                hint: "Fool's Garden",
                label: "Lemon tree",
            });

            Tree = Y.Base.create('myTree', Y.Tree, [Y.Tree.Openable, Y.Tree.Selectable]);
            this.tree = new Tree();
            this.tree.clear(this._buildNode(2, false, true));
            this.level2NodeId = 10;

            this.tree.rootNode.append([
                this._buildNode(this.level2NodeId, true, true),
                this._buildNode(11, true, false),
            ]);
        },

        tearDown: function () {
            this.view.destroy();
            this.view.get('container').empty();
            this.tree.destroy();
            delete this.tree;
            delete this.view;
        },

        _getYNode: function (id) {
            return this.view.get('container').one('[data-node-id="' + id + '"]');
        },

        _assertNodeRendered: function (id) {
            Assert.isNotNull(
                this._getYNode(id),
                "The node '" + id + "' is not rendered"
            );
        },

        "Should render the tree after the root node being loaded": function () {
            this.tree.plug(Y.Plugin.Tree.Lazy);
            this.view.render();
            this.view.set('tree', this.tree);
            
            this.tree.lazy.fire('load', {node: this.tree.rootNode});

            Assert.isTrue(
                this.view.get('container').hasClass('is-tree-loaded'),
                "The view container should get the loaded class"
            );
            Assert.isNotNull(
                this.view.get('container').one('.ez-tree-content > .ez-tree-level'),
                "The children of the root node should have been rendered"
            );
        },

        "Should render the loaded node level": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId),
                childNodeId = [20, 21],
                that = this;

            this.tree.plug(Y.Plugin.Tree.Lazy, {
                load: function (node, callback) {
                    node.append([
                        that._buildNode(childNodeId[0], true, false),
                        that._buildNode(childNodeId[1], true, false),
                    ]);
                    callback();
                }
            });
            this.view.set('tree', this.tree);
            this.view.render();

            this.tree.lazy.fire('load', {node: this.tree.rootNode});
            level2Node.open();

            Assert.isFalse(
                this._getYNode(level2Node.id).hasClass('is-tree-node-loading'),
                "The DOM tree node should not have the loading class"
            );
                
            this._assertNodeRendered(childNodeId[0]);
            this._assertNodeRendered(childNodeId[1]);
        },

        "Should handle the lazy loading while opening": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId);

            this.tree.plug(Y.Plugin.Tree.Lazy, {
                load: function (node, callback) {
                    // no callback on purpose
                }
            });
            this.view.set('tree', this.tree);
            this.view.render();

            this.tree.lazy.fire('load', {node: this.tree.rootNode});
            // simulating a previous loading error
            this._getYNode(level2Node.id).addClass('is-tree-node-error');

            level2Node.open();

            Assert.isTrue(
                this._getYNode(level2Node.id).hasClass('is-tree-node-loading'),
                "The DOM tree node should have the loading class"
            );
            Assert.isFalse(
                this._getYNode(level2Node.id).hasClass('is-tree-node-error'),
                "The DOM tree node should not have the error class"
            );
        },

        "Should handle loading error": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId);

            this.tree.plug(Y.Plugin.Tree.Lazy, {
                load: function (node, callback) {
                    callback({node: node});
                }
            });
            this.view.set('tree', this.tree);
            this.view.render();

            this.tree.lazy.fire('load', {node: this.tree.rootNode});
            level2Node.open();

            Assert.isFalse(
                this._getYNode(level2Node.id).hasClass('is-tree-node-loading'),
                "The DOM tree node should not have the loading class"
            );
            Assert.isTrue(
                this._getYNode(level2Node.id).hasClass('is-tree-node-error'),
                "The DOM tree node should have the error class"
            );
        },

        "Should handle the closing of a node": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId);

            this["Should render the loaded node level"]();
            level2Node.close();

            Assert.isFalse(
                this._getYNode(level2Node.id).hasClass('is-tree-node-open'),
                "The DOM tree node should not have the open class"
            );
            Assert.isTrue(
                this._getYNode(level2Node.id).hasClass('is-tree-node-close'),
                "The DOM tree node should have the close class"
            );
        },

        "Should handle the clear event": function () {
            this["Should render the loaded node level"]();

            this.tree.clear();

            Assert.isFalse(
                this.view.get('container').hasClass('is-tree-loaded'),
                "The view container should not have the loaded class"
            );
            Assert.isTrue(
                this.view.get('container').one('.ez-tree-content').getHTML() === "",
                "The tree content element should be empty"
            );
        },

        "Should handle the select event": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId);

            this["Should render the loaded node level"]();

            level2Node.select();

            Assert.isTrue(
                this._getYNode(level2Node.id).hasClass('is-tree-node-selected'),
                "The DOM tree node should have the selected class"
            );
        },

        "Should ignore the select event on the root": function () {
            this["Should render the loaded node level"]();
            this.tree.rootNode.select();
        },

        "Should handle the unselect event": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId);

            this["Should render the loaded node level"]();

            level2Node.select();
            this.tree.rootNode.select();

            Assert.isFalse(
                this._getYNode(level2Node.id).hasClass('is-tree-node-selected'),
                "The DOM tree node should not have the selected class"
            );
        },

        "Should ignore the select unevent on the root": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId);

            this["Should render the loaded node level"]();
            this.tree.rootNode.select();
            level2Node.select();
        },

        "Should set expanded to false on navigation": function () {
            var nav, that = this;

            this["Should render the loaded node level"]();
            nav = this.view.get('container').one('.ez-tree-navigate');

            nav.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isFalse(
                        this.view.get('expanded'),
                        "`expanded` should be set to false"
                    );
                });
            });
            this.wait();
        },

        "Should handle closing tree node": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId),
                toggleNodeEvent = false,
                that = this;

            this.view.on('toggleNode', function (e) {
                toggleNodeEvent = true;
                Assert.areEqual(
                    that.level2NodeId,
                    e.nodeId,
                    "The id of the node being toggled should be provided"
                );
            });
            this["Should render the loaded node level"]();

            this._getYNode(level2Node.id).one('.ez-tree-node-toggle').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        toggleNodeEvent,
                        "The toggleNode event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should handle opening tree node": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId),
                toggleNodeEvent = false,
                that = this;

            this.view.on('toggleNode', function (e) {
                toggleNodeEvent = true;
                Assert.areEqual(
                    that.level2NodeId,
                    e.nodeId,
                    "The id of the node being toggled should be provided"
                );
            });

            this["Should handle closing tree node"]();
            this._getYNode(level2Node.id).one('.ez-tree-node-toggle').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        toggleNodeEvent,
                        "The toggleNode event should have been fired"
                    );
                });
            });
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Tree Action View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(treeTest);
    Y.Test.Runner.add(buttonTest);
}, '', {
    requires: [
        'test', 'node-event-simulate', 'ez-treeactionview',
        'ez-genericbuttonactionview-tests', 'tree', 'tree-selectable',
        'tree-openable', 'tree-lazy'
    ]
});

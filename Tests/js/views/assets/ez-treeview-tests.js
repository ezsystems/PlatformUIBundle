/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-treeview-tests', function (Y) {
    var treeTest,
        Assert = Y.Assert, Mock = Y.Mock;

    treeTest = new Y.Test.Case({
        name: "eZ Tree View tree tests",

        _buildNode: function (id, leaf, canHaveChildren, data) {
            return {
                id: id,
                data: data,
                state: {
                    leaf: leaf,
                },
                canHaveChildren: canHaveChildren
            };
        },

        setUp: function () {
            var Tree;

            Y.Template.register(
                'tree-ez-partial', Y.Handlebars.compile(Y.one('#ez_tree').getHTML())
            );
            this.view = new Y.eZ.TreeView({
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
            Y.Template.register('tree-ez-partial', undefined);
            this.view.get('container').empty();
            this.view.destroy();
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

        "Should render the tree after the root node is loaded": function () {
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

        "Should 'jsonify' the node's data": function () {
            var level2Node = this.tree.getNodeById(this.level2NodeId),
                childNodeId = 20,
                modelMock = new Mock(), modelJson = {}, other = {},
                origTemplate = Y.Template.get('tree-ez-partial'),
                that = this;

            Mock.expect(modelMock, {
                method: 'toJSON',
                returns: modelJson,
            });
            this.tree.plug(Y.Plugin.Tree.Lazy, {
                load: function (node, callback) {
                    node.append([
                        that._buildNode(childNodeId, true, false, {model: modelMock, other: other}),
                    ]);
                    callback();
                }
            });
            this.view.set('tree', this.tree);
            this.view.render();

            this.tree.lazy.fire('load', {node: this.tree.rootNode});
            this.tree.rootNode.open();
            Y.Template.register('tree-ez-partial', function (variables) {
                Assert.areSame(
                    modelJson, variables.children[0].data.model,
                    "The model should be jsonified"
                );
                Assert.areSame(
                    other, variables.children[0].data.other,
                    "Others data should be left intact"
                );
                return origTemplate.apply(this, arguments);
            });


            level2Node.open();

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

        "Should fire the treeNavigate event": function () {
            var container = this.view.get('container'),
                nodeId = "21",
                that = this;

            this["Should render the loaded node level"]();

            this.view.on('treeNavigate', function (e) {
                that.resume(function () {
                    Assert.areEqual(
                        nodeId, e.nodeId,
                        "The node id should be provided in the event facade"
                    );
                    Assert.areSame(
                        this.view.get('tree'), e.tree,
                        "The tree should be provided in the event facade"
                    );
                    Assert.isObject(e.originalEvent, "The original event facade should be provided");
                    Assert.areEqual(
                        "tap", e.originalEvent.type,
                        "The original event facade should be provided"
                    );
                });
            });

            container.one('[data-node-id="' + nodeId + '"] .ez-tree-navigate').simulateGesture('tap');
            this.wait();
        },

        "Should prevent the tap event when preventing the treeNavigate event": function () {
            var container = this.view.get('container'),
                nodeId = "21",
                that = this;

            this["Should render the loaded node level"]();
            this.view.on('treeNavigate', function (e) {
                that.resume(function () {
                    e.originalEvent = new Y.Mock();
                    Y.Mock.expect(e.originalEvent, {
                        method: 'preventDefault',
                        run: function () {
                            that.resume(function () {
                                Y.Mock.verify(e.originalEvent);
                            });
                        }
                    });
                    e.preventDefault();
                    this.wait();
                });
            });
            container.one('[data-node-id="' + nodeId + '"] .ez-tree-navigate').simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Tree View tests");
    Y.Test.Runner.add(treeTest);
}, '', {
    requires: [
        'test', 'node-event-simulate', 'ez-treeview', 'template',
        'tree', 'tree-selectable', 'tree-openable', 'tree-lazy'
    ]
});

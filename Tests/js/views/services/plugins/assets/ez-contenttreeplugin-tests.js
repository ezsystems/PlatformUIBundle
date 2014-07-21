/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttreeplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert;

    tests = new Y.Test.Case({
        name: "eZ Content Tree Plugin tests",

        setUp: function () {
            this.service = new Y.Base();
            this.plugin = new Y.eZ.Plugin.ContentTree({
                host: this.service
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;
        },

        "Should provide a content tree in the `tree` attribute": function () {
            Assert.isInstanceOf(
                Y.eZ.ContentTree, this.plugin.get('tree'),
                "The `tree` attribute should hold a content tree instance"
            );
        },

        "Should handle the `toggleNode` event (opening)": function () {
            var tree = this.plugin.get('tree'),
                node;

            node = tree.createNode({
                canHaveChildren: true,
                children: [{}, {}],
                state: {loaded: true}
            });
            tree.rootNode.append(node);
            node.close();
            this.service.fire('whatever:toggleNode', {nodeId: node.id});

            Assert.isTrue(
                node.isOpen(),
                "The handling of the `toggleNode` event should have opened the node"
            );
        },

        "Should handle the `toggleNode` event (closing)": function () {
            var tree = this.plugin.get('tree'),
                node;

            node = tree.createNode({
                canHaveChildren: true,
                children: [{}, {}],
                state: {loaded: true}
            });
            tree.rootNode.append(node);
            node.open();
            this.service.fire('whatever:toggleNode', {nodeId: node.id});

            Assert.isFalse(
                node.isOpen(),
                "The handling of the `toggleNode` event should have closed the node"
            );
        },

        "Should reuse the tree if the node is already present": function () {
            var tree = this.plugin.get('tree'),
                nodeId = 3, loc, node;

            loc = new Y.Mock();
            Y.Mock.expect(loc, {
                method: 'get',
                args: ['id'],
                returns: nodeId,
            });
            this.service.set('response', {view: {"location": loc}});
            node = tree.rootNode.append({
                canHaveChildren: true,
                id: nodeId,
                children: [{}, {}],
                state: {loaded: true},
            }).close();

            tree.on('clear', function () {
                Assert.fail("The tree should be cleared");
            });
            this.service.fire('treeAction');

            Assert.isTrue(node.isSelected(), "The node should be selected");
            Assert.isTrue(node.isOpen(), "The node should be open");
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentTree;
    registerTest.components = ['discoveryBarViewService'];

    Y.Test.Runner.setName("eZ Content Tree Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-contenttreeplugin', 'ez-pluginregister-tests']});

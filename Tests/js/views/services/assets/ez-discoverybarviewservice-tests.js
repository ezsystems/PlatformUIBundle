YUI.add('ez-discoverybarviewservice-tests', function (Y) {
    var serviceTest,
        Assert = Y.Assert;

    serviceTest = new Y.Test.Case({
        name: "eZ Discovery Bar View Service tests",

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = new Y.Mock();

            this.service = new Y.eZ.DiscoveryBarViewService({
                app: this.app,
                capi: this.capi,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.capi;
        },

        "Should provide a content tree in the `tree` attribute": function () {
            Assert.isInstanceOf(
                Y.eZ.ContentTree, this.service.get('tree'),
                "The `tree` attribute should hold a content tree instance"
            );
        },

        "load should call the next callback": function () {
            var nextCalled = false,
                that = this;

            this.service.load(function (param) {
                nextCalled = true;
                Assert.areSame(
                    that.service,
                    param,
                    "The service should be passed to the `next` callback"
                );
            });

            Assert.isTrue(nextCalled, "The `next` callback was not called");
        },

        "Should handle the `toggleNode` event (opening)": function () {
            var tree = this.service.get('tree'),
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
            var tree = this.service.get('tree'),
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
            var tree = this.service.get('tree'),
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

    Y.Test.Runner.setName("eZ Discovery Bar View Service tests");
    Y.Test.Runner.add(serviceTest);

}, '', {requires: ['test', 'ez-discoverybarviewservice']});

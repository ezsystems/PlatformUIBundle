/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarcontenttreeplugin-tests', function (Y) {
    var tests, loadingTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Content Tree Plugin tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.Base();
            this.view.addTarget(this.service);
            this.plugin = new Y.eZ.Plugin.DiscoveryBarContentTree({
                host: this.service
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            this.view.destroy();
            delete this.service;
            delete this.plugin;
            delete this.view;
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
                Assert.fail("The tree should not be cleared");
            });
            this.service.fire('whatever:treeAction');

            Assert.isTrue(node.isSelected(), "The node should be selected");
            Assert.isTrue(node.isOpen(), "The node should be open");
        },

        "Should not build the tree if the view is not expanded": function () {
            var tree = this.plugin.get('tree'),
                loc, node;

            loc = new Y.Mock();
            Y.Mock.expect(loc, {
                method: 'get',
                args: ['id'],
                returns: "42",
            });
            node = tree.rootNode.append({
                canHaveChildren: true,
                id: 1,
                children: [{}, {}],
                state: {loaded: true},
            }).close();

            this.service.set('response', {view: {"location": loc}});
            this.view.set('expanded', false);

            tree.on('clear', function () {
                Assert.fail("The tree should not be cleared");
            });
            this.view.fire('treeAction');

            Assert.isFalse(node.isSelected(), "The node should not be selected");
            Assert.isFalse(node.isOpen(), "The node should not be open");
        },
    });

    loadingTest = new Y.Test.Case({
        name: "eZ Content Tree Plugin loading tests",

        setUp: function () {
            var capi = new Mock(),
                query = {body: {ViewInput: {LocationQuery: {}}}};

            this.contentService = new Mock();
            Mock.expect(capi, {
                method: 'getContentService',
                returns: this.contentService,
            });
            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [Mock.Value.String, 'LocationQuery'],
                returns: query,
            });
            this.service = new Y.Base();
            this.service.set('capi', capi);
            this.view = new Y.Base();
            this.view.addTarget(this.service);
            this.plugin = new Y.eZ.Plugin.DiscoveryBarContentTree({
                host: this.service
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            this.view.destroy();
            delete this.service;
            delete this.plugin;
            delete this.view;
        },

        _getLocationMock: function (attributes) {
            var loc = new Mock();

            Mock.expect(loc, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( !attributes[attr] ) {
                        Assert.fail("Unexpected call to get for attribute '" + attr + "'");
                    }
                    return attributes[attr];
                },
            });
            return loc;
        },

        "Should (re) initialized the tree": function () {
            var tree = this.plugin.get('tree'), loc,
                locationId = 42,
                id = '/whatever/' + locationId,
                contentInfo = {},
                treeCleared = false;

            loc = this._getLocationMock(
                {'id': id, 'locationId': locationId, 'contentInfo': contentInfo}
            );
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (query, callback) {
                    callback(true); // simulating an error to ease the test
                },
            });
            this.service.set('response', {view: {"location": loc, path: []}});
            this.view.set('expanded', true);

            tree.after('clear', function () {
                var rootNode = tree.rootNode;

                treeCleared = true;
                Assert.areEqual(
                    id, rootNode.id,
                    "The rootNode id should be the location id"
                );
                Assert.areSame(
                    loc, rootNode.data.location,
                    "The location should be set on the rootNode data"
                );
                Assert.areSame(
                    contentInfo, rootNode.data.contentInfo,
                    "The contentInfo should be set on the rootNode data"
                );
            });
            this.view.fire('treeAction');

            Assert.isTrue(treeCleared, "The tree should have been cleared");
            Assert.areSame(
                tree, this.view.get('tree'),
                "The view should receive the tree"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.DiscoveryBarContentTree;
    registerTest.components = ['discoveryBarViewService'];

    Y.Test.Runner.setName("eZ Discovery Bar Content Tree Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(loadingTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-discoverybarcontenttreeplugin', 'ez-pluginregister-tests']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverycontenttreeplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Universal Discovery Content Tree Plugin tests",

        setUp: function () {
            this.capi = new Mock();
            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.treeView = new Y.Base();
            this.view = new Y.Base();
            this.view.set('treeView', this.treeView);
            this.view.set('loadContent', false);
            this.view.addTarget(this.service);
            this.plugin = new Y.eZ.Plugin.UniversalDiscoveryContentTree({
                host: this.service
            });
            this.origLocation = Y.eZ.Location;
            Y.eZ.Location = Y.Base.create('locationModel', Y.Base, [], {});
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            this.view.destroy();
            this.treeView.destroy();
            delete this.service;
            delete this.plugin;
            delete this.view;
            delete this.treeView;
            delete this.capi;

            Y.eZ.Location = this.origLocation;
        },

        "Should not rebuild the tree if the view is not visible": function () {
            var tree = this.plugin.get('tree');

            this.view.set('visible', false);
            tree.on('clear', function () {
                Assert.fail("The tree should be kept intact");
            });
            this.view.fire('universalDiscoveryBrowseView:visibleChange');
        },

        "Should rebuild the tree if the view is visible": function () {
            var contentService = new Mock(),
                tree = this.plugin.get('tree'),
                query = {body: {ViewInput: {LocationQuery: {}}}},
                cleared = false,
                load = false;

            tree.after('clear', Y.bind(function () {
                cleared = true;

                Assert.areSame(
                    this.view.get('loadContent'), tree.rootNode.data.loadContent,
                    "The loadContent flag should be set from the view"
                );
            }, this));

            tree.lazy.on('load', function (e) {
                Assert.areSame(
                    tree.rootNode, e.node,
                    "The root node should have been loaded"
                );
                load = true;
            });

            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: contentService
            });
            Mock.expect(contentService, {
                method: 'newViewCreateStruct',
                args: ['children_1', 'LocationQuery'],
                returns: query,
            });
            Mock.expect(contentService, {
                method: 'createView',
                args: [query, Mock.Value.Function],
                run: function (query, callback) {
                    callback(true);
                },
            });
            this.view.set('visible', true);
            this.view.fire('universalDiscoveryBrowseView:visibleChange');

            Assert.areSame(
                tree, this.view.get('treeView').get('tree'),
                "The tree should have been set on the treeView"
            );
            Assert.isTrue(cleared, "The tree should have been cleared");
            Assert.isTrue(load, "The tree root node should be loaded");
            Mock.verify(this.capi);
            Mock.verify(contentService);
        },

        "Should set the loadContent flag from the view": function () {
            this.view.set('loadContent', true);
            this["Should rebuild the tree if the view is visible"]();
        },

        "Should initialize the tree starting from the Location #1": function () {
            var rootNodeLocation, rootNode,
                restId = '/api/ezp/v2/content/locations/1';

            this["Should rebuild the tree if the view is visible"]();

            rootNode = this.plugin.get('tree').rootNode;
            rootNodeLocation = rootNode.data.location;
            Assert.areEqual(
                restId, rootNode.id,
                "The tree root node should have the root Location rest id as id"
            );
            Assert.isFalse(
                rootNode.state.leaf, "The root node should not be a leaf"
            );
            Assert.isTrue(
                rootNode.canHaveChildren, "The root node should be configured to have children"
            );
            Assert.areEqual(
                1, rootNodeLocation.get('locationId'),
                "The tree should be built from the Location #1"
            );
            Assert.areEqual(
                restId, rootNodeLocation.get('id'),
                "The tree should build from the Location '/api/ezp/v2/content/locations/1'"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.UniversalDiscoveryContentTree;
    registerTest.components = ['universalDiscoveryViewService'];

    Y.Test.Runner.setName("eZ Universal Discovery Content Tree Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'base', 'ez-universaldiscoverycontenttreeplugin', 'ez-pluginregister-tests']});

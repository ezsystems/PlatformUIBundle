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
            this.view.addTarget(this.service);
            this.plugin = new Y.eZ.Plugin.UniversalDiscoveryContentTree({
                host: this.service
            });
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
                cleared = false,
                load = false;

            tree.on('clear', function () {
                cleared = true;
            });

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
                method: 'loadLocationChildren',
                args: [Mock.Value.String, Mock.Value.Function],
                run: function (id, callback) {
                    Assert.areEqual(
                        tree.rootNode.id, id,
                        "The tree loading should start by the loading the children of the root"
                    );
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
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.UniversalDiscoveryContentTree;
    registerTest.components = ['universalDiscoveryViewService'];

    Y.Test.Runner.setName("eZ Universal Discovery Content Tree Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'base', 'ez-universaldiscoverycontenttreeplugin', 'ez-pluginregister-tests']});

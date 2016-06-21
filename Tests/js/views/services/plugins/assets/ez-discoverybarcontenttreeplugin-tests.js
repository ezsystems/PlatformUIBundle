/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarcontenttreeplugin-tests', function (Y) {
    var tests, loadingTest, notLocationViewTest, parallelLoadTest,
        registerTest, registerSearchTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Content Tree Plugin tests",

        setUp: function () {
            Y.eZ.LocationViewView = Y.View;
            this.app = new Y.Base();
            this.service = new Y.Base();
            this.service.set('app', this.app);
            this.view = new Y.eZ.LocationViewView();
            this.view.addTarget(this.service);
            this.app.set('activeView', this.view);
            this.plugin = new Y.eZ.Plugin.DiscoveryBarContentTree({
                host: this.service
            });
        },

        tearDown: function () {
            delete Y.eZ.LocationViewView;
            this.app.destroy();
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
            Y.eZ.LocationViewView = Y.View;
            this.app = new Y.Base();
            this.service = new Y.Base();
            this.service.set('app', this.app);
            this.service.search = new Mock();
            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
            });
            this.view = new Y.eZ.LocationViewView();
            this.app.set('activeView', this.view);
            this.view.addTarget(this.service);
            this.plugin = new Y.eZ.Plugin.DiscoveryBarContentTree({
                host: this.service
            });
        },

        tearDown: function () {
            delete Y.eZ.LocationViewView;
            this.app.destroy();
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

    notLocationViewTest = new Y.Test.Case({
        name: "eZ Content Tree Plugin not Location view tests",

        setUp: function () {
            this.contentInfo = {};
            Y.eZ.LocationViewView = Y.Base.create('locationView', Y.View, [], {});
            Y.eZ.Location = Y.Base.create('location', Y.Model, [], {}, {
                ATTRS: {
                    contentInfo: {
                        valueFn: Y.bind(function () {return this.contentInfo;}, this),
                    }
                }
            });

            this.app = new Y.Base();
            this.service = new Y.Base();
            this.service.set('app', this.app);
            this.service.search = new Mock();
            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (search, callback) {
                    callback(false, [], 0);
                },
            });
            this.view = new Y.View();
            this.view.addTarget(this.service);
            this.app.set('activeView', this.view);
            this.plugin = new Y.eZ.Plugin.DiscoveryBarContentTree({
                host: this.service
            });
            this.locationId = '/tostaky';
            this.plugin._set('rootLocationId', this.locationId);
        },

        tearDown: function () {
            delete Y.eZ.LocationViewView;
            delete Y.eZ.Location;
            this.app.destroy();
            this.service.destroy();
            this.plugin.destroy();
            this.view.destroy();
            delete this.service;
            delete this.plugin;
            delete this.view;
        },

        "Should reuse the tree if the root Location is present": function () {
            var tree = this.plugin.get('tree'),
                node;

            this.service.set('response', {view: {}});
            node = tree.rootNode.append({
                canHaveChildren: true,
                id: this.locationId,
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


        "Should initialized the tree starting from rootLocationId": function () {
            var tree = this.plugin.get('tree'),
                treeCleared = false, loadFired = false;

            this.service.set('response', {view: {}});
            this.view.set('expanded', true);

            tree.after('clear', Y.bind(function () {
                var rootNode = tree.rootNode;

                treeCleared = true;
                Assert.areEqual(
                    this.locationId, rootNode.id,
                    "The rootNode id should be the location id"
                );
            }, this));
            tree.lazy.after('load', Y.bind(function () {
                var rootNode = tree.rootNode;

                loadFired = true;
                Assert.isInstanceOf(
                    Y.eZ.Location, rootNode.data.location,
                    "The location should have been added to the root node"
                );
                Assert.areEqual(
                    this.locationId, rootNode.data.location.get('id'),
                    "The location id should be set"
                );
                Assert.areSame(
                    this.contentInfo, rootNode.data.contentInfo,
                    "The contentInfo should have been added to the root node"
                );
            }, this));
            this.view.fire('treeAction');

            Assert.isTrue(treeCleared, "The tree should have been cleared");
            Assert.isTrue(loadFired, "The tree should have been loaded");
            Assert.areSame(
                tree, this.view.get('tree'),
                "The view should receive the tree"
            );
        },
    });

    parallelLoadTest = new Y.Test.Case({
        name: "eZ Content Tree Plugin parallelLoad tests",

        setUp: function () {
            this.capi = new Mock();
            this.discoveryService = new Mock();
            this.locationId = '/a/ton/étoile';

            Mock.expect(this.capi, {
                method: 'getDiscoveryService',
                returns: this.discoveryService,
            });
            Mock.expect(this.discoveryService, {
                method: 'getInfoObject',
                args: ['rootLocation', Mock.Value.Function],
                run: Y.bind(function (name, callback) {
                    callback('', {_href: this.locationId});
                }, this),
            });
            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.plugin = new Y.eZ.Plugin.DiscoveryBarContentTree({
                host: this.service
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;
        },

        "Should set the rootLocationId attribute using discoveryService": function () {
            var callbackCalled = false;
            this.plugin.parallelLoad(function () {
                callbackCalled = true;
            });

            Assert.isTrue(
                callbackCalled,
                "The parallelLoad callback should have been called"
            );
            Assert.areEqual(
                 this.locationId, this.plugin.get('rootLocationId'),
                 "The rootLocationId attribute should be set"
            );
            Mock.verify(this.capi);
            Mock.verify(this.discoveryService);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.DiscoveryBarContentTree;
    registerTest.components = ['discoveryBarViewService'];

    registerSearchTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerSearchTest.Plugin = Y.eZ.Plugin.Search;
    registerSearchTest.components = ['discoveryBarViewService'];

    Y.Test.Runner.setName("eZ Discovery Bar Content Tree Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(loadingTest);
    Y.Test.Runner.add(notLocationViewTest);
    Y.Test.Runner.add(parallelLoadTest);
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(registerSearchTest);
}, '', {requires: ['test', 'base', 'view', 'model', 'ez-discoverybarcontenttreeplugin', 'ez-pluginregister-tests']});

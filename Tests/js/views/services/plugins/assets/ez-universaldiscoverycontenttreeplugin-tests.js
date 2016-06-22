/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverycontenttreeplugin-tests', function (Y) {
    var tests, registerTest, registerSearchTest, startingLocationTests,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Universal Discovery Content Tree Plugin tests",

        setUp: function () {
            this.service = new Y.Base();
            this.service.search = new Mock();
            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (search, callback) {
                    callback(false, [], 0);
                },
            });
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
            var tree = this.plugin.get('tree'),
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

            this.view.set('visible', true);
            this.view.fire('universalDiscoveryBrowseView:visibleChange');

            Assert.areSame(
                tree, this.view.get('treeView').get('tree'),
                "The tree should have been set on the treeView"
            );
            Assert.isTrue(cleared, "The tree should have been cleared");
            Assert.isTrue(load, "The tree root node should be loaded");
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

    startingLocationTests = new Y.Test.Case({
        name: "eZ Universal Discovery Content Tree Plugin with a starting Location tests",

        setUp: function () {
            var that = this,
                BrowseView = Y.Base.create('universalDiscoveryBrowseView', Y.View, [], {
                selectContent: Y.bind(function (struct) {
                    this.isContentSelected = true;
                    Assert.areSame(
                        this.view.get('startingLocationId'), struct.location.get('id'),
                        "the struct should have the startingLocation"
                    );
                    Assert.areSame(
                        this.struct.location, struct.location,
                        "the struct should have the Location"
                    );
                    Assert.areSame(
                        this.struct.location.get('contentInfo'), struct.contentInfo,
                        "the struct should have the contentInfo coming from the Location"
                    );
                    Assert.isUndefined(
                        struct.content,
                        "As loadContent is false the struct should not have a content"
                    );
                    Assert.areSame(
                        this.struct.contentType, struct.contentType,
                        "the struct should have the contentType"
                    );
                }, this),
            },{});

            this.isContentSelected = false;
            this.service = new Y.Base();
            this.service.search = new Mock();
            this.treeView = new Y.Base();
            this.view = new BrowseView();
            this.view.set('treeView', this.treeView);
            this.view.set('loadContent', false);
            this.startingLocationId = '/api/ezp/v2/content/locations/1/2';
            this.view.set('startingLocationId', this.startingLocationId);
            this.startingLocationLocationId = '1/2';
            this.path = [];
            this.origLocation = Y.eZ.Location;
            this.origContentType = Y.eZ.ContentType;

            Y.eZ.ContentType =  Y.Base.create('contentTypeModel', Y.Model, [], {
            }, {ATTRS: {isContainer: {value: false}}});
            Y.eZ.Location  = Y.Base.create('locationModel', Y.Base, [], {
                loadFromHash: function () {},
                loadPath: function (options, callback) {
                    callback(false, that.path);
                },
                load: function (options, callback) {
                    Assert.areSame(
                        that.view.get('startingLocationId'), this.get('id'),
                        "The location id should be the one provided by the view"
                    );
                    callback(false);
                },
            }, {ATTRS: {id: {}, locationId: {}, contentInfo: {}}});

            this.view.addTarget(this.service);
            this.plugin = new Y.eZ.Plugin.UniversalDiscoveryContentTree({
                host: this.service
            });

            this.struct = {
                location: new Y.eZ.Location({
                    id: this.startingLocationId,
                    locationId: this.startingLocationLocationId,
                    contentInfo: {},
                }),
                contentType: new Y.eZ.ContentType(),
            };

            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (search, callback) {
                    Assert.areEqual(
                        1, search.criteria.ParentLocationIdCriterion,
                        "The search should be on the children of the virtual root"
                    );
                    Assert.areEqual(
                        '/api/ezp/v2/content/locations/1',
                        search.sortLocation.get('id'),
                        "The search results should be sorted according to the sortField/sortOrder of virtual root Location"
                    );
                    Assert.isTrue(
                        search.loadContentType,
                        "The loadContentType flag should be set"
                    );
                    Assert.areSame(
                        this.view.get('loadContent'),
                        search.loadContent,
                        "The loadContent flag should be consistent with the browse view configuration"
                    );

                    callback(false, [this.struct], 1);
                }, this),
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

            Y.eZ.Location = this.origLocation;
            Y.eZ.ContentType = this.origContentType;
        },

        "Should rebuild the tree if the view is visible": function () {
            var tree = this.plugin.get('tree'),
                cleared = false,
                countLoad = 0;

            tree.after('clear', Y.bind(function () {
                cleared = true;
            }, this));

            tree.lazy.once('load', function (e) {
                Assert.areSame(
                    tree.rootNode, e.node,
                    "The root node should have been loaded"
                );
            });

            tree.lazy.on('load', function (e) {
                countLoad++;
            });

            Assert.areEqual(
               this.path.length, countLoad,
                "The load event was not fired the expected number of time"
            );

            this.view.set('visible', true);
            this.view.fire('universalDiscoveryBrowseView:visibleChange');
        },

        "Should initialize the tree starting from the given Location": function () {
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
            Assert.areEqual(
                'SECTION', rootNodeLocation.get('sortField'),
                "The sortField of the virtual root should be set to SECTION"
            );
            Assert.areEqual(
                'ASC', rootNodeLocation.get('sortOrder'),
                "The sortOrder of the virtual root should be set to ASC"
            );
            Assert.isTrue(
                rootNode.hasChildren(),
                "rootNode should have children"
            );
            Assert.isTrue(
                this.plugin.get('tree').getNodeById(this.view.get('startingLocationId')).isSelected(),
                "The node corresponding to the startingLocationId attribute of the view should be selected"
            );
            Assert.isTrue(
                this.isContentSelected,
                'selectContent should have been called'
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.UniversalDiscoveryContentTree;
    registerTest.components = ['universalDiscoveryViewService'];

    registerSearchTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerSearchTest.Plugin = Y.eZ.Plugin.Search;
    registerSearchTest.components = ['universalDiscoveryViewService'];

    Y.Test.Runner.setName("eZ Universal Discovery Content Tree Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(startingLocationTests);
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(registerSearchTest);
}, '', {requires: ['test', 'base', 'model', 'view', 'ez-universaldiscoverycontenttreeplugin', 'ez-pluginregister-tests']});

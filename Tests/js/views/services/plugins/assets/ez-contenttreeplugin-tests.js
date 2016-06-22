/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttreeplugin-tests', function (Y) {
    var tests, loadTest,
        Assert = Y.Assert, Mock = Y.Mock;

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
    });

    loadTest = new Y.Test.Case({
        name: "eZ Content Tree Plugin loading tests",

        setUp: function () {
            this.service = new Y.Base();
            this.service.search = new Mock();
            this.plugin = new Y.eZ.Plugin.ContentTree({
                host: this.service
            });

            this.id = '/api/ezp/v2/content/locations/1/2';
            this.locationId = 2;
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;

            Y.eZ.ContentType = this.origType;
        },

        _initTree: function (id, locationId, loadContent) {
            var tree = this.plugin.get('tree'), node,
                location = new Y.eZ.Location({locationId: locationId, id: id});

            tree.rootNode.data.loadContent = loadContent;
            node = tree.createNode({
                data: {location: location},
                id: id,
                canHaveChildren: true,
                state: {leaf: false, loaded: false}
            });
            tree.rootNode.append(node);
            node.close();
            return tree;
        },

        _assertSearch: function (location, loadContent, search) {
            Assert.isTrue(
                search.viewName.indexOf(location.get('locationId')) !== -1,
                "The view name should contain the Location id"
            );
            Assert.areEqual(
                location.get('locationId'),
                search.criteria.ParentLocationIdCriterion,
                "The ParentLocationIdCriterion should be used in the search"
            );
            Assert.areSame(
                location, search.sortLocation,
                "The Location should be provided as the sort Location"
            );
            Assert.areSame(
                loadContent,
                search.loadContent,
                "The loadContent flag should be consistent with the one on the tree root"
            );
            Assert.isTrue(
                search.loadContentType,
                "The loadContentType flag should be set"
            );
        },

        "Should search for children when opening the tree": function () {
            var loadContent = false,
                tree = this._initTree(this.id, this.locationId, loadContent),
                location = tree.getNodeById(this.id).data.location;

            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (search, callback) {
                    this._assertSearch(location, loadContent, search);
                }, this),
            });
            this.service.fire('whatever:toggleNode', {
                nodeId: this.id
            });

            Mock.verify(this.service.search);
        },

        "Should search for children (with content) when opening the tree": function () {
            var loadContent = true,
                tree = this._initTree(this.id, this.locationId, loadContent),
                location = tree.getNodeById(this.id).data.location;

            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (search, callback) {
                    this._assertSearch(location, loadContent, search);
                }, this),
            });
            this.service.fire('whatever:toggleNode', {
                nodeId: this.id
            });

            Mock.verify(this.service.search);
        },

        "Should handle search error": function () {
            var tree = this._initTree(this.id, this.locationId, true),
                errorFired = false;

            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (search, callback) {
                    callback(true);
                }, this),
            });
            tree.lazy.on('error', function (evt) {
                errorFired = true;
            });
            this.service.fire('whatever:toggleNode', {
                nodeId: this.id
            });
            Assert.isTrue(
                errorFired,
                "The search error should have been handled"
            );
        },

        _getSearchResult: function (locationId, childCount, isContainer) {
            var location = new Y.Base(),
                contentType = new Y.Base();

            location.set('id', locationId);
            location.set('childCount', childCount);
            location.set('contentInfo', new Y.Base());
            contentType.set('isContainer', isContainer);

            return {
                location: location,
                contentType: contentType,
                content: new Y.Base(),
            };
        },

        _getSearchResults: function () {
            return [
                this._getSearchResult('2/3', 0, false),
                this._getSearchResult('2/4', 12, true),
            ];
        },

        "Should build the tree based on the search result": function () {
            var tree = this._initTree(this.id, this.locationId, true),
                baseNode = tree.getNodeById(this.id),
                results = this._getSearchResults();

            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (search, callback) {
                    callback(false, results);
                }, this),
            });
            this.service.fire('whatever:toggleNode', {
                nodeId: this.id
            });

            results.forEach(function (struct) {
                var node = tree.getNodeById(struct.location.get('id'));

                Assert.isObject(
                    node,
                    "A node for the Location should have been added"
                );
                Assert.areSame(
                    baseNode,
                    node.parent,
                    "The added node should have the base node as parent"
                );
                Assert.areSame(
                    struct.contentType.get('isContainer'),
                    node.canHaveChildren,
                    "The node canHaveChildren should be the isContainer flag"
                );
                Assert.areSame(
                    struct.location.get('childCount') === 0,
                    node.state.leaf,
                    "The node leaf flag should be set based on the childCount"
                );
                Assert.areSame(
                    struct.location,
                    node.data.location,
                    "The location should be stored in the node's data"
                );
                Assert.areSame(
                    struct.contentType,
                    node.data.contentType,
                    "The contentType should be stored in the node's data"
                );
                Assert.areSame(
                    struct.content,
                    node.data.content,
                    "The content should be stored in the node's data"
                );
                Assert.areSame(
                    struct.location.get('contentInfo'),
                    node.data.contentInfo,
                    "The contentInfo should be stored in the node's data"
                );
            }, this);
        },
    });

    Y.Test.Runner.setName("eZ Content Tree Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(loadTest);
}, '', {requires: ['test', 'base', 'ez-contenttreeplugin', 'ez-pluginregister-tests']});

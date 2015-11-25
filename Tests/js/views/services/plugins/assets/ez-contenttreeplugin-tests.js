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
            var capi = new Mock();

            this.contentService = new Mock();
            Mock.expect(capi, {
                method: 'getContentService',
                returns: this.contentService
            });
            this.service = new Y.Base();
            this.service.set('capi', capi);
            this.plugin = new Y.eZ.Plugin.ContentTree({
                host: this.service
            });
            this.origType = Y.eZ.ContentType;

            this.locationIds = ['/api/ezp/v2/content/locations/1/2/74/75', '/api/ezp/v2/content/locations/1/2/74/80'];
            this.contentTypesIds = ['/api/ezp/v2/content/types/1', '/api/ezp/v2/content/types/2'];
            Y.eZ.ContentType = Y.Base.create('contentTypeModel', Y.Base, [], {
                load: function (options, callback) {
                    loadTest._contentTypeLoad(this, options, callback);
                },
            }, {ATTRS: {id: {}}});
            this._contentTypeLoadSuccess = true;
            this._loadedContentTypeIds = [];
        },

        _contentTypeLoad: function (contentType, options, callback) {
            Assert.areSame(
                this.service.get('capi'),
                options.api,
                "The load method should receive the CAPI"
            );
            this._loadedContentTypeIds.push(contentType.get('id'));
            callback(!this._contentTypeLoadSuccess);
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


        "Should do a LocationQuery": function () {
            var locationId = 42,
                id = '/whatever/' + locationId,
                query = {body: {ViewInput: {LocationQuery: {}}}};

            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [Mock.Value.String, 'LocationQuery'],
                run: function (name, type) {
                    Assert.isTrue(
                        name.indexOf('_' + locationId) != -1,
                        "The name of the query should contain the location id"
                    );
                    return query;
                },
            });
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [query, Mock.Value.Function],
                run: function (q, callback) {
                    Assert.areEqual(
                        locationId,
                        q.body.ViewInput.LocationQuery.Criteria.ParentLocationIdCriterion,
                        "The query should request children locations"
                    );
                    callback(true); // error to ease testing
                },
            });
            this._initTree(id, locationId);

            this.service.fire('whatever:toggleNode', {
                nodeId: id
            });
        },

        _getLocationSearchResponse: function () {
            return {
                document: {
                    "View": {
                        "Result": {
                            "searchHits": {
                                "searchHit": [
                                    {
                                        "value": {
                                            "Location": {
                                                "_href": this.locationIds[0],
                                                "id": 75,
                                                "priority": 0,
                                                "hidden": false,
                                                "invisible": false,
                                                "pathString": "/1/2/74/75/",
                                                "depth": 3,
                                                "childCount": 0,
                                                "remoteId": "c07971827e6e6cdbb9ab4e65a1ca7634",
                                                "sortField": "PATH",
                                                "sortOrder": "ASC",
                                                "ContentInfo": {
                                                    "_href": "/api/ezp/v2/content/objects/73",
                                                    "Content": {
                                                        "_media-type": "application/vnd.ez.api.ContentInfo+json",
                                                        "_href": "/api/ezp/v2/content/objects/73",
                                                        "_remoteId": "88ebdebc4d5e55ebe841c50a92882961",
                                                        "_id": 73,
                                                        "ContentType": {
                                                            "_media-type": "application/vnd.ez.api.ContentType+json",
                                                            "_href": this.contentTypesIds[0],
                                                        },
                                                        "Name": "Products",
                                                        "lastModificationDate": "2012-03-28T13:44:04+02:00",
                                                        "publishedDate": "2012-03-28T12:12:21+02:00",
                                                        "mainLanguageCode": "eng-GB",
                                                        "alwaysAvailable": true,
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "value": {
                                            "Location": {
                                                "_href": this.locationIds[1],
                                                "id": 80,
                                                "priority": 0,
                                                "hidden": false,
                                                "invisible": false,
                                                "pathString": "/1/2/74/80/",
                                                "depth": 3,
                                                "childCount": 4,
                                                "remoteId": "a655946daa57223381420cf5d93dfed2",
                                                "sortField": "PUBLISHED",
                                                "sortOrder": "ASC",
                                                "ContentInfo": {
                                                    "_href": "/api/ezp/v2/content/objects/78",
                                                    "Content": {
                                                        "_media-type": "application/vnd.ez.api.ContentInfo+json",
                                                        "_href": "/api/ezp/v2/content/objects/78",
                                                        "_remoteId": "3d8a1028538c7c1d019cb39890b7d64a",
                                                        "_id": 78,
                                                        "ContentType": {
                                                            "_media-type": "application/vnd.ez.api.ContentType+json",
                                                            "_href": this.contentTypesIds[1],
                                                        },
                                                        "Name": "Services",
                                                        "lastModificationDate": "2013-02-25T18:32:54+01:00",
                                                        "publishedDate": "2012-03-28T12:35:04+02:00",
                                                        "mainLanguageCode": "eng-GB",
                                                        "alwaysAvailable": true,
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            };
        },

        _getContentSearchResponse: function () {
            return {
                document: {
                    "View": {
                        "Result": {
                            "searchHits": {
                                "searchHit": [
                                    {
                                        "value": {
                                                "Content": {
                                                    "_media-type": "application\/vnd.ez.api.Content+json",
                                                    "_href": "\/api\/ezp\/v2\/content\/objects\/73",
                                                    "_remoteId": "52fdba11e87ba8905da8b7c5ef275edd",
                                                    "_id": 73,
                                                    "ContentType": {
                                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                                        "_href": this.contentTypesIds[0]
                                                    },
                                                    "MainLocation": {
                                                        "_media-type": "application\/vnd.ez.api.Location+json",
                                                        "_href": this.locationIds[0]
                                                    },
                                                    "Name": "Products",
                                                    "Versions": {
                                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                                        "_href": "\/api\/ezp\/v2\/content\/objects\/73\/versions"
                                                    },
                                                    "CurrentVersion": {
                                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                                        "_href": "\/api\/ezp\/v2\/content\/objects\/73\/currentversion",
                                                        "Version": {
                                                            "_media-type": "application\/vnd.ez.api.Version+json",
                                                            "_href": "\/api\/ezp\/v2\/content\/objects\/73\/versions\/2",
                                                            "VersionInfo": {
                                                                "id": 605,
                                                                "versionNo": 2,
                                                                "status": "PUBLISHED",
                                                                "modificationDate": "2015-11-13T11:59:53+01:00",
                                                                "Creator": {
                                                                    "_media-type": "application\/vnd.ez.api.User+json",
                                                                    "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                                                },
                                                                "creationDate": "2015-11-13T11:59:52+01:00",
                                                                "initialLanguageCode": "fre-FR",
                                                                "languageCodes": "eng-GB,fre-FR",
                                                                "names": {
                                                                    "value": [
                                                                    {
                                                                        "_languageCode": "eng-GB",
                                                                        "#text": "Products"
                                                                    },
                                                                    ]
                                                                },
                                                                "Content": {
                                                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                                                    "_href": "\/api\/ezp\/v2\/content\/objects\/73"
                                                                }
                                                            },
                                                            "Fields": {
                                                                "field": [
                                                                ]
                                                            },
                                                            "Relations": {
                                                                "_media-type": "application\/vnd.ez.api.RelationList+json",
                                                                "_href": "\/api\/ezp\/v2\/content\/objects\/73\/versions\/2\/relations",
                                                                "Relation": [

                                                                    ]
                                                            }
                                                        }
                                                    },
                                            }
                                        }
                                    },
                                    {
                                        "value": {
                                            "Content": {
                                                    "_media-type": "application\/vnd.ez.api.Content+json",
                                                    "_href": "\/api\/ezp\/v2\/content\/objects\/78",
                                                    "_remoteId": "52fdba11e87ba8905da8b7c5ef275edd",
                                                    "_id": 139,
                                                    "ContentType": {
                                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                                        "_href": this.contentTypesIds[1]
                                                    },
                                                    "MainLocation": {
                                                        "_media-type": "application\/vnd.ez.api.Location+json",
                                                        "_href": this.locationIds[1]
                                                    },
                                                    "Name": "Services",
                                                    "Versions": {
                                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                                        "_href": "\/api\/ezp\/v2\/content\/objects\/78\/versions"
                                                    },
                                                    "CurrentVersion": {
                                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                                        "_href": "\/api\/ezp\/v2\/content\/objects\/139\/currentversion",
                                                        "Version": {
                                                            "_media-type": "application\/vnd.ez.api.Version+json",
                                                            "_href": "\/api\/ezp\/v2\/content\/objects\/139\/versions\/2",
                                                            "VersionInfo": {
                                                                "id": 605,
                                                                "versionNo": 2,
                                                                "status": "PUBLISHED",
                                                                "modificationDate": "2015-11-13T11:59:53+01:00",
                                                                "Creator": {
                                                                    "_media-type": "application\/vnd.ez.api.User+json",
                                                                    "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                                                },
                                                                "creationDate": "2015-11-13T11:59:52+01:00",
                                                                "initialLanguageCode": "fre-FR",
                                                                "languageCodes": "eng-GB,fre-FR",
                                                                "names": {
                                                                    "value": [
                                                                    {
                                                                        "_languageCode": "eng-GB",
                                                                        "#text": "Services"
                                                                    },
                                                                    ]
                                                                },
                                                                "Content": {
                                                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                                                    "_href": "\/api\/ezp\/v2\/content\/objects\/139"
                                                                }
                                                            },
                                                            "Fields": {
                                                                "field": [
                                                                ]
                                                            },
                                                            "Relations": {
                                                                "_media-type": "application\/vnd.ez.api.RelationList+json",
                                                                "_href": "\/api\/ezp\/v2\/content\/objects\/139\/versions\/2\/relations",
                                                                "Relation": [

                                                                    ]
                                                            }
                                                        }
                                                    },
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            };
        },


        "Should parse the search result": function () {
            var locationId = 42, tree,
                id = '/whatever/' + locationId,
                query = {body: {ViewInput: {LocationQuery: {}}}},
                response = this._getLocationSearchResponse();

            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [Mock.Value.String, 'LocationQuery'],
                returns: query,
            });
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [query, Mock.Value.Function],
                run: function (q, callback) {
                    callback(false, response);
                },
            });
            this._initTree(id, locationId, false);

            this.service.fire('whatever:toggleNode', {
                nodeId: id
            });

            tree = this.plugin.get('tree');

            Y.Array.each(this.locationIds, function (locId) {
                var node = tree.getNodeById(locId),
                    loc = node.data.location,
                    ct = node.data.contentType,
                    ci = node.data.contentInfo;

                Assert.isObject(
                    node,
                    "The node id should be the Location id"
                );
                Assert.areEqual(
                    locId, loc.get('id'),
                    "The location should have been created from the search result"
                );
                Assert.isInstanceOf(
                    Y.eZ.ContentInfo, ci,
                    "The contentInfo should be set on the node"
                );
                Assert.isInstanceOf(
                    Y.eZ.ContentType, ct,
                    "The contentType should be set on the node"
                );
                Assert.areEqual(
                    ci.get('resources').ContentType, ct.get('id'),
                    "The contentType should have been created with the contentInfo"
                );
                Assert.areSame(
                    node.state.leaf, loc.get('childCount') === 0,
                    "The leaf state should be set from the childCount"
                );
            });
        },

        "Should load the content types": function () {
            this["Should parse the search result"]();

            Y.Array.each(this.contentTypesIds, function (ctId) {
                Assert.isTrue(
                    this._loadedContentTypeIds.indexOf(ctId) !== -1,
                    "The content types should be loaded (" + ctId + ")"
                );
            }, this);
        },

        "Should load the contents": function () {
            var locationId = 42, tree,
                id = '/whatever/' + locationId,
                locationQuery = {body: {ViewInput: {LocationQuery: {}}}},
                contentQuery = {body: {ViewInput: {ContentQuery: {}}}},
                contentResponse = this._getContentSearchResponse(),
                locationResponse = this._getLocationSearchResponse();

            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [Mock.Value.String, Mock.Value.String],
                run: function (name, type) {
                    if ( type === 'LocationQuery' ) {
                        return locationQuery;
                    } else if ( type === 'ContentQuery' ) {
                        return contentQuery;
                    }
                    Y.fail("Unexpected query type");
                },
            });
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (q, callback) {
                    if ( q === locationQuery ) {
                        return callback(false, locationResponse);
                    } else if ( q === contentQuery ) {
                        return callback(false, contentResponse);
                    }
                    Y.fail("createView received an unexpected query");
                },
            });
            this._initTree(id, locationId, true);

            this.service.fire('whatever:toggleNode', {
                nodeId: id
            });

            tree = this.plugin.get('tree');

            Y.Array.each(this.locationIds, function (locId) {
                var node = tree.getNodeById(locId),
                    location = node.data.location,
                    content = node.data.content;

                Assert.areEqual(
                    location.get('contentInfo').get('id'),
                    content.get('id'),
                    "The Location's Content should be available in the node data"
                );
            });
        },

        "Should handle content loading error": function () {
            var locationId = 42, tree,
                id = '/whatever/' + locationId,
                locationQuery = {body: {ViewInput: {LocationQuery: {}}}},
                contentQuery = {body: {ViewInput: {ContentQuery: {}}}},
                contentResponse = this._getContentSearchResponse(),
                locationResponse = this._getLocationSearchResponse(),
                errorFired = false;

            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [Mock.Value.String, Mock.Value.String],
                run: function (name, type) {
                    if ( type === 'LocationQuery' ) {
                        return locationQuery;
                    } else if ( type === 'ContentQuery' ) {
                        return contentQuery;
                    }
                    Y.fail("Unexpected query type");
                },
            });
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (q, callback) {
                    if ( q === locationQuery ) {
                        return callback(false, locationResponse);
                    } else if ( q === contentQuery ) {
                        return callback(true, contentResponse);
                    }
                    Y.fail("createView received an unexpected query");
                },
            });
            tree = this._initTree(id, locationId, true);

            tree.lazy.on('error', function (evt) {
                errorFired = true;
            });
            this.service.fire('whatever:toggleNode', {
                nodeId: id
            });

            Assert.isTrue(errorFired, "The type loading error should trigger an error on the tree");
        },

        "Should handle content type loading error": function () {
            var locationId = 42,
                id = '/whatever/' + locationId,
                query = {body: {ViewInput: {LocationQuery: {}}}},
                response = this._getLocationSearchResponse(),
                errorFired = false,
                tree;

            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [Mock.Value.String, 'LocationQuery'],
                returns: query,
            });
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [query, Mock.Value.Function],
                run: function (q, callback) {
                    callback(false, response);
                },
            });
            this._contentTypeLoadSuccess = false;
            tree = this._initTree(id, locationId);

            tree.lazy.on('error', function (evt) {
                errorFired = true;
            });
            this.service.fire('whatever:toggleNode', {
                nodeId: id
            });

            Assert.isTrue(errorFired, "The type loading error should trigger an error on the tree");
        },
    });

    Y.Test.Runner.setName("eZ Content Tree Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(loadTest);
}, '', {requires: ['test', 'base', 'ez-contenttreeplugin', 'ez-pluginregister-tests']});

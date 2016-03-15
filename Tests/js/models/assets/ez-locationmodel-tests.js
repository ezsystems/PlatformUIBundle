/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationmodel-tests', function (Y) {
    var modelTest, trashTest, moveTest, hideTest, removeTest, loadPathTest, toJSONTest,
        Assert = Y.Assert, Mock = Y.Mock;

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ Location Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadLocation';
            this.rootProperty = "Location";
            this.parsedAttributeNumber = Y.eZ.Location.ATTRS_REST_MAP.length + 2; // links, content
            this.loadResponse = {
                "Location": {
                    "_media-type": "application/vnd.ez.api.Location+json",
                    "_href": "/api/ezp/v2/content/locations/1/2/61",
                    "id": 61,
                    "priority": -12,
                    "hidden": "false",
                    "invisible": "false",
                    "ParentLocation": {
                        "_media-type": "application/vnd.ez.api.Location+json",
                        "_href": "/api/ezp/v2/content/locations/1/2"
                    },
                    "pathString": "/1/2/61/",
                    "depth": 2,
                    "childCount": 3,
                    "remoteId": "a056661abf6a4c778ca3a642797ae5e3",
                    "Children": {
                        "_media-type": "application/vnd.ez.api.LocationList+json",
                        "_href": "/api/ezp/v2/content/locations/1/2/61/children"
                    },
                    "ContentInfo": {
                        "_media-type": "application/vnd.ez.api.ContentInfo+json",
                        "_href": "/api/ezp/v2/content/objects/123",
                        "Content": {
                            "_media-type": "application/vnd.ez.api.ContentInfo+json",
                            "_href": "/api/ezp/v2/content/objects/123",
                            "_remoteId": "bec12c855645c45c23c11abe83ad4d79",
                            "_id": 123,
                            "ContentType": {
                                "_media-type": "application/vnd.ez.api.ContentType+json",
                                "_href": "/api/ezp/v2/content/types/18"
                            },
                            "Name": "test-content",
                            "Versions": {
                                "_media-type": "application/vnd.ez.api.VersionList+json",
                                "_href": "/api/ezp/v2/content/objects/123/versions"
                            },
                            "CurrentVersion": {
                                "_media-type": "application/vnd.ez.api.Version+json",
                                "_href": "/api/ezp/v2/content/objects/123/currentversion"
                            },
                            "Section": {
                                "_media-type": "application/vnd.ez.api.Section+json",
                                "_href": "/api/ezp/v2/content/sections/1"
                            },
                            "Locations": {
                                "_media-type": "application/vnd.ez.api.LocationList+json",
                                "_href": "/api/ezp/v2/content/objects/123/locations"
                            },
                            "Owner": {
                                "_media-type": "application/vnd.ez.api.User+json",
                                "_href": "/api/ezp/v2/user/users/14"
                            },
                            "lastModificationDate": "2015-07-22T11:12:51+02:00",
                            "publishedDate": "2015-07-08T15:07:38+02:00",
                            "mainLanguageCode": "fre-FR",
                            "alwaysAvailable": false,
                            "ObjectStates": {
                                "_media-type": "application/vnd.ez.api.ContentObjectStates+json",
                                "_href": "/api/ezp/v2/content/objects/123/objectstates"
                            }
                        }
                    },
                    "Content": {
                        "_media-type": "application/vnd.ez.api.Content+json",
                        "_href": "/api/ezp/v2/content/objects/123"
                    },
                    "sortField": "PATH",
                    "sortOrder": "ASC"
                }
            };
        },

        setUp: function () {
            this.model = new Y.eZ.Location();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "The content info should be instance of eZ.ContentInfo": function () {
            var contentInfoStruct = this.loadResponse.Location.ContentInfo;

            this.model.set('contentInfo', contentInfoStruct);
            Y.Assert.isInstanceOf(
                Y.eZ.ContentInfo,
                this.model.get('contentInfo'),
                'Content Info should be instance of eZ.ContentInfo'
            );
            Y.Assert.areEqual(
                contentInfoStruct.Content.Name,
                this.model.get('contentInfo').get('name'),
                'Should instantiate content info with the name'
            );
        },

        "The content info should be instance of eZ.ContentInfo when set to undefined": function () {
            this.model.set('contentInfo', undefined);
            Y.Assert.isInstanceOf(
                Y.eZ.ContentInfo,
                this.model.get('contentInfo'),
                'ContentInfo should be instance of eZ.ContentInfo'
            );
        },

        "Should read the content info": function () {
            var m = this.model,
                response = {
                    document: this.loadResponse
                },
                contentInfo, res,
                respContentInfo = this.loadResponse.Location.ContentInfo;

            res = m.parse(response);
            contentInfo = res.contentInfo;

            Y.Assert.isObject(
                contentInfo,
                "The contentInfo should be object"
            );

            Y.Assert.areEqual(
                respContentInfo.Content._href,
                contentInfo.Content._href,
                "The content info should be imported and have the same ids"
            );

            Y.Assert.areEqual(
                respContentInfo.Content.Name,
                contentInfo.Content.Name,
                "The content info should be imported and have the same names"
            );
        },

        "Should parse the id": function () {
            var m = this.model,
                response = {document: this.loadResponse},
                res;

            res = m.parse(response);

            Y.Assert.areEqual(
                this.loadResponse.Location._href,
                res.id,
                "The _href property should be parsed and returned as the id"
            );
        },
    }));

    trashTest = new Y.Test.Case({
        name: "eZ Location Model trash tests",

        setUp: function () {
            this.model = new Y.eZ.Location();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should move location to trash": function () {
            var capiMock = new Mock(),
                contentServiceMock = new Mock(),
                discoveryServiceMock = new Mock(),
                locationId = 'ronaldo-luis-nazario-de-lima',
                getInfoObjectResponse = {"_href": 'fabrizio-ravanelli'};

            Mock.expect(capiMock, {
                method: 'getContentService',
                returns: contentServiceMock,
            });

            Mock.expect(capiMock, {
                method: 'getDiscoveryService',
                returns: discoveryServiceMock,
            });

            Mock.expect(discoveryServiceMock, {
                method: 'getInfoObject',
                args: ["trash", Mock.Value.Function],
                run: function (object, cb) {
                    cb(false, getInfoObjectResponse);
                }
            });

            Mock.expect(this.model, {
                method: 'get',
                args: [Mock.Value.String],
                returns: locationId
            });

            Mock.expect(contentServiceMock, {
                method: 'moveSubtree',
                args: [locationId, getInfoObjectResponse._href, Mock.Value.Function],
                run: function (id, trashPath, cb) {
                    cb(false);
                }
            });

            this.model.trash({
                api: capiMock
            }, function (error) {
                Assert.isFalse(
                    error,
                    "No error should be detected"
                );
            });
        },

        "Should catch error when getInfoObject returns error": function () {
            var capiMock = new Mock(),
                discoveryServiceMock = new Mock();

            Mock.expect(capiMock, {
                method: 'getDiscoveryService',
                returns: discoveryServiceMock,
            });

            Mock.expect(discoveryServiceMock, {
                method: 'getInfoObject',
                args: ["trash", Mock.Value.Function],
                run: function (object, cb) {
                    cb(true);
                }
            });

            this.model.trash({
                api: capiMock
            }, function (error) {
                Assert.isTrue(
                    error,
                    "Error should be detected"
                );
            });
        }
    });

    moveTest = new Y.Test.Case({
        name: "eZ location model move tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.locationId = '1/2/3';
            this.model = new Y.eZ.Location({id: this.locationId});
            this.contentServiceMock = new Y.Mock();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should move the location": function () {
            var callback = function () {},
                parentLocationId = '4/5/6',
                options = {api: this.capiMock};

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentServiceMock
            });
            Y.Mock.expect(this.contentServiceMock, {
                method: 'moveSubtree',
                args: [this.locationId, parentLocationId, callback],
            });
            this.model.move(options, parentLocationId, callback);
            Y.Mock.verify(this.contentServiceMock);
            Y.Mock.verify(this.capiMock);
        },
    });

    hideTest = new Y.Test.Case({
        name: "eZ location model hide tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.locationId = '1/2/3';
            this.sortField = "choucroute";
            this.sortOrder = "couscous";
            this.contentServiceMock = new Y.Mock();
            this.hidden = 'tartiflette';
            this.updateStruct = {
                body: {
                    LocationUpdate: {
                        hidden: "nothing",
                        sortField: this.sortField,
                        sortOrder: this.sortOrder
                    }
                }
            };
            this.model = new Y.eZ.Location({
                id: this.locationId,
                sortField: this.sortField,
                sortOrder: this.sortOrder,
                hidden: this.hidden,
            });
            this.callbackCalled = false;

            this.callback = Y.bind(function () {
                this.callbackCalled = true;
            }, this);

            Mock.expect(this.capiMock, {
                method: 'getContentService',
                callCount: 2,
                returns: this.contentServiceMock
            });

            Mock.expect(this.contentServiceMock, {
                method: 'newLocationUpdateStruct',
                returns: this.updateStruct
            });
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        _configureUpdateLocationMock: function (cbError) {
            Mock.expect(this.contentServiceMock, {
                method: 'updateLocation',
                args: [this.locationId, this.updateStruct, Mock.Value.Function],
                run: function (id, struct, cb) {
                    cb(cbError);
                },
            });
        },

        "Should hide the location": function () {
            var options = {api: this.capiMock};

            this._configureUpdateLocationMock(false);

            this.model.hide(options, this.callback);

            Assert.isTrue(
                this.model.get('hidden'),
                "Attribute hidden should have been set to true"
            );
            Assert.isTrue(
                this.callbackCalled,
                "Callback should have been called"
            );

            Mock.verify(this.contentServiceMock);
            Mock.verify(this.capiMock);
        },

        "Should unhide the location": function () {
            var options = {api: this.capiMock};

            this._configureUpdateLocationMock(false);

            this.model.unhide(options, this.callback);

            Assert.isFalse(
                this.model.get('hidden'),
                "Attribute hidden should have been set to false"
            );
            Assert.isTrue(
                this.callbackCalled,
                "Callback should have been called"
            );

            Mock.verify(this.contentServiceMock);
            Mock.verify(this.capiMock);
        },

        "Should not update hidden attribute on error": function () {
            var options = {api: this.capiMock};

            this._configureUpdateLocationMock(true);

            this.model.unhide(options, this.callback);

            Assert.areSame(
                this.hidden,
                this.model.get('hidden'),
                "Attribute hidden should not have been modified"
            );
            Assert.isTrue(
                this.callbackCalled,
                "Callback should have been called"
            );

            Mock.verify(this.contentServiceMock);
            Mock.verify(this.capiMock);
        },
    });

    removeTest = new Y.Test.Case({
        name: "eZ location model remove tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.contentService = new Y.Mock();
            this.locationId = '1/2/3';
            this.model = new Y.eZ.Location({id: this.locationId});

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentService,
            });
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should delete the location in the repository": function () {
            var location = this.model,
                deleteLocationResponse = 'The response';

            Y.Mock.expect(this.contentService, {
                method: 'deleteLocation',
                args: [this.model.get('id'), Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(false, deleteLocationResponse);
                }
            });

            this.model.destroy({
                remove: true,
                api: this.capiMock
            }, function (error, response) {
                Y.Assert.isFalse(!!error, "The destroy callback should be called without error");
                Y.Assert.isNull(
                    location.get('id'),
                    "The location object should reseted"
                );
                Y.Assert.areSame(
                    response,
                    deleteLocationResponse,
                    "The response should be the same as in REST call"
                );
            });

            Y.Mock.verify(this.contentService);
        },

        "Should not handle the error if `id` attribute is empty": function () {
            this.model.set('id', null);

            this.model.destroy({
                remove: true,
                api: this.capiMock
            }, function (error) {
                Y.Assert.isFalse(!!error, "The destroy callback should be called without an error");
            });

            Y.Mock.verify(this.contentService);
        },

        "Should handle the error while deleting the location": function () {
            var location = this.model,
                locationId = this.locationId;

            Y.Mock.expect(this.contentService, {
                method: 'deleteLocation',
                args: [this.model.get('id'), Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(true);
                }
            });

            this.model.destroy({
                remove: true,
                api: this.capiMock
            }, function (error) {
                Y.Assert.isTrue(!!error, "The destroy callback should be called with an error");

                Y.Assert.areEqual(
                    locationId, location.get('id'),
                    "The location object should be left intact"
                );
            });

            Y.Mock.verify(this.contentService);
        }
    });

    loadPathTest = new Y.Test.Case({
        name: "eZ location model load path tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.contentService = new Y.Mock();
            this.locationId = '/1/2/3/4';
            this.pathString = '/path/string/1/2/3';
            this.model = new Y.eZ.Location({id: this.locationId, pathString: this.pathString});
            this.loadAncestorsResponse = {
                document: {
                    View: {
                        Result: {
                            searchHits: {
                                searchHit: [
                                    {value: { Location: {_href: '/parent/location', depth: 2}}},
                                    {value: { Location: {_href: '/grand/parent/location', depth: 1}}},
                                    {value: { Location: {_href: this.locationId, depth: 3}}},
                                    {value: { Location: {_href: '/home/location', depth: 0}}},
                                ]
                            }
                        }
                    }
                }
            };
            this.viewCreateStruct = {
                body: {
                    ViewInput: {
                        LocationQuery : {

                        }
                    }
                }
            };

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentService,
            });

            Y.Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [Y.Mock.Value.String, 'LocationQuery'],
                returns: this.viewCreateStruct
            });
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        _assertLocations: function (locations) {
            var i,
                that = this;

            Assert.isArray(
                locations,
                "The result in callback should be an array"
            );
            Assert.areEqual(
                this.loadAncestorsResponse.document.View.Result.searchHits.searchHit.length-1,
                locations.length,
                "The result array should be reduced by current location"
            );
            Y.Array.each(locations, function (location) {
                Assert.isObject(location, "The item included in result array should be an object");
                Assert.areEqual(
                    location.name,
                    'locationModel',
                    "The item included in result array should be the locationModel instance"
                );
                Assert.areNotEqual(
                    location.get('id'),
                    that.model.get('id'),
                    "Current location should not be included in the result"
                );
            });

            for (i = 0; i != locations.length; ++i) {
                Y.Assert.areSame(
                    i, locations[i].get('depth'),
                    "The path should be sorted by depth"
                );
            }
        },


        "Should load path for the location": function () {
            var that = this;

            Y.Mock.expect(this.contentService, {
                method: 'createView',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (query, callback) {
                    Assert.isString(
                        query.body.ViewInput.LocationQuery.Criteria.AncestorCriterion,
                        "The query should contain AncestorCriterion"
                    );
                    Assert.areSame(
                        query.body.ViewInput.LocationQuery.Criteria.AncestorCriterion,
                        that.pathString,
                        "The AncestorCriterion of query should be set to the location's pathString"
                    );
                    callback(false, that.loadAncestorsResponse);
                }
            });

            this.model.loadPath({
                api: this.capiMock
            }, function (error, locations) {
                Assert.isFalse(
                    error,
                    "No error should be detected"
                );

                that._assertLocations(locations);
                that._assertLocations(that.model.get('path'));
            });
        },

        "Should handle the error if create REST view fails": function () {
            Y.Mock.expect(this.contentService, {
                method: 'createView',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    callback(true);
                }
            });

            this.model.loadPath({
                api: this.capiMock
            }, function (error) {
                Assert.isTrue(
                    error,
                    "Error should be detected"
                );
            });
        }
    });

    toJSONTest = new Y.Test.Case({
        name: "eZ Location Model toJSON test",

        setUp: function () {
            this.model = new Y.eZ.Location();
            this.pathItemMock = new Mock();
            this.pathMock = [this.pathItemMock];
            this.mockJSON = {'whatever': ''};

            Mock.expect(this.pathItemMock, {
                method: 'toJSON',
                returns: this.mockJSON,
            });
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should convert path in attribute": function () {
            var json;

            this.model._set('path', this.pathMock);

            json = this.model.toJSON();

            Mock.verify(this.pathItemMock);
            Assert.areSame(
                this.mockJSON, json.path[0],
                "The path attribute should be jsonified"
            );
        },

        "Should not convert path in attribute if path is not set": function () {
            var json = this.model.toJSON();

            Assert.isFalse (
                json.path,
                "Path should be set to its default value"
            );
        },
    });

    Y.Test.Runner.setName("eZ Location Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(trashTest);
    Y.Test.Runner.add(moveTest);
    Y.Test.Runner.add(hideTest);
    Y.Test.Runner.add(removeTest);
    Y.Test.Runner.add(loadPathTest);
    Y.Test.Runner.add(toJSONTest);
}, '', {requires: ['test', 'model-tests', 'ez-locationmodel', 'ez-restmodel']});

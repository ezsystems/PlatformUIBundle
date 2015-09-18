/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationmodel-tests', function (Y) {
    var modelTest, trashTest, moveTest,
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

    Y.Test.Runner.setName("eZ Location Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(trashTest);
    Y.Test.Runner.add(moveTest);
}, '', {requires: ['test', 'model-tests', 'ez-locationmodel', 'ez-restmodel']});

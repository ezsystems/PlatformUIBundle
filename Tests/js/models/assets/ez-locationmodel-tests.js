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
            this.parsedAttributeNumber = Y.eZ.Location.ATTRS_REST_MAP.length + 1; // links
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
                    "Content": {
                        "_media-type": "application/vnd.ez.api.Content+json",
                        "_href": "/api/ezp/v2/content/objects/59"
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
        }
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

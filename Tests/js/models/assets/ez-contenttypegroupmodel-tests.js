/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypegroupmodel-tests', function (Y) {
    var modelTest, loadTypesTest;

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ Content Type Group Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentTypeService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadContentTypeGroup';
            this.rootProperty = "ContentTypeGroup";
            this.parsedAttributeNumber = Y.eZ.ContentTypeGroup.ATTRS_REST_MAP.length + 1; // links + fields
            this.loadResponse = {
                "ContentTypeGroup": {
                    "_media-type": "application\/vnd.ez.api.ContentTypeGroup+json",
                    "_href": "\/api\/ezp\/v2\/content\/typegroups\/1",
                    "id": 1,
                    "identifier": "Content",
                    "created": "2002-09-05T11:08:48+02:00",
                    "modified": "2002-10-06T18:35:06+02:00",
                    "Creator": {
                        "_media-type": "application\/vnd.ez.api.User+json",
                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                    },
                    "Modifier": {
                        "_media-type": "application\/vnd.ez.api.User+json",
                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                    },
                    "ContentTypes": {
                        "_media-type": "application\/vnd.ez.api.ContentTypeInfoList+json",
                        "_href": "\/api\/ezp\/v2\/content\/typegroups\/1\/types"
                    }
                }
            };
        },

        setUp: function () {
            this.model = new Y.eZ.ContentTypeGroup();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },
    }));

    loadTypesTest = new Y.Test.Case({
        name: "eZ Content Type Group loadContentTypes tests",

        setUp: function () {
            this.group = new Y.eZ.ContentTypeGroup();
            this.groupId = "group/id";
            this.group.set('id', this.groupId);
            this.capi = new Y.Mock();
            this.typeService = new Y.Mock();
            this.response = {
                "ContentTypeInfoList": {
                    "_media-type": "application\/vnd.ez.api.ContentTypeInfoList+json",
                    "_href": "\/api\/ezp\/v2\/content\/typegroups\/2\/types",
                    "ContentType": [
                        {
                            "_href": "\/api\/ezp\/v2\/content\/types\/3"
                        },
                        {
                            "_href": "\/api\/ezp\/v2\/content\/types\/4",
                        }
                    ]
                }
            };

            Y.Mock.expect(this.capi, {
                method: 'getContentTypeService',
                returns: this.typeService
            });
        },

        tearDown: function () {
            this.group.destroy();
            delete this.group;
        },

        "Should use the contentTypes attribute if it's already filled": function () {
            var types = [],
                that = this,
                group = this.group;

            group._set('contentTypes', types);

            Y.Mock.expect(this.typeService, {
                method: 'loadContentTypes',
                callCount: 0
            });
            this.group.loadContentTypes({api: this.capi}, function (error) {
                Y.Assert.areSame(
                    types, group.get('contentTypes'),
                    "The contentTypes attribute content should be reused"
                );
                Y.Assert.isUndefined(error, "No error should have been found");
                Y.Mock.verify(that.typeService);
            });
        },

        "Should load the content types": function () {
            var that = this,
                group = this.group;

            Y.Mock.expect(this.typeService, {
                method: 'loadContentTypes',
                args: [this.groupId, Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(false, {document: that.response});
                },
            });
            this.group.loadContentTypes({api: this.capi}, function (error) {
                var types = group.get('contentTypes'),
                    responseTypes = that.response.ContentTypeInfoList.ContentType;

                Y.Assert.isUndefined(error, "No error should have been found");
                Y.Assert.areEqual(
                    responseTypes.length,
                    types.length,
                    "The content types should have been created"
                );

                Y.Array.each(types, function (type, i) {
                    Y.Assert.areEqual(
                        responseTypes[i]._href,
                        type.get('id'),
                        "The content type " + i + " in the list should have the id " + responseTypes[i]._href
                    );
                });

                Y.Mock.verify(that.typeService);
            });

        },

        "Should handle the error while loading the content types": function () {
            var that = this,
                group = this.group;

            Y.Mock.expect(this.typeService, {
                method: 'loadContentTypes',
                args: [this.groupId, Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(true);
                },
            });
            this.group.loadContentTypes({api: this.capi}, function (error) {
                Y.Assert.isNotUndefined(error, "An error should have been found");
                Y.Assert.isUndefined(
                    group.get('contentTypes'),
                    "The contentTypes attribute should stay undefined"
                );
                Y.Mock.verify(that.typeService);
            });
        },
    });

    Y.Test.Runner.setName("eZ Content Type Group Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(loadTypesTest);

}, '', {requires: ['test', 'model-tests', 'ez-contenttypegroupmodel', 'ez-restmodel']});

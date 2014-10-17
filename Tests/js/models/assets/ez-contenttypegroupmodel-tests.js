/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypegroupmodel-tests', function (Y) {
    var modelTest;

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

    Y.Test.Runner.setName("eZ Content Type Group Model tests");
    Y.Test.Runner.add(modelTest);

}, '', {requires: ['test', 'model-tests', 'ez-contenttypegroupmodel', 'ez-restmodel']});

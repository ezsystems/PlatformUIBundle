/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentinfomodel-tests', function (Y) {
    var modelTest, loadResponse, toObjectTest,
        Assert = Y.Assert;

    loadResponse = {
        "Content": {
            "_media-type": "application/vnd.ez.api.ContentInfo+json",
            "_href": "/api/ezp/v2/content/objects/123",
            "_remoteId": "bec12c855645c45c23c11abe83ad4d79",
            "_id": 123,
            "ContentType": {
                "_media-type": "application/vnd.ez.api.ContentType+json",
                "_href": "/api/ezp/v2/content/types/18"
            },
            "Name": "some-test-content",
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
            "MainLocation": {
                "_media-type": "application/vnd.ez.api.Location+json",
                "_href": "/api/ezp/v2/content/locations/1/2/124"
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
            "currentVersionNo": 20,
            "ObjectStates": {
                "_media-type": "application/vnd.ez.api.ContentObjectStates+json",
                "_href": "/api/ezp/v2/content/objects/123/objectstates"
            }
        }
    };

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ ContentInfo Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadContentInfo';
            this.rootProperty = "Content";
            this.parsedAttributeNumber = Y.eZ.ContentInfo.ATTRS_REST_MAP.length + 1; // links
        },

        setUp: function () {
            this.model = new Y.eZ.ContentInfo();
            this.loadResponse = loadResponse;
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },
    }));

    toObjectTest = new Y.Test.Case({
        name: "eZ ContentInfo Model toObject test",

        setUp: function () {
            this.contentInfo = new Y.eZ.ContentInfo({
                contentId: 42, name: 'doliprane'
            });
        },

        tearDown: function () {
            this.contentInfo.destroy();
        },

        "Should return an object based on the content": function () {
            var object = this.contentInfo.toObject();

            Assert.areSame(
                object.id, this.contentInfo.get('contentId'),
                "The object should have an id"
            );
            Assert.areSame(
                object.name, this.contentInfo.get('name'),
                "The object should have a name"
            );
        },
    });

    Y.Test.Runner.setName("eZ ContentInfo Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(toObjectTest);
}, '', {requires: ['test', 'model-tests', 'ez-contentinfomodel', 'ez-restmodel']});

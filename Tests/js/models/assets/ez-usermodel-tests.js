/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermodel-tests', function (Y) {
    var modelTest;

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ User Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getUserService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadUser';
            this.rootProperty = "User";
            this.parsedAttributeNumber = Y.eZ.User.ATTRS_REST_MAP.length + 1; // links
            this.loadResponse = {
                "User": {
                    "_media-type": "application/vnd.ez.api.User+json",
                    "_href": "/api/ezp/v2/user/users/14",
                    "_id": 14,
                    "_remoteId": "1bb4fe25487f05527efa8bfd394cecc7",
                    "publishDate": "2002-10-06T18:13:50+02:00",
                    "lastModificationDate": "2013-07-17T15:03:10+02:00",
                    "mainLanguageCode": "eng-GB",
                    "alwaysAvailable": "true",
                    "login": "admin",
                    "email": "dp@ez.no",
                    "enabled": "true",
                    "name": "Administrator User"
                }
            };
        },

        setUp: function () {
            this.model = new Y.eZ.User();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        }

    }));

    Y.Test.Runner.setName("eZ User Model tests");
    Y.Test.Runner.add(modelTest);

}, '', {requires: ['test', 'model-tests', 'ez-usermodel', 'ez-restmodel']});

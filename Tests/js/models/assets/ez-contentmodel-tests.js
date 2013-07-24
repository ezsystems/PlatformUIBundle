YUI.add('ez-contentmodel-tests', function (Y) {

    var modelTest;

    modelTest = new Y.eZ.ModelTest({
        name: "eZ Content Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadContentInfoAndCurrentVersion';
            this.rootProperty = "Content";
            this.loadResponse = {
                "Content": {
                    "_media-type": "application\/vnd.ez.api.Content+json",
                    "_href": "\/api\/ezp\/v2\/content\/objects\/57",
                    "_remoteId": "8a9c9c761004866fb458d89910f52bee",
                    "_id": 57,
                    "ContentType": {
                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                        "_href": "\/api\/ezp\/v2\/content\/types\/23"
                    },
                    "Name": "Home",
                    "MainLocation": {
                        "_media-type": "application\/vnd.ez.api.Location+json",
                        "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2"
                    },
                    "Owner": {
                        "_media-type": "application\/vnd.ez.api.User+json",
                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                    },
                    "lastModificationDate": "2010-09-14T10:46:59+02:00",
                    "publishedDate": "2007-11-19T14:54:46+01:00",
                    "mainLanguageCode": "eng-GB",
                    "alwaysAvailable": "true"
                }
            };
        },

        setUp: function () {
            this.model = new Y.eZ.Content();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        }

    });

    Y.Test.Runner.setName("eZ Content Model tests");
    Y.Test.Runner.add(modelTest);

}, '0.0.1', {requires: ['test', 'model-tests', 'ez-contentmodel', 'ez-restmodel']});

YUI.add('ez-contentmodel-tests', function (Y) {
    var modelTest;

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ Content Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadContentInfoAndCurrentVersion';
            this.rootProperty = "Content";
            this.parsedAttributeNumber = Y.eZ.Content.ATTRS_REST_MAP.length + 1 + 1; // links + "manually" parsed fields
            this.loadResponse = {
                "Content": {
                    "_media-type": "application\/vnd.ez.api.Content+json",
                    "_href": "\/api\/ezp\/v2\/content\/objects\/57",
                    "_remoteId": "8a9c9c761004866fb458d89910f52bee",
                    "_id": 57,
                    "CurrentVersion": {
                        "_media-type": "application/vnd.ez.api.Version+json",
                        "_href": "/api/ezp/v2/content/objects/59/currentversion",
                        "Version": {
                            "_media-type": "application/vnd.ez.api.Version+json",
                            "_href": "/api/ezp/v2/content/objects/59/versions/1",
                            "VersionInfo": {
                                "id": 506,
                                "versionNo": 1,
                                "status": "PUBLISHED",
                                "modificationDate": "2013-01-23T17:10:50+01:00",
                                "Creator": {
                                    "_media-type": "application/vnd.ez.api.User+json",
                                    "_href": "/api/ezp/v2/user/users/14"
                                },
                                "creationDate": "2013-01-23T17:10:46+01:00",
                                "initialLanguageCode": "eng-GB",
                                "languageCodes": "eng-GB",
                                "names": {
                                    "value": [
                                        {
                                            "_languageCode": "eng-GB",
                                            "#text": "Getting Started"
                                        }
                                    ]
                                },
                                "Content": {
                                    "_media-type": "application/vnd.ez.api.ContentInfo+json",
                                    "_href": "/api/ezp/v2/content/objects/59"
                                }
                            },
                            "Fields": {
                                "field": [
                                    {
                                        "id": 200,
                                        "fieldDefinitionIdentifier": "name",
                                        "languageCode": "eng-GB",
                                        "fieldValue": "Getting Started"
                                    },
                                    {
                                        "id": 201,
                                        "fieldDefinitionIdentifier": "page",
                                        "languageCode": "eng-GB",
                                        "fieldValue": {
                                            "zones": [
                                                {
                                                    "blocks": [
                                                        {
                                                            "id": "7cf0aae050d80f40f00ef4eb2295d0cb",
                                                            "name": "Highlighted Feature",
                                                            "type": "HighlightedItem",
                                                            "view": "default",
                                                            "overflowId": "",
                                                            "zoneId": "c5ce576877ab71afb7c143ea3276db4f"
                                                        },
                                                        {
                                                            "id": "32e704f1bc3d785eee7e742c081d5beb",
                                                            "name": "Main Features",
                                                            "type": "ContentGrid",
                                                            "view": "1_column_4_rows",
                                                            "overflowId": "",
                                                            "zoneId": "c5ce576877ab71afb7c143ea3276db4f"
                                                        }
                                                    ],
                                                    "id": "c5ce576877ab71afb7c143ea3276db4f",
                                                    "identifier": "left"
                                                },
                                                {
                                                    "blocks": [
                                                        {
                                                            "id": "639b9f037115d1ef4269713fdb7b6c71",
                                                            "name": "",
                                                            "type": "Campaign",
                                                            "view": "default",
                                                            "overflowId": "",
                                                            "zoneId": "fe8088a104581ea7faa6c00fe743f072"
                                                        },
                                                        {
                                                            "id": "96a998b9f2d0cfba849c27209dc582e9",
                                                            "name": "",
                                                            "type": "ContentGrid",
                                                            "view": "2_columns_2_rows",
                                                            "overflowId": "",
                                                            "zoneId": "fe8088a104581ea7faa6c00fe743f072"
                                                        }
                                                    ],
                                                    "id": "fe8088a104581ea7faa6c00fe743f072",
                                                    "identifier": "right"
                                                }
                                            ],
                                            "layout": "2ZonesLayout2"
                                        }
                                    }
                                ]
                            },
                            "Relations": {
                                "_media-type": "application/vnd.ez.api.RelationList+json",
                                "_href": "/api/ezp/v2/content/objects/59/versions/1/relations",
                                "Relation": []
                            }
                        }
                    },
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
        },

        "Should read the fields of the current version": function () {
            var m = this.model,
                response = {
                    body: Y.JSON.stringify(this.loadResponse)
                },
                fields, res;

            res = m .parse(response);
            fields = res.fields;

            Y.Assert.areEqual(
                this.loadResponse.Content.CurrentVersion.Version.Fields.field.length,
                Y.Object.size(fields),
                "The fields from the current version should all be imported"
            );
            Y.Assert.areEqual(
                this.loadResponse.Content.CurrentVersion.Version.Fields.field[0].id,
                fields.name.id,
                "The name field should have been imported"
            );

            Y.Assert.areEqual(
                this.loadResponse.Content.CurrentVersion.Version.Fields.field[1].id,
                fields.page.id,
                "The page field should have been imported"
            );
        },

        "Should return the fields": function () {
            var m = this.model,
                fields = {
                    'test': {'id': 42},
                    'test2': {'id': 43}
                };
            m.set('fields', fields);

            Y.Assert.areEqual(
                fields.test.id,
                m.getField('test').id
            );
            Y.Assert.areEqual(
                fields.test2.id,
                m.getField('test2').id
            );
            Y.Assert.isUndefined(
                m.getField('doesnotexist')
            );
        }

    }));

    Y.Test.Runner.setName("eZ Content Model tests");
    Y.Test.Runner.add(modelTest);

}, '0.0.1', {requires: ['test', 'model-tests', 'ez-contentmodel', 'ez-restmodel']});

YUI.add('ez-contenttypemodel-tests', function (Y) {

    var modelTest;

    modelTest = new Y.eZ.ModelTest({
        name: "eZ ContentType Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentTypeService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadContentType';
            this.rootProperty = "ContentType";
            this.loadResponse = {
                "ContentType": {
                    "_media-type": "application/vnd.ez.api.ContentType+json",
                    "_href": "/api/ezp/v2/content/types/23",
                    "id": 23,
                    "status": "DEFINED",
                    "identifier": "landing_page",
                    "names": {
                        "value": [
                            {
                                "_languageCode": "eng-GB",
                                "#text": "Landing Page"
                            }
                        ]
                    },
                    "descriptions": {
                        "value": [
                            {
                                "_languageCode": "eng-GB",
                                "#text": ""
                            }
                        ]
                    },
                    "creationDate": "2013-07-17T15:02:22+02:00",
                    "modificationDate": "2013-07-17T15:02:22+02:00",
                    "Creator": {
                        "_media-type": "application/vnd.ez.api.User+json",
                        "_href": "/api/ezp/v2/user/users/14"
                    },
                    "Modifier": {
                        "_media-type": "application/vnd.ez.api.User+json",
                        "_href": "/api/ezp/v2/user/users/14"
                    },
                    "remoteId": "e36c458e3e4a81298a0945f53a2c81f4",
                    "urlAliasSchema": "",
                    "nameSchema": "<name>",
                    "isContainer": "true",
                    "mainLanguageCode": "eng-GB",
                    "defaultAlwaysAvailable": "false",
                    "defaultSortField": "PATH",
                    "defaultSortOrder": "ASC",
                    "FieldDefinitions": {
                        "_media-type": "application/vnd.ez.api.FieldDefinitionList+json",
                        "_href": "/api/ezp/v2/content/types/23/fieldDefinitions",
                        "FieldDefinition": [
                            {
                                "_media-type": "application/vnd.ez.api.FieldDefinition+json",
                                "_href": "/api/ezp/v2/content/types/23/fieldDefinitions/232",
                                "id": 232,
                                "identifier": "name",
                                "fieldType": "ezstring",
                                "fieldGroup": "content",
                                "position": 1,
                                "isTranslatable": "true",
                                "isRequired": "true",
                                "isInfoCollector": "false",
                                "defaultValue": null,
                                "isSearchable": "true",
                                "names": {
                                    "value": [
                                        {
                                            "_languageCode": "eng-GB",
                                            "#text": "Name"
                                        }
                                    ]
                                },
                                "descriptions": {
                                    "value": [
                                        {
                                            "_languageCode": "eng-GB",
                                            "#text": ""
                                        }
                                    ]
                                },
                                "fieldSettings": [],
                                "validatorConfiguration": {
                                    "StringLengthValidator": {
                                        "maxStringLength": false,
                                        "minStringLength": false
                                    }
                                }
                            },
                            {
                                "_media-type": "application/vnd.ez.api.FieldDefinition+json",
                                "_href": "/api/ezp/v2/content/types/23/fieldDefinitions/233",
                                "id": 233,
                                "identifier": "page",
                                "fieldType": "ezpage",
                                "fieldGroup": "meta",
                                "position": 2,
                                "isTranslatable": "true",
                                "isRequired": "false",
                                "isInfoCollector": "false",
                                "defaultValue": null,
                                "isSearchable": "false",
                                "names": {
                                    "value": [
                                        {
                                            "_languageCode": "eng-GB",
                                            "#text": "Layout"
                                        }
                                    ]
                                },
                                "descriptions": {
                                    "value": [
                                        {
                                            "_languageCode": "eng-GB",
                                            "#text": ""
                                        }
                                    ]
                                },
                                "fieldSettings": {
                                    "defaultLayout": ""
                                },
                                "validatorConfiguration": []
                            }
                        ]
                    }
                }
            };
        },

        setUp: function () {
            this.model = new Y.eZ.ContentType();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should create correct field groups for the FormEditView from the REST data" : function () {
            var m = this.model,
                mockResponse = {},
                fieldGroups;

            mockResponse.body = Y.JSON.stringify(this.loadResponse);
            m.setAttrs(m.parse(mockResponse));

            fieldGroups = m.getFieldGroups();

            Y.Assert.areEqual(
                fieldGroups.length,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition.length,
                "Should split field definitions in groups correctly depending on 'FieldGroup' property"
            );
            Y.Assert.areEqual(
                fieldGroups[0].fieldGroupName,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition[0].fieldGroup,
                "Should give correct name to each field group according to 'FieldGroup' property"
            );
            Y.Assert.areEqual(
                fieldGroups[1].fieldGroupName,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition[1].fieldGroup,
                "Should give correct name to each field group according to 'FieldGroup' property"
            );
            Y.Assert.areEqual(
                fieldGroups[0].fields[0].identifier,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition[0].identifier,
                "Should import 'identifier' property correctly to created field groups"
            );
            Y.Assert.areEqual(
                fieldGroups[0].fields[0].fieldType,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition[0].fieldType,
                "Should import 'fieldType property correctly to created field groups"
            );
        }

    });

    Y.Test.Runner.setName("eZ ContentType Model tests");
    Y.Test.Runner.add(modelTest);

}, '0.0.1', {requires: ['test', 'model-tests', 'ez-contenttypemodel', 'ez-restmodel']});

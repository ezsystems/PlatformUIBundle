/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypemodel-tests', function (Y) {
    var modelTest, hasFieldTypeTest, getFieldDefinitionIdentifiersTest,
        Assert = Y.Assert;

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ ContentType Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentTypeService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadContentType';
            this.rootProperty = "ContentType";
            this.parsedAttributeNumber = Y.eZ.ContentType.ATTRS_REST_MAP.length + 1; // links
        },

        setUp: function () {
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
                                            "#text": "Description text in eng-GB"
                                        }
                                    ]
                                },
                                "fieldSettings": {
                                    "defaultLayout": ""
                                },
                                "validatorConfiguration": []
                            },
                            {
                                "_media-type": "application/vnd.ez.api.FieldDefinition+json",
                                "_href": "/api/ezp/v2/content/types/23/fieldDefinitions/234",
                                "id": 234,
                                "identifier": "page_meta",
                                "fieldType": "ezpage",
                                "fieldGroup": "meta",
                                "position": 3,
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
            this.model = new Y.eZ.ContentType();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should create correct field groups from the REST data": function () {
            var m = this.model,
                mockResponse = {},
                fieldGroups;

            mockResponse.document = this.loadResponse;
            m.setAttrs(m.parse(mockResponse));

            fieldGroups = m.getFieldGroups();

            Y.Assert.areEqual(
                fieldGroups.length,
                2,
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
                fieldGroups[0].fieldDefinitions[0].identifier,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition[0].identifier,
                "Should import the field definition"
            );
            Y.Assert.areEqual(
                fieldGroups[0].fieldDefinitions[0].fieldType,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition[0].fieldType,
                "Should import the field definition"
            );
            Y.Assert.areEqual(
                fieldGroups[1].fieldDefinitions[0].identifier,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition[1].identifier,
                "Should import the field definition"
            );
            Y.Assert.areEqual(
                fieldGroups[1].fieldDefinitions[0].fieldType,
                this.loadResponse.ContentType.FieldDefinitions.FieldDefinition[1].fieldType,
                "Should import the field definition"
            );
        },

        "Should set FieldDefinitions without any change": function () {
            var m = this.model,
                result,
                fieldDefinitions = {'name': {'names': 'bar'}, 'layout': {'descriptions': 'foo'}};

            m.set('fieldDefinitions', fieldDefinitions);
            result = m.get('fieldDefinitions');

            Y.Assert.areSame(
                fieldDefinitions,
                result
            );
        },

        "Should normalize the names and descriptions properties of the fieldDefinitions": function () {
            var m = this.model,
                fieldDefinitions = {};

            m.set('fieldDefinitions', this.loadResponse.ContentType.FieldDefinitions);

            fieldDefinitions = m.get('fieldDefinitions');

            Y.Assert.areEqual(
                "Name",
                fieldDefinitions.name.names["eng-GB"]
            );
            Y.Assert.areEqual(
                "",
                fieldDefinitions.name.descriptions["eng-GB"]
            );

            Y.Assert.areEqual(
                "Layout",
                fieldDefinitions.page.names["eng-GB"]
            );
            Y.Assert.areEqual(
                "Description text in eng-GB",
                fieldDefinitions.page.descriptions["eng-GB"]
            );

            /* jshint camelcase: false */
            Y.Assert.areEqual(
                "Layout",
                fieldDefinitions.page_meta.names["eng-GB"]
            );
            Y.Assert.areEqual(
                "",
                fieldDefinitions.page_meta.descriptions["eng-GB"]
            );
            /* jshint camelcase: true */
        },

        "Should ignore an invalid fieldDefinitions value": function () {
            this.model.set('fieldDefinitions', "Something from nothing");

            Y.Assert.isUndefined(
                this.model.get('fieldDefinitions'),
                "The default value of fieldDefinitions should be kept"
            );
        },

        "Should ignore a falsy fieldDefinitions value": function () {
            this.model.set('fieldDefinitions', undefined);

            Y.Assert.isUndefined(
                this.model.get('fieldDefinitions'),
                "The default value of fieldDefinitions should be kept"
            );
        },
    }));

    hasFieldTypeTest = new Y.Test.Case({
        name: "eZ ContentType Model hasFieldType tests",

        setUp: function () {
            this.contentType = new Y.eZ.ContentType({
                fieldDefinitions: {
                    'name': {
                        fieldType: 'ezstring',
                    },
                    'user_account': {
                        fieldType: 'ezuser',
                    },
                    'avatar': {
                        fieldType: 'ezimage',
                    },
                },
            });
        },

        tearDown: function () {
            this.contentType.destroy();
        },

        "Should find the ezuser fieldtype": function () {
            Assert.isTrue(
                this.contentType.hasFieldType('ezuser'),
                "The ezuser field type should be detected in the content type"
            );
        },

        "Should not find the ezwhatever fieldtype": function () {
            Assert.isFalse(
                this.contentType.hasFieldType('ezwhatever'),
                "The ezwhatever field type should not be detected in the content type"
            );
        },
    });

    getFieldDefinitionIdentifiersTest = new Y.Test.Case({
        name: "eZ ContentType Model hasFieldType tests",

        setUp: function () {
            this.contentType = new Y.eZ.ContentType({
                fieldDefinitions: {
                    'name': {
                        fieldType: 'ezstring',
                    },
                    'user_account': {
                        fieldType: 'ezuser',
                    },
                    'first_name': {
                        fieldType: 'ezstring',
                    },
                    'avatar': {
                        fieldType: 'ezimage',
                    },
                },
            });
        },

        tearDown: function () {
            this.contentType.destroy();
        },

        "Should return the identifiers of the ezstring fields": function () {
            var identifiers = this.contentType.getFieldDefinitionIdentifiers('ezstring');

            Assert.areEqual(
                2, identifiers.length,
                "getFieldDefinitionIdentifiers should find 2 fields"
            );
            Assert.areEqual(
                "name", identifiers[0],
                "The name field should be detected as a ezstring field"
            );
            Assert.areEqual(
                "first_name", identifiers[1],
                "The first_name field should be detected as a ezstring field"
            );
        },
    });

    Y.Test.Runner.setName("eZ ContentType Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(hasFieldTypeTest);
    Y.Test.Runner.add(getFieldDefinitionIdentifiersTest);
}, '', {requires: ['test', 'model-tests', 'ez-contenttypemodel', 'ez-restmodel']});

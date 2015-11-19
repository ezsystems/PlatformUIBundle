/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentmodel-tests', function (Y) {
    var modelTest, relationsTest, createContent, loadResponse, copyTest,
        loadLocationsTest, addLocationTest, setMainLocationTest, hasTranslationTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    loadResponse = {
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
                        "Relation": [
                            {
                                "_media-type": "application\/vnd.ez.api.Relation+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/110\/versions\/33\/relations\/26",
                                "SourceContent": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/110"
                                },
                                "DestinationContent": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/122"
                                },
                                "SourceFieldDefinitionIdentifier": "relation",
                                "RelationType": "ATTRIBUTE"
                            },
                            {
                                "_media-type": "application\/vnd.ez.api.Relation+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/110\/versions\/33\/relations\/27",
                                "SourceContent": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/110"
                                },
                                "DestinationContent": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/124"
                                },
                                "RelationType": "COMMON"
                            },
                            {
                                "_media-type": "application\/vnd.ez.api.Relation+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/110\/versions\/33\/relations\/28",
                                "SourceContent": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/110"
                                },
                                "DestinationContent": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/124"
                                },
                                "RelationType": "EMBED"
                            }
                        ]
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

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ Content Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadContentInfoAndCurrentVersion';
            this.rootProperty = "Content";
            this.parsedAttributeNumber = Y.eZ.Content.ATTRS_REST_MAP.length + 4; // links + fields + relations + currentVersion
        },

        setUp: function () {
            this.model = new Y.eZ.Content();
            this.loadResponse = loadResponse;
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        // overriding this test to take the languageCode into account
        "Sync 'read' should load the content with CAPI": function () {
            var m = this.model,
                languageCode = 'fre-FR',
                modelId = "/api/v2/ezp/model/mid",
                callback = function () { };

            Y.Mock.expect(this.capiMock, {
                method: this.capiGetService,
                returns: this.serviceMock
            });
            Y.Mock.expect(this.serviceMock, {
                method: this.serviceLoad,
                args: [
                    modelId,
                    languageCode,
                    callback
                ]
            });

            m.set('id', modelId);
            m.sync('read', {
                api: this.capiMock,
                languageCode: languageCode,
            }, callback);

            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.serviceMock);
        },

        "The current version should be instance of eZ.Version": function () {
            var currentVersionStruct = loadResponse.Content.CurrentVersion;

            this.model.set('currentVersion', currentVersionStruct);
            Y.Assert.isInstanceOf(
                Y.eZ.Version,
                this.model.get('currentVersion'),
                'Current version should be instance of eZ.Version'
            );
            Y.Assert.areEqual(
                currentVersionStruct.Version.VersionInfo.versionNo,
                this.model.get('currentVersion').get('versionNo'),
                'Should instantiate current version with version no'
            );
            Y.Assert.areEqual(
                currentVersionStruct.Version.VersionInfo.id,
                this.model.get('currentVersion').get('versionId'),
                'Should instantiate current version with version id'
            );
        },

        "The current version should be instance of eZ.Version (not version)": function () {
            this.model.set('currentVersion', undefined);
            Y.Assert.isInstanceOf(
                Y.eZ.Version,
                this.model.get('currentVersion'),
                'Current version should be instance of eZ.Version'
            );
        },

        "Should read the fields of the current version": function () {
            var m = this.model,
                response = {
                    document: this.loadResponse
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

        "Should read the relations of the current version": function () {
            var m = this.model,
                response = {
                    document: this.loadResponse
                },
                relations, res,
                respRelation = this.loadResponse.Content.CurrentVersion.Version.Relations.Relation;

            res = m .parse(response);
            relations = res.relations;

            Y.Assert.areEqual(
                respRelation.length,
                relations.length,
                "The relations should be imported"
            );

            Y.Array.each(relations, function (relation, i) {
                Y.Assert.areEqual(
                    respRelation[i]._href,
                    relation.id,
                    "The ordering should be kept"
                );
            });
        },

        "Should read the currentVersion": function () {
            var m = this.model,
                response = {
                    document: this.loadResponse
                },
                currentVersion, res,
                respCurrentVersion = this.loadResponse.Content.CurrentVersion;

            res = m.parse(response);
            currentVersion = res.currentVersion;

            Y.Assert.isObject(
                currentVersion,
                "The currentVersion should be object"
            );

            Y.Assert.areEqual(
                respCurrentVersion.languageCodes,
                currentVersion.languageCodes,
                "The languageCodes should be imported"
            );

            Y.Assert.areSame(
                respCurrentVersion,
                currentVersion,
                "The currentVersion should be imported"
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

    relationsTest = new Y.Test.Case({
        name: "eZ Content Model relations tests",

        setUp: function () {
            this.model = new Y.eZ.Content();

            this.relationsCommon = [
                {id: 42, type: "COMMON", destination: 142, source: 242},
                {id: 43, type: "COMMON", destination: 143, source: 243},
            ];

            this.relationEmbed = [
                {id: 44, type: "EMBED", destination: 144, source: 244},
            ];

            this.relationAttribute1 = [
                {id: 45, type: "ATTRIBUTE", destination: 145, source: 245, fieldDefinitionIdentifier: "attr1"},
            ];

            this.relationsAttribute2 = [
                {id: 46, type: "ATTRIBUTE", destination: 146, source: 246, fieldDefinitionIdentifier: "attr2"},
                {id: 47, type: "ATTRIBUTE", destination: 147, source: 247, fieldDefinitionIdentifier: "attr2"},
            ];

            this.relations = this.relationsCommon.concat(
                this.relationEmbed,
                this.relationAttribute1,
                this.relationsAttribute2
            );

            this.model.set('relations', this.relations);
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        _testRelations: function (expected, type, identifier) {
            var relations = this.model.relations(type, identifier);

            Y.Assert.areEqual(
                expected.length,
                relations.length,
                "The relations should be filtered"
            );

            Y.Array.each(relations, function (relation, i) {
                var elt = expected[i];

                Y.Assert.areEqual(
                    elt.id,
                    relation.id,
                    "The element " + i + " should be " + elt.id
                );
            });
        },

        "Should filter relations based on the type": function () {
            this._testRelations(this.relationsCommon, "COMMON");
        },

        "Should filter ATTRIBUTE relations with a field identifier": function () {
            this._testRelations(this.relationsAttribute2, "ATTRIBUTE", "attr2");
        },

        "Should filter ATTRIBUTE relations without a field identifier": function () {
            this._testRelations(
                this.relationAttribute1.concat(this.relationsAttribute2), "ATTRIBUTE"
            );
        },

        "Should return all relations (without a type and a field identifier)": function () {
            this._testRelations(this.relations);
        },
    });

    copyTest = new Y.Test.Case({
        name: "eZ Content Model copy tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.contentId = '1/2/3';
            this.model = new Y.eZ.Content({id: this.contentId});
            this.contentServiceMock = new Y.Mock();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should have a copy method": function () {
            var callback = function () {},
                parentLocationId = '4/5/6';

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentServiceMock
            });
            this.options = {api: this.capiMock};
            Y.Mock.expect(this.contentServiceMock, {
                method: 'copyContent',
                args: [this.contentId, parentLocationId, callback],
            });
            this.model.copy(this.options, parentLocationId, callback);
            Y.Mock.verify(this.contentServiceMock);
            Y.Mock.verify(this.capiMock);
        },
    });

    createContent = new Y.Test.Case({
        name: "eZ Content Model create tests",

        setUp: function () {
            var that = this,
                currentVersionStruct = loadResponse.Content.CurrentVersion;

            this.model = new Y.eZ.Content();
            this.model.set('currentVersion', currentVersionStruct);

            this.typeId = 'song';
            this.alwaysAvailable = true;
            this.type = new Mock();
            Y.Mock.expect(this.type, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'defaultAlwaysAvailable' ) {
                        return this.alwaysAvailable;
                    } else if ( attr === 'id' ) {
                        return this.typeId;
                    }
                    Y.fail('Unexpected call to get("' + attr + '")');
                }, this),
            });

            this.parentLocationId = 'foo-fighters';
            this.parentLocation = new Mock();
            Y.Mock.expect(this.parentLocation, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId,
            });

            this.languageCode = 'eng-US';

            this.fields = [
                {fieldDefinitionIdentifier: 'id1', fieldValue: 'value1'},
                {fieldDefinitionIdentifier: 'id2', fieldValue: 'value2'},
            ];

            this.capi = new Mock();
            this.contentService = new Mock();
            this.createStruct = new Mock();
            this.locationCreateStruct = {};
            this.createResponse = {document: loadResponse};
            Y.Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService,
            });
            Y.Mock.expect(this.contentService, {
                method: 'newContentCreateStruct',
                args: [
                    this.typeId,
                    this.locationCreateStruct,
                    this.languageCode,
                    this.alwaysAvailable
                ],
                returns: this.createStruct,
            });
            Y.Mock.expect(this.contentService, {
                method: 'newLocationCreateStruct',
                args: [this.parentLocationId],
                returns: this.locationCreateStruct,
            });
            Y.Mock.expect(this.createStruct, {
                method: 'addField',
                callCount: this.fields.length,
                args: [Mock.Value.String, Mock.Value.String],
                run: function (identifier, value) {
                    var found = false;
                    Y.Array.each(that.fields, function (val) {
                        if ( val.fieldDefinitionIdentifier === identifier && val.fieldValue === value ) {
                            found = true;
                        }
                    });
                    if ( !found ) {
                        Y.fail("addField should have been called only with the values createContent.fields");
                    }
                }
            });
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
            delete this.capi;
            delete this.contentService;
            delete this.createStruct;
            delete this.locationCreateStruct;
            delete this.createResponse;
        },

        "Should create the content": function () {
            var content = this.model,
                that = this;

            Y.Mock.expect(this.contentService, {
                method: 'createContent',
                args: [this.createStruct, Y.Mock.Value.Function],
                run: function (struct, callback) {
                    callback(false, that.createResponse);
                }
            });
            content.save({
                api: this.capi,
                languageCode: this.languageCode,
                contentType: this.type,
                parentLocation: this.parentLocation,
                fields: this.fields,
            }, function (error, response) {
                var fields = that.createResponse.document.Content.CurrentVersion.Version.Fields.field;
                Assert.isFalse(error, "No error should have been found");
                Assert.areSame(
                    that.createResponse,
                    response,
                    "The CAPI response should be provided in the save callback"
                );
                Assert.areEqual(
                    fields.length,
                    Y.Object.keys(content.get('fields')).length,
                    "The fields provided in the reponse should be parsed"
                );
                Assert.areEqual(
                    fields[0].fieldValue,
                    content.get('fields')[fields[0].fieldDefinitionIdentifier].fieldValue,
                    "The first field should have been parsed"
                );

                Mock.verify(that.createStruct);
                Mock.verify(that.contentService);
            });
        },

        "Should handle the error while creating a content": function () {
            var content = this.model,
                that = this,
                err = new Error();

            Y.Mock.expect(this.contentService, {
                method: 'createContent',
                args: [this.createStruct, Y.Mock.Value.Function],
                run: function (struct, callback) {
                    callback(err, that.createResponse);
                }
            });
            content.save({
                api: this.capi,
                languageCode: this.languageCode,
                contentType: this.type,
                parentLocation: this.parentLocation,
                fields: this.fields,
            }, function (error, response) {
                Assert.areSame(err, error, "The CAPI error should be provided");
                Assert.areEqual(
                    0,
                    Y.Object.keys(content.get('fields')).length,
                    "The response should not be provided"
                );
            });
        },
    });

    loadLocationsTest = new Y.Test.Case({
        name: "eZ Content Model load locations tests",

        setUp: function () {
            this.model = new Y.eZ.Content();
            this.contentId = 'Pele';
            this.locationId = 'Maradona';
            this.currentLocation = new Mock();

            this.capi = new Mock();
            this.contentService = new Mock();

            Y.Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService
            });

            Y.Mock.expect(this.model, {
                method: 'get',
                args: ['id'],
                returns: this.contentId
            });

            Mock.expect(this.currentLocation, {
                method: 'get',
                args: ['id'],
                returns: this.locationId
            });

            this.loadLocationsResponse = {
                document: {
                    LocationList: {
                        Location: [
                            {_href: 'Milton Friedman'},
                            {_href: 'JKM'},
                            {_href: this.locationId}
                        ]
                    }
                }
            };
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
            delete this.capi;
            delete this.contentService;
        },

        'Should load locations': function () {
            var options = {
                    api: this.capi,
                    location: this.currentLocation
                },
                callbackCalled = false,
                that = this;

            Y.eZ.Location = Y.Base.create('locationModel', Y.eZ.RestModel, [], {
                load: function (opts, callback) {
                    Assert.areSame(options, opts, 'Options with API should be the same');

                    callback(false, this);
                }
            });

            Y.Mock.expect(this.contentService, {
                method: 'loadLocations',
                args: [this.contentId, Y.Mock.Value.Function],
                run: function (contentId, cb) {
                    cb(false, that.loadLocationsResponse);
                }
            });

            this.model.loadLocations(options, function (err, response) {
                callbackCalled = true;

                Assert.isFalse(err, 'Should not return the error');
                Assert.areEqual(
                    response.length,
                    that.loadLocationsResponse.document.LocationList.Location.length,
                    'Number of locations returned should be the same as in REST response'
                );
            });

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },

        'Should pass error to callback function when CAPI loadLocations fails': function () {
            var options = {api: this.capi},
                callbackCalled = false;

            Y.eZ.Location = Y.Base.create('locationModel', Y.eZ.RestModel, [], {
                load: function (opts, callback) {
                    Assert.areSame(options, opts, 'Options with API should be the same');

                    callback(false, this);
                }
            });

            Y.Mock.expect(this.contentService, {
                method: 'loadLocations',
                args: [this.contentId, Y.Mock.Value.Function],
                run: function (contentId, cb) {
                    cb(true, {});
                }
            });

            this.model.loadLocations(options, function (err, response) {
                callbackCalled = true;

                Assert.isTrue(err, 'Should return the error');
            });

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },

        'Should pass error to callback function when loading the location fails': function () {
            var options = {api: this.capi},
                callbackCalled = false,
                that = this;

            Y.eZ.Location = Y.Base.create('locationModel', Y.eZ.RestModel, [], {
                load: function (opts, callback) {
                    Assert.areSame(options, opts, 'Options with API should be the same');

                    callback(true, {});
                }
            });

            Y.Mock.expect(this.contentService, {
                method: 'loadLocations',
                args: [this.contentId, Y.Mock.Value.Function],
                run: function (contentId, cb) {
                    cb(false, that.loadLocationsResponse);
                }
            });

            this.model.loadLocations(options, function (err, response) {
                callbackCalled = true;

                Assert.isTrue(err, 'Should return the error');
            });

            Assert.isTrue(callbackCalled, 'Should call callback function');
        }
    });

    addLocationTest = new Y.Test.Case({
        name: "eZ Content Model add location test",

        setUp: function () {
            this.model = new Y.eZ.Content();
            this.contentId = 'Pele';
            this.parentLocation = new Mock();
            this.parentLocationId = '/parent/location/id';

            this.capi = new Mock();
            this.contentService = new Mock();

            Y.Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService
            });

            Y.Mock.expect(this.parentLocation, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });

            Y.Mock.expect(this.model, {
                method: 'get',
                args: ['id'],
                returns: this.contentId
            });
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
            delete this.capi;
            delete this.contentService;
        },

        'Should create location': function () {
            var options = {api: this.capi},
                locationCreateStruct = {},
                callbackCalled = false;

            Y.Mock.expect(this.contentService, {
                method: 'newLocationCreateStruct',
                args: [this.parentLocationId],
                returns: locationCreateStruct
            });

            Y.Mock.expect(this.contentService, {
                method: 'createLocation',
                args: [this.contentId, locationCreateStruct, Y.Mock.Value.Function],
                run: function (contentId, struct, cb) {
                    cb(false, {});
                }
            });

            this.model.addLocation(options, this.parentLocation, function (err, response) {
                callbackCalled = true;

                Assert.isFalse(err, 'Should not return the error');
            });

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },

        'Should pass error to callback function when CAPI createLocation fails': function () {
            var options = {api: this.capi},
                locationCreateStruct = {},
                callbackCalled = false;

            Y.Mock.expect(this.contentService, {
                method: 'newLocationCreateStruct',
                args: [this.parentLocationId],
                returns: locationCreateStruct
            });

            Y.Mock.expect(this.contentService, {
                method: 'createLocation',
                args: [this.contentId, locationCreateStruct, Y.Mock.Value.Function],
                run: function (contentId, struct, cb) {
                    cb(true, {});
                }
            });

            this.model.addLocation(options, this.parentLocation, function (err, response) {
                callbackCalled = true;

                Assert.isTrue(err, 'Should return the error');
            });

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },
    });

    setMainLocationTest = new Y.Test.Case({
        name: "eZ Content Model set main location test",

        setUp: function () {
            this.model = new Y.eZ.Content();
            this.contentId = 'Pele';

            this.capi = new Mock();
            this.contentService = new Mock();
            this.contentMetadataUpdateStruct = new Mock();

            Y.Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService
            });

            Y.Mock.expect(this.model, {
                method: 'get',
                args: ['id'],
                returns: this.contentId
            });

            Y.Mock.expect(this.contentService, {
                method: 'newContentMetadataUpdateStruct',
                args: [],
                returns: this.contentMetadataUpdateStruct
            });

            Y.Mock.expect(this.contentMetadataUpdateStruct, {
                method: 'setMainLocation',
                args: [Mock.Value.String],
            });
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
            delete this.capi;
            delete this.contentService;
            delete this.contentMetadataUpdateStruct;
        },

        'Should set main location': function () {
            var options = {api: this.capi},
                locationId = '/new/main/location/id',
                callbackCalled = false;

            Y.Mock.expect(this.contentService, {
                method: 'updateContentMetadata',
                args: [this.contentId, this.contentMetadataUpdateStruct, Y.Mock.Value.Function],
                run: function (contentId, struct, cb) {
                    cb(false, {});
                }
            });

            this.model.setMainLocation(options, locationId, function (err, response) {
                callbackCalled = true;

                Assert.isFalse(err, 'Should not return the error');
            });

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },

        'Should pass error to callback function when CAPI setMainLocation fails': function () {
            var options = {api: this.capi},
                locationId = '/new/main/location/id',
                callbackCalled = false;

            Y.Mock.expect(this.contentService, {
                method: 'updateContentMetadata',
                args: [this.contentId, this.contentMetadataUpdateStruct, Y.Mock.Value.Function],
                run: function (contentId, struct, cb) {
                    cb(true);
                }
            });

            this.model.setMainLocation(options, locationId, function (err, response) {
                callbackCalled = true;

                Assert.isTrue(err, 'Should return the error');
            });

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },
    });

    hasTranslationTest = new Y.Test.Case({
        name: "eZ Content Model hasTranslation test",

        setUp: function () {
            this.content = new Y.eZ.Content();
        },

        tearDown: function () {
            this.content.destroy();
            delete this.content;
        },

        "Should find the translation": function () {
            this.content.set('currentVersion', {Version: {VersionInfo: {languageCodes: 'fre-FR'}, Fields: {field: {}}}});
            Assert.isTrue(
                this.content.hasTranslation('fre-FR'),
                "The translation should have been found"
            );
        },

        "Should not find the translation": function () {
            Assert.isFalse(
                this.content.hasTranslation('fre-FR'),
                "The translation should not have been found"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(relationsTest);
    Y.Test.Runner.add(createContent);
    Y.Test.Runner.add(copyTest);
    Y.Test.Runner.add(loadLocationsTest);
    Y.Test.Runner.add(addLocationTest);
    Y.Test.Runner.add(setMainLocationTest);
    Y.Test.Runner.add(hasTranslationTest);
}, '', {requires: ['test', 'model-tests', 'ez-contentmodel', 'ez-restmodel']});

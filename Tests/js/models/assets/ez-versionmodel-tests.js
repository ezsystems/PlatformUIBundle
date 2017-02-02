/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versionmodel-tests', function (Y) {
    var modelTest, createTest, updateTest, removeTest, hasTranslationTest,
        isDraftTest, createdByTest, isCurrentVersionTest, getFieldTest,
        getFieldsInTest, setFieldsInTest,
        restResponse = {
            "Version": {
                "_media-type": "application/vnd.ez.api.Version+json",
                "_href": "/api/ezp/v2/content/objects/4242/versions/3",
                "VersionInfo": {
                    "id": "42",
                    "versionNo": 3,
                    "status": "DRAFT",
                    "modificationDate": "2014-02-25T14:12:04+01:00",
                    "Creator": {
                        "_media-type": "application/vnd.ez.api.User+json",
                        "_href": "/api/ezp/v2/user/users/14"
                    },
                    "creationDate": "2014-02-25T14:12:04+01:00",
                    "initialLanguageCode": "eng-GB",
                    "languageCodes": "eng-GB",
                    "names": {
                        "value": [
                            {
                                "_languageCode": "eng-GB",
                                "#text": "T11"
                            }
                        ]
                    },
                    "Content": {
                        "_media-type": "application/vnd.ez.api.ContentInfo+json",
                        "_href": "/api/ezp/v2/content/objects/4242"
                    }
                },
                "Fields": {
                    "field": [
                        {
                            "id": 978,
                            "fieldDefinitionIdentifier": "name",
                            "languageCode": "eng-GB",
                            "fieldValue": "name"
                        },
                        {
                            "id": 979,
                            "fieldDefinitionIdentifier": "text",
                            "languageCode": "eng-GB",
                            "fieldValue": "Once and for all"
                        },
                        {
                            "id": 978,
                            "fieldDefinitionIdentifier": "name",
                            "languageCode": "fre-FR",
                            "fieldValue": "nom"
                        },
                        {
                            "id": 979,
                            "fieldDefinitionIdentifier": "text",
                            "languageCode": "fre-FR",
                            "fieldValue": "Une bois fois pour toute"
                        },
                    ]
                },
                "Relations": {
                    "_media-type": "application/vnd.ez.api.RelationList+json",
                    "_href": "/api/ezp/v2/content/objects/4242/versiaons/3/relations",
                    "Relation": []
                }
            }
        },
        Assert = Y.Assert, Mock = Y.Mock;

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ Version Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadContent';
            this.rootProperty = "Version.VersionInfo";
            this.parsedAttributeNumber = Y.eZ.Version.ATTRS_REST_MAP.length + 1 + 3; // links + "manually" parsed fields + fields by languages
        },

        setUp: function () {
            this.model = new Y.eZ.Version();
            this.loadResponse = restResponse;
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

        "Should read the fields": function () {
            var m = this.model,
                response = {
                    document: this.loadResponse
                },
                fields, res;

            res = m .parse(response);
            fields = res.fields;

            Y.Assert.areEqual(
                this.loadResponse.Version.Fields.field.length / 2,
                Y.Object.size(fields),
                "The fields from the current version should all be imported"
            );
            Y.Assert.areEqual(
                this.loadResponse.Version.Fields.field[0].id,
                fields.name.id,
                "The name field should have been imported"
            );

            Y.Assert.areEqual(
                this.loadResponse.Version.Fields.field[1].id,
                fields.text.id,
                "The text field should have been imported"
            );
        },

        "Should organized the field by language and field identifier": function () {
            var m = this.model,
                response = {
                    document: this.loadResponse
                },
                fields, res;

            res = m .parse(response);
            fields = res.fieldsByLanguage;

            Assert.areEqual(
                2, Y.Object.size(fields),
                "2 languages should be detected for the fields"
            );
            Assert.areEqual(
                2, Y.Object.size(fields['fre-FR']),
                "there should be 2 fields in French"
            );
            Assert.areEqual(
                2, Y.Object.size(fields['eng-GB']),
                "there should be 2 fields in French"
            );
            Assert.areEqual(
                "name", fields['eng-GB'].name.fieldValue,
                "The field should be organized by language and identifier"
            );
            Assert.areEqual(
                "nom", fields['fre-FR'].name.fieldValue,
                "The field should be organized by language and identifier"
            );
        },

        "Should return array with translations": function () {
            var m = this.model,
                languageCodes = 'eng-GB,pol-PL,ger-DE,fre-FR',
                translationList;

            m.set('languageCodes', languageCodes);
            translationList = m.getTranslationsList();

            Y.Assert.isArray(
                translationList,
                'The translation list should be an array'
            );
            Y.Assert.areEqual(
                translationList.length,
                4,
                'The translation list should contain all translations'
            );

            Y.Array.each(translationList, function (translation) {
                Y.Assert.isTrue(
                    languageCodes.indexOf(translation) >= 0,
                    'The translation should be included in languageCodes attribute'
                );
            });

        }
    }));

    createTest = new Y.Test.Case({
        name: "eZ Version Model create tests",

        setUp: function () {
            this.contentId = "/ezp/api/content/objects/4242";
            this.languageCode = 'eng-GB';
            this.version = new Y.eZ.Version({
                versionId: "42",
                versionNo: 2
            });
            this.createDraftResponse = restResponse;
            this.capiMock = new Y.Mock();
            this.contentService = new Y.Mock();
            this.updateStruct = {
                body: {
                    VersionUpdate: {
                        fields: {
                            field: "",
                        }
                    }
                }
            };

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentService,
            });
            Y.Mock.expect(this.contentService, {
                method: 'newContentUpdateStruct',
                args: [this.languageCode],
                returns: this.updateStruct,
            });
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should create a new version": function () {
            var that = this, fields = [{}, {}];

            Y.Mock.expect(this.contentService, {
                method: 'createContentDraft',
                args: [this.contentId, Y.Mock.Value.Function],
                run: function (contentId, cb) {
                    cb(false, {
                        document: that.createDraftResponse
                    });
                }
            });
            Y.Mock.expect(this.contentService, {
                method: 'updateContent',
                args: [that.createDraftResponse.Version._href, Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (id, struct, callback) {
                    Y.Assert.areSame(
                        fields,
                        struct.body.VersionUpdate.fields.field,
                        "The field should be added to update struct"
                    );
                    callback(false, {
                        document: that.createDraftResponse
                    });
                }
            });

            this.version.save({
                api: this.capiMock,
                languageCode: this.languageCode,
                fields: fields,
                contentId: this.contentId,
            }, function (error) {
                Y.Assert.isTrue(
                    !error,
                    "No error should be detected"
                );

                Y.Assert.areEqual(
                    that.createDraftResponse.Version.VersionInfo.versionNo,
                    that.version.get('versionNo'),
                    "The new version should have been created and parsed"
                );
            });
        },

        "Should keep the version intact in case of error": function () {
            var origVersionJSON = this.version.toJSON(),
                capiError = {message: 'capi error'},
                that = this,
                fields = [{}, {}];

            Y.Mock.expect(this.contentService, {
                method: 'createContentDraft',
                args: [this.contentId, Y.Mock.Value.Function],
                run: function (contentId, cb) {
                    cb(capiError, that.createDraftResponse);
                }
            });

            this.version.save({
                api: this.capiMock,
                languageCode: this.languageCode,
                fields: fields,
                contentId: this.contentId
            }, function (error, response) {
                Y.Assert.areSame(
                    capiError,
                    error,
                    "The error from the CAPI should be passed to the callback"
                );
                Y.Assert.areSame(
                    that.createDraftResponse,
                    response,
                    "The response should be passed to the callback"
                );
                Y.Assert.areEqual(
                    Y.JSON.stringify(origVersionJSON),
                    Y.JSON.stringify(that.version.toJSON()),
                    "The version should be left intact"
                );
            });
        },

    });

    removeTest = new Y.Test.Case({
        name: "eZ Version Model remove tests",

        setUp: function () {
            this.contentId = "/ezp/api/content/objects/4242";
            this.versionId = "42";
            this.version = new Y.eZ.Version();
            this.version.setAttrs({
                id: this.contentId + "/version/2",
                versionId: this.versionId,
                versionNo: 2
            });
            this.capiMock = new Y.Mock();
            this.contentService = new Y.Mock();

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentService,
            });
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should delete the version in the repository": function () {
            var version = this.version;

            Y.Mock.expect(this.contentService, {
                method: 'deleteVersion',
                args: [this.version.get('id'), Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback();
                }
            });

            this.version.destroy({
                remove: true,
                api: this.capiMock
            }, function (error) {
                Y.Assert.isFalse(!!error, "The destroy callback should be called without error");
                Y.Assert.areEqual(
                    "", version.get('versionId'),
                    "The version object should reseted"
                );
            });

            Y.Mock.verify(this.contentService);
        },

        "Should handle the error while deleting the version": function () {
            var version = this.version,
                versionId = this.versionId;

            Y.Mock.expect(this.contentService, {
                method: 'deleteVersion',
                args: [this.version.get('id'), Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(true);
                }
            });

            this.version.destroy({
                remove: true,
                api: this.capiMock
            }, function (error) {
                Y.Assert.isTrue(!!error, "The destroy callback should be called with an error");

                Y.Assert.areEqual(
                    versionId, version.get('versionId'),
                    "The version object should be left intact"
                );
            });

            Y.Mock.verify(this.contentService);
        },

        "Should ignore unsaved version": function () {
            var that = this;

            Y.Mock.expect(this.contentService, {
                method: 'deleteVersion',
                callCount: 0,
            });

            this.version.set('id', undefined);
            this.version.destroy({
                api: this.capiMock,
                remove: true,
            }, function (error) {
                Y.Assert.isFalse(error, "The error parameter of the callback should be false");
                Y.Mock.verify(that.contentService);
            });
        },
    });

    updateTest = new Y.Test.Case({
        name: "eZ Version Model update tests",

        setUp: function () {
            this.contentId = "/ezp/api/content/objects/4242";
            this.version = new Y.eZ.Version({
                id: this.contentId + "/version/2",
                versionId: "42",
                versionNo: 2
            });
            this.languageCode = 'eng-GB';
            this.origVersionJSON = this.version.toJSON();
            this.saveResponse = restResponse;
            this.capiMock = new Y.Mock();
            this.contentService = new Y.Mock();

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentService,
            });

            Y.Mock.expect(this.contentService, {
                method: 'newContentUpdateStruct',
                args: [this.languageCode],
                returns: {
                    "body": {
                        "VersionUpdate": {
                            "fields": {
                                "field": []
                            }
                        }
                    }
                }
            });
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should update the version with the provided fields": function () {
            var fields = [{}, {}];

            Y.Mock.expect(this.contentService, {
                method: 'updateContent',
                args: [this.version.get('id'), Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (id, struct, callback) {
                    Y.Assert.areSame(
                        fields,
                        struct.body.VersionUpdate.fields.field,
                        "The field should be added to update struct"
                    );
                    callback(false, {
                        document: updateTest.saveResponse
                    });
                }
            });

            this.version.save({
                api: this.capiMock,
                languageCode: this.languageCode,
                fields: fields
            }, function (error) {
                Y.Assert.isTrue(
                    !error, "No error should be detected"
                );
                Y.Assert.areEqual(
                    updateTest.saveResponse.Version.VersionInfo.versionNo,
                    updateTest.version.get('versionNo'),
                    "The version should have been updated with the response"
                );
                Y.Assert.areEqual(
                    updateTest.saveResponse.Version.VersionInfo.status,
                    updateTest.version.get('status'),
                    "The version status should be published"
                );
            });
        },

        "Should update and publish the version": function () {
            var fields = [{}, {}];

            Y.Mock.expect(this.contentService, {
                method: 'updateContent',
                args: [this.version.get('id'), Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (id, struct, callback) {
                    Y.Assert.areSame(
                        fields,
                        struct.body.VersionUpdate.fields.field,
                        "The field should be added to update struct"
                    );
                    callback(false, {
                        document: updateTest.saveResponse
                    });
                }
            });

            Y.Mock.expect(this.contentService, {
                method: 'publishVersion',
                args: [this.saveResponse.Version._href, Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(false, {});
                }
            });

            this.version.save({
                api: this.capiMock,
                fields: fields,
                languageCode: this.languageCode,
                publish: true
            }, function (error, response) {
                Y.Assert.isTrue(
                    !error, "No error should be detected"
                );
                Y.Assert.areEqual(
                    updateTest.saveResponse.Version.VersionInfo.versionNo,
                    updateTest.version.get('versionNo'),
                    "The version should have been updated with the response"
                );
                Y.Assert.areEqual(
                    "PUBLISHED",
                    updateTest.version.get('status'),
                    "The version should be published"
                );
            });
        },

        _testUpdateError: function (publish) {
            var fields = [{}, {}],
                updateError = {'message': 'update error'};

            Y.Mock.expect(this.contentService, {
                method: 'updateContent',
                args: [this.version.get('id'), Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (id, struct, callback) {
                    Y.Assert.areSame(
                        fields,
                        struct.body.VersionUpdate.fields.field,
                        "The field should be added to update struct"
                    );
                    callback(updateError);
                }
            });

            this.version.save({
                api: this.capiMock,
                fields: fields,
                languageCode: this.languageCode,
                publish: publish
            }, function (error) {
                Y.Assert.areSame(
                    updateError,
                    error,
                    "The updateContent error should be provided"
                );

                Y.Assert.areEqual(
                    Y.JSON.stringify(updateTest.origVersionJSON),
                    Y.JSON.stringify(updateTest.version.toJSON()),
                    "The version should be left intact"
                );
            });
        },

        "Should handle the error when updating": function () {
            this._testUpdateError();
        },

        "Should handle the error when updating with publish option": function () {
            this._testUpdateError(true);
        },

        "Should handle the error when publishing": function () {
            var fields = [{}, {}],
                publishError = {message: 'publish error'},
                pubResponse = {response: 'response'};

            Y.Mock.expect(this.contentService, {
                method: 'updateContent',
                args: [this.version.get('id'), Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (id, struct, callback) {
                    Y.Assert.areSame(
                        fields,
                        struct.body.VersionUpdate.fields.field,
                        "The field should be added to update struct"
                    );
                    callback(false, {
                        document: updateTest.saveResponse
                    });
                }
            });

            Y.Mock.expect(this.contentService, {
                method: 'publishVersion',
                args: [this.saveResponse.Version._href, Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(publishError, pubResponse);
                }
            });

            this.version.save({
                api: this.capiMock,
                languageCode: this.languageCode,
                fields: fields,
                publish: true
            }, function (error, response) {
                Y.Assert.areSame(
                    publishError,
                    error,
                    "The updateContent error should be provided"
                );
                Y.Assert.areSame(
                    pubResponse,
                    response,
                    "The updateContent response should be provided"
                );

                Y.Assert.areEqual(
                    Y.JSON.stringify(updateTest.origVersionJSON),
                    Y.JSON.stringify(updateTest.version.toJSON()),
                    "The version should be left intact"
                );
            });
        }
    });

    hasTranslationTest = new Y.Test.Case({
        name: "eZ Version Model hasTranslation tests",

        setUp: function () {
            this.contentId = "/ezp/api/content/objects/4242";
            this.version = new Y.eZ.Version({
                id: this.contentId + "/version/2",
                versionId: "42",
                versionNo: 2,
                languageCodes: 'fre-FR,eng-GB',
            });
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should find the fre-FR translation": function () {
            Assert.isTrue(
                this.version.hasTranslation('fre-FR'),
                "The fre-FR translation should be detected"
            );
        },

        "Should not find the xxx-XX translation": function () {
            Assert.isFalse(
                this.version.hasTranslation('xxx-XX'),
                "The xxx-XX translation should be detected"
            );
        },
    });

    isDraftTest = new Y.Test.Case({
        name: "eZ Version Model isDraftTest tests",

        setUp: function () {
            this.version = new Y.eZ.Version();
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should detect the version as a draft": function () {
            this.version.set('status', 'DRAFT');
            Assert.isTrue(
                this.version.isDraft(),
                "The version should be detected as a draft"
            );
        },

        "Should not detect the version as a draft": function () {
            this.version.set('status', 'ARCHIVED');
            Assert.isFalse(
                this.version.isDraft(),
                "The version should not be detected as a draft"
            );
        },
    });

    createdByTest = new Y.Test.Case({
        name: "eZ Version Model isDraftTest tests",

        setUp: function () {
            this.version = new Y.eZ.Version();
            this.userId = '/user/dave';
            this.version.set('resources', {
                'Creator': this.userId
            });
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should detect the creator": function () {
            var user = new Mock();

            Mock.expect(user, {
                method: 'get',
                args: ['id'],
                returns: this.userId
            });
            Assert.isTrue(
                this.version.createdBy(user),
                "The user should be detected as the creator of the version"
            );
        },

        "Should not detect the creator": function () {
            var user = new Mock();

            Mock.expect(user, {
                method: 'get',
                args: ['id'],
                returns: '/i/am/not/' + this.userId
            });
            Assert.isFalse(
                this.version.createdBy(user),
                "The user should not be detected as the creator of the version"
            );
        },
    });

    isCurrentVersionTest = new Y.Test.Case({
        name: "eZ Version Model isCurrentVersion test",

        setUp: function () {
            this.version = new Y.eZ.Version();
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should detect an unsaved version": function () {
            Assert.isFalse(
                this.version.isCurrentVersionOf({}),
                "The unsaved version should have been detected"
            );
        },

        "Should detect the current version": function () {
            var content = new Y.Model();

            this.version.setAttrs(this.version.parse({document: restResponse}));
            content.set('currentVersion', this.version);

            Assert.isTrue(
                this.version.isCurrentVersionOf(content),
                "The version should have been detected as the current version"
            );
        },

        "Should detect a different version": function () {
            var content = new Y.Model();

            this.version.setAttrs(this.version.parse({document: restResponse}));
            content.set('currentVersion', new Y.eZ.Version({id: 'not-the-same'}));

            Assert.isFalse(
                this.version.isCurrentVersionOf(content),
                "The version should have been detected as not the current version"
            );
        },
    });

    getFieldTest = new Y.Test.Case({
        name: "eZ Version Model getField test",

        setUp: function () {
            this.version = new Y.eZ.Version();
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should return the field in a given language": function () {
            var patates = {fieldValue: 'Patates'};

            this.version.set('fieldsByLanguage', {
                'fre-FR': {name: patates, location: {}},
                'eng-GB': {name: {fieldValue: 'Potatoes'}, location: {}},
            });

            Assert.areSame(
                patates, this.version.getField('name', 'fre-FR'),
                "The field in the given language should have been returned"
            );
        },

        "Should handle non existing language": function () {
            this.version.set('fieldsByLanguage', {
                'fre-FR': {name: {fieldValue: 'Patates'}, location: {}},
                'eng-GB': {name: {fieldValue: 'Potatoes'}, location: {}},
            });
            Assert.isUndefined(this.version.getField('name', 'nor-NO'));
        },

        // BC usage
        "Should fallback on the `fields` attribute is not field by language is set": function () {
            var field = {},
                fields = {},
                identifier = 'title';

            fields[identifier] = field;
            this.version.set('fields', fields);

            Assert.areSame(
                field, this.version.getField(identifier, 'fre-FR'),
                "The field from the `fields` attribute should be returned"
            );
        },

        // deprecated usage
        "Should return the fields": function () {
            var version = this.version,
                fields = {
                    'test': {'id': 42},
                    'test2': {'id': 43}
                };

            version.set('fields', fields);
            Assert.areEqual(
                fields.test.id,
                version.getField('test').id
            );
            Assert.areEqual(
                fields.test2.id,
                version.getField('test2').id
            );
            Assert.isUndefined(
                version.getField('doesnotexist')
            );
        },
    });

    getFieldsInTest = new Y.Test.Case({
        name: "eZ Version Model getFieldsIn test",

        setUp: function () {
            this.version = new Y.eZ.Version();
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should return the fields in a given language": function () {
            this.version.set('fieldsByLanguage', {
                'fre-FR': {name: {fieldValue: 'Patates'}, location: {}},
                'eng-GB': {name: {fieldValue: 'Potatoes'}, location: {}},
            });

            Assert.areSame(
                this.version.get('fieldsByLanguage')['fre-FR'],
                this.version.getFieldsIn('fre-FR'),
                "The fields in the given language should be returned"
            );
        },
    });

    setFieldsInTest = new Y.Test.Case({
        name: "eZ Version Model setFieldsIn test",

        setUp: function () {
            this.version = new Y.eZ.Version();
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should set the fields in a given language": function () {
            var fields = {name: {fieldValue: 'Patates'}, location: {}};

            this.version.setFieldsIn(fields, 'fre-FR');

            Assert.areSame(
                fields,
                this.version.getFieldsIn('fre-FR'),
                "The fields in the given language should be set"
            );
        },
    });

    Y.Test.Runner.setName("eZ Version Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(createTest);
    Y.Test.Runner.add(updateTest);
    Y.Test.Runner.add(removeTest);
    Y.Test.Runner.add(hasTranslationTest);
    Y.Test.Runner.add(isDraftTest);
    Y.Test.Runner.add(createdByTest);
    Y.Test.Runner.add(isCurrentVersionTest);
    Y.Test.Runner.add(getFieldTest);
    Y.Test.Runner.add(getFieldsInTest);
    Y.Test.Runner.add(setFieldsInTest);
}, '', {requires: ['test', 'json', 'model-tests', 'ez-versionmodel', 'ez-restmodel']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermodel-tests', function (Y) {
    'use strict';

    var modelTest,
        loadDraftsTest;

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ User Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getUserService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadUser';
            this.rootProperty = "User";
            this.contentType = new Y.Mock();
            this.parsedAttributeNumber = Y.eZ.User.ATTRS_REST_MAP.length + 2; // links + avatar
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
                    "name": "Administrator User",
                    "Version":  {
                        "Fields": {
                            "field": [
                                {
                                    fieldDefinitionIdentifier: "first_name",
                                    fieldValue: "Administrator",
                                    id: 28,
                                    languageCode: "eng-GB"
                                },
                                {
                                    fieldDefinitionIdentifier: "image",
                                    fieldValue: {
                                        alternativeText: "",
                                        fileName: "useravatar.png",
                                        fileSize: 6216,
                                        height: "48",
                                        id: "0/8/1/0/180-6-eng-GB/useravatar.png",
                                        imageId: "14-180",
                                        inputUri: null,
                                        path: "/0/8/1/0/180-6-eng-GB/useravatar.png",
                                        uri: "/var/site/storage/images/0/8/1/0/180-6-eng-GB/useravatar.png",
                                        width: "48"
                                    },
                                    id: 180,
                                    languageCode: "eng-GB"
                                },
                            ]
                        }
                    }
                },
                "_contentType": this.contentType,
                "document": {
                    "User": {
                        "ContentType": {
                            "_href": 'some-rest-id'
                        }
                    }
                }
            };
            this.imageIdentifiers = ['image'];

            Y.eZ.ContentType = Y.Model;

            Y.Mock.expect(this.contentType, {
                method: 'getFieldDefinitionIdentifiers',
                args: [
                    'ezimage'
                ],
                returns: this.imageIdentifiers
            });
        },

        setUp: function () {
            this.model = new Y.eZ.User();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Sync 'read' should load the content with CAPI": function () {
            var m = this.model,
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
                    Y.Mock.Value.Function
                ],
                run: Y.bind(function (id, callback) {
                    callback(false, this.loadResponse);
                }, this)
            });

            m.set('id', modelId);
            m.sync('read', {
                    api: this.capiMock
                }, callback
            );

            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.serviceMock);
        },

        "Should not set the avatar when user doesn't have one": function () {
            var m = this.model,
                response, res = {},
                errorFired = false;

            res.avatar = 'some avatar';

            Y.Mock.expect(this.contentType, {
                method: 'getFieldDefinitionIdentifiers',
                args: [
                    'ezimage'
                ],
                returns: []
            });

            response = {
                document: this.loadResponse
            };

            m.on('error', function (e) {
                errorFired = true;
            });

            res = m.parse(response);

            Y.Assert.isFalse(errorFired, "The error event should not have been fired");
            Y.Assert.isNull(res.avatar, 'Should not set avatar when user doesn`t have one');
        },

        "Sync 'read' should not load the content with CAPI": function () {
            var m = this.model,
                modelId = "/api/v2/ezp/model/mid",
                isCallbackCalled = false,
                callback = function (err) {
                    isCallbackCalled = true;

                    Y.Assert.isTrue(err, 'The `err` param of the callback should be set to a truthy value');
                };

            Y.Mock.expect(this.capiMock, {
                method: this.capiGetService,
                returns: this.serviceMock
            });
            Y.Mock.expect(this.serviceMock, {
                method: this.serviceLoad,
                args: [
                    modelId,
                    Y.Mock.Value.Function
                ],
                run: Y.bind(function (id, callback) {
                    callback(true, this.loadResponse);
                }, this)
            });

            m.set('id', modelId);
            m.sync('read', {
                    api: this.capiMock
                }, callback
            );

            Y.Assert.isTrue(isCallbackCalled, 'Should call the callback');

            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.serviceMock);
        },
    }));

    loadDraftsTest = new Y.Test.Case({
        name: "eZ User Model loadDrafts() method tests",

        setUp: function () {
            this.modelId = 'permanent-vacation';
            this.capiMock = new Y.Mock();
            this.contentServiceMock = new Y.Mock();
            this.model = new Y.eZ.User({id: this.modelId});

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentServiceMock
            });
        },

        tearDown: function () {
            this.model.destroy();

            delete this.modelId;
            delete this.capiMock;
            delete this.model;
        },

        "Should load user drafts": function () {
            var isCallbackCalled = false,
                draftHash = {
                    "Version":{"_href":"/api/ezp/v2/content/objects/116/versions/3"},
                    "VersionInfo":{
                        "id":709,
                        "versionNo":3,
                        "status":"DRAFT",
                        "modificationDate":"2016-06-03T14:20:49+02:00",
                        "Creator":{"_href":"/api/ezp/v2/user/users/14"},
                        "creationDate":"2016-06-03T14:20:49+02:00",
                        "initialLanguageCode":"eng-GB",
                        "languageCodes":"eng-GB",
                        "names":{"value":[{"_languageCode":"eng-GB","#text":"2 zones"}]},
                        "Content":{"_href":"/api/ezp/v2/content/objects/116"}
                    }
                },
                loadUserDraftsResponse = {document: {VersionList: {VersionItem: [draftHash]}}},
                loadDraftsCallback = function (error, response) {
                    isCallbackCalled = true;

                    Y.Assert.isFalse(error, 'Should not throw error');
                    Y.Assert.areSame(
                        loadUserDraftsResponse.document.VersionList.VersionItem.length,
                        response.length,
                        'Should return one draft model'
                    );
                    Y.Assert.isInstanceOf(Y.eZ.VersionInfo, response[0], 'Should return a correct model instance - Y.eZ.VersionInfo');
                    Y.Assert.areSame(draftHash.Version._href, response[0].get('id'), 'Should set model id correctly');
                };

            Y.Mock.expect(this.contentServiceMock, {
                method: 'loadUserDrafts',
                args: [this.modelId, Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(false, loadUserDraftsResponse);
                }
            });

            this.model.loadDrafts({api: this.capiMock}, loadDraftsCallback);

            Y.Assert.isTrue(isCallbackCalled, 'Should run the provided callback');

            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.contentServiceMock);
        },

        "Should throw an error while trying to load user drafts": function () {
            var isCallbackCalled = false,
                loadUserDraftsResponse = {message: 'Error occurred!'},
                loadDraftsCallback = function (error, response) {
                    isCallbackCalled = true;

                    Y.Assert.isTrue(error, 'Should throw an error');
                    Y.Assert.areSame(loadUserDraftsResponse, response, 'Should return error response');
                };

            Y.Mock.expect(this.contentServiceMock, {
                method: 'loadUserDrafts',
                args: [this.modelId, Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(true, loadUserDraftsResponse);
                }
            });

            this.model.loadDrafts({api: this.capiMock}, loadDraftsCallback);

            Y.Assert.isTrue(isCallbackCalled, 'Should run the provided callback');

            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.contentServiceMock);
        }
    });

    Y.Test.Runner.setName("eZ User Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(loadDraftsTest);
}, '', {requires: ['test', 'model-tests', 'ez-usermodel', 'ez-restmodel']});

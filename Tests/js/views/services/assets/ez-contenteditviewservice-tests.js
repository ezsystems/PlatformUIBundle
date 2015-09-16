/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditviewservice-tests', function (Y) {
    var cevlTest, eventTest, redirectionUrlTest, getViewParametersTest, changeLanguageTest,
        Mock = Y.Mock, Assert = Y.Assert;

    cevlTest = new Y.Test.Case({
        name: "eZ Content Edit View Service tests",

        setUp: function () {
            this.viewLocationRoute = '/view/something';
            this.locationId = 'something';
            this.versionTranslationsList = ['eng-GB', 'pol-PL'];
            this.languageCode = 'eng-GB';
            this.baseLanguageCode = 'pol-PL';
            this.newLanguageCode = 'ger-DE';
            this.request = {params: {id: "/api/ezp/v2/content/objects/59", languageCode: this.languageCode}};
            this.requestBaseLanguage = {
                params: {
                    id: "/api/ezp/v2/content/objects/59",
                    languageCode: this.newLanguageCode,
                    baseLanguageCode: this.baseLanguageCode
                }
            };
            this.capiMock = new Y.Test.Mock();
            this.resources = {
                'Owner': '/api/ezp/v2/user/users/14',
                'MainLocation': '/api/ezp/v2/content/locations/1/2/61',
                'ContentType': '/api/ezp/v2/content/types/23'
            };
            this.fieldDefinitions = {
                'name': {
                    "id": 230,
                    "identifier": "name",
                    "fieldType": "ezstring",
                    "defaultValue": 'default name'
                }
            };

            this.mocks = ['content', 'mainLocation', 'contentType', 'owner'];
            this.content = new Y.Test.Mock();
            this.mainLocation = new Y.Test.Mock();
            this.contentType = new Y.Test.Mock();
            this.owner = new Y.Test.Mock();
            this.version = new Y.Test.Mock();
            this.contentCurrentVersion = new Y.Test.Mock();
            this.app = new Y.Test.Mock();
            this.fields = {
                name: {
                    languageCode: this.languageCode,
                    fieldValue: 'Didier Drogba'
                }
            };
            this.fieldsForBaseTranslation = {
                name: {
                    languageCode: this.languageCode,
                    fieldValue: 'Roman Dmowski'
                }
            };
        },

        "Should load content using languageCode": function () {
            var service,
                that = this;

            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });

            Y.Mock.expect(this.content, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areEqual(
                        that.languageCode,
                        options.languageCode,
                        "Language code should be the same as in request"
                    );
                }
            });

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: this.request,
                app: this.app,
                location: this.mainLocation,
                content: this.content,
                version: this.version,
            });

            service.load();

            Y.Mock.verify(this.content);
        },

        "Should load content using baseLanguageCode": function () {
            var service,
                that = this;

            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.requestBaseLanguage.params.id]
            });

            Y.Mock.expect(this.content, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areEqual(
                        that.baseLanguageCode,
                        options.languageCode,
                        "Language code should be the same as baseLanguageCode in request"
                    );
                }
            });

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: this.requestBaseLanguage,
                app: this.app,
                location: this.mainLocation,
                content: this.content,
                version: this.version,
            });

            service.load();

            Y.Mock.verify(this.content);
        },

        "Should fire the 'error' event when translation on which translation is based doesn't exist": function () {
            var service,
                that = this,
                errorTriggered = false,
                newTranslation = 'jpn-JP',
                notExistingTranslation = 'fre-FR',
                contentAlwaysAvailable = false,
                callback = function () {},
                request = {
                    params: {
                        id: "/api/ezp/v2/content/objects/59",
                        languageCode: newTranslation,
                        baseLanguageCode: notExistingTranslation
                    }
                },
                runLoadCallback = function (options, callback) {
                    Y.Assert.areSame(
                        options.api, cevlTest.capiMock,
                        "The 'api' property should be the CAPI"
                    );
                    callback(false);
                };

            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.version, {
                method: 'set',
                args: ['fields', Y.Mock.Value.Object]
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                callCount: 4,
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'resources' ) {
                        return that.resources;
                    } else if ( attr === 'fields' ) {
                        return that.fields;
                    } else if ( attr === 'currentVersion' ) {
                        return that.contentCurrentVersion;
                    } else if ( attr === 'alwaysAvailable' ) {
                        return contentAlwaysAvailable;
                    } else if ( attr === 'contentId' ) {
                        return request.params.id;
                    } else {
                        Y.fail("Unexpected call to content.get(" + attr + ")");
                    }
                }
            });
            Y.Mock.expect(this.content, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function]
            });
            Y.Array.each(this.mocks, function (val) {
                Y.Mock.expect(cevlTest[val], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: runLoadCallback
                });
            });
            Y.Object.each(this.resources, function (val, key) {
                var attr = key.charAt(0).toLowerCase() + key.substr(1);
                Y.Mock.expect(cevlTest[attr], {
                    method: 'set',
                    args: ['id',  val]
                });
            });
            Y.Mock.expect(this.contentCurrentVersion, {
                method: 'getTranslationsList',
                args: [],
                returns: this.versionTranslationsList
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: request,
                app: this.app,
                location: this.mainLocation,
                content: this.content,
                version: this.version,
            });

            service.on('error', function (e) {
                errorTriggered = true;
            });

            service.load(callback);

            Y.Assert.isTrue(errorTriggered, 'Should fire `error` event');
        },

        _testSetFields: function (request, expectedFields) {
            var service,
                that = this,
                contentAlwaysAvailable = false,
                runLoadCallback = function (options, callback) {
                    Y.Assert.areSame(
                        options.api, cevlTest.capiMock,
                        "The 'api' property should be the CAPI"
                    );
                    callback(false);
                },
                callback = function () {};

            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                callCount: 4,
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'resources' ) {
                        return that.resources;
                    } else if ( attr === 'fields' ) {
                        if (request.params.baseLanguageCode) {
                            return that.fieldsForBaseTranslation;
                        }
                        return that.fields;
                    } else if ( attr === 'currentVersion' ) {
                        return that.contentCurrentVersion;
                    } else if ( attr === 'alwaysAvailable' ) {
                        return contentAlwaysAvailable;
                    } else if ( attr === 'contentId' ) {
                        return request.params.id;
                    } else {
                        Y.fail("Unexpected call to content.get(" + attr + ")");
                    }
                }
            });
            Y.Mock.expect(this.content, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function]
            });
            Y.Array.each(this.mocks, function (val) {
                Y.Mock.expect(cevlTest[val], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: runLoadCallback
                });
            });
            Y.Object.each(this.resources, function (val, key) {
                var attr = key.charAt(0).toLowerCase() + key.substr(1);
                Y.Mock.expect(cevlTest[attr], {
                    method: 'set',
                    args: ['id',  val]
                });
            });
            Y.Mock.expect(this.contentCurrentVersion, {
                method: 'getTranslationsList',
                args: [],
                returns: this.versionTranslationsList
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });
            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: this.fieldDefinitions
            });
            Y.Mock.expect(this.version, {
                method: 'set',
                args: ['fields', Y.Mock.Value.Object],
                run: function (attr, fields) {
                    Y.Object.each(fields, function (field, identifier) {
                        Y.Assert.areSame(
                            field.fieldValue,
                            expectedFields[identifier].fieldValue,
                            "The field value should be the same as expected"
                        );
                        Y.Assert.areSame(
                            field.languageCode,
                            expectedFields[identifier].languageCode,
                            "The field languageCode should be the same as expected"
                        );
                    });
                }
            });

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: request,
                app: this.app,
                location: this.mainLocation,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
            });

            service.load(callback);
        },

        "Should set default version fields for given content type": function () {
            var newTranslation = 'ger-DE',
                expectedFields = {
                    name: {
                        languageCode: newTranslation,
                        fieldValue: this.fieldDefinitions.name.defaultValue
                    }
                },
                request = {
                    params: {
                        id: "/api/ezp/v2/content/objects/59",
                        languageCode: newTranslation,
                    }
                };
            this._testSetFields(request, expectedFields);
        },

        "Should set values from content loaded with base language code": function () {
            var newTranslation = 'jpn-JP',
                baseLanguageCode = this.baseLanguageCode,
                expectedFields = {
                    name: {
                        languageCode: newTranslation,
                        fieldValue: this.fieldsForBaseTranslation.name.fieldValue
                    }
                },
                request = {
                    params: {
                        id: "/api/ezp/v2/content/objects/59",
                        languageCode: newTranslation,
                        baseLanguageCode: baseLanguageCode
                    }
                };
            this._testSetFields(request, expectedFields);
        },

        "Should set values from content loaded with existing language code": function () {
            var existingTranslation = this.languageCode,
                expectedFields = this.fields,
                request = {
                    params: {
                        id: "/api/ezp/v2/content/objects/59",
                        languageCode: existingTranslation,
                    }
                };
            this._testSetFields(request, expectedFields);
        },

        "Should load the content, the location, the content type and the owner": function () {
            var response = {}, service, callback,
                callbackCalled = false,
                that = this,
                runLoadCallback = function (options, callback) {
                    Y.Assert.areSame(
                        options.api, cevlTest.capiMock,
                        "The 'api' property should be the CAPI"
                    );
                    callback(false);
                };

            Y.Mock.expect(this.contentCurrentVersion, {
                method: 'getTranslationsList',
                args: [],
                returns: this.versionTranslationsList
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });
            Y.Mock.expect(this.version, {
                method: 'set',
                args: ['fields', Y.Mock.Value.Object],
                run: function(attr, fields) {
                    Y.Assert.areSame(
                        fields.name.languageCode,
                        that.fields.name.languageCode,
                        'The languageCode should match'
                    );
                    Y.Assert.areSame(
                        fields.name.fieldValue,
                        that.fields.name.fieldValue,
                        'The fieldValue should match'
                    );
                }
            });
            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                callCount: 3,
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'resources' ) {
                        return that.resources;
                    } else if ( attr === 'fields' ) {
                        return that.fields;
                    } else if ( attr === 'currentVersion' ) {
                        return that.contentCurrentVersion;
                    } else {
                        Y.fail("Unexpected call to content.get(" + attr + ")");
                    }
                }
            });
            Y.Mock.expect(this.contentType, {
                method: 'get',
                callCount: 2,
                args: ['fieldDefinitions'],
                returns: that.fieldDefinitions
            });

            Y.Object.each(this.resources, function (val, key) {
                var attr = key.charAt(0).toLowerCase() + key.substr(1);
                Y.Mock.expect(cevlTest[attr], {
                    method: 'set',
                    args: ['id',  val]
                });
            });

            Y.Array.each(this.mocks, function (val) {
                Y.Mock.expect(cevlTest[val], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: runLoadCallback
                });
            });

            callback = function (param) {
                var variables = service.getViewParameters();

                Y.Assert.areSame(
                    service, param,
                    "The service should be available in the parameter of the load callback"
                );
                Y.Assert.areSame(variables.content, cevlTest.content);
                callbackCalled = true;
            };

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                app: this.app,
                request: this.request,
                response: response,

                content: this.content,
                location: this.mainLocation,
                contentType: this.contentType,
                owner: this.owner,
                version: this.version
            });

            service.load(callback);

            Y.Mock.verify(this.app);
            Y.Mock.verify(this.content);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.owner);
            Y.Mock.verify(this.version);

            Y.Assert.isTrue(callbackCalled, "The load callback should have been called");
        },

        "Should fire the 'error' event when the content loading fails": function () {
            var service, callback,
                errorTriggered = false,
                that = this;

            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });

            Y.Mock.expect(this.content, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    callback(true);
                }
            });

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: that.fieldDefinitions
            });

            callback = function () {
                Y.Assert.fail("The load callback should not be called");
            };

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: this.request,
                app: this.app,
                location: this.mainLocation,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
            });

            service.on('error', function (e) {
                errorTriggered = true;
            });

            service.load(callback);

            Y.Mock.verify(this.app);
            Y.Mock.verify(this.content);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.version);
            Y.Assert.isTrue(errorTriggered, "The error event should have been triggered");
        },
        /**
         * @param {String} fail one of the value in this.mocks
         */
        _testSubloadError: function (fail) {
            var response = {}, service, callback,
                that = this,
                errorTriggered = false,
                runLoadCallbackSuccess = function (options, callback) {
                    callback(false);
                },
                runLoadCallbackFail = function (options, callback) {
                    callback(true);
                };

            Y.Mock.expect(this.contentCurrentVersion, {
                method: 'getTranslationsList',
                args: [],
                returns: this.versionTranslationsList
            });
            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });
            Y.Mock.expect(this.version, {
                method: 'set',
                args: ['fields', Y.Mock.Value.Object]
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                callCount: 4,
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'resources' ) {
                        return that.resources;
                    } else if ( attr === 'fields' ) {
                        return that.fields;
                    } else if ( attr === 'currentVersion' ) {
                        return that.contentCurrentVersion;
                    } else {
                        Y.fail("Unexpected call to content.get(" + attr + ")");
                    }
                }
            });
            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: that.fieldDefinitions
            });

            Y.Object.each(this.resources, function (val, key) {
                var attr = key.charAt(0).toLowerCase() + key.substr(1);
                Y.Mock.expect(cevlTest[attr], {
                    method: 'set',
                    args: ['id',  val]
                });
            });

            Y.Array.each(this.mocks, function (val) {
                Y.Mock.expect(cevlTest[val], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: fail === val ? runLoadCallbackFail : runLoadCallbackSuccess
                });
            });

            callback = function () {
                Y.Assert.fail("The load callback should not be called");
            };

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: this.request,
                response: response,
                app: this.app,
                content: this.content,
                location: this.mainLocation,
                contentType: this.contentType,
                owner: this.owner,
                version: this.version
            });


            service.on('error', function (e) {
                errorTriggered = true;
            });

            service.load(callback);

            Y.Mock.verify(this.app);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.owner);

            Y.Assert.isTrue(errorTriggered, "The error event should have been triggered");
        },

        "Should fire the error event when the location loading fails":  function () {
            this._testSubloadError('mainLocation');
        },

        "Should fire the error event when the content type loading fails":  function () {
            this._testSubloadError('contentType');
        },

        "Should fire the error event when the owner loading fails":  function () {
            this._testSubloadError('owner');
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Content Edit View Service 'closeView' event test",

        setUp: function () {
            this.viewLocationRoute = '/view/something';
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};

            this.app = new Y.Mock();

            Y.Mock.expect(this.app, {
                method: 'navigate',
                args: [this.viewLocationRoute],
            });

            this.service = new Y.eZ.ContentEditViewService({
                app: this.app,
                closeRedirectionUrl: this.viewLocationRoute,
                request: this.request
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        'Should redirect to the closeRedirectionUrl value': function () {
            this.service.fire('test:closeView');
            Y.Mock.verify(this.app);
        },

        'Should set languageCode and baseLanguageCode': function () {
            var baseLanguageCode = 'eng-GB',
                languageCode = 'jpn-JP',
                newRequest = {params: {languageCode: languageCode, baseLanguageCode: baseLanguageCode}};

            this.service.set('request', newRequest);
            this.service.fire('test:requestChange');
            Y.Assert.areSame(
                baseLanguageCode,
                this.service.get('baseLanguageCode'),
                "The baseLanguageCode attribute should be set"
            );
            Y.Assert.areSame(
                languageCode,
                this.service.get('languageCode'),
                "The languageCode attribute should be set"
            );
        }
    });

    redirectionUrlTest = new Y.Test.Case({
        name: 'eZ Content Edit View Service redirection urls tests',

        setUp: function () {
            this.location = new Mock();
            this.app = new Mock();
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};
            this.service = new Y.eZ.ContentEditViewService({
                app: this.app,
                location: this.location,
                request: this.request
            });
        },

        _defaultViewLocation: function (attr) {
            var locationId = 'communication-breakdown',
                uri = '/led-zeppelin/' + locationId;

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });
            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Mock.Value.Object],
                run: function (routeName, options) {
                    Assert.isObject(options, "The routeUri params should be an object");
                    Assert.areEqual(
                        locationId,
                        options.id,
                        "The current location id should be passed to routeUri"
                    );
                    return uri;
                }
            });

            Assert.areEqual(
                uri, this.service.get(attr),
                "The " + attr + " default value should be the view location of the location"
            );
            Mock.verify(this.location);
            Mock.verify(this.service);
        },

        _definedValue: function (attr) {
            var uri = '/led-zeppelin/over-the-hills-and-far-away';

            this.service.set(attr, uri);
            Assert.areEqual(
                uri, this.service.get(attr),
                "The " + attr + " value should be the defined one"
            );
        },

        _functionValue: function (attr) {
            var uri = '/led-zeppelin/over-the-hills-and-far-away',
                service = this.service,
                func = function () {
                    Assert.areSame(
                        service, this,
                        "The function should be executed in the service context"
                    );
                    return uri;
                };

            this.service.set(attr, func);
            Assert.areEqual(
                uri, this.service.get(attr),
                "The " + attr + " value should be the result of the function"
            );
        },

        "closeRedirectionUrl default value": function () {
            this._defaultViewLocation('closeRedirectionUrl');
        },

        "discardRedirectionUrl default value": function () {
            this._defaultViewLocation('closeRedirectionUrl');
        },

        "publishRedirectionUrl default value": function () {
            this._defaultViewLocation('closeRedirectionUrl');
        },

        "closeRedirectionUrl defined value": function () {
            this._definedValue('closeRedirectionUrl');
        },

        "discardRedirectionUrl defined value": function () {
            this._definedValue('closeRedirectionUrl');
        },

        "publishRedirectionUrl defined value": function () {
            this._definedValue('closeRedirectionUrl');
        },

        "closeRedirectionUrl function value": function () {
            this._functionValue('closeRedirectionUrl');
        },

        "discardRedirectionUrl function value": function () {
            this._functionValue('closeRedirectionUrl');
        },

        "publishRedirectionUrl function value": function () {
            this._functionValue('closeRedirectionUrl');
        },
    });

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Content edit View Service getViewParameters tests",

        setUp: function () {
            this.content = {};
            this.contentType = {};
            this.location = {};
            this.owner = {};
            this.version = {};
            this.config = {};
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};
            this.service = new Y.eZ.ContentEditViewService({
                content: this.content,
                contentType: this.contentType,
                location: this.location,
                config: this.config,
                owner: this.owner,
                version: this.version,
                request: this.request,
                languageCode: this.languageCode
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.content;
            delete this.contentType;
            delete this.location;
            delete this.config;
            delete this.owner;
            delete this.version;
        },

        "Should get the view parameters": function () {
            var params = this.service.getViewParameters();

            Y.Assert.areSame(this.content, params.content, 'The content should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.contentType, params.contentType, 'The contentType should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.config, params.config, 'The config should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.version, params.version, 'The version should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.owner, params.owner, 'The owner should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.location, params.mainLocation, 'The location should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.languageCode, params.languageCode, 'The languageCode should be available in the return value of getViewParameters');
        },
    });

    changeLanguageTest = new Y.Test.Case({
        name: 'eZ Content Edit View Service change language tests',

        setUp: function () {
            var that = this;

            this.content = new Mock();
            this.contentId = 'Zlatan Ibrahimovic';
            this.currentVersion = new Mock();
            this.translationsList = ['eng-GB', 'pol-PL'];
            this.app = new Mock();
            this.languageCode = 'eng-GB';
            this.switchedLanguageCode = 'pol-PL';
            this.editUrl = 'Diego Costa';
            this.request = {params: {languageCode: this.languageCode}};

            Y.Mock.expect(this.content, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'id' ) {
                        return that.contentId;
                    } else if ( attr === 'currentVersion' ) {
                        return that.currentVersion;
                    } else {
                        Y.fail("Unexpected call to content.get(" + attr + ")");
                    }
                }
            });

            Mock.expect(this.currentVersion, {
                method: 'getTranslationsList',
                args: [],
                returns: this.translationsList
            });

            this.service = new Y.eZ.ContentEditViewService({
                content: this.content,
                app: this.app,
                request: this.request
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.content;
            delete this.currentVersion;
        },

        "Should fire 'languageSelect' event": function () {
            var languageSelectFired = false,
                that = this;

            this.service.on('languageSelect', function (e) {
                languageSelectFired = true;

                Assert.areSame(
                    e.config.referenceLanguageList,
                    that.translationsList,
                    "Array with translations list of content should be passed in event facade config"
                );
            });

            this.service.fire('test:changeLanguage');

            Assert.isTrue(languageSelectFired, "The 'languageSelect' should have been fired");
        },

        "Should navigate to edit content view with selected language": function () {
            var that = this;

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['editContent', Y.Mock.Value.Object],
                run: function (routeName, params) {
                    Y.Assert.isObject(
                        params,
                        "routeUri should be called with an object in parameter"
                    );
                    Y.Assert.areEqual(
                        params.id,
                        that.contentId,
                        "routeUri should receive the content id in parameter"
                    );
                    Y.Assert.areEqual(
                        params.languageCode,
                        that.switchedLanguageCode,
                        "routeUri should receive the content id in parameter"
                    );
                    return that.editUrl;
                }
            });

            this.service.on('languageSelect', function (e) {
                var config = {selectedLanguageCode: that.switchedLanguageCode};

                e.config.languageSelectedHandler(config);
            });

            this.service.fire('test:changeLanguage');

            Mock.verify(this.app);
        }
    });

    Y.Test.Runner.setName("eZ Content Edit View Service tests");
    Y.Test.Runner.add(cevlTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(redirectionUrlTest);
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(changeLanguageTest);
}, '', {requires: ['test', 'ez-contenteditviewservice']});

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
            this.capiMock = {};
            this.contentInfo = new Mock();
            this.content = new Mock();
            this.mainLocation = new Mock();
            this.contentType = new Mock();
            this.owner = new Mock();
            this.version = new Mock();
            this.app = {};

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

            this.resources = {
                'Owner': '/api/ezp/v2/user/users/14',
                'MainLocation': '/api/ezp/v2/content/locations/1/2/61',
                'ContentType': '/api/ezp/v2/content/types/23'
            };
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

            Mock.expect(this.contentInfo, {
                method: 'set',
                args: ['id', this.request.params.id]
            });
            Mock.expect(this.contentInfo, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capiMock,
                        options.api,
                        "The CAPI should be provided"
                    );
                    callback(false);
                }, this),
            });
            Mock.expect(this.contentInfo, {
                method: 'get',
                args: ['resources'],
                returns: this.resources,
            });

            Mock.expect(this.content, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'mainLanguageCode' ) {
                        return this.languageCode;
                    } else if ( attr === 'fields' ) {
                        return this.fields;
                    }
                    Y.fail('Unexpected call to content.get("' + attr + '")');
                }, this),
            });

            Mock.expect(this.version, {
                method: 'reset'
            });
            Mock.expect(this.version, {
                method: 'set',
                args: ['fields', Mock.Value.Object],
            });

            this.mocks = ['content', 'mainLocation', 'contentType', 'owner'];
            this.mocksId = {
                'content': this.request.params.id,
                'mainLocation': this.resources.MainLocation,
                'contentType': this.resources.ContentType,
                'owner': this.resources.Owner,
            };
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.capiMock;
            delete this.contentInfo;
            delete this.content;
            delete this.mainLocation;
            delete this.contentType;
            delete this.owner;
            delete this.version;
            delete this.app;
        },

        _getService: function (request) {
            return new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: (request ? request : this.request),
                app: this.app,
                location: this.mainLocation,
                contentInfo: this.contentInfo,
                content: this.content,
                contentType: this.contentType,
                owner: this.owner,
                version: this.version,
                user: this.user,
            });
        },

        "Should load the content info": function () {
            var service, loaded = false;

            Mock.expect(this.contentInfo, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capiMock,
                        options.api,
                        "The CAPI should be provided"
                    );
                    loaded = true;
                }, this),
            });

            this.service = service = this._getService();
            service.load();
            Assert.isTrue(loaded, "The content info should have been loaded");
        },

        "Should check content info loading error": function () {
            var service,
                errorFired = false;

            Mock.expect(this.contentInfo, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capiMock,
                        options.api,
                        "The CAPI should be provided"
                    );
                    callback(true);
                }, this),
            });

            this.service = service = this._getService();
            service.on('error', function () {
                errorFired = true;
            });
            service.load();

            Assert.isTrue(errorFired, "The error event should have been fired");
        },

        /**
         * Configure the mocks references in the `mocks` property to be
         * "loadable".
         *
         * @method _configureMocksLoading
         * @params {String} [fail] the identifier of the mock that needs to
         * simulate a loading failure
         * @params {Function} [mockAssert] additional assert to execute on the
         * options passed to the load method.
         */
        _configureMocksLoading: function (fail, mockAssert) {
            var runLoadCallbackSuccess = function (assert, options, callback) {
                    Assert.areSame(
                        this.capiMock, options.api,
                        "The CAPI should be passed to the load methods"
                    );
                    if ( assert ) {
                        assert.call(this, options, callback);
                    }
                    callback(false);
                },
                runLoadCallbackFail = function (assert, options, callback) {
                    Assert.areSame(
                        this.capiMock, options.api,
                        "The CAPI should be passed to the load methods"
                    );
                    if ( assert ) {
                        assert.call(this, options, callback);
                    }
                    callback(true);
                };

            if ( !mockAssert ) {
                mockAssert = {};
            }
            Y.Array.each(this.mocks, function (val) {
                var run = Y.bind(runLoadCallbackSuccess, this, mockAssert[val]);

                if ( fail === val ) {
                    run = Y.bind(runLoadCallbackFail, this, mockAssert[val]);
                }
                Mock.expect(this[val], {
                    method: 'load',
                    args: [Mock.Value.Object, Mock.Value.Function],
                    run: run,
                });

                Mock.expect(this[val], {
                    method: 'set',
                    args: ['id', this.mocksId[val]],
                });
            }, this);
        },

        "Should load the content, the location, the content type and the owner": function () {
            var service,
                callbackCalled = false,
                contentLoadingAssert = function (options) {
                    Assert.areEqual(
                        this.baseLanguageCode, options.languageCode,
                        "The content should be loaded in the baseLanguageCode"
                    );
                };

            Mock.expect(this.content, {
                method: 'hasTranslation',
                args: [this.requestBaseLanguage.params.baseLanguageCode],
                returns: true,
            });

            this._configureMocksLoading('none', {'content': contentLoadingAssert});
            this.service = service = this._getService(this.requestBaseLanguage);
            service.load(function () {
                callbackCalled = true;
            });

            Assert.isTrue(callbackCalled, "The next function should have been called");
        },

        "Should check the content translation when edition is based on one": function () {
            var service,
                errorTriggered = false;

            Mock.expect(this.content, {
                method: 'hasTranslation',
                args: [this.requestBaseLanguage.params.baseLanguageCode],
                returns: false,
            });

            this._configureMocksLoading();
            this.service = service = this._getService(this.requestBaseLanguage);
            service.once('error', function (e) {
                errorTriggered = true;
            });
            service.load(function () {
                Y.fail("The callback should not be called");
            });
            Assert.isTrue(errorTriggered, "The error event should have been triggered");
        },

        "Should load the content in edited language": function () {
            var service,
                callbackCalled = false,
                contentLoadingAssert = function (options) {
                    Assert.areEqual(
                        this.languageCode, options.languageCode,
                        "The content should be loaded in the request languageCode"
                    );
                };

            this._configureMocksLoading('none', {'content': contentLoadingAssert});
            this.service = service = this._getService();
            service.once('error', function (e) {
                Y.fail("No error should be detected");
            });
            service.load(function () {
                callbackCalled = true;

            });
            Assert.isTrue(callbackCalled, "The callback should be called");
        },

        "Should handle the first creation of a translation": function () {
            var service,
                contentInfoAttrs = {},
                callbackCalled = false;

            this._configureMocksLoading('content');
            Mock.expect(this.contentInfo, {
                method: 'getAttrs',
                returns: contentInfoAttrs,
            });
            Mock.expect(this.content, {
                method: 'setAttrs',
                args: [contentInfoAttrs],
            });
            this.service = service = this._getService();
            service.once('error', function (e) {
                Y.fail("No error should be detected");
            });
            service.load(function () {
                callbackCalled = true;
            });
            Assert.isTrue(callbackCalled, "The callback should be called");
        },

        "Should set the version fields based on the default values": function () {
            var fields,
                fieldDefinitions = {
                    'name': {
                        'identifier': 'name',
                        'defaultValue': 'default name',
                    },
                    'short_name': {
                        'identifier': 'short_name',
                        'defaultValue': 'default short name',
                    },
            };


            Mock.expect(this.version, {
                method: 'set',
                args: ['fields', Mock.Value.Object],
                run: function (attr, f) {
                    fields = f;
                },
            });
            Mock.expect(this.content, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'mainLanguageCode' ) {
                        return this.languageCode;
                    } else if ( attr === 'fields' ) {
                        return {};
                    }
                    Y.fail('Unexpected call to content.get("' + attr + '")');
                }, this),
            });
            Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: fieldDefinitions,
            });

            this["Should handle the first creation of a translation"]();

            Assert.areEqual(
                Y.Object.size(fieldDefinitions), Y.Object.size(fields),
                "The version fields should have the same size of the fieldDefinitions"
            );
            Y.Object.each(fields, function (field, identifier) {
                Assert.areEqual(
                    identifier, field.fieldDefinitionIdentifier,
                    "The fieldDefinition identifier should be set on the fields"
                );
                Assert.areEqual(
                    fieldDefinitions[identifier].defaultValue, field.fieldValue,
                    "The field should have the default value of the fieldDefinition"
                );
                Assert.areEqual(
                    this.languageCode, field.languageCode,
                    "The languageCode should be set on the field"
                );
            }, this);
        },

        "Should set the version fields based on the loaded content": function () {
            var fields;

            Mock.expect(this.version, {
                method: 'set',
                args: ['fields', Mock.Value.Object],
                run: function (attr, f) {
                    fields = f;
                },
            });

            this["Should load the content, the location, the content type and the owner"]();

            Assert.areEqual(
                Y.Object.size(this.fields), Y.Object.size(fields),
                "The version fields should be created from the content fields"
            );
            Y.Object.each(fields, function (field, identifier) {
                var contentField = this.fields[identifier];

                Assert.areEqual(
                    contentField.languageCode, field.languageCode,
                    "The language code of the version field should match the one of content field"
                );
                Assert.areEqual(
                    contentField.fieldValue, field.fieldValue,
                    "The field value of the version field should match the one of content field"
                );
            }, this);
        },

        /**
         * @param {String} fail one of the value in this.mocks
         */
        _testSubloadError: function (fail) {
            var service,
                errorTriggered = false;

            this._configureMocksLoading(fail);
            this.service = service = this._getService(this.requestBaseLanguage);
            service.once('error', function (e) {
                errorTriggered = true;
            });

            service.load(function () {
                Y.fail("The load callback should not be called");
            });

            Assert.isTrue(errorTriggered, "The error event should have been triggered");
        },

        "Should fire the error event when the content loading fails":  function () {
            this._testSubloadError('content');
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
            this.content = new Mock();
            this.app = new Mock();
            this.user = {};
            Mock.expect(this.app, {
                method: 'get',
                args: ['user'],
                returns: this.user,
            });

            this.contentType = {};
            this.location = {};
            this.owner = {};
            this.version = {};
            this.config = {};

            this.languageCode = 'pol-PL';
            this.mainLanguageCode = 'ger-DE';
            this.request = {params: {languageCode: this.languageCode}};

            Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.mainLanguageCode
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
            delete this.user;
        },

        "Should get the view parameters": function () {
            var params;

            this.service = new Y.eZ.ContentEditViewService({
                app: this.app,
                content: this.content,
                contentType: this.contentType,
                location: this.location,
                config: this.config,
                owner: this.owner,
                version: this.version,
                request: this.request,
                languageCode: this.languageCode,
                user: this.user,
            });

            params = this.service.getViewParameters();

            Y.Assert.areSame(this.content, params.content, 'The content should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.contentType, params.contentType, 'The contentType should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.config, params.config, 'The config should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.version, params.version, 'The version should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.owner, params.owner, 'The owner should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.location, params.mainLocation, 'The location should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.languageCode, params.languageCode, 'The languageCode should be available in the return value of getViewParameters');
            Y.Assert.areSame(this.user, params.user, 'The user should be available in the return value of getViewParameters');
        },

        "Should return content's main language code in the view parameters": function () {
            var params;

            this.service = new Y.eZ.ContentEditViewService({
                app: this.app,
                content: this.content,
                request: {params: {}},
            });

            params = this.service.getViewParameters();

            Y.Assert.areSame(
                this.mainLanguageCode,
                params.languageCode,
                'The languageCode in the return value of getViewParameters should be the same as content\'s mainLanguageCode'
            );
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
                    } else if ( attr === 'mainLanguageCode' ) {
                        return that.languageCode;
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

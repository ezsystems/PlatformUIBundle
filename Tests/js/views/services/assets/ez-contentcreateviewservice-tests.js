/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateviewservice-tests', function (Y) {
    var loadTest, deprecatedLoadTest, eventTest, changeLanguageTest,
        languageCodeTest,
        Mock = Y.Mock, Assert = Y.Assert;

    loadTest = new Y.Test.Case({
        name: 'eZ Content Create View Service load test',

        setUp: function () {
            var thisTest = this;

            this.contentTypeId = 'song';
            this.names = {'eng-GB': "Song", 'fre-FR': "Chanson"};
            this.fieldDefinitions = {
                "title": {
                    "fieldDefinitionIdentifier": "title",
                    "defaultValue": "Ramble on",
                },
                "artist": {
                    "fieldDefinitionIdentifier": "artist",
                    "defaultValue": "Led Zeppelin",
                }
            };
            this.parentContentMainLanguageCode = 'eng-GB';
            this.parentContentId = 41;
            this.parentLocationId = '42';
            this.viewParentLocation = '/view/parent/';
            this.requestLanguageCode = 'pol-PL';

            this.origLocationModel = Y.eZ.Location;
            this.locationLoadError = false;
            this.loadedLocation = null;
            Y.eZ.Location = Y.Base.create('locationModel', Y.Model, [], {
                load: function (options, callback) {
                    Assert.areSame(
                        thisTest.capi,
                        options.api,
                        "The CAPI instance should be passed to Location load"
                    );
                    thisTest.loadedLocation = this;
                    callback(thisTest.locationLoadError);
                },
            }, {
                ATTRS: {
                    contentInfo: {
                        valueFn: Y.bind(function () {
                            return new Y.Model({mainLanguageCode: this.parentContentMainLanguageCode});
                        }, this),
                    },
                    resources: {
                        value: {Content: this.parentContentId},
                    },
                },
            });

            this.origContentModel = Y.eZ.Content;
            this.contentLoadError = false;
            this.loadedContent = null;
            Y.eZ.Content = Y.Base.create('contentModel', Y.Model, [], {
                load: function (options, callback) {
                    Assert.areSame(
                        thisTest.capi,
                        options.api,
                        "The CAPI instance should be passed to Location load"
                    );
                    thisTest.loadedContent = this;
                    callback(thisTest.contentLoadError);
                },
            });

            this.type = new Mock(new Y.Model({
                names: this.names,
                fieldDefinitions: this.fieldDefinitions,
            }));
            this.app = new Mock(new Y.Base());
            this.app.set('user', {});
            this.defaultLanguageCode = 'eng-GB';
            this.app.set('contentCreationDefaultLanguageCode', this.defaultLanguageCode);

            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Mock.Value.Object],
                run: Y.bind(function (route, params) {
                    Assert.areEqual(
                        this.parentLocationId, params.id,
                        "The parent location id should be passed to routeUri"
                    );
                    Assert.areEqual(
                        this.parentContentMainLanguageCode, params.languageCode,
                        "The parent language code should be passed to routeUri"
                    );
                    return this.viewParentLocation;
                }, this),
            });
            this.request = {
                route: {},
                params: {
                    languageCode: this.requestLanguageCode,
                    contentTypeId: this.contentTypeId,
                    parentLocationId: this.parentLocationId,
                },
            };
            this.capi = {};
            this.service = new Y.eZ.ContentCreateViewService({
                contentType: this.type,
                app: this.app,
                capi: this.capi,
                request: this.request,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            Y.eZ.Location = this.origLocationModel;
            Y.eZ.Content = this.origContentModel;
        },

        _configureModelLoad: function (mock, error) {
            Mock.expect(mock, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capi,
                        options.api,
                        "The CAPI should be provided to the load options"
                    );
                    callback(error);
                }, this),
            });
        },

        _configureContentTypeGetDefaultFields: function (mock, fields) {
            Mock.expect(mock, {
                method: 'getDefaultFields',
                returns: fields
            });
        },

        "Should load the Content Type": function () {
            var callbackCalled = false;

            this._configureModelLoad(this.type);
            this._configureContentTypeGetDefaultFields(this.type, {});
            this.service.load(Y.bind(function () {
                callbackCalled = true;

                Assert.areEqual(
                    this.request.params.contentTypeId,
                    this.service.get('contentType').get('id'),
                    "The content type id should be set from the one in the request"
                );
                Mock.verify(this.type);
            }, this));
            Assert.isTrue(
                callbackCalled,
                "The load callback should have been called"
            );
        },

        "Should handle the Content Type loading error": function () {
            var errorFired = false;

            this._configureModelLoad(this.type, true);
            this._configureContentTypeGetDefaultFields(this.type, {});
            this.service.on('error', function (e) {
                errorFired = true;

            });
            this.service.load(Y.bind(function () {
                Assert.fail('The callback should not be called');
            }, this));

            Assert.isTrue(
                errorFired,
                "The error event should have been fired"
            );
        },

        "Should load the parent Location": function () {
            var callbackCalled = false;

            this._configureModelLoad(this.type);
            this._configureContentTypeGetDefaultFields(this.type, {});
            this.service.load(Y.bind(function () {
                callbackCalled = true;

                Assert.areEqual(
                    this.request.params.parentLocationId,
                    this.service.get('parentLocation').get('id'),
                    "The parent Location should initialized with the request Location id"
                );
                Assert.areSame(
                    this.loadedLocation,
                    this.service.get('parentLocation'),
                    "The parent Location should have been loaded"
                );
            }, this));
            Assert.isTrue(
                callbackCalled,
                "The load callback should have been called"
            );
        },

        "Should load the parent Content": function () {
            var callbackCalled = false;

            this._configureModelLoad(this.type);
            this._configureContentTypeGetDefaultFields(this.type, {});
            this.service.load(Y.bind(function () {
                callbackCalled = true;

                Assert.areEqual(
                    this.parentContentId,
                    this.service.get('parentContent').get('id'),
                    "The parent Content should initialized from the parent Location"
                );
                Assert.areSame(
                    this.loadedContent,
                    this.service.get('parentContent'),
                    "The parent Content should have been loaded"
                );
            }, this));
            Assert.isTrue(
                callbackCalled,
                "The load callback should have been called"
            );

        },

        "Should handle the parent Location loading error": function () {
            var errorFired = false;

            this._configureModelLoad(this.type);
            this.locationLoadError = true;
            this.service.on('error', function (e) {
                errorFired = true;

            });
            this.service.load(Y.bind(function () {
                Assert.fail('The callback should not be called');
            }, this));

            Assert.isTrue(
                errorFired,
                "The error event should have been fired"
            );
        },

        "Should handle the parent Content loading error": function () {
            var errorFired = false;

            this._configureModelLoad(this.type);
            this.contentLoadError = true;
            this.service.on('error', function (e) {
                errorFired = true;

            });
            this.service.load(Y.bind(function () {
                Assert.fail('The callback should not be called');
            }, this));

            Assert.isTrue(
                errorFired,
                "The error event should have been fired"
            );
        },

        _assertLoadResult: function (service, fields) {
            var content = service.get('content'),
                version = service.get('version'),
                that = this;

            Assert.areSame(
                content.get('fields'),
                version.get('fields'),
                "The fields of the version and the content should be the same"
            );
            Assert.areSame(
                fields, content.get('fields'),
                "The fields attribute should be initialized from the Content Type"
            );
            Assert.isTrue(
                content.get('name').indexOf(that.names['eng-GB']) !== -1,
                "The name of the content should contain the name of the type" + content.get('name')
            );
        },

        "Should initialize a new content and a new version": function () {
            var loadCallback = false, that = this,
                originalVersion = this.service.get('version'),
                originalContent = this.service.get('content'),
                fields = {};

            this._configureModelLoad(this.type);
            this._configureContentTypeGetDefaultFields(this.type, fields);
            this.service.load(function (service) {
                loadCallback = true;

                Assert.areNotSame(
                    originalVersion,
                    that.service.get('version'),
                    "A new version object should have been instantiated"
                );
                Assert.areNotSame(
                    originalContent,
                    that.service.get('content'),
                    "A new content object should have been instantiated"
                );
                that._assertLoadResult(service, fields);
            });
            Assert.isTrue(loadCallback, "The load callback should have been called");
        },

        "Should initialize the redirection attributes": function () {
            var mainLocationId = 'good-bad-times',
                mainLanguageCode = 'fre-FR',
                viewMainLocation = '/view/' + mainLocationId + "/" + mainLanguageCode;

            this["Should initialize a new content and a new version"]();
            this.service.get('content').set('mainLanguageCode', mainLanguageCode);
            this.service.get('content').set('resources', {MainLocation: mainLocationId});

            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Mock.Value.Object],
                run: function (route, params) {
                    Assert.areEqual(
                        mainLocationId, params.id,
                        "The main location id should be passed to routeUri"
                    );
                    Assert.areEqual(
                        mainLanguageCode, params.languageCode,
                        "The main language code should be passed to routeUri"
                    );

                    return viewMainLocation;
                }
            });
            Assert.areEqual(
                this.viewParentLocation,
                this.service.get('discardRedirectionUrl'),
                "The discardRedirectionUrl should be the parent location view url"
            );
            Assert.areEqual(
                this.viewParentLocation,
                this.service.get('closeRedirectionUrl'),
                "The closeRedirectionUrl should be the parent location view url"
            );
            Assert.areEqual(
                viewMainLocation,
                this.service.get('publishRedirectionUrl'),
                "THe publishRedirectionUrl should be the main location view url"
            );
        },
    });

    deprecatedLoadTest = new Y.Test.Case({
        name: 'eZ Content Create View Service deprecated load test',

        setUp: function () {
            var that = this;

            this.type = new Mock();
            this.names = {'eng-GB': "Song", 'fre-FR': "Chanson"};
            this.fieldDefinitions = {
                "title": {
                    "fieldDefinitionIdentifier": "title",
                    "defaultValue": "Ramble on",
                },
                "artist": {
                    "fieldDefinitionIdentifier": "artist",
                    "defaultValue": "Led Zeppelin",
                }
            };
            this.app = new Mock();
            this.user = {};
            this.defaultLanguageCode = 'eng-GB';
            Mock.expect(this.app, {
                method: 'get',
                args: [ Mock.Value.String ],
                run: function (attr) {
                    if ( attr === 'user' ) {
                        return that.user;
                    } else if ( attr === 'contentCreationDefaultLanguageCode' ) {
                        return that.defaultLanguageCode;
                    } else {
                        Y.fail("Unexpected app.get(" + attr + ") call");
                    }
                }
            });
            this.parentContentMainLanguageCode = 'eng-GB';
            this.parentLocationId = '42';
            this.parentLocation = new Y.Model({
                id: this.parentLocationId,
                contentInfo: new Y.Model({
                    mainLanguageCode: this.parentContentMainLanguageCode,
                }),
            });
            this.viewParentLocation = '/view/parent/';
            this.parentContent = new Y.Model({
                mainLanguageCode: this.parentContentMainLanguageCode,
            });
            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Mock.Value.Object],
                run: function (route, params) {
                    Assert.areEqual(
                        that.parentLocationId, params.id,
                        "The parent location id should be passed to routeUri"
                    );
                    Assert.areEqual(
                        that.parentContentMainLanguageCode, params.languageCode,
                        "The parent language code should be passed to routeUri"
                    );
                    return that.viewParentLocation;
                }
            });
            this.languageCode = 'pol-PL';
            this.request = {
                params: {languageCode: this.languageCode},
                route: {name: 'createContent'},
            };
            this.capi = {};
            this.service = new Y.eZ.ContentCreateViewService({
                contentType: this.type,
                app: this.app,
                capi: this.capi,
                parentLocation: this.parentLocation,
                parentContent: this.parentContent,
                request: this.request,
            });
        },

        _assertLoadResult: function (service, fields) {
            var content = service.get('content'),
                version = service.get('version'),
                that = this;

            Assert.areSame(
                that.service,
                service,
                "The service should passed in parameter"
            );
            Assert.areSame(
                that.user,
                service.get('owner'),
                "The owner should be set to app's user"
            );
            Assert.areSame(
                content.get('fields'),
                version.get('fields'),
                "The fields of the version and the content should be the same"
            );
            Assert.areSame(
                fields, content.get('fields'),
                "The fields attribute should be initialized from the Content Type"
            );
            Assert.isTrue(
                content.get('name').indexOf(that.names['eng-GB']) !== -1,
                "The name of the content should contain the name of the type" + content.get('name')
            );
        },

        "Should initialize a new content and a new version": function () {
            var loadCallback = false, that = this,
                originalVersion = this.service.get('version'),
                originalContent = this.service.get('content'),
                fields = {};

            Mock.expect(this.type, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'fieldDefinitions' ) {
                        return that.fieldDefinitions;
                    } else if ( attr === 'names' ) {
                        return that.names;
                    } else {
                        Y.fail("Unexpected type.get(" + attr + ") call");
                    }
                }
            });
            Mock.expect(this.type, {
                method: 'getDefaultFields',
                returns: fields,
            });

            this.service.load(function (service) {
                loadCallback = true;

                Assert.areNotSame(
                    originalVersion,
                    that.service.get('version'),
                    "A new version object should have been instantiated"
                );
                Assert.areNotSame(
                    originalContent,
                    that.service.get('content'),
                    "A new content object should have been instantiated"
                );
                that._assertLoadResult(service, fields);
            });
            Assert.isTrue(loadCallback, "The load callback should have been called");
        },

        "Should handle missing fieldDefinitions in the content type": function () {
            var loadCallback = false, that = this,
                fields = {},
                getFieldDefinitionsCalls = 0;

            Mock.expect(this.type, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'fieldDefinitions' ) {
                        if ( getFieldDefinitionsCalls === 0 ) {
                            getFieldDefinitionsCalls++;
                            return undefined;
                        }
                        return that.fieldDefinitions;
                    } else if ( attr === 'names' ) {
                        return that.names;
                    } else {
                        Y.fail("Unexpected type.get(" + attr + ") call");
                    }
                }
            });
            Mock.expect(this.type, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi, options.api,
                        "The CAPI should be passed to the type load method"
                    );
                    callback(false);
                }
            });
            Mock.expect(this.type, {
                method: 'getDefaultFields',
                returns: fields,
            });
            this.service.load(function (service) {
                loadCallback = true;
                that._assertLoadResult(service, fields);
            });
            Assert.isTrue(loadCallback, "The load callback should have been called");
        },

        "Should handle the error while loading the content type": function () {
            var errorFired = false, that = this,
                getFieldDefinitionsCalls = 0;

            Mock.expect(this.type, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'fieldDefinitions' ) {
                        if ( getFieldDefinitionsCalls === 0 ) {
                            getFieldDefinitionsCalls++;
                            return undefined;
                        }
                        return that.fieldDefinitions;
                    } else if ( attr === 'names' ) {
                        return that.names;
                    } else if ( attr === 'id' ) {
                        return 'typeid';
                    } else {
                        Y.fail("Unexpected type.get(" + attr + ") call");
                    }
                }
            });
            Mock.expect(this.type, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi, options.api,
                        "The CAPI should be passed to the type load method"
                    );
                    callback(true);
                }
            });

            this.service.on('error', function () {
                errorFired = true;
            });
            this.service.load();
            Assert.isTrue(errorFired, "The error should have been fired");
        },

        "Should initialize the redirection attributes": function () {
            var content,
                mainLocationId = 'good-bad-times',
                mainLanguageCode = 'fre-FR',
                viewMainLocation = '/view/' + mainLocationId + "/" + mainLanguageCode;

            this["Should initialize a new content and a new version"]();

            content = this.service.get('content');
            content.set('resources', {MainLocation: mainLocationId});
            content.set('mainLanguageCode', mainLanguageCode);

            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Mock.Value.Object],
                run: function (route, params) {
                    Assert.areEqual(
                        mainLocationId, params.id,
                        "The main location id should be passed to routeUri"
                    );
                    Assert.areEqual(
                        mainLanguageCode, params.languageCode,
                        "The main language code should be passed to routeUri"
                    );

                    return viewMainLocation;
                }
            });
            Assert.areEqual(
                this.viewParentLocation,
                this.service.get('discardRedirectionUrl'),
                "The discardRedirectionUrl should be the parent location view url"
            );
            Assert.areEqual(
                this.viewParentLocation,
                this.service.get('closeRedirectionUrl'),
                "The closeRedirectionUrl should be the parent location view url"
            );
            Assert.areEqual(
                viewMainLocation,
                this.service.get('publishRedirectionUrl'),
                "THe publishRedirectionUrl should be the main location view url"
            );
        },
    });

    changeLanguageTest = new Y.Test.Case({
        name: 'eZ Content Create View Service change language test',

        setUp: function () {
            this.app = new Mock(new Y.Base());
            this.version = new Mock();
            this.languageCode = 'pol-PL';
            this.switchedLanguageCode = 'ger-DE';
            this.switchedLanguageName = 'German';
            this.versionId = 'Michael Jackson';
            this.request = {params: {languageCode: this.languageCode}};
            this.capi = {};

            Mock.expect(this.version, {
                method: 'get',
                args: ['versionId'],
                returns: this.versionId
            });
            Mock.expect(this.app, {
                method: 'getLanguageName',
                args: [this.switchedLanguageCode],
                returns: this.switchedLanguageName,
            });
            this.app.set('contentCreationDefaultLanguageCode', this.languageCode);

            this.view = new Y.View();
            this.service = new Y.eZ.ContentCreateViewService({
                app: this.app,
                capi: this.capi,
                request: this.request,
                version: this.version
            });
            this.view.addTarget(this.service);
        },

        tearDown: function () {
            this.service.destroy();
            this.view.destroy();
            delete this.app;
            delete this.service;
            delete this.version;
        },

        "Should fire 'languageSelect' event": function () {
            var languageSelectFired = false,
                that = this;

            this.service.on('languageSelect', function (e) {
                languageSelectFired = true;

                Assert.areSame(
                    e.config.referenceLanguageList[0],
                    that.languageCode,
                    "Currently selected language should be passed as existing translation"
                );

                Assert.isTrue(
                    e.config.translationMode,
                    "List of languages available for select should be the list of new translations"
                );
            });

            this.view.fire('changeLanguage');

            Assert.isTrue(languageSelectFired, "The 'languageSelect' should have been fired");
        },

        _configureVersionMock: function () {
            Mock.expect(this.version, {
                method: 'destroy',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capi, options.api,
                        "The CAPI should be passed to the type load method"
                    );
                    Assert.isTrue(
                        options.remove,
                        "The `remove` option should be set to true"
                    );
                    callback(true);
                }, this)
            });
        },

        _autoExecLanguageSelectedHandler: function () {
            this.service.on('languageSelect', Y.bind(function (e) {
                var config = {selectedLanguageCode: this.switchedLanguageCode};

                e.config.languageSelectedHandler(config);
            }, this));
        },

        "Should destroy the version and set selected languageCode and fields": function () {
            var fields = [{
                    fieldDefinitionIdentifier: 'name',
                    fieldValue: 'Husaria',
                }],
                expectedFields = {
                    'name': {
                        fieldDefinitionIdentifier: 'name',
                        fieldValue: 'Husaria',
                    }
                };

            this._configureVersionMock();
            this._autoExecLanguageSelectedHandler();
            this.view.fire('changeLanguage', {fields: fields});

            Assert.areEqual(
                this.service.get('languageCode'),
                this.switchedLanguageCode,
                'The attribute languageCode should be changed to the selected one'
            );
            Assert.areNotSame(
                this.version, this.service.get('version'),
                "A new version should have been created"
            );
            Assert.areEqual(
                this.service.get('content').get('fields').name.fieldDefinitionIdentifier,
                expectedFields.name.fieldDefinitionIdentifier,
                'The `fields` attribute of content should be updated with value passed to `changeLanguage` event'
            );
            Assert.areEqual(
                this.service.get('content').get('fields').name.fieldValue,
                expectedFields.name.fieldValue,
                'The `fields` attribute of content should be updated with value passed to `changeLanguage` event'
            );
            Assert.areEqual(
                this.service.get('version').get('fields').name.fieldDefinitionIdentifier,
                expectedFields.name.fieldDefinitionIdentifier,
                'The `fields` attribute of version should be updated with value passed to `changeLanguage` event'
            );
            Assert.areEqual(
                this.service.get('version').get('fields').name.fieldValue,
                expectedFields.name.fieldValue,
                'The `fields` attribute of version should be updated with value passed to `changeLanguage` event'
            );
        },

        "Should update the view with the new version and languageCode": function () {
            this._configureVersionMock();
            this._autoExecLanguageSelectedHandler();
            this.view.fire('changeLanguage');

            Assert.areSame(
                this.service.get('version'), this.view.get('version'),
                "The view should receive the new version"
            );
            Assert.areSame(
                this.service.get('languageCode'), this.view.get('languageCode'),
                "The view should receive the new languageCode"
            );
        },

        "Should fire notification about changing the language": function () {
            var notificationFired = false;

            this._configureVersionMock();
            this._autoExecLanguageSelectedHandler();

            this.service.on('notify', Y.bind(function (e) {
                notificationFired = true;

                Assert.isTrue(
                    (e.notification.text.indexOf(this.switchedLanguageName)>=0),
                    'The notification text should contain the language name'
                );
                Assert.areEqual(
                    e.notification.state,
                    'done',
                    'The state should be set to done'
                );
                Assert.areEqual(
                    e.notification.timeout,
                    5,
                    'The timeout should be set to 5'
                );
            }, this));

            this.view.fire('changeLanguage');

            Assert.isTrue(notificationFired, "Should fire notification");
        }
    });

    languageCodeTest = new Y.Test.Case({
        name: 'eZ Content Create View Service language code test',

        setUp: function () {
            this.app = new Y.Base();
            this.app.set('contentCreationDefaultLanguageCode', 'bressan_BRESSE');

            this.service = new Y.eZ.ContentCreateViewService({
                app: this.app,
                request: {params: {}},
            });
        },

        tearDown: function () {
            this.app.destroy();
            this.service.destroy();
            delete this.app;
            delete this.service;
        },

        "Should initialize the languageCode with the app contentCreationDefaultLanguageCode": function () {
            Assert.areEqual(
                this.app.get('contentCreationDefaultLanguageCode'),
                this.service.get('languageCode'),
                "The languageCode should be initialized with the default creation language code"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Create View Service tests");
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(deprecatedLoadTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(changeLanguageTest);
    Y.Test.Runner.add(languageCodeTest);
}, '', {requires: ['test', 'base', 'model', 'ez-contentcreateviewservice']});

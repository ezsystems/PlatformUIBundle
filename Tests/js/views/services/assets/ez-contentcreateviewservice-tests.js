/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateviewservice-tests', function (Y) {
    var loadTest, eventTest, changeLanguageTest,
        Mock = Y.Mock, Assert = Y.Assert;

    loadTest = new Y.Test.Case({
        name: 'eZ Content Create View Service load test',

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
            this.parentLocation = new Mock();
            this.parentLocationId = '42';
            this.viewParentLocation = '/view/parent/';
            Mock.expect(this.parentLocation, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId,
            });
            this.parentContent = new Mock();
            this.parentContentMainLanguageCode = 'eng-GB';
            Mock.expect(this.parentContent, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.parentContentMainLanguageCode,
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
            this.request = {params: {languageCode: this.languageCode}};
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

        _assertLoadResult: function (service) {
            var content = service.get('content'),
                version = service.get('version'),
                fields = content.get('fields'),
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
            Assert.isTrue(
                content.get('name').indexOf(that.names['eng-GB']) !== -1,
                "The name of the content should contain the name of the type" + content.get('name')
            );
            Assert.areEqual(
                Y.Object.keys(that.fieldDefinitions).length,
                Y.Object.keys(fields).length,
                "The content should have as many fields as there are field definitions in the type"
            );
            Y.Object.each(that.fieldDefinitions, function (fieldDef, identifier) {
                Assert.areEqual(
                    identifier,
                    fields[identifier].fieldDefinitionIdentifier,
                    "The field definition identifier should set for each field"
                );
                Assert.areEqual(
                    fieldDef.defaultValue,
                    fields[identifier].fieldValue,
                    "The value of the fields should be the default value of the corresponding field definition"
                );
            });
        },

        "Should initialize a new content and a new version": function () {
            var loadCallback = false, that = this,
                originalVersion = this.service.get('version'),
                originalContent = this.service.get('content');

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
                that._assertLoadResult(service);
            });
            Assert.isTrue(loadCallback, "The load callback should have been called");
        },

        "Should handle missing fieldDefinitions in the content type": function () {
            var loadCallback = false, that = this,
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
            this.service.load(function (service) {
                loadCallback = true;
                that._assertLoadResult(service);
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
            this.app = new Mock();
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

    Y.Test.Runner.setName("eZ Content Create View Service tests");
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(changeLanguageTest);
}, '', {requires: ['test', 'ez-contentcreateviewservice']});

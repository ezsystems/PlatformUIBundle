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
            this.names = {'eng-GB': "Song"};
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
            Mock.expect(this.app, {
                method: 'get',
                args: ['user'],
                returns: this.user,
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
                "The name of the content should contain the name of the type"
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
            this.versionId = 'Michael Jackson';
            this.request = {params: {languageCode: this.languageCode}};
            this.capi = {};

            Mock.expect(this.version, {
                method: 'get',
                args: ['versionId'],
                returns: this.versionId
            });

            this.service = new Y.eZ.ContentCreateViewService({
                app: this.app,
                capi: this.capi,
                request: this.request,
                version: this.version
            });
        },

        tearDown: function () {
            this.service.destroy();
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

            this.service.fire('test:changeLanguage');

            Assert.isTrue(languageSelectFired, "The 'languageSelect' should have been fired");
        },

        "Should remove currentVersion of content and set selected languageCode": function () {
            var that = this;

            Mock.expect(this.version, {
                method: 'destroy',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi, options.api,
                        "The CAPI should be passed to the type load method"
                    );
                    Assert.isTrue(
                        options.remove,
                        "The `remove` option should be set to true"
                    );
                    callback(true);
                }
            });

            this.service.on('languageSelect', function (e) {
                var config = {selectedLanguageCode: that.switchedLanguageCode};

                e.config.languageSelectedHandler(config);
            });

            this.service.fire('test:changeLanguage');

            Assert.areEqual(
                this.service.get('languageCode'),
                this.switchedLanguageCode,
                'The attribute languageCode should be changed to the selected one'
            );
        },

        "Should fire notification about changing the language": function () {
            var that = this,
                notificationFired = false;

            Mock.expect(this.version, {
                method: 'destroy',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    callback(true);
                }
            });

            this.service.on('languageSelect', function (e) {
                var config = {selectedLanguageCode: that.switchedLanguageCode};

                e.config.languageSelectedHandler(config);
            });

            this.service.on('notify', function (e) {
                notificationFired = true;

                Assert.isTrue(
                    (e.notification.text.indexOf(that.switchedLanguageCode)>=0),
                    'The notification text should contain info about the language'
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
            });

            this.service.fire('test:changeLanguage');

            Assert.isTrue(notificationFired, "Should fire notification");
        }
    });

    Y.Test.Runner.setName("eZ Content Create View Service tests");
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(changeLanguageTest);
}, '', {requires: ['test', 'ez-contentcreateviewservice']});

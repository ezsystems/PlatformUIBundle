/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global eZ */
YUI.add('ez-platformuiapp-tests', function (Y) {
    var dispatchConfigTest, getLanguageNameTest,
        setGlobalsTest, appReadyEventTest,
        Assert = Y.Assert;

    dispatchConfigTest = new Y.Test.Case({
        name: "eZ Platform UI App reverse dispatch config tests",

        setUp: function () {
            this.origCAPI = Y.eZ.CAPI;
            this.origSessionAuthAgent = Y.eZ.SessionAuthAgent;
            this.apiRoot = 'apiRoot';
            this.anonymousUserId = 'anonymousUserId';
            this.assetRoot = 'assetRoot';
            this.ckeditorPluginPath = 'ckeditorPluginPath';
            this.root = 'root';
            this.configLanguages = [
                {'languageCode': 'eng-GB', 'name': 'English', 'default': true},
                {'languageCode': 'pol-PL', 'name': 'Polish'}
            ];
            this.systemLanguageList = {
                'eng-GB': {'languageCode': 'eng-GB', 'name': 'English', 'default': true},
                'pol-PL': {'languageCode': 'pol-PL', 'name': 'Polish'}
            };
            this.interfaceLanguages = ['fr_FR', 'fr', 'en'];
            this.defaultLanguageCode = 'eng-GB';
            this.localesMap = {'fr_FR': 'fre-FR'};
            Y.eZ.CAPI = Y.bind(function (apiRoot, sessionAuthAgent) {
                Assert.areEqual(
                    this.apiRoot, apiRoot,
                    "The CAPI constructor should receive a / trimed version of apiRoot"
                );

                this.sessionAuthAgent = sessionAuthAgent;
            }, this);
            Y.eZ.SessionAuthAgent = Y.bind(function (sessionInfo) {
                this.sessionAuthAgentConfig = sessionInfo;
            }, this);
        },

        tearDown: function () {
            Y.eZ.CAPI = this.origCAPI;
            Y.eZ.SessionAuthAgent = this.origSessionAuthAgent;
            this.app.destroy();
        },

        _buildApp: function (localesMap) {
            this.app = new Y.eZ.PlatformUIApp({
                config: {
                    rootInfo: {
                        apiRoot: this.apiRoot + '/',
                        assetRoot: this.assetRoot,
                        ckeditorPluginPath: this.ckeditorPluginPath,
                    },
                    anonymousUserId: this.anonymousUserId,
                    sessionInfo: this.sessionInfo,
                    languages: this.configLanguages,
                    localesMap: localesMap,
                    interfaceLanguages: this.interfaceLanguages,
                },
            });
        },

        "Should configure the CAPI": function () {
            this._buildApp();
            Assert.isInstanceOf(
                Y.eZ.CAPI,
                this.app.get('capi'),
                "The CAPI object should be an instance of eZ.CAPI"
            );
            Assert.isInstanceOf(
                Y.eZ.SessionAuthAgent,
                this.sessionAuthAgent,
                "The session auth agent should be an instance of eZ.SessionAuthAgent"
            );
            Assert.isUndefined(
                this.sessionAuthAgentConfig,
                "The sessionAuthAgent should not have received any sessionInfo"
            );
        },

        "Should configure the SessionAuthAgent with the given sessionInfo": function () {
            this.sessionInfo = {isStarted: true};
            this._buildApp();
            Assert.areSame(
                this.sessionInfo,
                this.sessionAuthAgentConfig,
                "The sessionAuthAgent should have received the sessionInfo"
            );
            Assert.isUndefined(
                this.app.get('config').sessionInfo,
                "The sessionInfo should have been removed from the configuration"
            );
        },

        "Should not configure the SessionAuthAgent": function () {
            this.sessionInfo = {isStarted: false};
            this._buildApp();
            Assert.isUndefined(
                this.sessionAuthAgentConfig,
                "The sessionAuthAgent should not have received any sessionInfo"
            );
            Assert.isUndefined(
                this.app.get('config').sessionInfo,
                "The sessionInfo should have been removed from the configuration"
            );
        },

        "Should configure the `apiRoot`": function () {
            this._buildApp();
            Assert.areSame(
                this.apiRoot + '/',
                this.app.get('apiRoot'),
                "The `apiRoot` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').apiRoot,
                "The apiRoot should have been removed from the configuration"
            );
        },

        "Should configure the `assetRoot`": function () {
            this._buildApp();
            Assert.areSame(
                this.assetRoot,
                this.app.get('assetRoot'),
                "The `assetRoot` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').assetRoot,
                "The assetRoot should have been removed from the configuration"
            );
        },

        "Should configure the `anonymousUserId`": function () {
            this._buildApp();
            Assert.areSame(
                this.anonymousUserId,
                this.app.get('anonymousUserId'),
                "The `anonymousUserId` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').anonymousUserId,
                "The anonymousUserId should have been removed from the configuration"
            );
        },

        "Should configure the `localesMap`": function () {
            this._buildApp(this.localesMap);
            Assert.areSame(
                this.localesMap,
                this.app.get('localesMap'),
                "The `localesMap` attribute should have been set"
            );
        },

        "Should configure the `localesMap` default value": function () {
            this._buildApp(null);

            Assert.isObject(
                this.app.get('localesMap'),
                "The `localesMap` attribute should have been set"
            );
            Assert.areEqual(
                0,
                Y.Object.keys(this.app.get('localesMap')).length,
                "The `localesMap` attribute should have been set with an empty object"
            );
            Assert.areSame(
                this.app.get('localesMap'),
                this.app.get('config').localesMap,
                "The app config should reference the localesMap"
            );
        },

        "Should configure the `systemLanguageList`": function () {
            this._buildApp();

            Assert.areSame(
                JSON.stringify(this.systemLanguageList),
                JSON.stringify(this.app.get('systemLanguageList')),
                "The `systemLanguageList` should have been set"
            );
        },

        "Should configure the `contentCreationDefaultLanguageCode`": function () {
            this._buildApp();

            Assert.areSame(
                this.defaultLanguageCode,
                this.app.get('contentCreationDefaultLanguageCode'),
                "The `contentCreationDefaultLanguageCode` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').languages,
                "The languages should have been removed from the configuration"
            );
        },

        "Should configure the `interfaceLanguages`": function () {
            this._buildApp();

            Assert.areSame(
                this.interfaceLanguages,
                this.app.get('interfaceLanguages'),
                "The `interfaceLanguages` attribute should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').interfaceLanguages,
                "The interfaceLanguages should have been removed from the configuration"
            );

            Assert.areSame(
                this.app.get('interfaceLanguages'), Y.eZ.Translator.preferredLanguages,
                "The translator should be configured with the interfaceLanguages"
            );
        },
    });

    getLanguageNameTest = new Y.Test.Case({
        name: "eZ Platform UI App getLanguageName test",

        setUp: function () {
            this.languageCode = 'eng-GB';
            this.languageName = 'English';
            this.configLanguages = [
                {'languageCode': this.languageCode, 'name': this.languageName},
                {'languageCode': 'pol-PL', 'name': 'Polish'}
            ];

            this.app = new Y.eZ.PlatformUIApp({
                config: {
                    languages: this.configLanguages
                },
            });
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
        },

        "Should return the language name": function () {
            Assert.areEqual(
                this.languageName, this.app.getLanguageName(this.languageCode),
                "The language name should have been returned"
            );
        },

        "Should return the language code": function () {
            var languageCode = 'fre-FR';

            Assert.areEqual(
                languageCode, this.app.getLanguageName(languageCode),
                "The languageCode should have been returned"
            );
        },
    });

    setGlobalsTest = new Y.Test.Case({
        name: "eZ Platform UI App set globals test",

        setUp: function () {
            this.app = new Y.eZ.PlatformUIApp();
        },

        tearDown: function () {
            this.app.destroy();
            delete window.eZ;
        },

        "Should register the app instance under `eZ.YUI`": function () {
            Assert.areSame(
                this.app,
                eZ.YUI.app,
                "The app should be available under `eZ.YUI`"
            );
        },

        "Should register the YUI sandbox under `eZ.YUI`": function () {
            Assert.areSame(
                Y,
                eZ.YUI.Y,
                "The YUI sandbox should be available under `eZ.YUI`"
            );
        }
    });

    appReadyEventTest = new Y.Test.Case({
        name: "eZ Platform UI App `ez:yui-app:ready` event test",

        "Should dispatch the `ez:yui-app:ready` event on the document": function () {
            var app,
                dispatchedEvent = false;

            document.addEventListener('ez:yui-app:ready', function (e) {
                dispatchedEvent = true;

                Assert.areSame(
                    document, e.target,
                    "The event target should be the document"
                );
            });

            app = new Y.eZ.PlatformUIApp();

            Assert.isTrue(
                dispatchedEvent,
                "The `ez:yui-app:ready` event should have been dispatched"
            );
        }
    });

    Y.Test.Runner.setName("eZ Platform UI App tests");
    Y.Test.Runner.add(dispatchConfigTest);
    Y.Test.Runner.add(getLanguageNameTest);
    Y.Test.Runner.add(setGlobalsTest);
    Y.Test.Runner.add(appReadyEventTest);
}, '', {requires: ['test', 'ez-platformuiapp']});

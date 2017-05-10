/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global eZ */
YUI.add('ez-platformuiapp-tests', function (Y) {
    var dispatchConfigTest, getLanguageNameTest,
        setGlobalsTest, appReadyEventTest,
        renderViewTest, renderSideViewTest,
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

    renderViewTest = new Y.Test.Case({
        name: "eZ Platform UI App renderView test",

        setUp: function () {
            this.config = {};
            this.app = new Y.eZ.PlatformUIApp({config: this.config});
        },

        tearDown: function () {
            this.app.destroy();
        },

        "Should configure the view service": function () {
            var params = {},
                capi = {},
                doneCalled = false,
                done;

            this.app._set('capi', capi);
            done = Y.bind(function (err, service, view) {
                doneCalled = true;
                Assert.isFalse(
                    err,
                    "The error parameter should be false"
                );
                Assert.isInstanceOf(
                    Y.eZ.ViewService, service,
                    "The service should have been instantiated"
                );
                Assert.areSame(
                    this.app, service.get('app'),
                    "The service should have received the app"
                );
                Assert.areSame(
                    capi, service.get('capi'),
                    "The service should have received the CAPI"
                );
                Assert.areSame(
                    params, service.get('request').params,
                    "The service should have received a request containing the params"
                );
                Assert.areSame(
                    this.config, service.get('config'),
                    "The service should have received the config"
                );
            }, this);

            this.app.renderView(Y.View, Y.eZ.ViewService, params, done);

            Assert.isTrue(
                doneCalled,
                "The renderView callback should have been called"
            );
        },

        "Should add the app as a bubble target of the view service": function () {
            var done,
                bubble = false;

            done = function (err, service, view) {
                service.fire('whatever');
            };

            this.app.on('*:whatever', function () {
                bubble = true;
            });
            this.app.renderView(Y.View, Y.eZ.ViewService, {}, done);

            Assert.isTrue(
                bubble,
                "The app should be a bubble target of the view service"
            );
        },

        "Should pass the plugins to the view service": function () {
            var done,
                pluginNS = 'myPlugin',
                Plugin = Y.Base.create('myPlugin', Y.eZ.Plugin.ViewServiceBase, [], {}, {NS: pluginNS});

            done = function (err, service, view) {
                Assert.isInstanceOf(
                    Plugin,
                    service[pluginNS],
                    "Registered plugins should have been instantiated"
                );
            };

            Y.eZ.PluginRegistry.registerPlugin(Plugin, [Y.eZ.ViewService.NAME]);
            this.app.renderView(Y.View, Y.eZ.ViewService, {}, done);
            Y.eZ.PluginRegistry.unregisterPlugin(pluginNS);
        },

        "Should handle loading error": function () {
            var done,
                doneCalled = false,
                errorMsg = 'error message',
                Service = Y.Base.create('errorService', Y.eZ.ViewService, [], {
                    _load: function () {
                        this._error(errorMsg);
                    },
                });

            done = function (err, service, view) {
                doneCalled = true;
                Assert.isInstanceOf(
                    Error, err,
                    "The error parameter should be an Error"
                );
                Assert.areEqual(
                    errorMsg, err.message,
                    "The error message should be set with the loading error"
                );
                Assert.isUndefined(service, "The service should be undefined");
                Assert.isUndefined(view, "The view should be undefined");
            };

            this.app.renderView(Y.View, Service, {}, done);
            Assert.isTrue(doneCalled, "The callback should have been called");
        },

        "Should render the view": function () {
            var done,
                viewParameters = {},
                rendered = false,
                Service = Y.Base.create('errorService', Y.eZ.ViewService, [], {
                    getViewParameters: function () {
                        return viewParameters;
                    }
                }),
                View = Y.Base.create('myView', Y.View, [], {
                    initializer: function (config) {
                        Assert.areSame(
                            viewParameters, config,
                            "The view should have received the view parameters"
                        );
                    },

                    render: function () {
                        rendered = true;
                        return this;
                    },
                });

            done = function (err, service, view) {
                Assert.isInstanceOf(
                    View, view,
                    "The view should have been instantiated"
                );
            };

            this.app.renderView(View, Service, {}, done);
            Assert.isTrue(rendered, "The view should have been rendered");
        },

        "Should add the view service as a bubble target of the view": function () {
            var done,
                bubble = false;

            done = function (err, service, view) {
                view.fire('whatever');
            };

            this.app.on('*:whatever', function () {
                bubble = true;
            });
            this.app.renderView(Y.View, Y.eZ.ViewService, {}, done);

            Assert.isTrue(
                bubble,
                "The view service and then the app should be a bubble target of the view"
            );
        },
    });

    renderSideViewTest = new Y.Test.Case({
        name: "eZ Platform UI App renderSideView test",

        setUp: function () {
            this.config = {};
            this.app = new Y.eZ.PlatformUIApp({config: this.config});
        },

        tearDown: function () {
            this.app.destroy();
        },

        "Should configure the side view service": function () {
            var params = {},
                capi = {},
                doneCalled = false,
                done;

            this.app._set('capi', capi);
            done = Y.bind(function (err, service, view) {
                doneCalled = true;
                Assert.isFalse(
                    err,
                    "The error parameter should be false"
                );
                Assert.isInstanceOf(
                    Y.eZ.ViewService, service,
                    "The service should have been instantiated"
                );
                Assert.areSame(
                    this.app, service.get('app'),
                    "The service should have received the app"
                );
                Assert.areSame(
                    capi, service.get('capi'),
                    "The service should have received the CAPI"
                );
                Assert.areSame(
                    params, service.get('parameters'),
                    "The service should have received the parameters"
                );
                Assert.areSame(
                    this.config, service.get('config'),
                    "The service should have received the config"
                );
            }, this);

            this.app.renderSideView(Y.View, Y.eZ.ViewService, params, done);

            Assert.isTrue(
                doneCalled,
                "The renderSideView callback should have been called"
            );
        },

        "Should add the app as a bubble target of the side view service": function () {
            var done,
                bubble = false;

            done = function (err, service, view) {
                service.fire('whatever');
            };

            this.app.on('*:whatever', function () {
                bubble = true;
            });
            this.app.renderSideView(Y.View, Y.eZ.ViewService, {}, done);

            Assert.isTrue(
                bubble,
                "The app should be a bubble target of the view service"
            );
        },

        "Should pass the plugins to the side view service": function () {
            var done,
                pluginNS = 'myPlugin',
                Plugin = Y.Base.create('myPlugin', Y.eZ.Plugin.ViewServiceBase, [], {}, {NS: pluginNS});

            done = function (err, service, view) {
                Assert.isInstanceOf(
                    Plugin,
                    service[pluginNS],
                    "Registered plugins should have been instantiated"
                );
            };

            Y.eZ.PluginRegistry.registerPlugin(Plugin, [Y.eZ.ViewService.NAME]);
            this.app.renderSideView(Y.View, Y.eZ.ViewService, {}, done);
            Y.eZ.PluginRegistry.unregisterPlugin(pluginNS);
        },

        "Should handle loading error": function () {
            var done,
                doneCalled = false,
                errorMsg = 'error message',
                Service = Y.Base.create('errorService', Y.eZ.ViewService, [], {
                    _load: function () {
                        this._error(errorMsg);
                    },
                });

            done = function (err, service, view) {
                doneCalled = true;
                Assert.isInstanceOf(
                    Error, err,
                    "The error parameter should be an Error"
                );
                Assert.areEqual(
                    errorMsg, err.message,
                    "The error message should be set with the loading error"
                );
                Assert.isUndefined(service, "The service should be undefined");
                Assert.isUndefined(view, "The view should be undefined");
            };

            this.app.renderSideView(Y.View, Service, {}, done);
            Assert.isTrue(doneCalled, "The callback should have been called");
        },

        "Should render the side view": function () {
            var done,
                viewParameters = {},
                rendered = false,
                Service = Y.Base.create('errorService', Y.eZ.ViewService, [], {
                    getViewParameters: function () {
                        return viewParameters;
                    }
                }),
                View = Y.Base.create('myView', Y.View, [], {
                    setAttrs: function (config) {
                        Assert.areSame(
                            viewParameters, config,
                            "The view should have received the view parameters"
                        );
                    },

                    render: function () {
                        rendered = true;
                        return this;
                    },
                });

            done = function (err, service, view) {
                Assert.isInstanceOf(
                    View, view,
                    "The view should have been instantiated"
                );
            };

            this.app.renderSideView(View, Service, {}, done);
            Assert.isTrue(rendered, "The view should have been rendered");
        },

        "Should add the side view service as a bubble target of the side view": function () {
            var done,
                bubble = false;

            done = function (err, service, view) {
                view.fire('whatever');
            };

            this.app.on('*:whatever', function () {
                bubble = true;
            });
            this.app.renderSideView(Y.View, Y.eZ.ViewService, {}, done);

            Assert.isTrue(
                bubble,
                "The view service and then the app should be a bubble target of the view"
            );
        },
    });

    Y.Test.Runner.setName("eZ Platform UI App tests");
    Y.Test.Runner.add(dispatchConfigTest);
    Y.Test.Runner.add(getLanguageNameTest);
    Y.Test.Runner.add(setGlobalsTest);
    Y.Test.Runner.add(appReadyEventTest);
    Y.Test.Runner.add(renderViewTest);
    Y.Test.Runner.add(renderSideViewTest);
}, '', {requires: ['test', 'ez-platformuiapp', 'ez-viewservice', 'ez-viewservicebaseplugin']});

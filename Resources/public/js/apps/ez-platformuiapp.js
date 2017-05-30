/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-platformuiapp', function (Y) {
    "use strict";
    /**
     * Provides the PlatformUI Application class
     *
     * @module ez-platformuiapp
     */

    Y.namespace('eZ');

    /**
     * PlatformUI Application
     *
     * @namespace eZ
     * @class PlatformUIApp
     * @constructor
     * @extends App
     */
    Y.eZ.PlatformUIApp = Y.Base.create('platformuiApp', Y.App, [Y.eZ.TranslateProperty], {
        /**
         * Initializes the application.
         *
         * @method initializer
         */
        initializer: function () {
            this._dispatchConfig();
            Y.eZ.Translator.setPreferredLanguages(this.get('interfaceLanguages'));

            this._setGlobals();

            this.on('initializedChange', this._fireAppReadyEvent, this);
        },

        /**
         * Instantiates and renders a view with the given `ViewConstructor` and
         * `ServiceConstructor`. It does pretty much the same thing as what
         * happened when navigating in the app but it skips the routing phase.
         * When done, the `done` callback is called with the view and view
         * service instances as parameters.
         *
         * @method renderView
         * @param {Function} ViewConstructor
         * @param {Function} ServiceConstructor
         * @param {Object} requestParams the request parameters expected by the
         * view service.
         * @param {Function} done
         * @param {false|Error} done.error
         * @param {eZ.ViewService} done.viewService
         * @param {eZ.View} done.view
         */
        renderView: function (ViewConstructor, ServiceConstructor, requestParams, done) {
            var req, res,
                view, viewService;

            req = this._getRequest('renderComponent');
            req.params = requestParams;
            res = this._getResponse(req);

            viewService = new ServiceConstructor({
                app: this,
                capi: this.get('capi'),
                request: req,
                response: res,
                plugins: Y.eZ.PluginRegistry.getPlugins(ServiceConstructor.NAME),
                config: this.get('config'),
                bubbleTargets: this,
            });

            viewService.once('error', function (e) {
                done(new Error(e.message));
            });
            viewService.load(function () {
                view = new ViewConstructor(viewService.getViewParameters());
                view.render();
                view.addTarget(viewService);
                done(false, viewService, view);
            });
        },

        /**
         * Instantiates and renders a side view with the given `ViewConstructor` and
         * `ServiceConstructor`. It does pretty much the same thing as what
         * happened when the app is creating a side view.
         *
         * @method renderSideView
         * @param {Function} ViewConstructor
         * @param {Function} ServiceConstructor
         * @param {Object} params the parameters expected by the side view
         * service
         * @param {Function} done
         * @param {false|Error} done.error
         * @param {eZ.ViewService} done.viewService
         * @param {eZ.View} done.view
         */
        renderSideView: function (ViewConstructor, ServiceConstructor, params, done) {
            var req, res,
                view, viewService;

            req = this._getRequest('renderComponent');
            res = this._getResponse(req);

            viewService = new ServiceConstructor({
                app: this,
                capi: this.get('capi'),
                plugins: Y.eZ.PluginRegistry.getPlugins(ServiceConstructor.NAME),
                config: this.get('config'),
                bubbleTargets: this,
            });

            viewService.once('error', function (e) {
                done(new Error(e.message));
            });

            viewService.setAttrs({
                'parameters': params,
                'request': req,
                'response': res,
            });
            view = new ViewConstructor({bubbleTargets: viewService});
            viewService.load(function () {
                view.setAttrs(viewService.getViewParameters());
                view.render();
                view.addTarget(viewService);
                done(false, viewService, view);
            });
        },

        /**
         * Registers the `Y` sandbox object and the app instance in the global
         * `eZ.YUI` namespace.
         *
         * @method _setGlobals
         * @private
         */
        _setGlobals: function () {
            window.eZ = window.eZ || {};
            window.eZ.YUI = {
                Y: Y,
                app: this,
            };
        },

        /**
         * Fires the custom `ez:yui-app:ready` **DOM** event. It is dispatched
         * from the `document` object.
         *
         * @method _fireAppReadyEvent
         * @private
         */
        _fireAppReadyEvent: function () {
            var evt = new CustomEvent('ez:yui-app:ready');

            document.dispatchEvent(evt);
        },

        /**
         * Dispatches the `config` attribute value so that the app is configured
         * accordingly. The values consumed by the app are removed from the
         * configuration.
         *
         * @method _dispatchConfig
         * @protected
         */
        _dispatchConfig: function () {
            var config = this.get('config'),
                systemLanguageList = {},
                defaultLanguageCode;

            if ( !config ) {
                return;
            }
            Y.Object.each(config.rootInfo, function (value, attrName) {
                if ( this.attrAdded(attrName) ) {
                    this._set(attrName, value);
                    delete config.rootInfo[attrName];
                }
            }, this);
            if ( config.anonymousUserId ) {
                this._set('anonymousUserId', config.anonymousUserId);
                delete config.anonymousUserId;
            }
            config.localesMap = config.localesMap || {};
            this._set('localesMap', config.localesMap);

            this._set('capi', new Y.eZ.CAPI(
                this.get('apiRoot').replace(/\/{1,}$/, ''),
                new Y.eZ.SessionAuthAgent(
                    (config.sessionInfo && config.sessionInfo.isStarted) ? config.sessionInfo : undefined
                )
            ));
            delete config.sessionInfo;

            if ( config.languages ) {
                Y.Array.each(config.languages, function (language) {
                    systemLanguageList[language.languageCode] = language;
                    if ( language.default ) {
                        defaultLanguageCode = language.languageCode;
                    }
                });
                this._set('systemLanguageList', systemLanguageList);
                this._set('contentCreationDefaultLanguageCode', defaultLanguageCode);
                delete config.languages;
            }
            if ( config.interfaceLanguages ) {
                this._set('interfaceLanguages', config.interfaceLanguages);
                delete config.interfaceLanguages;
            }
        },

        /**
         * Returns the language name of the language with the given
         * `languageCode`. If no language is found with this code, the language
         * code is returned.
         *
         * @method getLanguageName
         * @since 1.1
         * @param {String} languageCode
         * @return {String}
         */
        getLanguageName: function (languageCode) {
            var systemLanguageList = this.get('systemLanguageList');

            if ( systemLanguageList[languageCode] ) {
                return systemLanguageList[languageCode].name;
            }
            return languageCode;
        },
    }, {
        ATTRS: {
            /**
             * The application configuration. It is dispatched to the others
             * application attributes/properties at build time.
             *
             * @attribute config
             * @type {Object|undefined}
             * @writeOnce
             */
            config: {
                writeOnce: 'initOnly',
            },

            /**
             * The base URI to build the URI of the ajax request
             *
             * @attribute apiRoot
             * @default "/"
             * @type String
             * @readOnly
             */
            apiRoot: {
                readOnly: true,
                value: "/"
            },

            /**
             * The root directory where to find the assets.
             *
             * @attribute assetRoot
             * @default "/"
             * @type String
             * @readOnly
             */
            assetRoot: {
                readOnly: true,
                value: "/"
            },

            /**
             * eZ Platform REST client
             *
             * @attribute capi
             * @default null
             * @type {eZ.CAPI}
             * @readOnly
             * @required
             */
            capi: {
                readOnly: true,
                value: null
            },

            /**
             * Stores the REST id of the configured anonymous user
             *
             * @attribute anonymousUserId
             * @type {String}
             * @readOnly
             */
            anonymousUserId: {
                readOnly: true,
                value: "/api/ezp/v2/user/users/10",
            },

            /**
             * System language list provided with config. The list is hash
             * containing language objects and is indexed by languageCode.
             *
             * @attribute systemLanguageList
             * @default {}
             * @type {Object}
             * @readOnly
             */
            systemLanguageList: {
                readOnly: true,
                value: {}
            },

            /**
             * Default language code, as defined by the current siteaccess language config.
             *
             * @attribute contentCreationDefaultLanguageCode
             * @default "eng-GB"
             * @type {String}
             * @readOnly
             */
            contentCreationDefaultLanguageCode: {
                readOnly: true,
                value: "eng-GB"
            },

            /**
             * Holds the Locales conversion map between eZ Locale codes and
             * POSIX ones. See locale.yml
             *
             * @attribute localesMap
             * @type {Object}
             * @readOnly
             * @default {}
             */
            localesMap: {
                readOnly: true,
                value: {},
            },

            /**
             * List of preferred languages in which the interface should be
             * translated.
             *
             * @attribute interfaceLanguages
             * @readOnly
             * @default ['en']
             * @type {Array}
             */
            interfaceLanguages: {
                readOnly: true,
                value: ['en'],
            },
        }
    });
});

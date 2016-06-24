/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerlanguagehelpersplugin', function (Y) {
    "use strict";
    /**
     * Provides the register language helpers plugin
     *
     * @module ez-registerhelpersplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Register Language Helpers plugin for the Platform UI application. It registers
     * handlebars helper allowing to get language name based on language code:
     *
     *   * `language_name` is for returning language name based on given language code. It takes the
     *   language code as an argument
     *
     * @namespace eZ.Plugin
     * @class RegisterLanguageHelpers
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.RegisterLanguageHelpers = Y.Base.create('registerLanguageHelpersPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            this._registerLanguageName();
            this._registerTranslatedProperty();
        },

        /**
         * Registers the `language_name` handlebars helper. The `language_name` helper expects the
         * argument to be a language code. It will return language name from the language object
         * in app's systemLanguageList. If language with given language code won't be found in
         * systemLanguageList then language code is returned.
         *
         * @method _registerLanguageName
         * @protected
         */
        _registerLanguageName: function () {
            var app = this.get('host');

            Y.Handlebars.registerHelper('language_name', Y.bind(app.getLanguageName, app));
        },

        /**
         * Registers the `translate_property` handlebars helper. The
         * `translate_property` helper expects a hash indexed by eZ Locale
         * ('eng-GB', 'fre-FR', ...) and will try to pick the best one according
         * to the browser languages configuration.
         *
         * @method _registerTranslatedProperty
         * @protected
         */
        _registerTranslatedProperty: function () {
            Y.Handlebars.registerHelper('translate_property', Y.bind(this._translateProperty, this));
        },

        /**
         * Find the correct property translation according to browser's
         * languages configuration. It basically iterates over the browser's
         * language to find a matching translation, if none matches, it takes
         * the first one.
         *
         * @private
         * @method _translateProperty
         * @param {Object} property the property to translate as a hash indexed
         * by eZ Locale for example: ('eng-GB': 'potatoes', 'fre-FR': 'pomme de terre'}
         * @return {String}
         */
        _translateProperty: function (property) {
            var navigatorLocales = this._getNavigatorPosixLocales(),
                localesMap = this._getLocalesMap(property),
                matchingPosixLocale;

            Y.Array.some(navigatorLocales, function (posixLocale) {
                var prefixLanguage;

                if ( localesMap[posixLocale] ) {
                    matchingPosixLocale = posixLocale;
                    return true;
                }
                if ( posixLocale.indexOf('_') !== -1 ) {
                    prefixLanguage = posixLocale.split('_')[0] + '_';
                } else {
                    prefixLanguage = posixLocale + '_';
                }
                matchingPosixLocale = this._findPosixLocaleByPrefix(
                    prefixLanguage, localesMap
                );
                return !!matchingPosixLocale;
            }, this);

            if ( matchingPosixLocale ) {
                return property[localesMap[matchingPosixLocale]];
            }
            return property[Object.keys(property)[0]];
        },

        /**
         * Returns the POSIX Locale matching the prefix
         *
         * @private
         * @method _findPosixLocaleByPrefix
         * @param {String} prefix e.g. 'fr'
         * @param {Object} localesMap the locales map for the property
         * @param {String} e.g. 'fr_fr'
         */
        _findPosixLocaleByPrefix: function (prefix, localesMap) {
            return Y.Array.find(Object.keys(localesMap), function (posixLocale) {
                return posixLocale.indexOf(prefix) === 0;
            });
        },

        /**
         * Returns an array containing the normalized POSIX locale configured in
         * the browser.
         *
         * @private
         * @method _getNavigatorPosixLocales
         * @return {Array} e.g. ['fr_fr', 'en_en', 'en']
         */
        _getNavigatorPosixLocales: function () {
            var navigator = this.get('navigator'),
                languages = navigator.languages || [navigator.language];

            return languages.map(function (language) {
                return this._normalizeNavigatorLanguage(language);
            }, this);
        },

        /**
         * Returns an array containing the existing Locale in which the property
         * exists.
         *
         * @private
         * @method _getExistingPropertyLanguages
         * @param {Object} property
         * @param {Array} e.g. ['fre-FR', 'eng-GB']
         */
        _getExistingPropertyLanguages: function (property) {
            return Object.keys(property);
        },

        /**
         * Creates a locales map for the languages in which the property exists.
         *
         * @private
         * @method _getLocalesMap
         * @param {Object} property
         * @return {Object} an Object containing the locale indexed by
         * normalized POSIX locales
         */
        _getLocalesMap: function (property) {
            var fullLocalesMap = this.get('host').get('localesMap'),
                localesMap = {},
                existingLocales = this._getExistingPropertyLanguages(property);

            Y.Object.each(fullLocalesMap, function (locale, posixLocale) {
                if ( existingLocales.indexOf(locale) !== -1 ) {
                    localesMap[this._normalizeNavigatorLanguage(posixLocale)] = locale;
                }
            }, this);
            return localesMap;
        },

        /**
         * Normalizes browser's language
         *
         * @private
         * @method _normalizeNavigatorLanguage
         * @param {String} lang the language e.g. 'fr-FR'
         * @return {String}
         */
        _normalizeNavigatorLanguage: function (lang) {
            return lang.toLowerCase().replace('-', '_');
        },
    }, {
        NS: 'registerLanguageHelpers',

        ATTRS: {
            /**
             * Holds a reference to the navigator object.
             *
             * @attribute navigator
             * @type {Navigator}
             * @readOnly
             */
            navigator: {
                value: Y.config.win.navigator,
                cloneDefaultValue: false,
                readOnly: true,
            },
        },
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.RegisterLanguageHelpers, ['platformuiApp']
    );
});

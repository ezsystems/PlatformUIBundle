/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-translateproperty', function (Y) {
    "use strict";
    /**
     * Provides the translate property plugin
     *
     * @module ez-translateproperty
     */
    Y.namespace('eZ');

    Y.eZ.TranslateProperty = Y.Base.create('translateProperty', Y.Base, [], {
        /**
         * Find the correct property translation according to browser's
         * languages configuration. It basically iterates over the browser's
         * languages to find a matching translation, if none matches, it takes
         * the first one.
         *
         * @method translateProperty
         * @param {Object} fullLocalesMap the Locales map between POSIX Locales
         * (e.g.) fr_FR and Locales used in eZ Platform (e.g. fre-FR)
         * @param {Object} property the property to translate as a hash indexed
         * by eZ Locale for example:
         *
         *   {'eng-GB': 'potatoes', 'fre-FR': 'pomme de terre'}
         *
         * @return {String}
         */
        translateProperty: function (fullLocalesMap, property) {
            var navigatorLocales = this._getNavigatorPosixLocales(),
                localesMap = this._getLocalesMap(fullLocalesMap, property),
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
         * @param {Object} fullLocalesMap
         * @param {Object} property
         * @return {Object} an Object containing the locale indexed by
         * normalized POSIX locales
         */
        _getLocalesMap: function (fullLocalesMap, property) {
            var localesMap = {},
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
        }
    });
});

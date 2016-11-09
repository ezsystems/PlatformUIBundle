/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global Translator */
YUI.add('ez-translator', function (Y) {
    "use strict";

    Y.namespace('eZ');

    var preferredLanguages = [];

    /**
     * Translator *static* object.
     *
     * @class eZ.Translator
     */
    Y.eZ.Translator = {};

    /**
     * Sets the preferred languages to use to translate the strings.
     *
     * @method setPreferredLanguages
     * @static
     * @param {Array} languages array of language codes
     */
    Y.eZ.Translator.setPreferredLanguages = function (languages) {
        Translator.fallback = ''; // disable the Translator fallback strategy
        preferredLanguages = languages;
    };

    /**
     * Translates the given key from the domain with the given parameters.
     *
     * ** /!\ Use the shortcut `Y.eZ.trans` so that translation keys are
     * recognized and dumped by `translation:update`.**
     *
     * @method trans
     * @param String key message to be translated
     * @param Object parameters to be applied to the message
     * @param String domain where the translation can be found
     * @static
     * @protected
     */
    Y.eZ.Translator.trans = function (key, parameters, domain) {
        var trans = key,
            languageCount = preferredLanguages.length,
            i = 0;

        while ( i < languageCount && trans === key ) {
            trans = Translator.trans(key, parameters, domain, preferredLanguages[i]);
            i++;
        }
        return trans;
    };

    /**
     * Shortcut to `Y.eZ.Translator.trans`
     *
     * @param String key message to be translated
     * @param Object parameters to be applied to the message
     * @param String domain where the translation can be found
     * @namespace eZ
     * @method trans
     * @static
     */
    Y.eZ.trans = Y.eZ.Translator.trans;
});

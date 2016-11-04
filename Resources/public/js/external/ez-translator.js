/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global Translator */
YUI.add('ez-translator', function (Y) {
    "use strict";

    Y.namespace('eZ');

    /**
     * eZ JavaScript Translator
     * https://github.com/willdurand/BazingaJsTranslationBundle
     *
     * @namespace eZ
     * @class Translator
     * @constructor
     */
    Y.eZ.Translator = Translator;

    /**
     * Shortcut to the Y.eZ.Translator.trans method
     *
     * @namespace eZ
     * @method Y.eZ.trans
     * @param String key message to be translated
     * @param Object parameters to be applied to the message
     * @param String domain where the translation can be found
     */
    Y.eZ.trans = Y.bind(Translator.trans, Translator);
});

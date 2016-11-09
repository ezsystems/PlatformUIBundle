YUI.add('ez-translator', function (Y) {
    "use strict";

    Y.namespace('eZ');

    Y.eZ.trans = function (str) {
        return str;
    };

    Y.eZ.Translator = {};
    Y.eZ.Translator.trans = Y.eZ.trans;
    Y.eZ.Translator.setPreferredLanguages = function (languages) {
        Y.eZ.Translator.preferredLanguages = languages;
    };
});

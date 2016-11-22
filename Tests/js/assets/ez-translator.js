YUI.add('ez-translator', function (Y) {
    "use strict";

    Y.namespace('eZ');

    Y.eZ.trans = function (id, params, domain) {
        var str = id;

        Y.Object.each(params, function (key, val) {
            str += ' param-' + key + '=' + val;
        });
        str += ' domain=' + domain;
        return str;
    };

    Y.eZ.Translator = {};
    Y.eZ.Translator.trans = Y.eZ.trans;
    Y.eZ.Translator.setPreferredLanguages = function (languages) {
        Y.eZ.Translator.preferredLanguages = languages;
    };
});

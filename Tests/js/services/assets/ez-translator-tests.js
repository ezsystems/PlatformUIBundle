/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-translator-tests', function (Y) {
    var transTest,
        Assert = Y.Assert, Mock = Y.Mock;

    transTest = new Y.Test.Case({
        name: "eZ Translator trans tests",

        setUp: function () {
            this.translator = new Mock();
            window.Translator = this.translator;
        },

        tearDown: function () {
            delete window.Translator;
        },

        "Should return the key if no language is set as preferred": function () {
            var key = 'communication.breakdown';

            Assert.areEqual(
                key, Y.eZ.trans(key, {}, 'led zeppelin'),
                "The key should be returned"
            );
        },

        "Should return the key if no translation is found": function () {
            var key = 'communication.breakdown',
                parameters = {},
                domain = 'led zeppelin',
                lang = ['fr', 'en'];

            Y.eZ.Translator.setPreferredLanguages(lang);
            Mock.expect(this.translator, {
                method: 'trans',
                args: [key, parameters, domain, Mock.Value.String],
                run: function (key, parameters, domain, language) {
                    Assert.isTrue(
                        lang.indexOf(language) !== -1,
                        "The lang should be passed to Translator.trans"
                    );
                    return key;
                },
            });
            Assert.areEqual(
                key, Y.eZ.trans(key, parameters, domain),
                "The key should be returned"
            );
            Assert.areEqual(
                "", this.translator.fallback,
                "The Translator fallback should be disabled"
            );
        },

        "Should return the first available translation": function () {
            var key = 'rock.and.roll',
                translated = 'Rock And Roll',
                parameters = {},
                domain = 'led zeppelin',
                lang = ['it', 'fr', 'en'];

            Y.eZ.Translator.setPreferredLanguages(lang);
            Mock.expect(this.translator, {
                method: 'trans',
                args: [key, parameters, domain, Mock.Value.String],
                run: function (key, parameters, domain, language) {
                    if ( language === 'fr' ) {
                        return translated;
                    }
                    return key;
                },
            });
            Assert.areEqual(
                translated, Y.eZ.trans(key, parameters, domain),
                "The key should be translated with the first available translation"
            );
        },
    });

    Y.Test.Runner.setName("eZ Translator module tests");
    Y.Test.Runner.add(transTest);

}, '', {requires: ['test', 'ez-translator']});

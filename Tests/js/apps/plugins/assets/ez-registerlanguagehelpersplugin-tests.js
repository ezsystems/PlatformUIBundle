/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerlanguagehelpersplugin-tests', function (Y) {
    var registerHelpersTest, languageNameTest, translatePropertyTest, registerTest,
        navigatorAttrTest,
        Assert = Y.Assert, Mock = Y.Mock;

    registerHelpersTest = new Y.Test.Case({
        name: "eZ Register Language Helpers register helpers test",

        setUp: function () {
            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: {}
            });
        },

        _helperRegistered: function (name) {
            Assert.isFunction(
                Y.Handlebars.helpers[name],
                "The helper '" + name + "' should be registered"
            );
        },

        "Should register the 'language_name' helper": function () {
            this._helperRegistered('language_name');
        },

        "Should register the `translate_property` helper": function () {
            this._helperRegistered('translate_property');
        },
    });

    languageNameTest = new Y.Test.Case({
        name: "eZ Register Language Helpers language_name test",

        setUp: function () {
            this.languageCode = 'pol-PL';
            this.app = new Mock();

            Mock.expect(this.app, {
                method: 'getLanguageName',
                args: [this.languageCode],
            });

            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        "Should call the app getLanguageName method": function () {
            /*jshint camelcase: false */
            Y.Handlebars.helpers.language_name(this.languageCode);
            /*jshint camelcase: true */

            Mock.verify(this.app);
        }
    });

    navigatorAttrTest = new Y.Test.Case({
        name: "eZ Register Language Helpers navigator attribute test",

        setUp: function () {
            this.app = new Y.Base();

            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        "Should return the navigator object": function () {
            Assert.areSame(
                Y.config.win.navigator,
                this.plugin.get('navigator'),
                "The navigator attribute should hold the navigator object"
            );
        },
    });

    translatePropertyTest = new Y.Test.Case({
        name: "eZ Register Language Helpers translate_property test",

        setUp: function () {
            this.localesMap = {
                'fr_FR': 'fre-FR',
                'fr_CA': 'fre-CA',
                'en_GB': 'eng-GB',
                'nn_NO': 'nor-NO',
                'no_NO': 'nor-NO',
            };
            this.app = new Y.Base();
            this.app.set('localesMap', this.localesMap);

            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app
            });
            this.property = {
                'eng-GB': 'potatoes',
                'fre-FR': 'pomme de terres',
                'nor-NO': 'potet',
            };
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        _testTranslateProperty: function (navigator, expected) {
            var translated;

            this.plugin._set('navigator', navigator);
            /*jshint camelcase: false */
            translated = Y.Handlebars.helpers.translate_property(this.property);
            /*jshint camelcase: true */

            Assert.areEqual(
                expected,
                translated,
                "The property should have been translated to " + expected
            );
        },

        "Unsupported navigator.languages direct posix locale match": function () {
            var navigator = {language: 'fr-FR'};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },

        "direct posix locale match": function () {
            var navigator = {languages: ['fr-FR', 'en-GB']};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },

        "Unsupported navigator.languages partial posix locale match": function () {
            var navigator = {language: 'fr-BE'};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },

        "partial posix locale match": function () {
            var navigator = {languages: ['fr-BE', 'en-GB']};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },

        "Unsupported navigator.languages prefix posix locale match": function () {
            var navigator = {language: 'fr'};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },

        "prefix posix locale match": function () {
            var navigator = {languages: ['fr', 'en-GB']};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },

        "Unsupported navigator.languages no posix locale match": function () {
            var navigator = {language: 'bressan_BRESSE'};

            this._testTranslateProperty(navigator, this.property['eng-GB']);
        },

        "no posix locale match": function () {
            var navigator = {languages: ['bressan_BRESSE', 'patois_BRESSE']};

            this._testTranslateProperty(navigator, this.property['eng-GB']);
        },

        "no posix locale match, then prefix match": function () {
            var navigator = {languages: ['bressan_BRESSE', 'fr', 'no_NO']};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },

        "no posix locale match, then partial match": function () {
            var navigator = {languages: ['bressan_BRESSE', 'fr_BE', 'no_NO']};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },

        "no posix locale match, then direct match": function () {
            var navigator = {languages: ['bressan_BRESSE', 'fr_FR', 'no_NO']};

            this._testTranslateProperty(navigator, this.property['fre-FR']);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.RegisterLanguageHelpers;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Register Language Helpers Plugin tests");
    Y.Test.Runner.add(registerHelpersTest);
    Y.Test.Runner.add(languageNameTest);
    Y.Test.Runner.add(translatePropertyTest);
    Y.Test.Runner.add(navigatorAttrTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'handlebars', 'ez-registerlanguagehelpersplugin', 'ez-pluginregister-tests']});

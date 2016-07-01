/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-translateproperty-tests', function (Y) {
    var translatePropertyTest, navigatorAttrTest,
        Assert = Y.Assert;
        
    translatePropertyTest = new Y.Test.Case({
        name: "eZ Translate Property translateProperty test",

        setUp: function () {
            this.localesMap = {
                'fr_FR': 'fre-FR',
                'fr_CA': 'fre-CA',
                'en_GB': 'eng-GB',
                'nn_NO': 'nor-NO',
                'no_NO': 'nor-NO',
            };

            this.extension = new Y.eZ.TranslateProperty();
            this.property = {
                'eng-GB': 'potatoes',
                'fre-FR': 'pomme de terres',
                'nor-NO': 'potet',
            };
        },

        tearDown: function () {
            this.extension.destroy();
            delete this.extension;
        },

        _testTranslateProperty: function (navigator, expected) {
            var translated;

            this.extension._set('navigator', navigator);
            translated = this.extension.translateProperty(this.localesMap, this.property);

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

    navigatorAttrTest = new Y.Test.Case({
        name: "eZ Translate Property navigator attribute test",

        setUp: function () {
            this.extension = new Y.eZ.TranslateProperty();
        },

        tearDown: function () {
            this.extension.destroy();
            delete this.extension;
        },

        "Should return the navigator object": function () {
            Assert.areSame(
                Y.config.win.navigator,
                this.extension.get('navigator'),
                "The navigator attribute should hold the navigator object"
            );
        },
    });

    Y.Test.Runner.setName("eZ Translate Property extension tests");
    Y.Test.Runner.add(translatePropertyTest);
    Y.Test.Runner.add(navigatorAttrTest);
}, '', {requires: ['test', 'ez-translateproperty']});

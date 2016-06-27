/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerlanguagehelpersplugin-tests', function (Y) {
    var registerHelpersTest, languageNameTest, translatePropertyTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    registerHelpersTest = new Y.Test.Case({
        name: "eZ Register Language Helpers register helpers test",

        setUp: function () {
            this.app = new Mock();
            this.localesMap = {};

            Mock.expect(this.app, {
                method: 'get',
                args: ['localesMap'],
                returns: this.localesMap,
            });
            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app,
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

    translatePropertyTest = new Y.Test.Case({
        name: "eZ Register Language Helpers translate_property test",

        setUp: function () {
            this.app = new Mock();
            this.localesMap = {};
            this.property = {};

            Mock.expect(this.app, {
                method: 'translateProperty',
                args: [this.localesMap, this.property],
            });
            Mock.expect(this.app, {
                method: 'get',
                args: ['localesMap'],
                returns: this.localesMap,
            });

            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        "Should call the `translateProperty` method": function () {
            /*jshint camelcase: false */
            Y.Handlebars.helpers.translate_property(this.property);
            /*jshint camelcase: true */

            Mock.verify(this.app);
        }
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.RegisterLanguageHelpers;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Register Language Helpers Plugin tests");
    Y.Test.Runner.add(registerHelpersTest);
    Y.Test.Runner.add(languageNameTest);
    Y.Test.Runner.add(translatePropertyTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'handlebars', 'ez-registerlanguagehelpersplugin', 'ez-pluginregister-tests']});

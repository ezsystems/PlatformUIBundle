/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerlanguagehelpersplugin-tests', function (Y) {
    var pluginTest, languageNameHelperTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    pluginTest = new Y.Test.Case({
        name: "eZ Register Language Helpers Plugin test",

        setUp: function () {
            this.systemLanguageList = {
                'pol-PL': {
                    languageCode: 'pol-PL',
                    name: 'Polish'
                }
            };
            this.app = new Mock();

            Mock.expect(this.app, {
                method: 'get',
                args: ['systemLanguageList'],
                returns: this.systemLanguageList
            });

            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
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
    });

    languageNameHelperTest = new Y.Test.Case({
        name: "eZ Register Language Helpers Plugin language_name helper test",

        setUp: function () {
            this.systemLanguageList = {
                'pol-PL': {
                    languageCode: 'pol-PL',
                    name: 'Polish'
                }
            };
            this.app = new Mock();

            Mock.expect(this.app, {
                method: 'get',
                args: ['systemLanguageList'],
                returns: this.systemLanguageList
            });

            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        "Should return language name": function () {
            var languageCode = 'pol-PL',
                languageName = this.systemLanguageList[languageCode].name;

            Assert.areEqual(
                languageName,
                /*jshint camelcase: false */
                Y.Handlebars.helpers.language_name(languageCode),
                /*jshint camelcase: true */
                "'language_name' should return the language name"
            );
            Mock.verify(this.app);
        },

        "Should return language code": function () {
            var languageCode = 'ger-DE';

            Assert.areEqual(
                languageCode,
                /*jshint camelcase: false */
                Y.Handlebars.helpers.language_name(languageCode),
                /*jshint camelcase: true */
                "'language_name' should return the language code"
            );
            Mock.verify(this.app);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.RegisterLanguageHelpers;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Register Language Helpers Plugin tests");
    Y.Test.Runner.add(pluginTest);
    Y.Test.Runner.add(languageNameHelperTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'handlebars', 'ez-registerlanguagehelpersplugin', 'ez-pluginregister-tests']});

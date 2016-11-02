/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerlanguagehelpersplugin-tests', function (Y) {
    var registerHelpersTest, languageNameTest, translatePropertyTest, registerTest,
        translateTest,
        Assert = Y.Assert, Mock = Y.Mock;

    function initAppMock (localesMap) {
        var app = new Mock();

        Mock.expect(app, {
            method: 'get',
            args: ['localesMap'],
            returns: localesMap,
        });
        return app;
    }

    registerHelpersTest = new Y.Test.Case({
        name: "eZ Register Language Helpers register helpers test",

        setUp: function () {
            this.localesMap = {};
            this.app = initAppMock(this.localesMap);

            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app,
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

        "Should register the `translate_property` helper": function () {
            this._helperRegistered('translate_property');
        },

        "Should register the `translate` helper": function () {
            this._helperRegistered('translate');
        },
    });

    languageNameTest = new Y.Test.Case({
        name: "eZ Register Language Helpers language_name test",

        setUp: function () {
            this.languageCode = 'pol-PL';
            this.app = initAppMock({});

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
            this.localesMap = {};
            this.app = initAppMock(this.localesMap);
            this.property = {};

            Mock.expect(this.app, {
                method: 'translateProperty',
                args: [this.localesMap, this.property],
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

    translateTest = new Y.Test.Case({
        name: "eZ Register Language Helpers translate test",

        setUp: function () {
            this.app = initAppMock({});
            this.plugin = new Y.eZ.Plugin.RegisterLanguageHelpers({
                host: this.app,
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
            delete Y.eZ.Translator;
        },

        _mockTranslator: function (expectedMessage, expectedDomain, variableCheckFunc) {
            Y.eZ.Translator = {
                trans: function(message, variables, domain) {
                    Assert.areSame(
                        expectedMessage,
                        message,
                        "The message should be passed to the translator"
                    );
                    Assert.isObject(
                        variables,
                        "An object should be passed to the translator variables"
                    );
                    if ( variableCheckFunc ) {
                        variableCheckFunc.call(this, variables);
                    }

                    Assert.areSame(
                        expectedDomain,
                        domain,
                        "The domain should be passed to the translator"
                    );
                }
            };
        },

        "Should call the `translate` method": function () {
            var message = "Translate me!",
                domain = "unit test";

            this._mockTranslator(message, domain);

            Y.Handlebars.helpers.translate(message, domain, {hash: {}});
        },

        "Should not escape the translated string": function () {
            var message = "When The Levee Breaks - <b>Led Zeppelin</b>",
                domain = "led-zep";

            this._mockTranslator(message, domain);

            Y.Handlebars.helpers.translate(message, domain, {hash: {}});
        },

        "Should pass the parameters to the translator": function () {
            var message = "When The Levee Breaks",
                domain = "led-zep",
                safeString = "Stairway to Heaven",
                notSafeString = "<b>";

            this._mockTranslator(message, domain, function (variables) {
                Assert.areEqual(
                    safeString, variables.safeString,
                    "The variables should be passed to the translator"
                );
                Assert.areEqual(
                    '&lt;b&gt;', variables.notSafeString,
                    "The variables should be escaped"
                );
            });

            Y.Handlebars.helpers.translate(
                message, domain, {
                    hash: {
                        "safeString": safeString,
                        "notSafeString": notSafeString,
                    }
                }
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.RegisterLanguageHelpers;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Register Language Helpers Plugin tests");
    Y.Test.Runner.add(registerHelpersTest);
    Y.Test.Runner.add(languageNameTest);
    Y.Test.Runner.add(translatePropertyTest);
    Y.Test.Runner.add(translateTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'handlebars', 'ez-registerlanguagehelpersplugin', 'ez-pluginregister-tests']});

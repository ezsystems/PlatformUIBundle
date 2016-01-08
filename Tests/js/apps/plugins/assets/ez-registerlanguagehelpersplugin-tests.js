/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerlanguagehelpersplugin-tests', function (Y) {
    var pluginTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    pluginTest = new Y.Test.Case({
        name: "eZ Register Language Helpers Plugin test",

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

        _helperRegistered: function (name) {
            Assert.isFunction(
                Y.Handlebars.helpers[name],
                "The helper '" + name + "' should be registered"
            );
        },

        "Should register the 'language_name' helper": function () {
            this._helperRegistered('language_name');
        },

        "Should call the app getLanguageName method": function () {
            /*jshint camelcase: false */
            Y.Handlebars.helpers.language_name(this.languageCode);
            /*jshint camelcase: true */

            Mock.verify(this.app);
        }
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.RegisterLanguageHelpers;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Register Language Helpers Plugin tests");
    Y.Test.Runner.add(pluginTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'handlebars', 'ez-registerlanguagehelpersplugin', 'ez-pluginregister-tests']});

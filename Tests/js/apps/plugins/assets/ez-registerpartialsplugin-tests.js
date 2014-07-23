/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerpartialsplugin-tests', function (Y) {
    var pluginTest, registerTest, Assert = Y.Assert;

    pluginTest = new Y.Test.Case({
        name: "eZ Register Partials Plugin test",

        setUp: function () {
            this.plugin = new Y.eZ.Plugin.RegisterPartials();
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        "Should register partials found inside the DOM": function () {
            var template = Y.Handlebars.compile('Test partial should be here: {{> ezTestPartial}}');

            Assert.isFunction(template);
            Assert.areEqual(
                "Test partial should be here: I'm a test partial!",
                template()
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.RegisterPartials;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Register Partials Plugin tests");
    Y.Test.Runner.add(pluginTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'handlebars', 'ez-registerpartialsplugin', 'ez-pluginregister-tests']});

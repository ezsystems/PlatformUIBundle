/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-pluginregister-tests', function (Y) {
    "use strict";

    var Assert = Y.Assert;

    Y.namespace('eZ.Test');

    // generic test to apply to any plugin to check that it is registered for
    // the expected components.
    // to work, the test case should have the following properties:
    // * this.Plugin containing the Plugin constructor function
    // * this.components containing an array of the component names
    Y.eZ.Test.PluginRegisterTest = {
        "Should autoregister plugins": function () {
            var Plugin = this.Plugin;

            Y.Array.each(this.components, function (component) {
                var plugins = Y.eZ.PluginRegistry.getPlugins(component);

                Assert.isTrue(
                    plugins.length >= 1,
                    "There should be at least one plugin for " + component
                );
                Assert.isTrue(
                    plugins.indexOf(Plugin) !== -1,
                    "The plugin should be registered for " + component
                );
            });
        }
    };
});

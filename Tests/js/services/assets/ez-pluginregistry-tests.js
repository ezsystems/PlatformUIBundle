YUI.add('ez-pluginregistry-tests', function (Y) {
    var registerTests, resetTests, unregisterTests,
        _generatePlugin = function (ns) {
            var Plugin = function () {};

            Plugin.NS = ns;
            return Plugin;
        },
        Assert = Y.Assert;

    registerTests = new Y.Test.Case({
        name: "eZ Plugin Registry register tests",

        tearDown: function () {
            Y.eZ.PluginRegistry.reset();
        },

        _should: {
            error: {
                "Should not register non function": true,
                "Should not register non plugin constructor": true,
            }
        },

        "Should register the plugin for the given component": function () {
            var ns = 'pluginNs',
                plugin = _generatePlugin(ns),
                component = 'component';

            Y.eZ.PluginRegistry.registerPlugin(plugin, [component]);

            Assert.areEqual(
                1, Y.eZ.PluginRegistry.getPlugins(component).length,
                "Only one plugin should be registered"
            );
            Assert.areSame(
                plugin, Y.eZ.PluginRegistry.getPlugins(component)[0],
                "The plugin should be registered"
            );
        },

        "Should register the plugin for several components": function () {
            var ns = 'pluginNs',
                plugin = _generatePlugin(ns),
                component1 = 'component1', component2 = 'component2';

            Y.eZ.PluginRegistry.registerPlugin(plugin, [component1, component2]);

            Assert.areEqual(
                1, Y.eZ.PluginRegistry.getPlugins(component1).length,
                "Only one plugin should be registered for component " + component1
            );
            Assert.areSame(
                plugin, Y.eZ.PluginRegistry.getPlugins(component1)[0],
                "The plugin should be registered for component " + component1
            );

            Assert.areEqual(
                1, Y.eZ.PluginRegistry.getPlugins(component2).length,
                "Only one plugin should be registered for component " + component1
            );
            Assert.areSame(
                plugin, Y.eZ.PluginRegistry.getPlugins(component2)[0],
                "The plugin should be registered for component " + component1
            );
        },

        "Should register several plugins on one component": function () {
            var ns1 = 'pluginNs1',
                ns2 = 'pluginNs2',
                plugin1 = _generatePlugin(ns1),
                plugin2 = _generatePlugin(ns2),
                component = 'component';

            Y.eZ.PluginRegistry.registerPlugin(plugin1, [component]);
            Y.eZ.PluginRegistry.registerPlugin(plugin2, [component]);

            Assert.areEqual(
                2, Y.eZ.PluginRegistry.getPlugins(component).length,
                "Two plugins should be registered"
            );
            Assert.areSame(
                plugin1, Y.eZ.PluginRegistry.getPlugins(component)[0],
                "The plugin1 should be registered"
            );
            Assert.areSame(
                plugin2, Y.eZ.PluginRegistry.getPlugins(component)[1],
                "The plugin1 should be registered"
            );
        },

        "Should not register non function": function () {
            Y.eZ.PluginRegistry.registerPlugin("not a plugin", ['component']);
        },

        "Should not register non plugin constructor": function () {
            Y.eZ.PluginRegistry.registerPlugin(function () { }, ['component']);
        },
    });

    unregisterTests = new Y.Test.Case({
        name: "eZ Plugin Registry register tests",

        tearDown: function () {
            Y.eZ.PluginRegistry.reset();
        },

        "Should unregister a plugin": function () {
            var ns = 'pluginNs',
                plugin = _generatePlugin(ns),
                component = 'component';

            Y.eZ.PluginRegistry.registerPlugin(plugin, [component]);
            Y.eZ.PluginRegistry.unregisterPlugin(ns);

            Assert.areEqual(
                0, Y.eZ.PluginRegistry.getPlugins(component).length,
                "The plugin should have been unregistered"
            );
        },

        "Should unregister a plugin from all its components": function () {
            var ns = 'pluginNs',
                plugin = _generatePlugin(ns),
                component1 = 'component1',
                component2 = 'component2';

            Y.eZ.PluginRegistry.registerPlugin(plugin, [component1, component2]);
            Y.eZ.PluginRegistry.unregisterPlugin(ns);

            Assert.areEqual(
                0, Y.eZ.PluginRegistry.getPlugins(component1).length,
                "The plugin should have been unregistered from component " + component1
            );
            Assert.areEqual(
                0, Y.eZ.PluginRegistry.getPlugins(component2).length,
                "The plugin should have been unregistered from component " + component2
            );
        },

        "Should ignore unknown plugin": function () {
            var ns = 'pluginNs',
                plugin = _generatePlugin(ns),
                component = 'component';

            Y.eZ.PluginRegistry.registerPlugin(plugin, [component]);
            Y.eZ.PluginRegistry.unregisterPlugin("somethingWrong");

            Assert.areEqual(
                1, Y.eZ.PluginRegistry.getPlugins(component).length,
                "The plugin should stay in the registry"
            );
        },
    });

    resetTests = new Y.Test.Case({
        name: "eZ Plugin Registry reset tests",

        "Should reset the plugin registry": function () {
            var ns1 = 'pluginNs1',
                ns2 = 'pluginNs2',
                ns3 = 'pluginNs2',
                plugin1 = _generatePlugin(ns1),
                plugin2 = _generatePlugin(ns2),
                plugin3 = _generatePlugin(ns3),
                component1 = 'component1',
                component2 = 'component2';

            Y.eZ.PluginRegistry.registerPlugin(plugin1, [component1]);
            Y.eZ.PluginRegistry.registerPlugin(plugin2, [component2]);
            Y.eZ.PluginRegistry.registerPlugin(plugin3, [component1, component2]);
            Y.eZ.PluginRegistry.reset();

            Assert.areEqual(
                0, Y.eZ.PluginRegistry.getPlugins(component1).length,
                "No plugin should be registered for " + component1
            );
            Assert.areEqual(
                0, Y.eZ.PluginRegistry.getPlugins(component2).length,
                "No plugin should be registered for " + component2
            );
        },
    });

    Y.Test.Runner.setName("eZ Plugin Registry tests");
    Y.Test.Runner.add(registerTests);
    Y.Test.Runner.add(unregisterTests);
    Y.Test.Runner.add(resetTests);
}, '0.0.1', {requires: ['test', 'ez-pluginregistry']});

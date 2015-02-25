YUI.add('ez-pluginregistry', function (Y) {
    "use strict";
    /**
     * Provides the plugin registry
     *
     * @module ez-pluginregistry
     */
    Y.namespace('eZ');

    /**
     * Plugin registry. It allows to register plugins by component.
     *
     * @class PluginRegistry
     * @namespace eZ
     */
    Y.eZ.PluginRegistry = {
        /**
         * Static property which holds the plugin constructors by component
         * identifier.
         *
         * @static
         * @property _plugins
         * @type Object
         * @private
         */
        _plugins: {},

        /**
         * Resets the plugin registry
         *
         * @static
         * @method reset
         */
        reset: function () {
            Y.eZ.PluginRegistry._plugins = {};
        },

        /**
         * Registers a plugin in the registry for the given components
         *
         * @method registerPlugin
         * @static
         * @param {Function} constructor the constructor function of the plugin.
         *        It should have a `NS` static property to be considered as a
         *        valid plugin.
         * @param {Array} components array containing the string identifiers of
         *        the components that will be extended by the plugin
         */
        registerPlugin: function (constructor, components) {
            var plugins = Y.eZ.PluginRegistry._plugins;

            if ( typeof constructor !== "function" || !constructor.NS ) {
                throw new Error("PluginRegistry.registerPlugin expects a plugin constructor");
            }
            Y.Array.each(components, function (identifier) {
                plugins[identifier] = plugins[identifier] || [];
                plugins[identifier].push(constructor);
            });
        },

        /**
         * Removes a plugin from the registry based on its namespace.
         *
         * @method unregisterPlugin
         * @static
         * @param {String} ns the namespace of the plugin to remove
         */
        unregisterPlugin: function (ns) {
            var plugins = Y.eZ.PluginRegistry._plugins;

            Y.Object.each(plugins, function (value, key) {
                plugins[key] = Y.Array.reject(value, function (item) {
                    return (item.NS === ns);
                });
            });
        },

        /**
         * Returns the plugins registered for the component.
         *
         * @method getPlugins
         * @static
         * @param {String} component the identifier of the component
         * @return Array
         */
        getPlugins: function (component) {
            return Y.eZ.PluginRegistry._plugins[component] || [];
        },
    };
});

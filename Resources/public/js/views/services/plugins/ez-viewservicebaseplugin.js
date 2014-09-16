YUI.add('ez-viewservicebaseplugin', function (Y) {
    "use strict";
    /**
     * Provides the base class to create view service plugin
     *
     * @module ez-viewservicebaseplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * View Service Base Plugin class. This class is meant to be extended to
     * create view service plugins. It defines 3 public methods you can override
     * at will to enrich the behavior of a view service. In addition, it's
     * common to add an `initializer` method where you can setup custom event
     * handlers and you **must** define a `NS` static property.
     *
     * After creating the class, don't forget to register the plugin in the
     * eZ.PluginRegistry.
     *
     * @namespace eZ.Plugin
     * @class ViewServiceBase
     * @constructor
     * @extends Plugin.Base
     * @example
     *      MyPlugin = Y.Base.create('myPlugin', Y.eZ.Plugin.ViewServiceBase,[], {
     *          initializer: function () {
     *              this.get('host').on('*:customEvent', this._customEventHandler);
     *          },
     *
     *          _customEventHandler: function () {
     *              // logic here
     *          },
     *
     *          afterLoad: function (cb) {
     *              // logic here to fill someValue
     *              this.set('something', someValue);
     *              cb();
     *          },
     *
     *          getViewParameters: function () {
     *              return {something: this.get('something')};
     *          },
     *      }, {
     *          NS: "mandatoryStaticNamespace",
     *          ATTRS: {
     *              something: {}
     *          },
     *      });
     *
     *      Y.eZ.PluginRegistry.registerPlugin(MyPlugin, ['identifierOfTheViewServiceToExtend']);
     *
     */
    Y.eZ.Plugin.ViewServiceBase = Y.Base.create('viewServiceBasePlugin', Y.Plugin.Base, [], {
        /**
         * Load implementation that will be called after the default view
         * service `load` implementation. In others terms, here you can use the
         * potential results of the view service `load` method. When done, the
         * `callback` has to be called.
         *
         * @param {Function} callback
         * @method afterLoad
         */
        afterLoad: function (callback) {
            callback();
        },

        /**
         * Load implementation that will be called in parallel with the view
         * service `load` implementation. When done, the `callback` has to be
         * called.
         *
         * @param {Function} callback
         * @method parallelLoad
         */
        parallelLoad: function (callback) {
            callback();
        },

        /**
         * Returns the parameters to pass to the view. The return value of this
         * method is merged with the `getViewParameters` result of the view
         * service and the `getViewParameters` result of the others plugins.
         *
         * @method getViewParameters
         * @return Object
         */
        getViewParameters: function () {
            return {};
        },

        /**
         * Configures the next view service. It is called when the active view
         * service change in the application with the new service in parameters
         * so that it's possible to configure it.
         *
         * @method setNextViewServiceParameters
         * @param {eZ.ViewService} newService the new view service to configure
         * @return {eZ.ViewService} the new view service
         */
        setNextViewServiceParameters: function (service) {
            return service;
        },
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-viewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service base class
     * @module ez-viewservice
     */
    Y.namespace('eZ');

    /**
     * Fired when a loading error occurs
     *
     * @event error
     * @param {String} message the error message
     */
    var EVT_ERROR = 'error';

    /**
     * View service base class.
     * The classes extending this one are supposed to be used in the route
     * definition, see {{#crossLink "eZ.PlatformUIApp"}}the route
     * attribute of eZ.PlatformUIApp{{/crossLink}}
     *
     * @namespace eZ
     * @class ViewService
     * @constructor
     * @extends Base
     */
    Y.eZ.ViewService = Y.Base.create('viewService', Y.Base, [], {
        /**
         * Triggers the error event when the message parameter in the event
         * facade
         *
         * @method _error
         * @protected
         * @param {String} msg
         */
        _error: function (msg) {
            this.fire(EVT_ERROR, {message: msg});
        },

        /**
         * Loads the data for the view. This method first calls the
         * `parallelLoad` of each plugins in parallel with the service `_load`
         * and after that it calls in parallel the `afterLoad` of each plugins
         * and then calls the callback with the service in parameter.
         *
         * **Do not override this method unless you know what you are doing**
         * You'll most likely want to implement the `_load` method instead!
         *
         * @method load
         * @param {Function} callback
         */
        load: function (callback) {
            var tasks = new Y.Parallel(),
                service = this;

            Y.Object.each(this._plugins, function (fn, name) {
                service[name].parallelLoad(tasks.add());
            });
            this._load(tasks.add());

            tasks.done(function () {
                var after = new Y.Parallel();

                Y.Object.each(service._plugins, function (fn, name) {
                    service[name].afterLoad(after.add());
                });
                after.done(function () {
                    callback(service);
                });
            });
        },

        /**
         * Defaut load implementation of the service. This method is meant to be
         * overriden in services. The default implementation does nothing except
         * calling the passed callback.
         *
         * @method _load
         * @protected
         * @param {Function} callback
         */
        _load: function (callback) {
            callback();
        },

        /**
        * Configures the next view services. This method is meant to be overridden in
        * view services implementations. It is called before load and takes the view
        * service instance that will replace the current one.
        * The default implementation does nothing.
        *
        * @method _setNextViewServiceParameters
        * @protected
        * @param {eZ.ViewService} service the new active view service
        * @return {eZ.ViewService} the new view service
        */
        _setNextViewServiceParameters: function (service) {
            return service;
        },

        /**
         * Configures the next view services, it calls `_setNextViewServiceParameters`
         * and takes the view service plugins into account.
         *
         * **Do not override this method unless you know what you are doing**
         * You'll most likely want to implement the `_setNextViewServiceParameters`
         * method instead or write a view service plugin.
         *
         * @method setNextViewServiceParameters
         * @protected
         * @param {eZ.ViewService} service the new active view service
         * @return {eZ.ViewService} the new view service
         */
        setNextViewServiceParameters: function (newService) {
            var that = this;

            this._setNextViewServiceParameters(newService);
            Y.Object.each(this._plugins, function (fn, name) {
                that[name].setNextViewServiceParameters(newService);
            });

            return newService;
        },

        /**
         * Returns the parameters to pass to the view. This method merges the
         * view parameters provided by the plugins and by the service itself.
         *
         * **Do not override this method unless you know what you are doing**
         * You'll most likely want to implement the `_getViewParameters` method
         * instead!
         *
         * @method getViewParameters
         * @return {Object}
         */
        getViewParameters: function () {
            var viewParams = [this._getViewParameters()],
                service = this;

            Y.Object.each(this._plugins, function (fn, name) {
                viewParams.push(service[name].getViewParameters());
            });
            return Y.merge.apply(Y, viewParams);
        },

        /**
         * Returns the parameters to pass to the view. This method is meant to
         * be overriden in custom view services. The default implementation
         * returns an empty object.
         *
         * @method _getViewParameters
         * @return {Object}
         */
        _getViewParameters: function () {
            return {};
        }
    }, {
        ATTRS: {
            /**
             * The CAPI instance.
             *
             * @attribute capi
             * @initOnly
             */
            capi: {
                writeOnce: "initOnly"
            },

            /**
             * The request object currently handled
             *
             * @attribute request
             */
            request: {},

            /**
             * The response object
             *
             * @attribute response
             */
            response: {},

            /**
             * The application object
             *
             * @attribute app
             * @initOnly
             */
            app: {
                writeOnce: "initOnly"
            },

            /**
             * The view service configuration.
             *
             * @attribute config
             * @type mixed
             */
            config: {},
        }
    });
});

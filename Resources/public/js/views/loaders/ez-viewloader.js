YUI.add('ez-viewloader', function (Y) {
    "use strict";
    /**
     * Provides the view loader base class
     * @module ez-viewloader
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
     * View loader base class.
     * The classes extending this one are supposed to be used in the route
     * definition, see {{#crossLink "eZ.EditorialApp"}}the route
     * attribute of eZ.EditorialApp{{/crossLink}}
     *
     * @namespace eZ
     * @class ViewLoader
     * @constructor
     * @extends Base
     */
    Y.eZ.ViewLoader = Y.Base.create('viewLoader', Y.Base, [], {
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
         * Loads the data for the view. The default implementation does nothing
         * except calling the passed callback.
         *
         * @method load
         * @param {Function} callback
         */
        load: function (callback) {
            callback();
        },

        /**
         * Sets the results of the view loader in the response object
         *
         * @protected
         * @method _setResponseVariables
         * @param {Object} hash
         */
        _setResponseVariables: function (hash) {
            var response = this.get('response');

            response.variables = hash;
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
             * @initOnly
             */
            request: {
                writeOnce: "initOnly"
            },

            /**
             * The response object
             *
             * @attribute response
             * @initOnly
             */
            response: {
                writeOnce: "initOnly"
            }
        }
    });
});

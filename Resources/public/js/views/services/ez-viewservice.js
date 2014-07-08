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
         * Loads the data for the view. The default implementation does nothing
         * except calling the passed callback.
         *
         * @method load
         * @param {Function} callback
         */
        load: function (callback) {
            callback(this);
        },

        /**
         * Returns the parameters to pass to the view instance
         *
         * @method getViewParameters
         * @return {Object}
         */
        getViewParameters: function () {
            return {};
        },
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
            }
        }
    });
});

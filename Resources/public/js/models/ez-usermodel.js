/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermodel', function (Y) {
    "use strict";
    /**
     * Provides the User model class
     *
     * @module ez-usermodel
     */

    Y.namespace('eZ');

    /**
     * User model used to represent an eZ Publish user.
     *
     * @namespace eZ
     * @class User
     * @constructor
     * @extends eZ.RestModel
     */
    Y.eZ.User = Y.Base.create('userModel', Y.eZ.RestModel, [], {
        /**
         * sync implementation that relies on the JS REST client.
         * For now, it only supports the 'read' action. The callback is
         * directly passed to the UserService.loadUser method.
         *
         * @method sync
         * @param {String} action the action, currently only 'read' is supported
         * @param {Object} options the options for the sync.
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback a callback executed when the operation is finished
         */
        sync: function (action, options, callback) {
            var api = options.api;

            if ( action === 'read' ) {
                api.getUserService().loadUser(
                    this.get('id'), callback
                );
            } else {
                callback("Only read operation is supported at the moment");
            }
        }
    }, {
        REST_STRUCT_ROOT: "User",
        ATTRS_REST_MAP: [
            'email', 'login', 'enabled', 'name',
            {'_remoteId': 'remoteId'}
        ],
        ATTRS: {
            /**
             * The user's email
             *
             * @attribute email
             * @default ''
             * @type string
             */
            email: {
                value: ''
            },

            /**
             * The user's login
             *
             * @attribute login
             * @default ''
             * @type string
             */
            login: {
                value: ''
            },

            /**
             * The user's `enabled` flag
             *
             * @attribute enabled
             * @default true
             * @type boolean
             */
            enabled: {
                setter: '_setterBoolean',
                value: true
            },

            /**
             * The user's name
             *
             * @attribute name
             * @default ''
             * @type string
             */
            name: {
                value: ''
            },

            /**
             * The user's remote id
             *
             * @attribute remoteId
             * @default ''
             * @type string
             */
            remoteId: {
                value: ''
            }
        }
    });
});

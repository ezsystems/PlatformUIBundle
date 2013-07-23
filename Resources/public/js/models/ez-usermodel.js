YUI.add('ez-usermodel', function (Y) {
    "use strict";
    /**
     * Provides the User model class
     *
     * @method ez-usermodel
     */

    Y.namespace('eZ');

    /**
     * User model
     *
     * @namespace eZ
     * @class User
     * @constructor
     * @extends Model
     */
    Y.eZ.User = Y.Base.create('userModel', Y.eZ.RestModel, [], {

        sync: function (action, options, callback) {
            var api = options.api;

            if ( action === 'read' ) {
                api.getUserService().loadUser(
                    this.get('id'), callback
                );
            } else {
                callback("Only read operation is supported at the moment");
            }
        },

        /**
         * Parses the response from the eZ Publish REST API
         *
         * @method parse
         * @param {Object} response the response object from the eZ JS REST Client
         * @return {Object} attribute hash
         */
        parse: function (response) {
            var user;

            try {
                user = Y.JSON.parse(response.body);
            } catch (ex) {
                /**
                 * Fired when a parsing error occurs
                 *
                 * @event error
                 * @param {String} src "parse"
                 * @param {String} error the error message
                 * @param {Object} response the response object that failed to
                 * be parsed
                 */
                this.fire('error', {
                    src: 'parse',
                    error: "No user in the response",
                    response: response
                });
                return null;
            }

            return this._parseStruct(user.User);
        }

    }, {
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

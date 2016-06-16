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
                api.getUserService().loadUser(this.get('id'), function (err, response) {
                    var contentType;

                    if ( err ) {
                        return callback(err, response);
                    }

                    contentType = new Y.eZ.ContentType({id: response.document.User.ContentType._href});
                    contentType.load({api: api}, function (error) {
                        response.document._contentType = contentType;
                        callback(error, response);
                    });
                });
            } else {
                callback("Only read operation is supported at the moment");
            }
        },

        /**
         * Override the default implementation to find the avatar (if any) in the user Content item.
         *
         * @protected
         * @method _parseStruct
         * @param {Object} the user item
         * @param {Object} the response document
         */
        _parseStruct: function (struct, responseDoc) {
                var attrs, imageField,
                    imageIdentifiers = responseDoc._contentType.getFieldDefinitionIdentifiers('ezimage');

            attrs = this.constructor.superclass._parseStruct.call(this, struct);
            imageField = struct.Version.Fields.field.filter(function (field) {
                return field.fieldDefinitionIdentifier == imageIdentifiers[0];
            });
            attrs.avatar = imageField.length ? imageField[0].fieldValue : null;
            return attrs;
        },

        /**
         * Loads drafts created by a given user
         *
         * @method loadDrafts
         * @param options {Object}
         * @param options.api {Object} (required) the JS REST client instance
         * @param callback {Function} function to call after processing response
         */
        loadDrafts: function (options, callback) {
            options.api.getContentService().loadUserDrafts(this.get('id'), function (error, response) {
                var versions = [];

                if (error) {
                    callback(error, response);

                    return;
                }

                response.document.VersionList.VersionItem.forEach(function (versionItemHash) {
                    var versionInfo = new Y.eZ.VersionInfo();

                    versionInfo.loadFromHash(versionItemHash);
                    versions.push(versionInfo);
                });

                callback(error, versions);
            });
        },
    }, {
        REST_STRUCT_ROOT: "User",
        ATTRS_REST_MAP: [
            'email', 'login', 'enabled', 'name',
            {'_remoteId': 'remoteId'}, {'_id': 'userId'}
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
            },

            /**
             * The user's avatar
             *
             * @attribute avatar
             * @default null
             * @type object
             */
            avatar: {
                value: null
            },

            /**
             * The user id
             *
             * @attribute userId
             * @default ''
             * @type Number
             */
            userId: {
                value: ''
            },
        }
    });
});

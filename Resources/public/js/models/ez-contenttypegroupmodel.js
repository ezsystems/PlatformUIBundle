/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypegroupmodel', function (Y) {
    "use strict";
    /**
     * Provides the Content type group model class
     *
     * @module ez-contenttypegroupmodel
     */

    Y.namespace('eZ');

    /**
     * Content type group model
     *
     * @namespace eZ
     * @class ContentTypeGroup
     * @constructor
     * @extends eZ.RestModel
     */
    Y.eZ.ContentTypeGroup = Y.Base.create('contentTypeGroupModel', Y.eZ.RestModel, [], {
        /**
         * sync implementation that relies on the JS REST client.
         * For now, it only supports the 'read' action. The callback is
         * directly passed to the ContentTypeService.loadContentTypeGroup method.
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
                api.getContentTypeService().loadContentTypeGroup(
                    this.get('id'), callback
                );
            } else {
                callback("Only read operation is supported at the moment");
            }
        },

        /**
         * Loads the content types in this group using the JS REST client. The
         * content types list is stored in the `contentTypes` attribute.
         *
         * @method loadContentTypes
         * @param {Object} options
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback a callback executed when the operation is finished
         */
        loadContentTypes: function (options, callback) {
            var typeService = options.api.getContentTypeService(),
                group = this;

            if ( this.get('contentTypes') ) {
                return callback();
            }
            typeService.loadContentTypes(this.get('id'), function (error, response) {
                var types = [];

                if ( error ) {
                    return callback(error);
                }
                Y.Array.each(response.document.ContentTypeInfoList.ContentType, function (typeHash) {
                    var type = new Y.eZ.ContentType();

                    type.set('id', typeHash._href);
                    type.loadFromHash(typeHash);
                    types.push(type);
                });

                group._set('contentTypes', types);
                callback();
            });
        },
    }, {
        REST_STRUCT_ROOT: "ContentTypeGroup",
        ATTRS_REST_MAP: [
            'created', 'modified', 'identifier'
        ],
        LINKS_MAP: [
            'ContentTypes'
        ],
        ATTRS: {
            /**
             * The list of content types in this group. This attribute is lazily
             * filled by loadContentTypes
             *
             * @attribute contentTypes
             * @default undefined
             * @type Array
             */
            contentTypes: {
                readOnly: true,
            },

            /**
             * The content type group's creation date
             *
             * @attribute created
             * @default epoch
             * @type Date
             */
            created: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The content type group's modification date
             *
             * @attribute modified
             * @default epoch
             * @type Date
             */
            modified: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The content type group's identifier (name actually)
             *
             * @attribute identifier
             * @default ""
             * @type string
             */
            identifier: {
                value: ""
            },
        }
    });
});

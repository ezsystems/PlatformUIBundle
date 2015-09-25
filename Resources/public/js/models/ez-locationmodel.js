/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationmodel', function (Y) {
    "use strict";
    /**
     * Provides the Location model cass
     *
     * @module ez-locationmodel
     */

    Y.namespace('eZ');

    /**
     * Location model
     *
     * @namespace eZ
     * @class Location
     * @constructor
     * @extends Model
     */
    Y.eZ.Location = Y.Base.create('locationModel', Y.eZ.RestModel, [], {
        /**
         * Override of the eZ.RestModel _parseStruct method to also read the content info
         *
         * @protected
         * @method _parseStruct
         * @param {Object} struct the struct to transform
         * @return {Object}
         */
        _parseStruct: function (struct) {
            var attrs;

            attrs = this.constructor.superclass._parseStruct.call(this, struct);
            attrs.contentInfo = struct.ContentInfo;

            return attrs;
        },

        /**
         * sync implementation that relies on the JS REST client.
         * For now, it only supports the 'read' action. The callback is
         * directly passed to the ContentService.loadLocation method.
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
                api.getContentService().loadLocation(
                    this.get('id'), callback
                );
            } else {
                callback("Only read operation is supported at the moment");
            }
        },

        /**
         * Moves location to trash. Callback is directly passed to ContentService.moveSubtree location
         *
         * @method trash
         * @param {Object} options the options for moving to trash
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback
         */
        trash: function (options, callback) {
            var trashPath,
                api = options.api,
                location = this;

            api.getDiscoveryService().getInfoObject('trash', function (error, response) {
                if (error) {
                    callback(error);
                    return;
                }

                trashPath = response._href;
                api.getContentService().moveSubtree(
                    location.get('id'), trashPath, callback
                );
            });
        },

        /**
         * Moves the location under the given parenLocationId.
         *
         * @method move
         * @param {Object} options the options for the move.
         * @param {Object} options.api (required) the JS REST client instance
         * @param {String} parentLocationId the location id where we should move the content
         * @param {Function} callback a callback executed when the operation is finished
         */
        move: function (options, parentLocationId, callback) {
            options.api.getContentService().moveSubtree(this.get('id'), parentLocationId, callback);
        }
    }, {
        REST_STRUCT_ROOT: "Location",
        ATTRS_REST_MAP: [
            'childCount', 'depth', 'hidden', 'invisible', 'pathString',
            'priority', 'remoteId', 'sortField', 'sortOrder',
            {'id': 'locationId'}, {'_href': 'id'},
        ],
        LINKS_MAP: ['ParentLocation', 'Content'],
        ATTRS: {
            /**
             * The location's number of child
             *
             * @attribute childCount
             * @default 0
             * @type integer
             */
            childCount: {
                value: 0
            },

            /**
             * The location's depth
             *
             * @attribute depth
             * @default 1
             * @type integer
             */
            depth: {
                value: 1
            },

            /**
             * The location's hidden flag
             *
             * @attribute hidden
             * @default false
             * @type boolean
             */
            hidden: {
                value: false
            },

            /**
             * The location's invisible flag
             *
             * @attribute invisible
             * @default false
             * @type boolean
             */
            invisible: {
                value: false
            },

            /**
             * The location's id in the eZ Publish content repository
             *
             * @attribute locationId
             * @default ''
             * @type string
             */
            locationId: {
                value: ''
            },

            /**
             * The location's path string
             *
             * @attribute pathString
             * @default ''
             * @type string
             */
            pathString: {
                value: ""
            },

            /**
             * The location's priority
             *
             * @attribute priority
             * @default 0
             * @type integer
             */
            priority: {
                value: 0
            },

            /**
             * The location's remote id
             *
             * @attribute remoteId
             * @default ''
             * @type string
             */
            remoteId: {
                value: ""
            },

            /**
             * The location's sort field
             *
             * @attribute sortField
             * @default "PATH"
             * @type string
             */
            sortField: {
                value: "PATH"
            },

            /**
             * The location's sort order
             *
             * @attribute sortOrder
             * @default "ASC"
             * @type string
             */
            sortOrder: {
                value: "ASC"
            },

            /**
             * The content info
             *
             * @attribute contentInfo
             * @type eZ.ContentInfo
             */
            contentInfo: {
                getter: function (value) {
                    var contentInfo = new Y.eZ.ContentInfo();

                    if ( value ) {
                        contentInfo.setAttrs(contentInfo.parse({document: value}));
                    }
                    return contentInfo;
                }
            },
        }
    });
});

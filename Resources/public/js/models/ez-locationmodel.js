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
         * For now, it supports the 'read' and 'delete' actions. The callback is
         * directly passed to the ContentService.loadLocation method.
         *
         * @method sync
         * @param {String} action the action, currently 'read' and 'delete' are supported
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
            } else if ( action === 'delete' ) {
                this._deleteLocation(options, callback);
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
        },

        /**
         * Updates the hidden status of the location
         *
         * @protected
         * @method _updatehidden
         * @param {Object} options the required for the update
         * @param {Object} options.api (required) the JS REST client instance
         * @param {String} hidden `true` or `false` value to be set on the hidden attribute
         * @param {Function} callback a callback executed when the operation is finished
         */
        _updateHidden: function (options, hidden, callback) {
            var locationUpdateStruct = options.api.getContentService().newLocationUpdateStruct();

            locationUpdateStruct.body.LocationUpdate.hidden = hidden;
            //Remove the 2 line bellow once EZP-24899 is fixed and update unit test
            locationUpdateStruct.body.LocationUpdate.sortField = this.get('sortField');
            locationUpdateStruct.body.LocationUpdate.sortOrder = this.get('sortOrder');
            options.api.getContentService().updateLocation(this.get('id'), locationUpdateStruct, callback);
        },

        /**
         * Hides the location
         *
         * @method hide
         * @param {Object} options the required for the update
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback a callback executed when the operation is finished
         */
        hide: function (options, callback) {
            this._updateHidden(options, 'true', callback);
        },

        /**
         * Reverse the hidden status of the location
         *
         * @method unhide
         * @param {Object} options the required for the update
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback a callback executed when the operation is finished
         */
        unhide: function (options, callback) {
            this._updateHidden(options, 'false', callback);
        },

        /**
         * Deletes the location in the repository.
         *
         * @protected
         * @method _deleteLocation
         * @param {Object} options
         * @param {Object} options.api the JS REST client instance
         * @param {Function} callback
         */
        _deleteLocation: function (options, callback) {
            var contentService = options.api.getContentService(),
                location = this;

            if ( !this.get('id') ) {
                callback(false);
                return;
            }
            contentService.deleteLocation(this.get('id'), function (error, response) {
                if ( error ) {
                    callback(error);
                    return;
                }
                location.reset();
                callback(error, response);
            });
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

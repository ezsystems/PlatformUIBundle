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
        }
    }, {
        REST_STRUCT_ROOT: "Location",
        ATTRS_REST_MAP: [
            'childCount', 'depth', 'hidden', 'invisible', 'pathString',
            'priority', 'remoteId', 'sortField', 'sortOrder',
            {'id': 'locationId'}
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
            }
        }
    });
});

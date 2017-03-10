/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sectionmodel', function (Y) {
    "use strict";
    /**
     * Provides the Section model class
     *
     * @module ez-sectionmodel
     */

    Y.namespace('eZ');

    /**
     * Section model
     *
     * @namespace eZ
     * @class Section
     * @constructor
     * @extends eZ.RestModel
     */
    Y.eZ.Section = Y.Base.create('sectionModel', Y.eZ.RestModel, [], {
        /**
         * sync implementation that relies on the JS REST client.
         * It only supports the 'read' action. The callback is
         * directly passed to the corresponding ContentService methods.
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
                api.getContentService().loadSection(
                    this.get('id'), callback
                );
            } else {
                callback("Only read operation is supported at the moment");
            }
        },
    }, {
        REST_STRUCT_ROOT: "Section",
        ATTRS_REST_MAP: [
            'identifier', 'name', 'sectionId', {'_href': 'id'}
        ],
        ATTRS: {
            /**
             * The section's identifier
             *
             * @attribute identifier
             * @default ''
             * @type string
             */
            identifier: {
                value: ''
            },

            /**
             * The section's name
             *
             * @attribute name
             * @default ''
             * @type string
             */
            name: {
                value: ''
            },

            /**
             * The section's id
             *
             * @attribute id
             * @default null
             * @type number
             */
            sectionId: {
                value: null
            },
        }
    });
});

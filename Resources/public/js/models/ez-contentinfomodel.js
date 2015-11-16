/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentinfomodel', function (Y) {
    "use strict";
    /**
     * Provides the ContentInfo model class
     *
     * @module ez-contentinfomodel
     */

    Y.namespace('eZ');

    /**
     * ContentInfo model
     *
     * @namespace eZ
     * @class ContentInfo
     * @constructor
     * @extends eZ.RestModel
     */
    Y.eZ.ContentInfo = Y.Base.create('contentInfoModel', Y.eZ.RestModel, [Y.eZ.ContentInfoAttributes], {

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
                api.getContentService().loadContentInfo(
                    this.get('id'), callback
                );
            } else {
                callback("Only read operation is supported at the moment");
            }
        },

    }, {
        REST_STRUCT_ROOT: "Content",
        ATTRS_REST_MAP: [
            'alwaysAvailable', 'lastModificationDate',
            'mainLanguageCode', 'publishedDate',
            {'_remoteId': 'remoteId'},
            {'Name': 'name'},
            {'_id': 'contentId'},
            {'_href': 'id'},
        ],
        LINKS_MAP: [
            'Owner', 'ContentType', 'MainLocation',
        ],
    });
});

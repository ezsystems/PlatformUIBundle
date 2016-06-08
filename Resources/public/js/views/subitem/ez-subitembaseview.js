/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitembaseview', function (Y) {
    "use strict";
    /**
     * Provides the subitem base view.
     *
     * @module ez-subitembaseview
     */
    Y.namespace('eZ');

    /**
     * The subitem base view. It's the base class for the subitem list views.
     *
     * @namespace eZ
     * @class SubitemBaseView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.SubitemBaseView = Y.Base.create('subitemBaseView', Y.eZ.TemplateBasedView, [], {
        /**
         * Returns the Location children count
         *
         * @method _getChildCount
         * @protected
         * @return {Number}
         */
        _getChildCount: function () {
            return this.get('location').get('childCount');
        },
    }, {
        ATTRS: {
            /**
             * Identifier of the subitem view.
             *
             * @attribute identifier
             * @readOnly
             */
            identifier: {
                readOnly: true,
            },

            /**
             * Name of the subitem view
             *
             * @attribute name
             * @readOnly
             */
            name: {
                readOnly: true,
            },

            /**
             * The parent Location of the sub items.
             *
             * @attribute location
             * @type Y.eZ.Location
             * @writeOnce
             * @required
             */
            location: {
                writeOnce: "initOnly",
            },

            /**
             * The content associated with the current location
             *
             * @attribute content
             * @type Y.eZ.Content
             * @writeOnce
             * @required
             */
            content: {
                writeOnce: "initOnly",
            },

            /**
             * The content type of the content at the current location
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             * @writeOnce
             * @required
             */
            contentType: {
                writeOnce: "initOnly",
            },
        },
    });
});

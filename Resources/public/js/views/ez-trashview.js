/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashview', function (Y) {
    "use strict";
    /**
     * Provides the Trash View class
     *
     * @module ez-trashview
     */
    Y.namespace('eZ');

    /**
     * The Trash view
     *
     * @namespace eZ
     * @class TrashView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.TrashView = Y.Base.create('trashView', Y.eZ.TemplateBasedView, [], {

        /**
        * Renders the trash view
        *
        * @method render
        * @return {eZ.TrashView} the view itself
        */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                trashItems: this._convertTrashItemsToJSON(),
            }));

            return this;
        },

        /**
         * Converts the content of the `trashItems` attribute into JSON
         *
         * @protected
         * @method _convertTrashItemsToJSON
         * @return {Array} of JSONified `trashItems`
         */
        _convertTrashItemsToJSON: function () {
            return Y.Array.map(this.get('trashItems'), function (trashItem) {
                return {
                    'item': trashItem.item.toJSON(),
                    'parentLocation': trashItem.parentLocation.toJSON(),
                    'contentType': trashItem.contentType.toJSON(),
                };
            });
        },
    }, {
        ATTRS: {

            /**
             * List of Trash Items struct:
             *  - struct.item: Y.eZ.TrashItem
             *  - struct.parentLocation: Y.eZ.Location
             *  - struct.contentType: Y.eZ.ContentType
             *
             * @attribute trashItems
             * @required
             * @default []
             * @type Array
             */
            trashItems: {
                value: [],
            },
        }
    });
});

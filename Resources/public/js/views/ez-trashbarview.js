/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashbarview', function (Y) {
    "use strict";
    /**
     * Provides the Trash Bar class
     *
     * @module ez-trashbarview
     */
    Y.namespace('eZ');

    /**
     * The trash bar
     *
     * @namespace eZ
     * @class TrashBarView
     * @constructor
     * @extends eZ.BarView
     */
    Y.eZ.TrashBarView = Y.Base.create('trashBarView', Y.eZ.BarView, [], {
    }, {
        ATTRS: {
            /**
             * An array of {{#crossLink
             * "eZ.ButtonActionView"}}eZ.ButtonActionView{{/crossLink}}
             *
             * @attribute actionsList
             * @type Array
             */
            actionsList: {
                valueFn: function () {
                    return [
                        new Y.eZ.ButtonActionView({
                            actionId: "minimizeTrashBar",
                            disabled: false,
                            label: Y.eZ.trans('minimize', {}, 'trash'),
                            priority: 1000
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "restoreTrashItems",
                            disabled: true,
                            label: Y.eZ.trans('restore.selected', {}, 'trash'),
                            priority: 800
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "emptyTrash",
                            disabled: false,
                            label: Y.eZ.trans('empty.trash', {}, 'trash'),
                            priority: 10
                        }),
                    ];
                }
            },
        }
    });
});

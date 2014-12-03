/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-actionbarview', function (Y) {
    "use strict";
    /**
     * Provides the Action Bar class
     *
     * @module ez-actionbarview
     */

    Y.namespace('eZ');

    /**
     * The action bar
     *
     * @namespace eZ
     * @class ActionBarView
     * @constructor
     * @extends eZ.BarView
     */
    Y.eZ.ActionBarView = Y.Base.create('actionBarView', Y.eZ.BarView, [], {
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
                            actionId: "minimizeActionBar",
                            disabled: false,
                            label: "Minimize",
                            priority: 1000
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "edit",
                            disabled: false,
                            label: "Edit",
                            hint: "Edit this content",
                            priority: 200
                        }),
                        new Y.eZ.CreateContentActionView({
                            actionId: 'createContent',
                            disabled: false,
                            label: 'Create Content',
                            priority: 210
                        })
                    ];
                }
            },
        }
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarview', function (Y) {
    "use strict";
    /**
     * Provides the Discovery Bar class
     *
     * @module ez-discoverybarview
     */
    Y.namespace('eZ');

    /**
     * The discovery bar
     *
     * @namespace eZ
     * @class DiscoveryBarView
     * @constructor
     * @extends eZ.BarView
     */
    Y.eZ.DiscoveryBarView = Y.Base.create('discoveryBarView', Y.eZ.BarView, [], {
        /**
         * Renders the discovery bar view
         *
         * @method render
         * @return {eZ.DiscoveryBarView} the view it self
         */
        render: function () {
            this.get('container').addClass('ez-view-discoverybarview');
            return Y.eZ.DiscoveryBarView.superclass.render.call(this);
        }
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
                            actionId: "minimizeDiscoveryBar",
                            disabled: false,
                            label: Y.eZ.trans('discoverybar.minimize', {}, 'bar'),
                            priority: 1000
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "viewSearch",
                            disabled: false,
                            label: Y.eZ.trans('discoverybar.search', {}, 'bar'),
                            priority: 900
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "browse",
                            disabled: false,
                            label: Y.eZ.trans('discoverybar.browse', {}, 'bar'),
                            priority: 800
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "viewTrash",
                            disabled: false,
                            label: Y.eZ.trans('discoverybar.trash', {}, 'bar'),
                            priority: 600
                        }),
                    ];
                }
            },
        }
    });
});

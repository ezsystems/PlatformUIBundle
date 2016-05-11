/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockbaseviewplugin', function (Y) {
    'use strict';

    /**
     * Provides the dashboard base block view plugin class
     *
     * @module ez-dashboardblockbaseviewplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The dashboard base block view plugin
     *
     * @namespace eZ.Plugin
     * @class DashboardBlockBaseView
     * @constructor
     * @extends Base
     */
    Y.eZ.Plugin.DashboardBlockBaseView = Y.Base.create('baseDashboardBlockViewPlugin', Y.Base, [], {
        initializer: function () {
            this.after('hostChange', this._addBlock);
        },

        /**
         * Adds a block to a dashboard view instance
         *
         * @method _addBlock
         * @protected
         */
        _addBlock: function () {
            this.get('host').addBlock(this.get('block'));
        }
    }, {
        NS: 'DashboardBlockBaseViewPlugin',
        ATTRS: {
            /**
             * The dashboard base block view instance
             *
             * @attribute block
             * @type Y.eZ.DashboardBlockBaseView
             */
            block: {
                valueFn: function () {
                    return new Y.eZ.DashboardBlockBaseView();
                }
            },
        }
    });
});

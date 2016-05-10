/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-allcontent-dashboardblockviewplugin', function (Y) {
    'use strict';

    /**
     * Provides the all content dashboard block view plugin class
     *
     * @module ez-allcontent-dashboardblockviewplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The all content dashboard block view plugin
     *
     * @namespace eZ.Plugin
     * @class AllContentDashboardBlockView
     * @constructor
     * @extends eZ.Plugin.BaseDashboardBlockView
     */
    Y.eZ.Plugin.AllContentDashboardBlockView = Y.Base.create('allContentDashboardBlockViewPlugin', Y.eZ.Plugin.BaseDashboardBlockView, [], {}, {
        NS: 'AllContentDashboardBlockViewPlugin',
        ATTRS: {
            /**
             * The all content dashboard block view instance
             *
             * @attribute block
             * @type Y.eZ.AllContentDashboardBlockView
             */
            block: {
                valueFn: function () {
                    return new Y.eZ.AllContentDashboardBlockView({priority: 1});
                }
            }
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.AllContentDashboardBlockView, ['dashboardBlockBasedView']
    );
});

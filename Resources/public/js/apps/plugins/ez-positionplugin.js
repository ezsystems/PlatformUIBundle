/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-positionplugin', function (Y) {
    "use strict";
    /**
     * Provides the position plugin
     *
     * @module ez-positionplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The position plugin is responsible for handling the `heightChange` events
     * to adjust the margin of the main views node so that the navigation hub
     * and notification hub views don't overlap the main views. It also informs
     * the active view of its new position when a heightChange event is caught.
     *
     * @namespace eZ.Plugin
     * @class Position
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.Position = Y.Base.create('positionPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host');

            app.after('navigationHubView:heightChange', function (e) {
                var notificationContainer = app.get('container').one('.ez-notification-container');

                notificationContainer.setStyle(
                    'top',
                    (parseInt(notificationContainer.getStyle('top'), 10) + e.height.offset) + 'px'
                );
            });

            app.after('*:heightChange', function (e) {
                var mainViews = app.get('container').one('.ez-mainviews'),
                    activeView = app.get('activeView');

                mainViews.setStyle(
                    'marginTop',
                    (parseInt(mainViews.getStyle('marginTop'), 10) + e.height.offset) + 'px'
                );
                if ( activeView && activeView.refreshTopPosition ) {
                    activeView.refreshTopPosition(e.height.offset);
                }
            });
        },
    }, {
        NS: 'position',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.Position, ['platformuiApp']
    );
});

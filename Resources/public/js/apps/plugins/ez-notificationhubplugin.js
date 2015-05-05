/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationhubplugin', function (Y) {
    "use strict";
    /**
     * Provides the notification hub plugin
     *
     * @module ez-notificationhubplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The notification hub plugin for the application. It is responsible for
     * catching the `notify` events and to give the corresponding notification
     * to the notification hub view service.
     *
     * @namespace eZ.Plugin
     * @class NotificationHub
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.NotificationHub = Y.Base.create('notificationHubPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host');

            app.on('ready', function () {
                app.showSideView('notificationHub');
            });

            app.on('*:notify', function (e) {
                app.showSideView('notificationHub', {notification: e.notification});
            });
        },
    }, {
        NS: 'notificationHub',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.NotificationHub, ['platformuiApp']
    );
});

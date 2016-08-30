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

            app.on('*:notify', Y.bind(function (e) {
                var notification = e.notification;

                if ( notification.state === 'error' ) {
                    this._checkIsLoggedIn(
                        this._logOut,
                        Y.bind(this._showNotification, this, e.notification)
                    );
                } else {
                    this._showNotification(e.notification);
                }
            }, this));
        },

        /**
         * Checks if the user is logged in and call the corresponding callback.
         *
         * @private
         * @method _checkIsLoggedIn
         * @param {Function} notLoggedInCallback
         * @param {Function} loggedInCallback
         */
        _checkIsLoggedIn: function (notLoggedInCallback, loggedInCallback) {
            var app = this.get('host');

            app.set('loading', true);
            app.isLoggedIn(Y.bind(function (notLoggedIn) {
                if ( notLoggedIn ) {
                    notLoggedInCallback.apply(this);
                    return;
                }
                app.set('loading', false);
                loggedInCallback.apply(this);
            }, this));
        },

        /**
         * Logs out the user and redirect to the login form.
         *
         * @method _logOut
         * @private
         */
        _logOut: function () {
            var app = this.get('host');

            app.logOut(function () {
                app.navigateTo('loginForm');
            });
        },

        /**
         * Shows the notification in the notification hub.
         *
         * @method _showNotification
         * @param {Object} notification
         * @protected
         */
        _showNotification: function (notification) {
            this.get('host').showSideView('notificationHub', {notification: notification});
        },
    }, {
        NS: 'notificationHub',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.NotificationHub, ['platformuiApp']
    );
});

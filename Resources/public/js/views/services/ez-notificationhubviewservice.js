/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationhubviewservice', function (Y) {
    "use strict";
    /**
     * Provides the notification hub view service
     *
     * @method ez-notificationhubviewservice
     */

    /**
     * The notification hub view service. It is responsible for adding or
     * updating the notifications in the notification list.
     *
     * @namespace eZ
     * @class NotificationHubViewService
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NotificationHubViewService = Y.Base.create('notificationHubViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        initializer: function () {
            this.after('parametersChange', function () {
                var parameters = this.get('parameters');

                if ( parameters.notification ) {
                    this._handleNotification(parameters.notification);
                }
            });
        },

        /**
         * Updates or creates a new notification in the list.
         *
         * @method _handleNotification
         * @protected
         * @param {eZ.Notification} notification
         */
        _handleNotification: function (notification) {
            var list = this.get('notificationList'),
                existing = list.getById(notification.identifier);

            if ( existing ) {
                existing.setAttrs(notification);
            } else {
                list.add(notification);
            }
        },

        _getViewParameters: function () {
            return {
                notificationList: this.get('notificationList'),
            };
        },
    }, {
        ATTRS: {
            /**
             * The notification list for the application
             *
             * @attribute notificationList
             * @readOnly
             * @type {eZ.NotificationList}
             */
            notificationList: {
                readOnly: true,
                valueFn: function () {
                    return new Y.eZ.NotificationList();
                },
            },
        },
    });
});

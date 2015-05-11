/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationhubview', function (Y) {
    "use strict";
    /**
     * Provides the notification hub view class
     *
     * @method ez-notificationhubview
     */

    /**
     * The notification hub view.
     *
     * @namespace eZ
     * @class NotificationHubView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NotificationHubView = Y.Base.create('notificationHubView', Y.eZ.View, [Y.eZ.HeightChange], {
        initializer: function () {
            this.containerTemplate = '<ul class="ez-view-notificationhubview"/>';
            /**
             * Array of the currently rendered notification views.
             *
             * @property _notificationViews
             * @type {Array}
             * @protected
             */
            this._notificationViews = [];
        },

        /**
         * Subscribes to the `add` and `remove` events on the notification list
         * so that the view is in sync with the list.
         *
         * @method _setListEventHandlers
         * @param {eZ.NotificationList} list
         * @protected
         */
        _setListEventHandlers: function (list) {
            list.on('add', Y.bind(function (e) {
                var oldHeight = this._getContainerHeight();

                this._addNotificationView(e.model);
                this._fireHeightChange(
                    oldHeight, this._getContainerHeight()
                );
            }, this));

            list.on('remove', Y.bind(function (e) {
                var oldHeight = this._getContainerHeight(),
                    newHeight = oldHeight;

                newHeight -= this._removeNotificationView(e.model);
                this._fireHeightChange(
                    oldHeight, newHeight
                );
            }, this));
        },

        /**
         * Adds a notification view for a new Notification model in the list.
         * The view is directly rendered and added to the hub view container.
         *
         * @method _addNotificationView
         * @protected
         * @param {eZ.Notification} notification
         */
        _addNotificationView: function (notification) {
            var view = new Y.eZ.NotificationView({
                    notification: notification,
                    bubbleTargets: this,
                });

            this._notificationViews.push(view);
            this.get('container').append(view.render().get('container'));
            view.set('active', true);
        },

        /**
         * Removes the notification view corresponding to the given notification
         * model from the internal view list.
         *
         * @method _removeNotificationView
         * @protected
         * @param {eZ.Notification} notification
         * @return {Number} the height in pixel of the removed view
         */
        _removeNotificationView: function (notification) {
            var height;

            this._notificationViews = Y.Array.filter(this._notificationViews, function (view) {
                var keep = view.get('notification') !== notification;

                if ( !keep ) {
                    height = view.get('container').get('offsetHeight');
                    view.vanish();
                }
                return keep;
            }, this);
            return height;
        },

        render: function () {
            this.get('notificationList').each(function (notification) {
                this._addNotificationView(notification);
            }, this);
            return this;
        },
    }, {
        ATTRS: {
            /**
             * The notification model list to display
             *
             * @attribute notificationList
             * @type {eZ.NotificationList}
             * @writeOnce
             */
            notificationList: {
                writeOnce: true,
                setter: '_setListEventHandlers',
            },
        },
    });
});

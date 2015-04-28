/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationview', function (Y) {
    "use strict";
    /**
     * Provides the notification view class
     *
     * @method ez-notificationview
     */

    /**
     * The notification view.
     *
     * @namespace eZ
     * @class NotificationView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NotificationView = Y.Base.create('notificationView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-notification-close': {
                'tap': '_closeNotification',
            }
        },

        /**
         * tap event handler on the close notification link. It destroys the
         * corresponding notification model.
         *
         * @method _closeNotification
         * @param {EventFacade} e
         * @protected
         */
        _closeNotification: function (e) {
            e.preventDefault();
            this.get('notification').destroy();
        },

        initializer: function () {
            var notification = this.get('notification');

            this.containerTemplate = '<li class="' + this._generateViewClassName(this._getName()) + '"/>';

            notification.on('destroy', Y.bind(function () {
                // TODO animate the destruction for a nicer UX/UI
                this.destroy({remove: true});
            }, this));
            notification.after('stateChange', Y.bind(function (e) {
                this._uiChangeState(e.prevVal, e.newVal);
            }, this));
            notification.after('textChange', Y.bind(function () {
                this._uiChangeText(notification.get('text'));
            }, this));
        },

        /**
         * Returns the state class from the given state string
         *
         * @method _getStateClass
         * @protected
         * @param {String} state
         */
        _getStateClass: function (state) {
            return 'is-state-' + state;
        },

        /**
         * Set and unset the state class on the container depending on the
         * prevState and newState parameters
         *
         * @protected
         * @method _uiChangeState
         * @param {String} prevState
         * @param {String} newState
         */
        _uiChangeState: function (prevState, newState) {
            var container = this.get('container');

            if ( prevState ) {
                container.removeClass(this._getStateClass(prevState));
            }
            if ( newState ) {
                container.addClass(this._getStateClass(newState));
            }
        },

        /**
         * Updates the displayed notification text
         *
         * @method _uiChangeText
         * @param {String} text
         * @protected
         */
        _uiChangeText: function (text) {
            this.get('container').one('.ez-notification-text').setContent(text);
        },

        render: function () {
            var container = this.get('container');

            this._uiChangeState(null, this.get('notification').get('state'));
            container.setHTML(this.template({
                notification: this.get('notification').toJSON(),
            }));
            return this;
        },
    }, {
        ATTRS: {
            /**
             * The notification model to displayed
             *
             * @attribute notification
             * @type {eZ.Notification}
             * @required
             */
            notification: {
                writeOnce: 'initOnly',
            },
        },
    });
});

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

    var IS_ACTIVE = 'is-active';

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
                'tap': function (e) {
                    e.preventDefault();
                    this._closeNotification();
                }
            }
        },

        /**
         * Closes the notification view by destroying the corresponding
         * Notification object.
         *
         * @method _closeNotification
         * @protected
         */
        _closeNotification: function (e) {
            this.get('notification').destroy();
        },

        initializer: function () {
            var notification = this.get('notification');

            /**
             * Stores the auto hide timer returned by Y.later.
             *
             * @property _autohideTimer
             * @type {Object|Null}
             * @protected
             */
            this._autohideTimer = null;
            this.containerTemplate = '<li class="' + this._generateViewClassName(this._getName()) + '"/>';

            notification.after('stateChange', Y.bind(function (e) {
                this._uiChangeState(e.prevVal, e.newVal);
            }, this));
            notification.after('textChange', Y.bind(function () {
                this._uiChangeText(notification.get('text'));
            }, this));

            notification.after('destroy', Y.bind(this._stopAutohide, this));

            this.after('activeChange', function (e) {
                if ( this.get('active') ) {
                    this.get('container').addClass(IS_ACTIVE);
                    this._setAutohide();
                    notification.after(
                        'timeoutChange',
                        Y.bind(this._setAutohide, this)
                    );
                } else {
                    this.get('container').removeClass(IS_ACTIVE);
                }
            });
        },

        /**
         * Creates a timer so that the notification is automatically hidden
         * after its timeout. An already existing timer if any is stopped
         *
         * @method _setAutohide
         * @protected
         */
        _setAutohide: function () {
            var timeout = this.get('notification').get('timeout');

            this._stopAutohide();
            if ( timeout ) {
                this._autohideTimer = Y.later(timeout * 1000, this, this._closeNotification);
            }
        },

        /**
         * Stops the auto hide timer if any
         *
         * @method _stopAutohide
         * @protected
         */
        _stopAutohide: function () {
            if ( this._autohideTimer ) {
                this._autohideTimer.cancel();
            }
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

        /**
         * Hides the notification view and destroys the view after the CSS
         * transition has been executed.
         *
         * @method vanish
         */
        vanish: function () {
            this.get('container').onceAfter(['webkitTransitionEnd', 'transitionend'], Y.bind(function () {
                this.destroy({remove: true});
            }, this));
            this.set('active', false);
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

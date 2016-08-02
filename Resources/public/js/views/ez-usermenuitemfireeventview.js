/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermenuitemfireeventview', function (Y) {
    "use strict";
    /**
     * Provides the user menu item fire event view
     *
     * @module ez-usermenuitemfire event view
     */
    Y.namespace('eZ');

    /**
     * The user menu item fire event view. 
     *
     * @namespace eZ
     * @class UserMenuItemFireEventView
     * @constructor
     * @extends eZ.UserMenuItemView
     */
    Y.eZ.UserMenuItemFireEventView = Y.Base.create('UserMenuItemFireEventView', Y.eZ.UserMenuItemView, [], {
        events: {
            '.ez-view-usermenuitemfireeventview': {
                'tap': '_fireEvent'
            }
        },

        initializer: function () {
            var dataEvent = 'data-event-name="' + this.get('eventName') + '"';

            this.containerTemplate = '<li class="' + this._generateViewClassName(this._getName()) + '" ' + dataEvent + '/>';

            this.on('addedToUserMenu', this._addUserMenuHideOnEvent, this);
        },

        /**
        * Renders the item view
        *
        * @method render
        * @return {eZ.UserMenuItemFireEventView} the view itself
        */
        render: function () {
            this.get('container').setHTML(this.template({title: this.get('title')}));
            return this;
        },

        /**
         * Adds the event listener to hide the user menu
         *
         * @method _addUserMenuHideOnEvent
         * @protected
         * @param event {Object} event facade
         */
        _addUserMenuHideOnEvent: function (event) {
            this.on(this.get('eventName'), Y.bind(event.userMenu.hide, event.userMenu));
        },

        /**
         * Tap event handler on the user menu item
         *
         * @method _fireEvent
         * @protected
         * @param event {Object} tap event facade
         */
        _fireEvent: function (event) {
            event.preventDefault();
            this.fire(this.get('eventName'), {
                originalEvent: event
            });
        }
    }, {
        ATTRS: {
            /**
             * The event name to fire
             *
             * @attribute eventName
             * @type {String}
             */
            eventName: {}
        }
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermenuview', function (Y) {
    'use strict';
    /**
     * Provides the User Menu View class
     *
     * @module ez-usermenuview
     */
    Y.namespace('eZ');

    var CLASS_HIDDEN = 'is-user-menu-hidden';

    /**
     * The User Menu view
     *
     * @namespace eZ
     * @class UserMenuView
     * @constructor
     * @extends eZ.View
     */
    Y.eZ.UserMenuView = Y.Base.create('userMenuView', Y.eZ.View, [], {
        initializer: function () {
            this.containerTemplate = '<ul class="ez-view-usermenuview ' + CLASS_HIDDEN + '"/>';

            this.on('displayedChange', this._uiToggleUserMenu);
            this.on('activeChange', this._setActiveViews);
        },

        /**
         * Renders the user menu view
         *
         * @method render
         * @return {eZ.UserMenuView} the view itself
         */
        render: function () {
            this._renderMenuItems();

            return this;
        },

        /**
         * Toggles the displayed value.
         *
         * @method toggleDisplayed
         * @public
         */
        toggleDisplayed: function () {
            this._set('displayed', !this.get('displayed'));
        },

        /**
         * Hides the user menu.
         *
         * @method hide
         * @public
         */
        hide: function () {
            this._set('displayed', false);
        },

        /**
         * Toggles the visibility of a user menu.
         *
         * @method _uiToggleUserMenu
         * @protected
         * @param event {Object} event facade
         */
        _uiToggleUserMenu: function (event) {
            var userMenu = this.get('container');

            if (event.newVal) {
                userMenu.removeClass(CLASS_HIDDEN);
            } else {
                userMenu.addClass(CLASS_HIDDEN);
            }
        },

        /**
         * Sets active flag to the item view
         *
         * @method _setActiveViews
         * @protected
         * @param event {Object} event facade
         */
        _setActiveViews: function (event) {
            var items = this.get('items');

            items.forEach(function (item) {
                item.set('active', event.newVal);
            });
        },

        /**
         * Renders menu items views
         *
         * @method _renderMenuItems
         * @protected
         */
        _renderMenuItems: function () {
            var menuItemsContainer = this.get('container'),
                items = this.get('items');

            items.sort(function (a, b) {
                return b.get('priority') - a.get('priority');
            });

            items.forEach(Y.bind(function (item) {
                menuItemsContainer.append(item.render().get('container'));
            }, this));
        },

        /**
         * Adds item to the menu and fire event when it's done
         *
         * @method addMenuItem
         * @public
         * @param view {Object}
         */
        addMenuItem: function (view) {
            var items = this.get('items');

            items.push(view);

            view.addTarget(this);

            /**
             * Fired when the view is added to the user menu
             *
             * @event addedToUserMenu
             * @param userMenu {Object} the user menu view
             */
            view.fire('addedToUserMenu', {
                userMenu: this,
            });
        },
    }, {
        ATTRS: {
            /**
             * Contains the views for the user menu items
             *
             * @attribute items
             * @type {Array}
             */
            items: {
                valueFn: function () {
                    return [
                        new Y.eZ.UserMenuItemFireEventView({
                            bubbleTargets: this,
                            title: "Logout",
                            eventName: 'logOut',
                        }),
                    ];
                }
            },

            /**
             * Whether the user menu is displayed or not
             *
             * @attribute displayed
             * @type Boolean
             * @default false
             * @readOnly
             */
            displayed: {
                value: false,
                readOnly: true
            }
        }
    });
});

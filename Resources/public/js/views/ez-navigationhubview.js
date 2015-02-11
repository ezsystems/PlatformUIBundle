/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubview', function (Y) {
    "use strict";
    /**
     * Provides the navigation hub view
     *
     * @module ez-navigationhubview
     */
    Y.namespace('eZ');

    var L = Y.Lang,
        FIXED_NAVIGATION = 'is-navigation-fixed',
        NAVIGATION_HIDDEN = 'is-navigation-hidden',
        SUB_MENU_OPEN = 'is-sub-menu-open',
        NAVIGATION_SEL = '.ez-navigation',
        DEFAULT_ACTIVE_NAV = 'create',
        ACTIVE_NAVIGATION_TPL = 'ez-navigation-{identifier}',
        ZONE_ACTIVE = 'is-zone-active';

    /**
     * The navigation hub view
     *
     * @namespace eZ
     * @class NavigationHubView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NavigationHubView = Y.Base.create('navigationHubView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-zone': {
                'tap': '_setNavigation',
            },
            '.ez-sub-menu-link': {
                'mouseover': '_uiShowSubMenu',
                'mouseout': '_uiHideSubMenu',
                'tap': '_uiToggleSubMenu',
            },
            '.ez-logout': {
                'tap': '_logOut',
            }
        },

        /*
         * The currently active navigation menu
         *
         * @property _navigationMenu
         * @default null
         * @type {Node}
         */
        _navigationMenu: null,

        /**
         * The y coordinate of the active menu when the navigation is not fixed.
         *
         * @property _navigationY
         * @default 0
         * @type Number
         */
        _navigationY: 0,

        /**
         * The scroll event subscription set to manage the fixed navigation
         *
         * @property
         * @default null
         * @type EventHandle
         */
        _scrollSubscription: null,

        /**
         * The resize event subscription set to manage the width of the
         * navigation
         *
         * @property _resizeSubscription
         * @default null
         * @type EventHandle
         */
        _resizeSubscription: null,

        initializer: function () {
            this.after('activeNavigationChange', this._uiSetActiveNavigation);
            this.after('navigationFixedChange', this._uiHandleFixedNavigation);
            this.after('activeChange', this._onActiveUpdate);
        },

        /**
         * Sets the active navigation in the UI
         *
         * @method _uiSetActiveNavigation
         * @protected
         */
        _uiSetActiveNavigation: function () {
            this._uiSetActiveZone();
            this._uiShowNavigation();
            this._uiNavigationSize();
        },

        /**
         * Handles the fixed navigation in the UI
         *
         * @method _uiHandleFixedNavigation
         * @protected
         * @param {Object} e event facade
         */
        _uiHandleFixedNavigation: function (e) {
            var container = this.get('container');

            if ( e.newVal ) {
                container.addClass(FIXED_NAVIGATION);
            } else {
                container.removeClass(FIXED_NAVIGATION);
            }
            /**
             * event fired when the navigation mode change so that the rest of
             * the application can also change if needed. For the navigation
             * hub, the navigation mode is either true or false. True when the
             * navigation is fixed and false otherwise.
             *
             * @event navigationModeChange
             * @param navigation navigation mode info
             * @param navigation.modeClass the class to add on the app container
             * @param navigation.value the new value of the navigation mode
             */
            this.fire('navigationModeChange', {
                navigation: {
                    modeClass: 'is-navigationhubview-fixed',
                    value: e.newVal
                }
            });
        },

        /**
         * Marks the zone associated with the activeNavigation as active
         *
         * @protected
         * @method _uiSetActiveZone
         */
        _uiSetActiveZone: function () {
            var container = this.get('container'),
                active = container.one('.' + ZONE_ACTIVE);

            if ( active ) {
                active.removeClass(ZONE_ACTIVE);
            }
            container.one('.ez-' + this.get('activeNavigation') + '-zone').addClass(ZONE_ACTIVE);
        },

        /**
         * Renders the navigation hub view
         *
         * @method render
         * @return {eZ.NavigationHubView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                user: this.get('user').toJSON(),
                menus: this.get('navigationMenus')
            }));

            this._setNavigationMenu(this.get('activeNavigation'));
            this._uiSetActiveNavigation();
            return this;
        },

        _onActiveUpdate: function (e) {
            var fixed = this.get('navigationFixed');

            if ( e.newVal ) {
                this._scrollSubscription = Y.on('scroll', Y.bind(this._handleScroll, this));
                this._resizeSubscription = Y.on('resize', Y.bind(this._uiNavigationSize, this));
                this.set('navigationFixed', false);
                this._navigationY = this.get('container').one(NAVIGATION_SEL).getY();
                this.set('navigationFixed', fixed);
                this._uiNavigationSize();
            } else {
                this._scrollSubscription.detach();
                this._resizeSubscription.detach();
            }
        },

        /**
         * Makes sure the navigation corresponding to the activeNavigation value
         * is shown
         *
         * @protected
         * @method _uiShowNavigation
         */
        _uiShowNavigation: function () {
            var navigations = this.get('container').one(NAVIGATION_SEL).get('children'),
                navClass = L.sub(ACTIVE_NAVIGATION_TPL, {identifier: this.get('activeNavigation')});

            navigations.each(function (nav) {
                if ( nav.hasClass(navClass) ) {
                    nav.removeClass(NAVIGATION_HIDDEN);
                } else {
                    nav.addClass(NAVIGATION_HIDDEN);
                }
            });
        },

        /**
         * tap/mouseover handler on the navigation zones. It sets the
         * activeNavigation attribute to the corresponding value
         *
         * @protected
         * @method _setNavigation
         * @param {Object} e event facade
         */
        _setNavigation: function (e) {
            this.set('activeNavigation', e.currentTarget.getAttribute('data-navigation'));
        },

        /**
         * Handles the user scroll to make the navigation fixed or not
         *
         * @protected
         * @method _handleScroll
         * @param {Object} e event facade
         */
        _handleScroll: function (e) {
            var navigation = this.get('container').one(NAVIGATION_SEL);

            if ( navigation.get('docScrollY') > this._navigationY ) {
                this.set('navigationFixed', true);
                this.set('activeNavigation', DEFAULT_ACTIVE_NAV); // TODO should depend on the app activeView
            } else {
                this.set('navigationFixed', false);
            }
        },

        /**
         * Makes sure all the active navigation items are available in the menu.
         * If there's too much items, the overflowed elements are put in the
         * *more* sub menu
         *
         * @method _uiNavigationSize
         * @protected
         */
        _uiNavigationSize: function (e) {
            var items, item,
                more = this._navigationMenu.one('.ez-more'),
                moreMenu = more.one('.ez-sub-menu'),
                moreItems = moreMenu.all('li');

            while ( this._navigationUnderflowed() ) {
                if ( moreItems.isEmpty() ) {
                    this._navigationMenu.removeClass('has-more');
                    break;
                } else {
                    item = moreItems.shift();
                    this._navigationMenu.insert(item, more);
                }
            }
            items = this._getNavigationItems();
            while ( !items.isEmpty() && this._navigationOverflowed() ) {
                this._navigationMenu.addClass('has-more');
                item = items.pop();
                moreMenu.prepend(item);
            }
        },

        /**
         * Checks whether there are too much items in the navigation for the
         * current viewport size
         *
         * @protected
         * @method _navigationOverflowed
         * @return Boolean
         */
        _navigationOverflowed: function () {
            return this._navigationMenu.get('scrollWidth') > this._navigationMenu.get('offsetWidth');
        },

        /**
         * Checks whether the navigation is not completely filled up
         *
         * @protected
         * @method _navigationUnderflowed
         * @return Boolean
         */
        _navigationUnderflowed: function () {
            return this._navigationMenu.get('scrollWidth') <= this._navigationMenu.get('offsetWidth');
        },

        /**
         * Returns all navigation items except the *More* item
         *
         * @method _getNavigationItems
         * @protected
         * @return NodeList
         */
        _getNavigationItems: function () {
            return this._navigationMenu.all('> li:not(.ez-more)');
        },

        /**
         * mouseover event handler for the sub menu links to show and place
         * the corresponding sub menu
         *
         * @method _uiShowSubMenu
         * @protected
         * @param {Object} e event facade
         */
        _uiShowSubMenu: function (e) {
            var link = e.currentTarget,
                subMenu = link.one('.ez-sub-menu');

            link.addClass(SUB_MENU_OPEN);
            subMenu.setStyle('min-width', link.get('offsetWidth') + 'px');
            subMenu.setXY([
                link.getX(),
                link.getY() + link.get('offsetHeight')
            ]);
            // make sure the menu is fully in the view port
            if ( !subMenu.inViewportRegion(Y.config.doc) ) {
                subMenu.setX(subMenu.get('winWidth') - subMenu.get('offsetWidth'));
            }
            this._clickOutsideSubscription = link.on('clickoutside', Y.bind(this._uiHideSubMenu, this));
        },

        /**
         * mouseout/clickoutside event handler for the sub menu links to hide
         * the corresponding sub menu
         *
         * @method _uiHideSubMenu
         * @protected
         * @param {Object} e event facade
         */
        _uiHideSubMenu: function (e) {
            e.currentTarget.removeClass(SUB_MENU_OPEN);
            this._clickOutsideSubscription.detach();
        },

        /**
         * Toggles the sub menu visibility
         *
         * @protected
         * @method _uiToggleSubMenu
         * @param {Object} e event facade
         */
        _uiToggleSubMenu: function (e) {
            if ( e.currentTarget.hasClass(SUB_MENU_OPEN) ) {
                this._uiHideSubMenu(e);
            } else {
                this._uiShowSubMenu(e);
            }
        },

        /**
         * Tap event handler on the logout link
         *
         * @method _logOut
         * @protected
         * @param e {Object} tap event facade
         */
        _logOut: function (e) {
            e.preventDefault();
            this.fire('logOut', {
                originalEvent: e
            });
        },

        /**
         * Sets the _navigationMenu property depending on the val parameter.
         *
         * @method _setNavigationMenu
         * @private
         * @param val {String}
         * @return {String} val
         */
        _setNavigationMenu: function (val) {
            this._navigationMenu = this.get('container').one(
                '.' + L.sub(ACTIVE_NAVIGATION_TPL, {identifier: val})
            );
            return val;
        },
    }, {
        ATTRS: {
            /**
             * Contains the identifier ('create', 'optimize', ...) of the
             * currently active navigation. When set, this attribute updates the
             * `_navigationMenu` property with the corresponding Node
             *
             * @attribute activeNavigation
             * @type String
             * @default null
             * @required
             */
            activeNavigation: {
                setter: '_setNavigationMenu',
                value: DEFAULT_ACTIVE_NAV,
            },

            /**
             * Whether the navigation is in fixed more or not
             *
             * @attribute navigationFixed
             * @type Boolean
             * @default false
             */
            navigationFixed: {
                value: false
            },

            /**
             * The currently authenticated user
             *
             * @attribute user
             * @type eZ.User
             * @required
             */
            user: {},

            /**
             * Contains an object filled with menu links
             * assigned to the tab
             *
             * @attribute navigationMenus
             * @type Object
             * @required
             */
            navigationMenus: {}
        }
    });
});

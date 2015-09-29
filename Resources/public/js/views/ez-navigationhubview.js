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
        NAVIGATION_NODE_CLASS_TPL = 'ez-navigation-{identifier}',
        ZONE_ACTIVE = 'is-zone-active';

    /**
     * The navigation hub view
     *
     * @namespace eZ
     * @class NavigationHubView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NavigationHubView = Y.Base.create('navigationHubView', Y.eZ.TemplateBasedView, [Y.eZ.HeightChange], {
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
            this.after('activeNavigationChange', function (e) {
                var oldHeight;

                if ( this.get('active') ) {
                    oldHeight = this._getContainerHeight();
                    this._uiSetActiveNavigation(e.prevVal);
                    this._navigateToZone(e.newVal);
                    this._fireHeightChange(oldHeight, this._getContainerHeight());
                }
            });
            this.after('navigationFixedChange', this._uiHandleFixedNavigation);
            this.after('activeChange', this._onActiveUpdate);
            this.after('matchedRouteChange', this._handleSelectedItem);
        },

        /**
         * Returns the height of the navigation menu
         *
         * @protected
         * @method _getNavigationHeight
         * @return {Number}
         */
        _getNavigationHeight: function () {
            return this.get('container').one(NAVIGATION_SEL).get('offsetHeight');
        },

        /**
         * matchedRouteChange event handler. It makes sure the corresponding
         * navigation item is selected and the zone in which it is, is active.
         *
         * @method _handleSelectedItem
         * @protected
         */
        _handleSelectedItem: function () {
            var matchedRoute = this.get('matchedRoute'),
                activeZone = null;

            Y.Object.each(this.get('zones'), function (zone, key) {
                var inZone = false;

                Y.Array.each(this._getNavigationItemViews(key), function (item) {
                    inZone = (item.matchRoute(matchedRoute) || inZone);
                });
                if ( inZone ) {
                    activeZone = key;
                }
            }, this);
            this.set('activeNavigation', activeZone);
        },

        /**
         * Fires the event to navigate to the given zone. The navigation happens
         * only if the zone has exactly one navigation items.
         *
         * @method _navigateToZone
         * @param {String|Null} zone
         * @method protected
         */
        _navigateToZone: function (zone) {
            var items;

            if ( !zone ) {
                return;
            }

            items = this._getNavigationItemViews(zone);
            if ( items && items.length === 1 ) {
                this.fire('navigateTo', {
                    route: items[0].get('route')
                });
            }
        },

        /**
         * Sets the active navigation in the UI
         *
         * @method _uiSetActiveNavigation
         * @param {String|Null} previousZone the previously active zone
         * @protected
         */
        _uiSetActiveNavigation: function (previousZone) {
            this._uiSetActiveZone();
            this._uiShowNavigation(previousZone);
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
            var container = this.get('container'),
                oldHeight;

            if ( e.newVal ) {
                oldHeight = this._getContainerHeight();
                container.addClass(FIXED_NAVIGATION);
                this._fireHeightChange(
                    oldHeight,
                    this._getNavigationHeight()
                );
            } else {
                oldHeight = this._getNavigationHeight();
                container.removeClass(FIXED_NAVIGATION);
                this._fireHeightChange(
                    oldHeight,
                    this._getContainerHeight()
                );
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
            if ( this.get('activeNavigation') ) {
                container.one('.ez-' + this.get('activeNavigation') + '-zone').addClass(ZONE_ACTIVE);
            }
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
                zones: this._buildZones(),
            }));
            this._renderNavigationItems();
            this._uiSetActiveNavigation();
            return this;
        },

        /**
         * Builds the zone list for the template. Each zone is represented by an
         * object with a `name` and a `hasNavigation` properties.
         *
         * @method _buildZones
         * @protected
         * @return {Object}
         */
        _buildZones: function () {
            var zones = {};

            Y.Object.each(this.get('zones'), function (zoneName, key) {
                zones[key] = {
                    name: zoneName,
                    hasNavigation: this._hasNavigation(key),
                };
            }, this);
            return zones;
        },

        /**
         * Returns whether the zone associated with the given key has a
         * navigation ie it has more than one navigation item view.
         *
         * @method _hasNavigation
         * @protected
         * @param {String} zoneKey
         * @return {Boolean}
         */
        _hasNavigation: function (zoneKey) {
            var items = this._getNavigationItemViews(zoneKey);

            return !!(items && items.length > 1);
        },

        /**
         * Returns the navigation item views instances associated with the given
         * zone key.
         *
         * @method _getNavigationItemViews
         * @protected
         * @param {String} zoneKey
         * @return {undefined|Array} of eZ.NavigationItemView
         */
        _getNavigationItemViews: function (zoneKey) {
            return this.get(zoneKey + 'NavigationItems');
        },

        /**
         * Renders the navigation items in the corresponding navigation zone
         *
         * @method _renderNavigationItems
         * @protected
         */
        _renderNavigationItems: function () {
            var that = this;

            Y.Object.each(this.get('zones'), function (zone, key) {
                var after = that._getNavigationNode(key).one('.ez-logo');

                Y.Array.each(that._getNavigationItemViews(key), function (view) {
                    after.insert(view.render().get('container'), 'after');
                    after = view.get('container');
                });
            });
        },

        _onActiveUpdate: function (e) {
            var fixed = this.get('navigationFixed');

            this._setNavigationItemActive(e.newVal);
            if ( e.newVal ) {
                this._scrollSubscription = Y.on('scroll', Y.bind(this._handleScroll, this));
                this._resizeSubscription = Y.on('resize', Y.bind(this._uiNavigationSize, this));
                this._fireHeightChange(0, this._getContainerHeight());
                this.set('navigationFixed', false);
                this._navigationY = this.get('container').one(NAVIGATION_SEL).getY();
                this.set('navigationFixed', fixed);
                this._uiNavigationSize();
            } else {
                this.set('navigationFixed', false);
                this._fireHeightChange(this._getContainerHeight(), 0);
                this._scrollSubscription.detach();
                this._resizeSubscription.detach();
            }
        },

        /**
         * Sets the active flag on the navigation item views
         *
         * @protected
         * @method _setNavigationItemActive
         * @param {Boolean} active
         */
        _setNavigationItemActive: function (active) {
            Y.Object.each(this.get('zones'), function (zone, key) {
                Y.Array.each(this._getNavigationItemViews(key), function (view) {
                    view.set('active', active);
                });
            }, this);
        },

        /**
         * Makes sure the navigation corresponding to the activeNavigation value
         * is shown if needed
         *
         * @protected
         * @method _uiShowNavigation
         * @param {String|Null} previousZone the previously active zone
         */
        _uiShowNavigation: function (previousZone) {
            if ( previousZone ) {
                this._getNavigationNode(previousZone).addClass(NAVIGATION_HIDDEN);
            }
            if ( this.get('activeNavigation') && this._hasNavigation(this.get('activeNavigation')) ) {
                this._getNavigationNode(this.get('activeNavigation')).removeClass(NAVIGATION_HIDDEN);
            }
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
            var items, item, more, moreMenu, moreItems;

            if ( !this._navigationMenu ) {
                return;
            }
            more = this._navigationMenu.one('.ez-more');
            moreMenu = more.one('.ez-sub-menu');
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
            if ( val ) {
                this._navigationMenu = this._getNavigationNode(val);
            } else {
                this._navigationMenu = null;
            }
            return val;
        },

        /**
         * Returns the navigation node corresponding to the identifier
         *
         * @param {String} identifier
         * @method _getNavigationNode
         * @protected
         * @return {Y.Node}
         */
        _getNavigationNode: function (identifier) {
            return this.get('container').one('.' + L.sub(NAVIGATION_NODE_CLASS_TPL, {identifier: identifier}));
        },

        /**
         * Builds the list of navigation item views based on the value. This
         * method is a setter for the *NavigationItems.
         *
         * @method _buildNavigationViews
         * @protected
         * @param {Array} value an array of plain object or Y.Views (see
         * attributes description)
         * @return {Array} of Y.View
         */
        _buildNavigationViews: function (value) {
            var res = [],
                that = this;

            Y.Array.each(value, function (struct) {
                var ViewConstructor, view;

                if ( struct instanceof Y.eZ.NavigationItemView ) {
                    view = struct;
                } else {
                    ViewConstructor = struct.Constructor;
                    view = new ViewConstructor(struct.config || {});
                }
                view.addTarget(that);
                res.push(view);
            });
            return res;
        },
    }, {
        ATTRS: {
            /**
             * Object describing the available zones (Platform, Studio), the
             * key is the zone identifier, the value is the zone name.
             *
             * @attribute zones
             * @type Object
             * @readOnly
             */
            zones: {
                value: {
                    'platform': 'Content',
                    'studio': 'Page',
                    'studioplus': 'Performance',
                    'admin': 'Admin Panel',
                },
                readOnly: true,
            },

            /**
             * Stores the navigation view item views instance for each item in
             * the navigation for the platform zone. This attribute accepts either
             * an array of already build views or an array of object with at a
             * `Constructor` property and optionally a `config` property holding
             * an object to pass to the constructor function.
             *
             * @attribute platformNavigationItems
             * @type Array of Y.View
             * @writeOnce
             */
            platformNavigationItems: {
                setter: '_buildNavigationViews',
                writeOnce: true,
            },

            /**
             * Stores the navigation view item views instance for each item in
             * the navigation for the studio zone. This attribute accepts either
             * an array of already build views or an array of object with at a
             * `Constructor` property and optionally a `config` property holding
             * an object to pass to the constructor function.
             *
             * @attribute studioNavigationItems
             * @type Array of Y.View
             * @writeOnce
             */
            studioNavigationItems: {
                setter: '_buildNavigationViews',
                writeOnce: true,
            },

            /**
             * Stores the navigation view item views instance for each item in
             * the navigation for the admin zone. This attribute accepts either
             * an array of already build views or an array of object with at a
             * `Constructor` property and optionally a `config` property holding
             * an object to pass to the constructor function.
             *
             * @attribute studioplusNavigationItems
             * @type Array of Y.View
             * @writeOnce
             */
            adminNavigationItems: {
                setter: '_buildNavigationViews',
                writeOnce: true,
            },

            /**
             * Stores the navigation view item views instance for each item in
             * the navigation for the studioplus zone. This attribute accepts either
             * an array of already build views or an array of object with at a
             * `Constructor` property and optionally a `config` property holding
             * an object to pass to the constructor function.
             *
             * @attribute studioplusNavigationItems
             * @type Array of Y.View
             * @writeOnce
             */
            studioplusNavigationItems: {
                setter: '_buildNavigationViews',
                writeOnce: true,
            },

            /**
             * Contains the identifier ('platform', 'studio', ...) of the
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
                value: null,
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
             * The matched route provided by the navigation hub view service. It
             * used to detect which navigaiton item should be selected and it is
             * updated after each page change.
             *
             * @attribute matchedRoute
             * @type {Object}
             */
            matchedRoute: {},
        }
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service component for the navigation hub
     *
     * @module ez-navigationhubviewservice
     */
    Y.namespace('eZ');

    var IDENTIFIER_CONTENT_STRUCTURE = 'content-structure';

    /**
     * Navigation hub view service.
     *
     * @namespace eZ
     * @class NavigationHubViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.NavigationHubViewService = Y.Base.create('navigationHubViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        initializer: function () {
            this.on('*:logOut', this._logOut);
            this.after('*:activeNavigationChange', this._navigateToFirstItemRoute);
            this.get('app').on('*:resetContentNavigationItem', this._resetContentNavigationItem, this);
        },

        /**
         * Updates content link in 'Content' navigation zone for current selected content
         *
         * @method _resetContentNavigationItem
         * @protected
         * @param {Event} event
         */
        _resetContentNavigationItem: function () {
            var contentItem = this.getNavigationItem(IDENTIFIER_CONTENT_STRUCTURE),
                matchedRoute = this._matchedRoute(),
                rootLocation = this.get('rootLocation'),
                rootLocationId = rootLocation.get('id'),
                rootLocationLang = rootLocation.get('contentInfo').get('mainLanguageCode');

            if (contentItem) {
                contentItem.set('route.params.id', rootLocationId);
                contentItem.set('route.params.languageCode', rootLocationLang);

                matchedRoute.parameters.id = rootLocationId;
                matchedRoute.parameters.languageCode = rootLocationLang;

                /**
                 * Simulating matched route change event (the event from the navigation hub view)
                 *
                 * @event matchedRouteChange
                 */
                this.fire('matchedRouteChange', {newVal: matchedRoute});
            }
        },

        /**
         * navigateTo event handler. it redirects the user to the given route.
         *
         * @method _navigateTo
         * @protected
         * @deprecated
         * @param {EventFacade} e
         */
        _navigateTo: function (e) {
            var route = e.route;

            console.log('[DEPRECATED] _navigateTo is deprecated');
            console.log('[DEPRECATED] this method will be removed from PlatformUI 2.0');
            this.get('app').navigateTo(route.name, route.params);
        },

        /**
         * logOut event handler, it logs out the user and redirect to the login
         * form.
         *
         * @method _logOut
         */
        _logOut: function () {
            var app = this.get('app');

            app.set('loading', true);
            app.logOut(function () {
                app.navigateTo('loginForm');
            });
        },

        /**
         * Returns true if a provided item is a NavigationItemView, false if item is a NavigationItemParameterView
         *
         * @method _isNavigationViewItem
         * @private
         * @param {Object} item
         * @return {Boolean}
         */
        _isNavigationViewItem: function (item) {
            return !!item.get;
        },

        /**
         * Redirects to the first item of the active zone
         *
         * @method _navigateToFirstItemRoute
         * @protected
         * @param {EventFacade} e
         * @param {String} e.newVal new value of `activeNavigation`
         */
        _navigateToFirstItemRoute: function (e) {
            var zone = this.get(e.newVal + 'NavigationItems'),
                firstItem,
                route;

            if (zone && zone.length > 0 && e.prevVal !== null) {
                firstItem = zone[0];

                if (this._isNavigationViewItem(firstItem)) {
                    route = firstItem.get('route');
                } else {
                    route = firstItem.config.route;
                }
                this.get('app').navigateTo(route.name, route.params);
            }
        },

        _load: function (next) {
            var api = this.get('capi'),
                loadError = false,
                service = this,
                discoveryService = api.getDiscoveryService(),
                contentService = api.getContentService(),
                user = this.get('app').get('user'),
                tasks = new Y.Parallel();

            if (user.get('avatar')) {
                contentService.loadImageVariation(user.get('avatar').variations.platformui_profileview.href, tasks.add(function (error, response) { //jshint ignore:line
                    if ( error && response.status !== 401 ) {
                        // 401 error is ignored because the user might not have the right to read
                        // his/her own avatar see https://jira.ez.no/browse/EZP-25522
                        loadError = true;
                        return;
                    }

                    service.set('userAvatar', response.document.ContentImageVariation);
                }));
            }

            discoveryService.getInfoObject('rootLocation', function (error, response){
                var rootLocationId;

                if ( error ) {
                    loadError = true;
                    return;
                }

                rootLocationId = response._href;

                service._loadLocation(rootLocationId, 'rootLocation', tasks.add(function (error) {
                    var params = {id: '', languageCode: ''};

                    if ( error ) {
                        loadError = true;
                        return;
                    }

                    params.id = service.get('rootLocation').get('id');
                    params.languageCode = service.get('rootLocation').get('contentInfo').get('mainLanguageCode');

                    service.getNavigationItem(IDENTIFIER_CONTENT_STRUCTURE).set(
                        'route',
                        {name: 'viewLocation', params: params}
                    );
                }));
            });

            discoveryService.getInfoObject('rootMediaFolder', function (error, response){
                var rootMediaLocationId;

                if ( error ) {
                    loadError = true;
                    return;
                }

                rootMediaLocationId = response._href;

                service._loadLocation(rootMediaLocationId, 'rootMediaLocation' , tasks.add(function (error){
                    var params = {id: '', languageCode: ''};

                    if ( error ) {
                        loadError = true;
                        return;
                    }

                    params.id = service.get('rootMediaLocation').get('id');
                    params.languageCode = service.get('rootMediaLocation').get('contentInfo').get('mainLanguageCode');

                    service.getNavigationItem('media-library').set(
                        'route',
                        {name: 'viewLocation', params: params}
                    );
                }));
            });

            tasks.done(function () {
                if ( loadError ) {
                    service._error(Y.eZ.trans('failed.to.load.root.locations', {}, 'navigationhub'));
                    return;
                }

                next(service);
            });
        },

        /**
         * Loads the given `locationId`
         *
         * @protected
         * @method _loadLocation
         * @param {Integer} locationId
         * @param {string} attributeName where data need to be loaded
         * @param {Function} callback the function to call when the location is loaded
         * @param {Boolean} callback.error the error, true if an error occurred
         * @param {ez.Location} callback.result the location object
         */
        _loadLocation: function (locationId, attributeName, callback) {
            var loadOptions = {
                    api: this.get('capi')
                },
                location = this.get(attributeName);

            location.set('id', locationId);

            location.load(loadOptions, callback);
        },

        /**
         * Returns a navigation item object. See the *NavigationItems attribute.
         *
         * @private
         * @method _getItem
         * @param {Function} constructor
         * @param {Object} config
         * @return {Object}
         */
        _getItem: function(constructor, config) {
            return {
                Constructor: constructor,
                config: config
            };
        },

        /**
         * Returns a navigation item object describing a {{#crossLink
         * "eZ.NavigationItemView"}}eZ.NavigationItemView{{/crossLink}}
         *
         * @private
         * @method _getNavigationItem
         * @param {String} title
         * @param {String} identifier
         * @param {String} routeName
         * @param {Object} routeParams
         * @return {Object}
         */
        _getNavigationItem: function (title, identifier, routeName, routeParams) {
            return this._getItem(
                Y.eZ.NavigationItemView, {
                    title: title,
                    identifier: identifier,
                    route: {
                        name: routeName,
                        params: routeParams
                    }
                }
            );
        },

        /**
         * Returns the navigation item object describing a {{#crossLink
         * "eZ.NavigationItemSubtreeView"}}eZ.NavigationItemSubtreeView{{/crossLink}}.
         *
         * @method _getSubtreeItem
         * @private
         * @param {String} title
         * @param {String} identifier
         * @param {String} locationId
         * @param {String} languageCode
         * @return {Object}
         */
        _getSubtreeItem: function (title, identifier, locationId, languageCode) {
            return new Y.eZ.NavigationItemSubtreeView( {
                title: title,
                identifier: identifier,
                route: {
                    name: 'viewLocation',
                    params: {
                        id: locationId,
                        languageCode: languageCode
                    }
                }
            });
        },

        /**
         * Returns a navigation item object describing a {{#crossLink
         * "eZ.NavigationItemParameterView"}}eZ.NavigationItemParameterView{{/crossLink}}
         *
         * @private
         * @method _getParameterItem
         * @param {String} title
         * @param {String} identifier
         * @param {String} routeName
         * @param {Object} routeParams
         * @param {String} matchParameter
         * @return {Object}
         */
        _getParameterItem: function (title, identifier, routeName, routeParams, matchParameter) {
            return this._getItem(
                Y.eZ.NavigationItemParameterView, {
                    title: title,
                    identifier: identifier,
                    route: {
                        name: routeName,
                        params: routeParams,
                    },
                    matchParameter: matchParameter
                }
            );
        },

        /**
         * Returns the parameters for the navigation hub view
         *
         * @method getViewParameters
         * @return {Object}
         */
        _getViewParameters: function () {
            return {
                user: this.get('app').get('user'),
                userAvatar: this.get('userAvatar'),
                platformNavigationItems: this.get('platformNavigationItems'),
                studioNavigationItems: this.get('studioNavigationItems'),
                adminNavigationItems: this.get('adminNavigationItems'),
                matchedRoute: this._matchedRoute(),
            };
        },

        /**
         * A matched route object from the request. This object will be used by
         * the navigation hub view to check which navigation item view is
         * selected. A matched route object is a clone of the application active
         * route without the service, serviceInstance and callbacks entries and
         * with an additional `parameters` property holding the route
         * parameters and their values.
         *
         * @method _matchedRoute
         * @protected
         * @return {Object}
         */
        _matchedRoute: function () {
            var request = this.get('request'),
                route = request.route,
                matchedRoute = Y.merge(route);

            matchedRoute.parameters = request.params;
            delete matchedRoute.service;
            delete matchedRoute.serviceInstance;
            delete matchedRoute.callbacks;

            return matchedRoute;
        },

        /**
         * Adds a navigation item for the given zone.
         * Note: adding a navigation item will only work before the first
         * initialization of the navigation hub. As a result, in a navigation
         * hub view service plugin, this method should be called only in or from
         * the initializer method.
         *
         * @method addNavigationItem
         * @param {Object} item a navigation item, see the description of the
         * *NavigationItems attributes
         * @param {String} zone the identifier of the zone
         */
        addNavigationItem: function (item, zone) {
            this.get(zone + 'NavigationItems').push(item);
        },

        /**
         * Removes a navigation item for the given zone.
         * Note: removing a navigation item will only work before the first
         * initialization of the navigation hub. As a result, in a navigation
         * hub view service plugin, this method should be called only in or from
         * the initializer method.
         *
         * @method removeNavigationItem
         * @param {String} identifier the identifier of the navigation item to
         * remove
         * @param {String} zone the identifier of the zone
         */
        removeNavigationItem: function (identifier, zone) {
            var attr = zone + 'NavigationItems';

            this._set(attr, Y.Array.reject(this.get(attr), Y.bind(function (elt) {
                if (this._isNavigationViewItem(elt)) {
                    return elt.get('identifier') === identifier;
                } else {
                    return elt.config.identifier === identifier;
                }
            },this)));
        },

        /**
         * Retrieves a navigation item
         *
         * @method getNavigationItem
         * @param {String} identifier the identifier of the navigation item to retrieve
         * @return {Object}
         */
        getNavigationItem: function(identifier) {
            var zones = ['platform', 'studio', 'admin'],
                items = [];

            Y.Array.each(zones, function (zone) {
                items = items.concat(this.get(zone + 'NavigationItems'));
            }, this);

            return Y.Array.find(items, Y.bind(function (elt) {
                if (this._isNavigationViewItem(elt)) {
                    return elt.get('identifier') === identifier;
                } else {
                    return false;
                }
            }, this));
        }
    }, {
        ATTRS: {

            /**
             * Stores the root `location`
             *
             * @attribute rootLocation
             * @type {eZ.Location}
             */
            rootLocation: {
                valueFn: function () {
                    return new Y.eZ.Location();
                },
            },

            /**
             * Stores the root media `location`
             *
             * @attribute rootMediaLocation
             * @type {eZ.Location}
             */
            rootMediaLocation: {
                valueFn: function () {
                    return new Y.eZ.Location();
                },
            },

            /**
             * Stores the navigation item objects for the 'platform' zone. Each
             * object must contain a `Constructor` property referencing
             * the constructor function to use to build the navigation item
             * view and a `config` property will be used as a configuration
             * object for the navigation item view. This configuration must
             * contain a `title` and an `identifier` properties.
             *
             * @attribute platformNavigationItems
             * @type Array
             * @default array containing the object the 'Content structure' and
             * 'Media library' items
             * @readOnly
             */
            platformNavigationItems: {
                getter: function (val) {
                    if (val) {
                        return val;
                    }

                    val = [
                        this._getSubtreeItem(
                            Y.eZ.trans("navigationhub.content.structure", {}, 'navigationhub'),
                            "content-structure",
                            this.get('rootLocation').get('id'),
                            this.get('rootLocation').get('contentInfo').get('mainLanguageCode')
                        ),
                        this._getSubtreeItem(
                            Y.eZ.trans("navigationhub.media.library",{}, 'navigationhub'),
                            "media-library",
                            this.get('rootMediaLocation').get('id'),
                            this.get('rootMediaLocation').get('contentInfo').get('mainLanguageCode')
                        ),
                    ];

                    this._set('platformNavigationItems', val);
                    return val;
                },
                readOnly: true,
            },

            /**
             * Stores the navigation item objects for the 'studio' zone. Each
             * object must contain a `Constructor` property referencing
             * the constructor function to use to build the navigation item
             * view and a `config` property will be used as a configuration
             * object for the navigation item view. This configuration must
             * contain a `title` and an `identifier` properties.
             *
             * @attribute studioNavigationItems
             * @type Array
             * @default empty array
             * @readOnly
             */
            studioNavigationItems: {
                getter: function (val) {
                    if (val) {
                        return val;
                    }

                    val = [
                        this._getNavigationItem(
                            "eZ Studio presentation", "studio-presentation",
                            "studioPresentation", {}
                        ),
                    ];

                    this._set('studioNavigationItems', val);
                    return val;
                },
                readOnly: true,
            },

            /**
             * Stores the navigation item objects for the 'admin' zone. Each
             * object must contain a `Constructor` property referencing
             * the constructor function to use to build the navigation item
             * view and a `config` property will be used as a configuration
             * object for the navigation item view. This configuration must
             * contain a `title` and an `identifier` properties.
             *
             * @attribute adminNavigationItems
             * @type Array
             * @default array containing the items for the admin
             * @readOnly
             */
            adminNavigationItems: {
                getter: function (val) {
                    if (val) {
                        return val;
                    }

                    val = [
                        this._getParameterItem(
                            Y.eZ.trans('navigationhub.dashboard.title', {}, 'navigationhub'), "admin-dashboard",
                            "adminGenericRoute", {uri: "pjax/dashboard"}, "uri"
                        ),
                        this._getParameterItem(
                            Y.eZ.trans('navigationhub.system.information', {}, 'navigationhub'), "admin-systeminfo",
                            "adminGenericRoute", {uri: "pjax/systeminfo"}, "uri"
                        ),
                        this._getNavigationItem(
                            Y.eZ.trans('navigationhub.section.list', {}, 'navigationhub'), "admin-sections",
                            "adminSection", {uri: "pjax/section/list"}
                        ),
                        this._getNavigationItem(
                            Y.eZ.trans('navigationhub.content_type.dashboard_title', {}, 'navigationhub'), "admin-contenttypes",
                            "adminContentType", {uri: "pjax/contenttype"}
                        ),
                        this._getNavigationItem(
                            Y.eZ.trans('navigationhub.language.list', {}, 'navigationhub'), "admin-languages",
                            "adminLanguage", {uri: "pjax/language/list"}
                        ),
                        //TODO in EZP-24860. For now link to users node is defined in a static way.
                        this._getSubtreeItem(
                            Y.eZ.trans('navigationhub.user.list', {}, 'navigationhub'),
                            "admin-users",
                            "/api/ezp/v2/content/locations/1/5",
                            "eng-GB"
                        ),
                        this._getNavigationItem(
                             Y.eZ.trans('navigationhub.role.list', {}, 'navigationhub'), "admin-roles",
                            "adminRole", {uri: "pjax/role"}
                        ),
                    ];

                    this._set('adminNavigationItems', val);
                    return val;
                },
                readOnly: true,
            },

            /**
             * Stores the user's avatar image
             *
             * @attribute userAvatar
             * @type {String}
             * @default null
             */
            userAvatar: {
                value: null
            }
        },
    });
});

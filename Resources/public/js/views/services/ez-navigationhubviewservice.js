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

    /**
     * Navigation hub view service.
     *
     * @namespace eZ
     * @class NavigationHubViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.NavigationHubViewService = Y.Base.create('navigationHubViewService', Y.eZ.ViewService, [], {
        initializer: function () {
            this.on('*:logOut', this._logOut);
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
         * Returns the navigation item for the subtree starting for the
         * given location id.
         *
         * @method _getSubtreeItems
         * @protected
         * @param {String} title
         * @param {String} identifier
         * @param {String} locationId
         * @return {Object}
         */
        _getSubtreeItems: function (title, identifier, locationId) {
            return {
                Constructor: Y.eZ.NavigationItemSubtreeView,
                config: {
                    title: title,
                    identifier: identifier,
                    route: {
                        name: 'viewLocation',
                        params: {
                            id: locationId,
                        },
                    },
                },
            };
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
                createNavigationItems: this.get('createNavigationItems'),
                deliverNavigationItems: this.get('deliverNavigationItems'),
                optimizeNavigationItems: this.get('optimizeNavigationItems'),
                matchedRoute: this._matchedRoute(),
            };
        },

        /**
         * A matched route object from the request. This object will be used by
         * the navigation hub view to check which navigation item view is
         * selected. A matched route object is a clone of the application active
         * route without the service, serviceInstance and callbacks entries and
         * with an additionnal `parameters` property holding the route
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

            this._set(attr, Y.Array.reject(this.get(attr), function (elt) {
                return elt.config.identifier === identifier;
            }));
        },
    }, {
        ATTRS: {
            /**
             * Stores the navigation item objects for the 'create' zone. Each
             * object must contain a `Constructor` property referencing
             * the constructor function to use to build the navigation item
             * view and a `config` property will be used as a configuration
             * object for the navigation item view. This configuration must
             * contain a `title` and an `identifier` properties.
             *
             * @attribute createNavigationItems
             * @type Array
             * @default array containing the object the 'Content structure' and
             * 'Media library' items
             * @readOnly
             */
            createNavigationItems: {
                valueFn: function () {
                    // TODO these location ids should be taken from the REST
                    // root ressource instead of being hardcoded
                    return [
                        this._getSubtreeItems(
                            "Content structure",
                            "content-structure",
                            "/api/ezp/v2/content/locations/1/2"
                        ),
                        this._getSubtreeItems(
                            "Media library",
                            "media-library",
                            "/api/ezp/v2/content/locations/1/43"
                        ),
                    ];
                },
                readOnly: true,
            },

            /**
             * Stores the navigation item objects for the 'optimize' zone. Each
             * object must contain a `Constructor` property referencing
             * the constructor function to use to build the navigation item
             * view and a `config` property will be used as a configuration
             * object for the navigation item view. This configuration must
             * contain a `title` and an `identifier` properties.
             *
             * @attribute optimizeNavigationItems
             * @type Array
             * @default empty array
             * @readOnly
             */
            optimizeNavigationItems: {
                value: [],
                readOnly: true,
            },

            /**
             * Stores the navigation item objects for the 'deliver' zone. Each
             * object must contain a `Constructor` property referencing
             * the constructor function to use to build the navigation item
             * view and a `config` property will be used as a configuration
             * object for the navigation item view. This configuration must
             * contain a `title` and an `identifier` properties.
             *
             * @attribute deliverNavigationItems
             * @type Array
             * @default empty array
             * @readOnly
             */
            deliverNavigationItems: {
                value: [],
                readOnly: true,
            },
        },
    });
});

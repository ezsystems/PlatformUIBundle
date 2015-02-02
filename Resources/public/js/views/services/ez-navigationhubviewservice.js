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
         * Returns the navigation items object.
         *
         * @method _getNavigationLocationItems
         * @protected
         * @param {String} title
         * @param {String} identifier
         * @param {String} locationId
         * @return {Object}
         */
        _getNavigationLocationItems: function (title, identifier, locationId) {
            return {
                Constructor: Y.eZ.NavigationItemView,
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
            };
        },

        /**
         * Adds a navigation item for the given zone
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
         * Removes a navigation item for the given zone
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
                        this._getNavigationLocationItems(
                            "Content structure",
                            "content-structure",
                            "/api/ezp/v2/content/locations/1/2"
                        ),
                        this._getNavigationLocationItems(
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

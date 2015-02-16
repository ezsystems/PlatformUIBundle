/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationitemsubtreeview', function (Y) {
    "use strict";
    /**
     * Provides a navigation item implementation to point to a subtree
     *
     * @module ez-navigationitemsubtreeview
     */
    Y.namespace('eZ');

    /**
     * The navigation item subtree view. It can be used to represent a
     * navigation item pointing to a location in the location tree.
     *
     * @namespace eZ
     * @class NavigationItemSubtreeView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NavigationItemSubtreeView = Y.Base.create('navigationItemSubtreeView', Y.eZ.NavigationItemView, [], {
        _getName: function () {
            return Y.eZ.NavigationItemView.NAME;
        },

        /**
         * Checks whether the navigation item is selected or not based on the
         * location id in the route.
         *
         * @method matchRoute
         * @param {Object} route the matched route object
         * @return {Boolean}
         */
        matchRoute: function (route) {
            var selected = false,
                linkRoute = this.get('route'),
                startLocatioId = linkRoute.params.id;

            if ( this._sameRoute(route) && route.parameters.id ) {
                selected = (route.parameters.id.indexOf(startLocatioId) === 0);
            }
            this._set('selected', selected);
            return selected;
        },
    });
});

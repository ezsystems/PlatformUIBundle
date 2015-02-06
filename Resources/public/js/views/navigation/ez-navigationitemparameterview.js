/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationitemparameterview', function (Y) {
    "use strict";
    /**
     * Provides a navigation item parameter view
     *
     * @module ez-navigationitemparameterview
     */
    Y.namespace('eZ');

    /**
     * The navigation item parameter view. It can be used when the associated
     * route is generic route and the matching needs to take a parameter into
     * account.
     *
     * @namespace eZ
     * @class NavigationItemParameterView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NavigationItemParameterView = Y.Base.create('navigationItemParameterView', Y.eZ.NavigationItemView, [], {
        _getName: function () {
            return Y.eZ.NavigationItemView.NAME;
        },

        /**
         * Checks that the `matchParameter` has the same value in the matched
         * route and in the `route` attribute
         *
         * @protected
         * @method _parameterMatch
         * @param {Object} route the matched route object
         * @return {Boolean}
         */
        _parameterMatch: function (route) {
            var matchParameter = this.get('matchParameter'),
                linkRoute = this.get('route');

            return (
                typeof route.parameters[matchParameter] !== 'undefined'
                && linkRoute.params[matchParameter] === route.parameters[matchParameter]
            );
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
            var selected = (this._sameRoute(route) && this._parameterMatch(route));

            this._set('selected', selected);
            return selected;
        },
    }, {
        ATTRS: {
            /**
             * Stores the identifier of the parameter to check in the matched route
             * and in the `route` attribute
             *
             * @attribute matchParameter
             * @type {String}
             * @required
             */
            matchParameter: {
                writeOnce: "initOnly"
            },
        },
    });
});

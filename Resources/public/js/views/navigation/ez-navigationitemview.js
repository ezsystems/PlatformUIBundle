/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationitemview', function (Y) {
    "use strict";
    /**
     * Provides the navigation item view
     *
     * @module ez-navigationitemview
     */
    Y.namespace('eZ');

    var NAVIGATION_ACTIVE = 'ez-navigation-active';

    /**
     * The navigation item view. It represents a navigation item to be
     * rendered in the navigation of a zone.
     *
     * @namespace eZ
     * @class NavigationItemView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NavigationItemView = Y.Base.create('navigationItemView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {
            this.containerTemplate = '<li class="' + this._generateViewClassName(this._getName()) + '"/>';
            this.after('selectedChange', this._uiSelectedChange);
        },

        /**
         * selectedChange event handler. Adds or removes the navigation active
         * class depending on the `selected` attribute value.
         *
         * @method _uiSelectedChange
         * @protected
         */
        _uiSelectedChange: function () {
            var container = this.get('container');

            if ( this.get('selected') ) {
                container.addClass(NAVIGATION_ACTIVE);
            } else {
                container.removeClass(NAVIGATION_ACTIVE);
            }
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                title: this.get('title'),
                route: this.get('route'),
            }));
            return this;
        },

        /**
         * Returns whether the matched route is the same as the one stored in
         * the navigation item.
         *
         * @method _sameRoute
         * @protected
         * @param {Object} route the matched route
         * @return Boolean
         */
        _sameRoute: function (route) {
            return this.get('route').name === route.name;
        },

        /**
         * Checks whether the navigation item is selected or not based on the
         * matched route object provided by the navigation hub service.
         * This default implementation only compares the matched route name
         * against the route stored in the `route` attribute.
         *
         * @method matchRoute
         * @param {Object} route the matched route object
         * @return {Boolean}
         */
        matchRoute: function (route) {
            var selected = (route.name === this.get('route').name);

            this._set('selected', selected);
            return selected;
        },
    }, {
        ATTRS: {
            /**
             * Title of the navigation item
             *
             * @attribute title
             * @type String
             */
            title: {},

            /**
             * Route configuration of the item. This should contain an object
             * with a `name` property referencing a route and optionally a
             * `params` property holding the parameters of the route.
             *
             * @attribute route
             * @type Object
             */
            route: {},

            /**
             * Flag indicating whether the item is selected according to the
             * matched route provided to the last call of `match` vs. the route
             * stored in the `route` attribute
             *
             * @attribute selected
             * @type Boolean
             * @readOnly
             * @default false
             */
            selected: {
                value: false,
                readOnly: true,
            },
        }
    });
});

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
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                title: this.get('title'),
                route: this.get('route'),
            }));
            return this;
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
            route: {}
        }
    });
});

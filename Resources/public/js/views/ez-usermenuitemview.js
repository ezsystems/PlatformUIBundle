/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermenuitemview', function (Y) {
    "use strict";
    /**
     * Provides the user menu item view
     *
     * @module ez-usermenuitemview
     */
    Y.namespace('eZ');

    /**
     * The user menu item view. 
     *
     * @namespace eZ
     * @class UserMenuItemView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UserMenuItemView = Y.Base.create('userMenuItemView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {
            this.containerTemplate = '<li class="' + this._generateViewClassName(this._getName()) + '"/>';
        },

        /**
        * Renders the item view
        *
        * @method render
        * @return {eZ.UserMenuItemView} the view itself
        */
        render: function () {
            this.get('container').setHTML(this.template({title: this.get('title')}));
            return this;
        },
    }, {
        ATTRS: {
            /**
             * Stores the item title
             *
             * @attribute title
             * @type {String}
             */
            title: {},

            /**
             * Stores prority of the user menu item
             *
             * @attribute priority
             * @type {Number}
             */
            priority: {
                value: 1
            }
        }
    });
});

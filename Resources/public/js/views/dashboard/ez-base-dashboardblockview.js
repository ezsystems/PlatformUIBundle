/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-base-dashboardblockview', function (Y) {
    "use strict";
    /**
     * Provides the Dashboard Base Block View class
     *
     * @module ez-base-dashboardblockview
     */
    Y.namespace('eZ');

    /**
     * The dashboard base block view
     *
     * @namespace eZ
     * @class BaseDashboardBlockView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.BaseDashboardBlockView = Y.Base.create('baseDashboardBlockView', Y.eZ.TemplateBasedView, [], {
        /**
         * Renders the dashboard block view
         *
         * @method render
         * @return {eZ.DashboardBlockView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template(this.getAttrs()));

            return this;
        }
    }, {
        ATTRS: {
            /**
             * The block priority/order
             *
             * @attribute priority
             * @type Number
             * @default 0
             */
            priority: {
                value: 0
            },

            /**
             * The block identifier
             *
             * @attribute identifier
             * @type String
             * @default 'dashboard-base-block'
             */
            identifier: {
                value: 'dashboard-base-block'
            }
        }
    });
});

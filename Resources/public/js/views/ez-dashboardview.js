/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardview', function (Y) {
    "use strict";
    /**
     * Provides the Dashboard View class
     *
     * @module ez-dashboardview
     */
    Y.namespace('eZ');

    /**
     * The dashboard view
     *
     * @namespace eZ
     * @class DashboardView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.DashboardView = Y.Base.create('dashboardView', Y.eZ.TemplateBasedView, [], {
        /**
         * Renders the dashboard view
         *
         * @method render
         * @return {eZ.DashboardView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        }
    });
});

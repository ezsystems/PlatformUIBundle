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
    Y.eZ.DashboardView = Y.Base.create('dashboardView', Y.eZ.TemplateBasedView, [Y.eZ.HeightFit], {

        initializer: function () {
            this.after('activeChange', this._setIFrameSource);
        },

        /**
         * Renders the dashboard view
         *
         * @method render
         * @return {eZ.DashboardView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template());
            this._attachedViewEvents.push(Y.on("windowresize", Y.bind(this._uiSetHeight, this, 0)));

            return this;
        },

        /**
         * Sets the source of the iframe to the value of the iframeSource attribute.
         *
         * @method _setIFrameSource
         * @private
         */
        _setIFrameSource: function () {
            this.get('container').one('.ez-dashboard-content').set('src', this.get('iframeSource'));
        }

    }, {
        ATTRS: {
            /**
             * Stores the iframe Source
             *
             * @attribute iframeSource
             * @type String
             * @default 'http://ez.no/in-product/eZ-Platform'
             * @readOnly
             */
            iframeSource: {
                value: 'http://ez.no/in-product/eZ-Platform',
                readOnly: true,
            },
        },
    });
});

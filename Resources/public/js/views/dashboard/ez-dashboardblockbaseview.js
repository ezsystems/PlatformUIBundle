/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockbaseview', function (Y) {
    'use strict';

    /**
     * Provides the Dashboard Base Block View class
     *
     * @module ez-dashboardblockbaseview
     */
    Y.namespace('eZ');

    /**
     * The dashboard base block view
     *
     * @namespace eZ
     * @class DashboardBlockBaseView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.DashboardBlockBaseView = Y.Base.create('dashboardBlockBaseView', Y.eZ.TemplateBasedView, [], {
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
             * @required
             */
            identifier: {}
        }
    });
});

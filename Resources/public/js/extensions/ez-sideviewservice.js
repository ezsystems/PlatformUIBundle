/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sideviewservice', function (Y) {
    "use strict";
    /**
     * The side view service extension
     *
     * @module ez-sideviewservice
     */
    Y.namespace('eZ');

    /**
     * View service extension providing the concept of side view service.
     * Basically a side view service can be configured with parameters just for
     * one execution.
     *
     * @namespace eZ
     * @class SideViewService
     * @extensionfor Y.eZ.ViewService
     */
    Y.eZ.SideViewService = Y.Base.create('sideViewService', Y.Base, [], {
    }, {
        ATTRS: {
            /**
             * The parameters of the side view service. The parameters are set
             * when the side view is shown with the
             * {{#crossLink "eZ.PlatformUIApp/showSideView:method"}}eZ.PlatformUIApp.showSideView method{{/crossLink}}
             * typically after catching an event (see for instance the
             * {{#crossLink "eZ.Plugin.UniversalDiscovery"}}Universal Discovery
             * Plugin{{/crossLink}})
             *
             * @attribute parameters
             * @type {Object}
             * @default undefined
             */
            parameters: {
            }       
        }
    });
});

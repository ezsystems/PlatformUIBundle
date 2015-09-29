/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service component for the discovery bar
     *
     * @module ez-discoverybarviewservice
     */
    Y.namespace('eZ');

    /**
     * Discovery bar view service.
     *
     * @namespace eZ
     * @class DiscoveryBarViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.DiscoveryBarViewService = Y.Base.create('discoveryBarViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {});
});

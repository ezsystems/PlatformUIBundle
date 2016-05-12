/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblocksviewservice', function (Y) {
    'use strict';

    /**
     * Provides the dashboard blocks view service class
     *
     * @method ez-dashboardblocksviewservice
     */
    Y.namespace('eZ');

    /**
     * The dashboard blocks view service
     *
     * @namespace eZ
     * @class DashboardBlocksViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.DashboardBlocksViewService = Y.Base.create('dashboardBlocksViewService', Y.eZ.ViewService, [], {});
});

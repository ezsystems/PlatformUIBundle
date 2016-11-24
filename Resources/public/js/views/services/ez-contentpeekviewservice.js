/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentpeekviewservice', function (Y) {
    "use strict";
    /**
     * Provides the content peek view service class
     *
     * @method ez-contentpeekviewservice
     */

    /**
     * The content peek view service
     *
     * @namespace eZ
     * @class ContentPeekViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.ContentPeekViewService = Y.Base.create('contentPeekViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        _getViewParameters: function () {
            return this.get('parameters');
        }
    });
});

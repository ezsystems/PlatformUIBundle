/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-confirmboxviewservice', function (Y) {
    "use strict";
    /**
     * Provides the confirm box view service class
     *
     * @method ez-confirmboxviewservice
     */

    /**
     * The confirm box view service
     *
     * @namespace eZ
     * @class ConfirmBoxViewService
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ConfirmBoxViewService = Y.Base.create('confirmBoxViewService', Y.eZ.ViewService, [], {
        getViewParameters: function () {
            return this.get('config');
        }
    });
});

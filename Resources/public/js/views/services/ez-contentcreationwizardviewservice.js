/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardviewservice', function (Y) {
    "use strict";
    /**
     * Provides the content creation wizard view service class
     *
     * @method ez-contentcreationwizardviewservice
     */

    /**
     * The content creation wizard view service
     *
     * @namespace eZ
     * @class ContentCreationWizardViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.ContentCreationWizardViewService = Y.Base.create('contentCreationWizardViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        _getViewParameters: function () {
            return this.get('parameters');
        }
    });
});

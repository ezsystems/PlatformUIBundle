/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageselectionboxviewservice', function (Y) {
    "use strict";
    /**
     * Provides the language selection box view service class
     *
     * @module ez-languageselectionboxviewservice
     */

    /**
     * The language selection box view service
     *
     * @namespace eZ
     * @class LanguageSelectionBoxViewService
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.LanguageSelectionBoxViewService = Y.Base.create('languageSelectionBoxViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        _getViewParameters: function () {
            var config = Y.merge(this.get('parameters'));

            config.systemLanguageList = this.get('app').get('systemLanguageList');

            return config;
        }
    });
});

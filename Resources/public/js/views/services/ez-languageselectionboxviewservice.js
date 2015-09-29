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
        getViewParameters: function () {
            var config = Y.merge(this.get('parameters'));

            config.systemLanguageList = this.get('availableTranslations');

            return config;
        }
    }, {
        ATTRS: {
            /**
             * List of available translations. List contains language objects.
             *
             * @attribute availableTranslations
             * @type {Object}
             */
            availableTranslations: {
                value: {
                    'eng-GB': {id: 2, languageCode: 'eng-GB', name: 'English (United Kingdom)', enabled: true},
                    'nno-NO': {id: 4, languageCode: 'nno-NO', name: 'Norwegian (Nynorsk)', enabled: true},
                    'chi-CN': {id: 8, languageCode: 'chi-CN', name: 'Simplified Chinese', enabled: true},
                    'cze-CZ': {id: 16, languageCode: 'cze-CZ', name: 'Czech', enabled: true},
                    'eng-US': {id: 32, languageCode: 'eng-US', name: 'English (American)', enabled: true},
                    'esl-ES': {id: 64, languageCode: 'esl-ES', name: 'Spanish (Spain)', enabled: true},
                    'fre-FR': {id: 128, languageCode: 'fre-FR', name: 'French (France)', enabled: true},
                    'ita-IT': {id: 256, languageCode: 'ita-IT', name: 'Italian', enabled: true},
                    'jpn-JP': {id: 512, languageCode: 'jpn-JP', name: 'Japanese', enabled: true},
                    'swe-SE': {id: 1024, languageCode: 'swe-SE', name: 'Swedish', enabled: true},
                    'pol-PL': {id: 2048, languageCode: 'pol-PL', name: 'Polish', enabled: true},
                    'ger-DE': {id: 4096, languageCode: 'ger-DE', name: 'German', enabled: true},
                }
            },
        }
    });
});

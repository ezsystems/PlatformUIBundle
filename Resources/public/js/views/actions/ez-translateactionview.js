/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-translateactionview', function (Y) {
    'use strict';
    /**
     * Provides the translate action view class
     *
     * @module ez-translateactionview
     */
    Y.namespace('eZ');

    var events = {
            '.ez-newtranslation-button': {
                'tap': '_newTranslationLanguageSelectionBox',
            }
        };

    /**
     * Translate Action View
     *
     * @namespace eZ
     * @class TranslateActionView
     * @constructor
     * @extends eZ.ButtonActionView
     */
    Y.eZ.TranslateActionView = Y.Base.create('translateActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {
        initializer: function () {
            this.events = Y.merge(this.events, events);
            this.after({
                'translateAction': this._toggleExpanded,
                'expandedChange': this._setClickOutsideEventHandler,
            });
        },

        /**
         * Renders the action
         *
         * @method render
         * @return Y.eZ.TranslateActionView the view itself
         */
        render: function () {
            var container = this.get('container'),
                translationsList = this.get('content').get('currentVersion').getTranslationsList(),
                firstLanguageCodes = this._getFirstLanguageCodes(),
                moreTranslationCount = 0;

            if (translationsList.length - firstLanguageCodes.length > 0) {
                moreTranslationCount = translationsList.length - firstLanguageCodes.length;
            }

            this._addButtonActionViewClassName();

            container.setHTML(this.template({
                actionId: this.get('actionId'),
                disabled: this.get('disabled'),
                label: this.get('label'),

                location: this.get('location').toJSON(),
                content: this.get('content').toJSON(),
                translations: translationsList,
                firstLanguagesCode: firstLanguageCodes,
                moreTranslationCount: moreTranslationCount
            }));

            return this;
        },

        /**
         * expandedChange event handler to define or detach the click outside
         * event handler so that the view gets hidden when the user click
         * somewhere else
         *
         * @method _setClickOutsideEventHandler
         * @param {Object} e event facade of the expandedChange event
         * @protected
         */
        _setClickOutsideEventHandler: function (e) {
            if ( e.newVal ) {
                this._clickOutsideSubscription = this.get('container').on(
                    'clickoutside', Y.bind(this._hideView, this)
                );
            } else {
                this._clickOutsideSubscription.detach();
            }
        },

        /**
         * Toggles the expanded state
         *
         * @method _toggleExpanded
         * @protected
         */
        _toggleExpanded: function () {
            this.set('expanded', !this.get('expanded'));

            return this;
        },

        /**
         * Hides the expanded view
         *
         * @method _hideView
         * @protected
         */
        _hideView: function () {
            this.set('expanded', false);
        },

        /**
         * Returns array containing language codes of translations of content that will be
         * displayed in the hint.
         *
         * @method _getFirstLanguageCodes
         * @protected
         */
        _getFirstLanguageCodes: function () {
            var translations = this.get('content').get('currentVersion').getTranslationsList(),
                countAll = translations.length,
                firstLanguageCodes = Y.Object.values(Y.merge(translations));

            firstLanguageCodes.splice(2, countAll-2);

            return firstLanguageCodes;
        },

        /**
         * Tap event handler on New Translation button. It opens language selection box.
         *
         * @method _newTranslationLanguageSelectionBox
         * @private
         * @param {EventFacade} e
         */
        _newTranslationLanguageSelectionBox: function (e) {
            e.preventDefault();
            this.fire('languageSelect', {
                config: {
                    title: "Select a language for your new translation:",
                    languageSelectedHandler: Y.bind(this._newTranslation, this),
                    cancelLanguageSelectionHandler: null,
                    canBaseTranslation: true,
                    translationMode: true,
                    referenceLanguageList: this.get('content').get('currentVersion').getTranslationsList()
                },
            });
            this._hideView();
        },

        /**
         * Fires `translate` event after making a selection on LanguageSelectionBox
         *
         * @method _newTranslation
         * @private
         * @param {EventFacade} e
         */
        _newTranslation: function (e) {
            var languageCode = e.selectedLanguageCode,
                isBaseLanguage = e.baseTranslation,
                data = {
                    content: this.get('content'),
                    toLanguageCode: languageCode,
                };

            if (isBaseLanguage && e.selectedBaseLanguageCode !== null){
                data.baseLanguageCode = e.selectedBaseLanguageCode;
            }

            /**
             * Fired when content is being translated
             *
             * @event translateContent
             * @param {Object} data
             * @param {eZ.Content} data.content content object which will be translated
             * @param {String} data.toLanguageCode language to which content will be translated
             * @param {String} data.baseLanguageCode optional language on which translation will be basing
             */
            this.fire('translateContent', data);
        }
    }, {
        ATTRS: {
            /**
             * The viewed location
             *
             * @attribute location
             * @type Y.eZ.Location
             */
            location: {
                writeOnce: "initOnly"
            },

            /**
             * The content associated with the location
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {
                writeOnce: "initOnly"
            },
        }
    });
});

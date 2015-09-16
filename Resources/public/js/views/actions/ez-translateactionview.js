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
            var container = this.get('container');

            this._addButtonActionViewClassName();

            container.setHTML(this.template({
                actionId: this.get('actionId'),
                disabled: this.get('disabled'),
                label: this.get('label'),
                hint: this.get('hint'),

                location: this.get('location').toJSON(),
                content: this.get('content').toJSON(),
                translations: this.get('content').get('currentVersion').getTranslationsList()
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
         * Returns the hint for translate button
         *
         * @method _getTranslateButtonHint
         * @protected
         * @return {String}
         */
        _getTranslateButtonHint: function () {
            var translations = this.get('content').get('currentVersion').getTranslationsList(),
                countAll = translations.length,
                moreTranslations = Y.Object.values(Y.merge(translations));

            moreTranslations.splice(2, countAll-2);

            if (countAll > moreTranslations.length) {
                moreTranslations.push('+' + (countAll-moreTranslations.length));
            }

            return moreTranslations.join(', ');
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
             * hint attribute here overwrites hint attribute from Y.eZ.ButtonActionView
             * because hint for Y.eZ.TranslateActionView is dynamically build with
             * getter funtion using existing translations of content
             *
             * @attribute hint
             * @type string
             * @readOnly
             */
            hint: {
                readOnly: true,
                getter: '_getTranslateButtonHint'
            },

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

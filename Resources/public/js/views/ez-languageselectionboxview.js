/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageselectionboxview', function (Y) {
    "use strict";
    /**
     * Provides the language selection box view class
     *
     * @module ez-languageselectionboxview
     */
    Y.namespace('eZ');

    var LANGUAGE_SELECTED = 'languageSelected',
        CANCEL_LANGUAGE_SELECTION = 'cancelLanguageSelection',
        BASE_TRANSLATION_AVAILABLE_CLASS = 'is-base-translation-allowed',
        BASE_LANGUAGES_LIST_VISIBLE_CLASS = 'is-base-languages-list-visible',
        TRANSLATION_HIGHLIGHT_CLASS = 'is-language-selected';

    /**
     * The language selection box view.
     *
     * @namespace eZ
     * @class LanguageSelectionBoxView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.LanguageSelectionBoxView = Y.Base.create('languageSelectionBoxView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-languageselectionbox-close': {
                'tap': '_cancelLanguageSelection',
            },
            '.ez-languageselectionbox-confirm': {
                'tap': '_confirmLanguageSelection',
            },
            '.ez-language-element': {
                'tap': '_selectLanguage'
            },
            '.ez-base-language': {
                'tap': '_selectBaseLanguage'
            },
            '.ez-base-translation-checkbox': {
                'change': '_toggleBaseTranslation'
            },
        },

        initializer: function () {
            this.on(['languageSelectedHandlerChange', 'cancelLanguageSelectionHandlerChange'], function (e) {
                this._syncEventHandler(e.attrName.replace(/Handler$/, ''), e.prevVal, e.newVal);
            });
            this._publishEvents();
            this.after('activeChange', function () {
                if ( this.get('active') ) {
                    this.reset('baseTranslation');
                    this.reset('selectedLanguageCode');
                    this.reset('selectedBaseLanguageCode');
                    this.render();
                }
            });
            this.on('translationModeChange', function (e) {
                this.render();
            });
            this.on('canBaseTranslationChange', function (e) {
                this._uiSetBaseTranslationVisibility(e.newVal);
            });
            this.on('selectedLanguageCodeChange', function (e) {
                if ( this.get('active') ) {
                    this._uiHighlightLanguage(e.newVal, false);
                }
            });
            this.after('selectedLanguageCodeChange', function (e) {
                this._uiSetConfirmButtonState();
            });
            this.on('selectedBaseLanguageCodeChange', function (e) {
                if ( this.get('active') ) {
                    this._uiHighlightLanguage(e.newVal, true);
                }
            });
            this.on('baseTranslationChange', function (e) {
                if ( this.get('active') ) {
                    this._uiBaseTranslationState(e.newVal);
                }
            });
        },

        /**
         * Tap event handler on language from languages list
         *
         * @method _selectLanguage
         * @protected
         * @param {EventFacade} e
         */
        _selectLanguage: function (e) {
            var languageCode = e.target.getAttribute('data-languagecode');

            this.set('selectedLanguageCode', languageCode);
        },

        /**
         * Tap event handler on language from base languages list
         *
         * @method _selectBaseLanguage
         * @protected
         * @param {EventFacade} e
         */
        _selectBaseLanguage: function (e) {
            var languageCode = e.target.getAttribute('data-languagecode');

            this.set('selectedBaseLanguageCode', languageCode);
        },

        /**
         * Tap event handler on switcher dictating if new translation will base
         * on already existing one or not
         *
         * @method _toggleBaseTranslation
         * @protected
         */
        _toggleBaseTranslation: function (e) {
            this.set('baseTranslation', e.target.get('checked'));
        },

        /**
         * Publishes the cancelLanguageSelection and languageSelected events
         *
         * @method _publishEvents
         * @protected
         */
        _publishEvents: function () {
            this.publish(LANGUAGE_SELECTED, {
                bubbles: true,
                emitFacade: true,
                preventable: false,
                defaultFn: this._resetState,
            });
            this.publish(CANCEL_LANGUAGE_SELECTION, {
                bubbles: true,
                emitFacade: true,
                preventable: false,
                defaultFn: this._resetState,
            });
        },

        /**
         * languageSelectedHandlerChange and cancelLanguageSelectionHandlerChange event
         * handler. It makes sure the potential previous event handler are
         * removed and it adds the new handlers if any.
         *
         * @method _syncEventHandler
         * @private
         * @param {String} eventName event name
         * @param {Function|Null} oldHandler the previous event handler
         * @param {Function|Null} newHandler the new event handler
         */
        _syncEventHandler: function (eventName, oldHandler, newHandler) {
            if ( oldHandler ) {
                this.detach(eventName, oldHandler);
            }
            if ( newHandler ) {
                this.on(eventName, newHandler);
            }
        },

        /**
         * Resets the state of the languageSelectionBox view
         *
         * @method _resetState
         * @protected
         */
        _resetState: function () {
            this.reset('baseTranslation');
            this.reset('selectedLanguageCode');
            this.reset('selectedBaseLanguageCode');
        },

        /**
         * Highlights the selected language
         *
         * @method _uiHighlightLanguage
         * @protected
         * @param {String} languageCode
         * @param {Boolean} baseLanguage defines if language should be highlighted in base languages list
         */
        _uiHighlightLanguage: function (languageCode, baseLanguage) {
            var languageElementSelector;

            if (baseLanguage) {
                languageElementSelector = '.ez-base-language';
            } else {
                languageElementSelector = '.ez-language-element';
            }

            this.get('container')
                .all(languageElementSelector)
                .removeClass(TRANSLATION_HIGHLIGHT_CLASS);

            if ( languageCode !== null ) {
                this.get('container')
                    .one(languageElementSelector + '[data-languagecode="' + languageCode + '"]')
                    .addClass(TRANSLATION_HIGHLIGHT_CLASS);
            }
        },

        /**
         * Sets the state for base translation checkbox
         *
         * @method _uiBaseTranslationState
         * @protected
         * @param {String} baseTranslation
         */
        _uiBaseTranslationState: function (baseTranslation) {
            var c = this.get('container'),
                baseCheckbox = c.one('.ez-base-translation-checkbox');

            baseCheckbox.set('checked', baseTranslation);
            if (baseTranslation) {
                c.addClass(BASE_LANGUAGES_LIST_VISIBLE_CLASS);
            } else {
                c.removeClass(BASE_LANGUAGES_LIST_VISIBLE_CLASS);
            }
        },

        /**
         * Sets visibility of whole part containing base translations
         *
         * @method _uiSetBaseTranslationVisibility
         * @protected
         * @param {Boolean} canBaseTranslation
         */
        _uiSetBaseTranslationVisibility: function (canBaseTranslation) {
            var c = this.get('container');

            if (canBaseTranslation) {
                c.addClass(BASE_TRANSLATION_AVAILABLE_CLASS);
            } else {
                c.removeClass(BASE_TRANSLATION_AVAILABLE_CLASS);
            }
        },

        /**
         * `selectedLanguageCodeChange` event handler. It enables/disables the button
         * depending on new translation selection
         *
         * @method _uiSetConfirmButtonState
         * @protected
         */
        _uiSetConfirmButtonState: function () {
            var confirmButton = this.get('container').one('.ez-languageselectionbox-confirm');

            confirmButton.set('disabled', !this.get('selectedLanguageCode'));
        },

        render: function () {
            var container = this.get('container'),
                languages;

            if (this.get('translationMode')) {
                languages = this.get('newTranslations');
            } else {
                languages = this.get('referenceLanguageList');
            }
            container.setHTML(this.template({
                title: this.get('title'),
                languages: languages,
                referenceLanguageList: this.get('referenceLanguageList'),
                canBaseTranslation: this.get('canBaseTranslation'),
            }));

            return this;
        },

        /**
         * Cancel the languageSelectionBox by firing the `cancelLanguageSelect` event
         *
         * @protected
         * @method _cancelLanguageSelection
         */
        _cancelLanguageSelection: function () {
            /**
             * Fired when language selection is being cancelled
             *
             * @event cancelLanguageSelection
             */
            this.fire(CANCEL_LANGUAGE_SELECTION);
        },

        /**
         * Confirm the languageSelectionBox's selection by firing the `languageSelected` event
         *
         * @protected
         * @method _confirmLanguageSelection
         */
        _confirmLanguageSelection: function () {
            var data = {
                    baseTranslation: this.get('baseTranslation'),
                    selectedLanguageCode: this.get('selectedLanguageCode'),
                    selectedBaseLanguageCode: this.get('selectedBaseLanguageCode')
                };

            /**
             * Fired when language selection is being confirmed
             *
             * @event languageSelected
             * @param {Object} data
             * @param {Boolean} data.baseTranslation defines if translation will be basing on already existing language
             * @param {String} data.selectedLanguageCode language code of selected language
             * @param {Null|String} data.selectedBaseLanguageCode language on which translation will be based
             */
            this.fire(LANGUAGE_SELECTED, data);
        },

        /**
         * Returns list of languages that are available but are not included in list passed
         * in `referenceLanguageList` attribute
         *
         * @protected
         * @method _getNewTranslations
         * @return {Array}
         */
        _getNewTranslations: function () {
            var systemLanguages = Y.Object.keys(this.get('systemLanguageList')),
                referenceLanguageList = this.get('referenceLanguageList');

            return Y.Array.reject(systemLanguages, function (value) {
                return referenceLanguageList.indexOf(value) >= 0;
            });
        },
    }, {
        ATTRS: {
            /**
             * Title of the languageSelectionBox
             *
             * @attribute title
             * @default ""
             * @type {String}
             */
            title: {
                value: "",
            },

            /**
             * languageSelected event handler
             *
             * @attribute languageSelectedHandler
             * @type {Function|Null}
             * @default null
             */
            languageSelectedHandler: {
                value: null,
            },

            /**
             * cancelLanguageSelection event handler
             *
             * @attribute cancelLanguageSelectionHandler
             * @type {Function|Null}
             * @default null
             */
            cancelLanguageSelectionHandler: {
                value: null,
            },

            /**
             * List of active system languages. List contains language objects indexed by language code.
             *
             * @attribute systemLanguageList
             * @type {Object}
             */
            systemLanguageList: {},

            /**
             * List of available new translations
             *
             * @attribute newTranslations
             * @type {Array}
             */
            newTranslations: {
                getter: '_getNewTranslations'
            },

            /**
             * List of languages used as reference. When in translation mode, this is the list of existing
             * translations and it is displayed as list of base languages on which new translation can be based.
             * If not in translation mode, this is the list of languages that can be picked in.
             *
             * @attribute referenceLanguageList
             * @type {Array|Null}
             * @default null
             */
            referenceLanguageList: {
                value: null
            },

            /**
             * Enables or disables possibility of basing new translation on already existing one
             *
             * @attribute canBaseTranslation
             * @type {Boolean}
             * @default true
             */
            canBaseTranslation: {
                value: true
            },

            /**
             * Defines if new translation will be based on already existing one
             *
             * @attribute baseTranslation
             * @type {Boolean}
             * @default false
             */
            baseTranslation: {
                value: false
            },

            /**
             * Selected language from new translations list
             *
             * @attribute selectedLanguageCode
             * @type {string|Null}
             * @default null
             */
            selectedLanguageCode: {
                value: null
            },

            /**
             * Selected language from existing translations list on which
             * new translation will be based
             *
             * @attribute selectedBaseLanguageCode
             * @type {string|Null}
             * @default null
             */
            selectedBaseLanguageCode: {
                value: null
            },

            /**
             * Translation mode flag. In translation mode, the referenceLanguageList attribute holds
             * the list of existing translations, so the language selection box will allow to select
             * the system language list but not yet the reference list. By default, the translation
             * mode is disabled, the user will be able to select a language from the list in the
             * referenceLanguageList attribute.
             *
             * @attribute translationMode
             * @type {Boolean}
             * @default false
             */
            translationMode: {
                value: false
            }
        },
    });
});

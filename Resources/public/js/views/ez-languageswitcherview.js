/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageswitcherview', function (Y) {
    "use strict";
    /**
     * Provides the Language Switcher View class
     *
     * @module ez-languageswitcherview
     */
    Y.namespace('eZ');

    var NAVIGATE_MODE = 'navigate';

    /**
     * The Language Switcher View
     *
     * @namespace eZ
     * @class LanguageSwitcherView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.LanguageSwitcherView = Y.Base.create('languageSwitcherView', Y.eZ.TemplateBasedView, [Y.eZ.Expandable], {
        events: {
            '.ez-dropdown-list-indicator': {
                'tap': '_toggleExpanded'
            }
        },

        initializer: function () {
            this.after('expandedChange', this._setClickOutsideEventHandler);
            if ( this.get('switchMode') !== NAVIGATE_MODE ) {
                this._addDOMEventHandlers({
                    '.ez-language-switch-link': {
                        'tap': '_switchLanguage',
                    },
                });
                this.after('languageCodeChange', this.render);
            }
        },

        /**
         * `tap` event handler on the language switch links.
         *
         * @method _switchLanguage
         * @protected
         * @param {EventFacade} e
         */
        _switchLanguage: function (e) {
            var newLanguageCode = e.target.getData('language-code'),
                oldLanguageCode = this.get('languageCode');

            e.preventDefault();

            this._hideLanguageList();
            this.set('languageCode', newLanguageCode);
            /**
             * Fired to indicate that the user wants to switch to a new
             * language. It is fired only when `switchMode` attribute is set to
             * 'event'.
             *
             * @event switchLanguage
             * @param {String} languageCode
             * @param {String} oldLanguageCode
             */
            this.fire('switchLanguage', {
                languageCode: newLanguageCode,
                oldLanguageCode: oldLanguageCode,
            });
        },

        /**
         * Renders the language switcher view
         *
         * @method render
         * @return {eZ.LanguageSwitcherView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                location: this.get('location').toJSON(),
                currentTranslation: this.get('languageCode'),
                otherTranslations: this._getOtherTranslationsList()
            }));

            return this;
        },

        /**
         * Returns array with translations of content other than already being viewed.
         * If conten doesn't have got other translations than the one already being viewed,
         * then empty array is returned.
         *
         * @method _getOtherTranslationsList
         * @private
         * @return {Array} other translations
         */
        _getOtherTranslationsList: function () {
            var languageCode = this.get('languageCode'),
                translations = this.get('content').get('currentVersion').getTranslationsList();

            return Y.Array.reject(translations, function (value) {
                return value === languageCode;
            });
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
                    'clickoutside', Y.bind(this._hideLanguageList, this)
                );
            } else {
                this._clickOutsideSubscription.detach();
            }
        },

        /**
         * Hides the expanded view
         *
         * @method _hideView
         * @protected
         * @deprecated
         */
        _hideView: function () {
            console.log('[DEPRECATED] _hideView is deprecated, use _hideLanguageList instead');
            console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');
            this._hideLanguageList();
        },

        /**
         * Hides the language list (if any)
         *
         * @method _hideLanguageList
         * @protected
         */
        _hideLanguageList: function () {
            this.set('expanded', false);
        },

        /**
         * Toggles the expanded state
         *
         * @method _toggleExpanded
         * @protected
         */
        _toggleExpanded: function (e) {
            e.preventDefault();
            this.set('expanded', !this.get('expanded'));
        }
    }, {
        ATTRS: {
            /**
             * The content associated the current location
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {},

            /**
             * The current location
             *
             * @attribute location
             * @type Y.eZ.Location
             */
            location: {},

            /**
             * Language code of language currently active for the current location
             *
             * @attribute languageCode
             * @type String
             */
            languageCode: {},

            /**
             * The way the language switch will be done. When set to 'event',
             * the view will fire a 'switchLanguage' event while if it is set to
             * 'navigate', the browser will just follow the link generated by
             * the template.
             *
             * @attribute switchMode
             * @default 'navigate'
             * @writeOnce
             */
            switchMode: {
                writeOnce: 'initOnly',
                value: NAVIGATE_MODE,
            },
        }
    });
});

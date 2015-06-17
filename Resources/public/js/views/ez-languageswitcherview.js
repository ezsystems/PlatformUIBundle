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

    /**
     * The raw content view
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
                    'clickoutside', Y.bind(this._hideView, this)
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
         */
        _hideView: function () {
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
             * @writeOnce
             */
            content: {
                writeOnce: "initOnly",
            },

            /**
             * The current location
             *
             * @attribute location
             * @type Y.eZ.Location
             * @writeOnce
             */
            location: {
                writeOnce: "initOnly",
            },

            /**
             * Language code of language currently active for the current location
             *
             * @attribute languageCode
             * @type String
             * @writeOnce
             */
            languageCode: {
                writeOnce: "initOnly"
            }
        }
    });
});

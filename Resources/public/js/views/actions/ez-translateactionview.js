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
                hint: this._getTranslateButtonHint(),

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
         * @return {String}
         */
        _getTranslateButtonHint: function () {
            var translations = this.get('content').get('currentVersion').getTranslationsList(),
                counter = translations.length;

            translations.splice(2, counter-2);

            if (counter > translations.length) {
                translations.push('+' + (counter-translations.length));
            }

            return translations.join(', ');
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

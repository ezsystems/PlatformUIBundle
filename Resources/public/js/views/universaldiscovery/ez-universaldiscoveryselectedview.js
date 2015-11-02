/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryselectedview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery selected view
     *
     * @module ez-universaldiscoveryselectedview
     */
    Y.namespace('eZ');

    var IS_ANIMATED = 'is-animated';

    /**
     * Universal Discovery Selected View. It's a view meant to display the
     * currently selected content in the different discovery method.
     *
     * @namespace eZ
     * @class UniversalDiscoverySelectedView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('universalDiscoverySelectedView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-ud-selected-confirm': {
                'tap': '_confirmSelected',
            }
        },

        initializer: function () {
            this.after('contentStructChange', function (e) {
                this._setConfirmButtonState(e.newVal);
                this.render();
            });
            this.after('confirmButtonEnabledChange', function (e) {
                this._uiButtonState();
                if ( this.get('confirmButtonEnabled') ) {
                    this._uiResetAnimation();
                }
            });
        },

        /**
         * Sets the confirm selection button state depending on wether content
         * is selectable and is not already selected.
         *
         * @method _setConfirmButtonState
         * @protected
         */
        _setConfirmButtonState: function (contentStruct) {
            var isAlreadySelected = this.get('isAlreadySelected'),
                isSelectable = this.get('isSelectable');

            if (this.get('contentStruct')) {
                this.set(
                    'confirmButtonEnabled',
                    (!isAlreadySelected(contentStruct) && isSelectable(contentStruct))
                );
            }
        },

        /**
         * `confirmButtonEnabledChange` event handler. It sets the confirm
         * button state depending on the value of the `confirmButtonEnabled`
         * attribute
         *
         * @method _uiButtonState
         * @protected
         */
        _uiButtonState: function () {
            var confirmButton = this.get('container').one('.ez-ud-selected-confirm');

            if ( this.get('addConfirmButton') && confirmButton ) {
                confirmButton.set(
                    'disabled', !this.get('confirmButtonEnabled')
                );
            }
        },

        /**
         * tap event handler on the confirm button. If the given content is not already selected
         * it disables the confirm button and  fires the `confirmSelectedContent` event
         * meaning that the user wants the content to be added to his confirmed content list.
         *
         * @method _confirmSelected
         * @protected
         * @param {EventFacade} e
         */
        _confirmSelected: function (e) {
            var isAlreadySelected = this.get('isAlreadySelected'),
                contentStruct = this.get('contentStruct');

            if (!isAlreadySelected(contentStruct)) {
                this.set('confirmButtonEnabled', false);
                /**
                 * Fired when the user has confirmed that he wants the content to be
                 * added in the confirmed list. This event will be fired/used only
                 * when the universal discovery widget is configured to allow
                 * several contents to be selected.
                 *
                 * @event confirmSelectedContent
                 * @param selection {Object} the content structure for the content
                 * which is selected
                 */
                this.fire('confirmSelectedContent', {
                    selection: contentStruct,
                });
            }
        },

        render: function () {
            this.get('container').setHTML(this.template({
                contentInfo: this._modelJson('contentInfo'),
                location: this._modelJson('location'),
                contentType: this._modelJson('contentType'),
                addConfirmButton: this.get('addConfirmButton'),
                confirmButtonEnabled: this.get('confirmButtonEnabled'),
            }));
            return this;
        },

        /**
         * Returns the element that will be animated when the displayed content
         * is selected
         *
         * @method _getAnimatedElement
         * @protected
         * @return {Y.Node|Null}
         */
        _getAnimatedElement: function () {
            return this.get('container').one('.ez-ud-selected-animation');
        },

        /**
         * Starts the animation of the content selection. It also returns the
         * node to animate.
         *
         * @method startAnimation
         * @return {Y.Node|Null}
         */
        startAnimation: function () {
            var node = this._getAnimatedElement();

            if ( node ) {
                node.addClass(IS_ANIMATED);
                return node;
            }
            return null;
        },

        /**
         * Resets the animated element to its original state
         *
         * @method _uiResetAnimation
         * @protected
         */
        _uiResetAnimation: function () {
            var node = this._getAnimatedElement();

            if ( node ) {
                node.removeClass(IS_ANIMATED).removeAttribute('style');
            }
        },

        /**
         * 'jsonifies' the model available under the identifier in the
         * `contentStruct` attribute
         *
         * @method _modelJson
         * @protected
         * @param {String} identifier the identifier of the model in the
         * `contentStruct` attribute
         * @return {Object|false}
         */
        _modelJson: function (identifier) {
            var struct = this.get('contentStruct');

            if ( struct && struct[identifier] ) {
                return struct[identifier].toJSON();
            }
            return false;
        },
    }, {
        ATTRS: {
            /**
             * The content structure representing the content to display. It
             * should contain the content info, the location and the content
             * type models under the key `contentInfo`, `location` and
             * `contentType`.
             *
             * @attribute contentStruct
             * @type {null|Object}
             * @default null
             */
            contentStruct: {
                value: null,
            },

            /**
             * Flag indicating whether a confirm button has to be added.
             *
             * @attribute addConfirmButton
             * @type {Boolean}
             * @default false
             */
            addConfirmButton: {
                value: false,
            },

            /**
             * Flag indicating whether the confirm button should be enabled or
             * not.
             *
             * @attribute confirmButtonEnabled
             * @type {Boolean}
             * @default true
             */
            confirmButtonEnabled: {
                value: true,
            },

            /**
             * Checks wether the content is already selected.
             *
             * @attribute isAlreadySelected
             * @type {Function}
             */
            isAlreadySelected: {
                validator: Y.Lang.isFunction,
                value: function (contentStruct) {
                    return false;
                }
            },

            /**
             * Checks wether the content is selectable.
             *
             * @attribute isSelectable
             * @type {Function}
             */
            isSelectable: {
                validator: Y.Lang.isFunction,
                value: function (contentStruct) {
                    return true;
                }
            },
        }
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-mixin-embedalign', function (Y) {
    "use strict";

    /**
     * Provides the EmbedAlign mixin
     *
     * @module ez-alloyeditor-button-mixin-embedalign
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React;

    /**
     * Mixin providing the base to implement the embed align buttons.
     *
     * @uses ButtonStateClasses
     * @uses eZ.AlloyEditorButton.WidgetButton
     *
     * @class ButtonEmbedAlign
     * @namespace eZ.AlloyEditorButton
     */
    Y.eZ.AlloyEditorButton.ButtonEmbedAlign = {
        mixins: [
            AlloyEditor.ButtonStateClasses,
            Y.eZ.AlloyEditorButton.WidgetButton,
        ],

        propTypes: {
            /**
             * The label that should be used for accessibility purposes. This
             * property is deprecated, while using ButtonEmbedAlign, you should
             * implement a `_getLabel` method instead.
             *
             * @property {String} label
             * @deprecated
             */
            label: React.PropTypes.string,

            /**
             * The tabIndex of the button in its toolbar current state. A value other than -1
             * means that the button has focus and is the active element.
             *
             * @property {Number} tabIndex
             */
            tabIndex: React.PropTypes.number,

            /**
             * The alignment to apply ('center', 'left' or 'right')
             *
             * @required
             * @property {String} alignment
             */
            alignment: React.PropTypes.string.isRequired,

            /**
             * The suffix of the class to use icon to set the button icon
             *
             * @property {String} classIcon
             */
            classIcon: React.PropTypes.string,
        },

        /**
         * Checks if the configured alignment is active on the focused embed
         * element.
         *
         * @method isActive
         * @return {Boolean}
         */
        isActive: function () {
            return this._getWidget().isAligned(this.props.alignment);
        },

        /**
         * Applies or un-applies the alignment on the currently focused embed
         * element.
         *
         * @method applyStyle
         */
        applyStyle: function () {
            var widget = this._getWidget();

            if ( this.isActive() ) {
                widget.unsetAlignment();
            } else {
                widget.setAlignment(this.props.alignment);
            }
        },

        render: function() {
            var cssClass = 'ae-button ' + this.getStateClasses(),
                iconCss = 'ez-font-icon ez-ae-icon-align-' + this.props.classIcon,
                label;

            if ( this._getLabel ) {
                label = this._getLabel();
            } else {
                console.log('[DEPRECATED] Using deprecated `label` property');
                console.log('[DEPRECATED] Please implement a `_getLabel` method instead');
                label = this.props.label;
            }

            return (
                <button className={cssClass} onClick={this.applyStyle}
                    tabIndex={this.props.tabIndex} title={label}>
                    <span className={iconCss}></span>
                </button>
            );
        },
    };
});

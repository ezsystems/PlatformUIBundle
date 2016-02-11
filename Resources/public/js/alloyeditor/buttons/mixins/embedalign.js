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
             * The label that should be used for accessibility purposes.
             *
             * @property {String} label
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
            this.props.editor.get('nativeEditor').fire('actionPerformed', this);
        },

        render: function() {
            var cssClass = 'ae-button ' + this.getStateClasses(),
                iconCss = 'ez-font-icon ez-ae-icon-align-' + this.props.classIcon;

            return (
                React.createElement("button", {className: cssClass, onClick: this.applyStyle, 
                    tabIndex: this.props.tabIndex, title: this.props.label}, 
                    React.createElement("span", {className: iconCss})
                )
            );
        },
    };
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-mixin-blocktextalign', function (Y) {
    "use strict";

    /**
     * Provides the BlockTextAlign mixin
     *
     * @module ez-alloyeditor-button-mixin-blocktextalign
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React;

    /**
     * Mixin that provides the base to implement the block text align buttons.
     *
     * @uses ButtonStateClasses
     *
     * @class ButtonBlockTextAlign
     * @namespace eZ.AlloyEditorButton
     */
    Y.eZ.AlloyEditorButton.ButtonBlockTextAlign = {
        mixins: [AlloyEditor.ButtonStateClasses],

        propTypes: {
            /**
             * The editor instance where the component is being used.
             *
             * @property {Object} editor
             */
            editor: React.PropTypes.object.isRequired,

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
             * The text-align style value to check and apply
             *
             * @required
             * @property {String} textAlign
             */
            textAlign: React.PropTypes.string.isRequired,

            /**
             * The suffix of the class to use icon to set the button icon
             *
             * @property {String} classIcon
             */
            classIcon: React.PropTypes.string,
        },

        _findBlock: function () {
            return this.props.editor.get('nativeEditor').elementPath().block;
        },

        /**
         * Checks whether the element holding the caret already has the current
         * text align style
         *
         * @method isActive
         * @return {Boolean}
         */
        isActive: function () {
            return this._findBlock().getStyle('textAlign') === this.props.textAlign;
        },

        /**
         * Applies or removes the text align style
         *
         * @method applyStyle
         */
        applyStyle: function () {
            var block = this._findBlock(),
                editor = this.props.editor.get('nativeEditor');

            if ( this.isActive() ) {
                block.removeStyle('text-align');
            } else {
                block.setStyle('text-align', this.props.textAlign);
            }
            editor.fire('actionPerformed', this);
        },

        /**
         * Lifecycle. Renders the UI of the button.
         *
         * @method render
         * @return {Object} The content which should be rendered.
         */
        render: function() {
            var cssClass = 'ae-button ' + this.getStateClasses(),
                iconCss = 'ae-icon-align-' + this.props.classIcon;

            return (
                <button className={cssClass} onClick={this.applyStyle}
                    tabIndex={this.props.tabIndex} title={this.props.label}>
                    <span className={iconCss}></span>
                </button>
            );
        }
    };
});

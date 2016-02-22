/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-imagevariation', function (Y) {
    "use strict";
    /**
     * Provides the image variation drop down
     *
     * @module ez-alloyeditor-button-remove
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonImageVariation;

    /**
     * The ButtonImageVariation components represents a drop down to choose
     * the image variation to use.
     *
     * @uses Y.eZ.AlloyEditorButton.WidgetButton
     *
     * @class ButtonImageVariation
     * @namespace eZ.AlloyEditorButton
     */
    ButtonImageVariation = React.createClass({
        mixins: [
            Y.eZ.AlloyEditorButton.WidgetButton,
            Y.eZ.AlloyEditorButton.ButtonEmbedImage,
        ],

        statics: {
            key: 'ezimagevariation'
        },

        /**
         * Change event handler. It updates the image in the editor so that the
         * newly choosen variation is used.
         *
         * @method _updateImage
         * @protected
         * @param {Object} e
         */
        _updateImage: function (e) {
            var widget = this._getWidget(),
                newVariation = e.target.value;

            widget.setConfig('size', newVariation).setWidgetContent('');
            widget.focus();
            this.props.editor.get('nativeEditor').fire('updatedEmbed');
        },

        /**
         * Returns the options to add to the drop down list.
         *
         * @method _getImageVariationOptions
         * @return Array
         */
        _getImageVariationOptions: function () {
            var editor = this.props.editor.get('nativeEditor'),
                variations = editor.config.eZ.imageVariations;

            return variations.map(function (variation) {
                return <option
                    key={variation.identifier}
                    value={variation.identifier}>{variation.name}</option>;
            });
        },

        render: function () {
            return (
                <select
                    defaultValue={this._getWidget().getConfig('size')}
                    onChange={this._updateImage}
                    tabIndex={this.props.tabIndex}>
                    {this._getImageVariationOptions()}
                </select>
            );
        },
    });

    AlloyEditor.Buttons[ButtonImageVariation.key] = ButtonImageVariation;

    Y.eZ.AlloyEditorButton.ButtonImageVariation = ButtonImageVariation;
});

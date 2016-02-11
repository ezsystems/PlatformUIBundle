/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-embedright', function (Y) {
    "use strict";
    /**
     * Provides the embed right align button
     *
     * @module ez-alloyeditor-button-embedcenter
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonEmbedRight;

    /**
     * The ButtonEmbedRight class provides functionality for aligning an embed
     * element to the right
     *
     * @uses eZ.AlloyEditorButton.ButtonEmbedAlign
     *
     * @class ButtonEmbedRight
     * @namespace eZ.AlloyEditorButton
     */
    ButtonEmbedRight = React.createClass({
        mixins: [
            Y.eZ.AlloyEditorButton.ButtonEmbedAlign,
        ],

        statics: {
            key: 'ezembedright'
        },

        getDefaultProps: function() {
            return {
                alignment: 'right',
                classIcon: 'embedright',
                label: 'Right',
            };
        },
    });

    AlloyEditor.Buttons[ButtonEmbedRight.key] = ButtonEmbedRight;

    Y.eZ.AlloyEditorButton.ButtonEmbedRight = ButtonEmbedRight;
});

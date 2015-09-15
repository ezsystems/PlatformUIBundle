/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-blocktextalignjustify', function (Y) {
    "use strict";
    /**
     * Provides the block text align justify button
     *
     * @module ez-alloyeditor-button-blocktextalignjustify
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonBlockTextAlignJustify;

    /**
     * The ButtonBlockTextAlignJustify class provides functionality for
     * justifying the text inside a block element.
     *
     * @uses eZ.AlloyEditorButton.ButtonBlockTextAlign
     *
     * @class ButtonBlockTextAlignJustify
     * @namespace eZ.AlloyEditorButton
     */
    ButtonBlockTextAlignJustify = React.createClass({
        mixins: [Y.eZ.AlloyEditorButton.ButtonBlockTextAlign],

        statics: {
            key: 'ezblocktextalignjustify'
        },

        getDefaultProps: function() {
            return {
                textAlign: 'justify',
                classIcon: 'justified',
                label: 'Justify',
            };
        },
    });

    AlloyEditor.Buttons[ButtonBlockTextAlignJustify.key] = ButtonBlockTextAlignJustify;

    Y.eZ.AlloyEditorButton.ButtonBlockTextAlignJustify = ButtonBlockTextAlignJustify;
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-blocktextalignleft', function (Y) {
    "use strict";
    /**
     * Provides the block text align left button
     *
     * @module ez-alloyeditor-button-blocktextalignleft
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonBlockTextAlignLeft;

    /**
     * The ButtonBlockTextAlignLeft class provides functionality for aligning
     * to the left the text inside a block element.
     *
     * @uses eZ.AlloyEditorButton.ButtonBlockTextAlign
     *
     * @class ButtonBlockTextAlignLeft
     * @namespace eZ.AlloyEditorButton
     */
    ButtonBlockTextAlignLeft = React.createClass({
        mixins: [Y.eZ.AlloyEditorButton.ButtonBlockTextAlign],

        statics: {
            key: 'ezblocktextalignleft'
        },

        getDefaultProps: function() {
            return {
                textAlign: 'left',
                classIcon: 'left',
                label: 'Left',
            };
        },
    });

    AlloyEditor.Buttons[ButtonBlockTextAlignLeft.key] = ButtonBlockTextAlignLeft;

    Y.eZ.AlloyEditorButton.ButtonBlockTextAlignLeft = ButtonBlockTextAlignLeft;
});

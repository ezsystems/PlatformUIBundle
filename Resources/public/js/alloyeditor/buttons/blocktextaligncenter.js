/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
// **NOTICE:**
// THIS IS AN AUTO-GENERATED FILE
// DO YOUR MODIFICATIONS IN THE CORRESPONDING .jsx FILE
// AND REGENERATE IT WITH: grunt jsx
// END OF NOTICE
YUI.add('ez-alloyeditor-button-blocktextaligncenter', function (Y) {
    "use strict";
    /**
     * Provides the block text align center button
     *
     * @module ez-alloyeditor-button-blocktextaligncenter
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonBlockTextAlignCenter;

    /**
     * The ButtonBlockTextAlignCenter class provides functionality for centering
     * the text inside a block element.
     *
     * @uses eZ.AlloyEditorButton.ButtonBlockTextAlign
     *
     * @class ButtonBlockTextAlignCenter
     * @namespace eZ.AlloyEditorButton
     */
    ButtonBlockTextAlignCenter = React.createClass({displayName: "ButtonBlockTextAlignCenter",
        mixins: [Y.eZ.AlloyEditorButton.ButtonBlockTextAlign],

        statics: {
            key: 'ezblocktextaligncenter'
        },

        getDefaultProps: function() {
            return {
                textAlign: 'center',
                classIcon: 'center',
                label: 'Center',
            };
        },
    });

    AlloyEditor.Buttons[ButtonBlockTextAlignCenter.key] = ButtonBlockTextAlignCenter;

    Y.eZ.AlloyEditorButton.ButtonBlockTextAlignCenter = ButtonBlockTextAlignCenter;
});

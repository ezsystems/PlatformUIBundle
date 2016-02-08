/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
// **NOTICE:**
// THIS IS AN AUTO-GENERATED FILE
// DO YOUR MODIFICATIONS IN THE CORRESPONDING .jsx FILE
// AND REGENERATE IT WITH: grunt jsx
// END OF NOTICE
YUI.add('ez-alloyeditor-button-embedcenter', function (Y) {
    "use strict";
    /**
     * Provides the embed center button
     *
     * @module ez-alloyeditor-button-embedcenter
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonEmbedCenter;

    /**
     * The ButtonEmbedCenter class provides functionality for centering
     * an embed element
     *
     * @uses eZ.AlloyEditorButton.ButtonEmbedAlign
     *
     * @class ButtonEmbedCenter
     * @namespace eZ.AlloyEditorButton
     */
    ButtonEmbedCenter = React.createClass({displayName: "ButtonEmbedCenter",
        mixins: [
            Y.eZ.AlloyEditorButton.ButtonEmbedAlign,
        ],

        statics: {
            key: 'ezembedcenter'
        },

        getDefaultProps: function() {
            return {
                alignment: 'center',
                classIcon: 'embedcenter',
                label: 'Center',
            };
        },
    });

    AlloyEditor.Buttons[ButtonEmbedCenter.key] = ButtonEmbedCenter;

    Y.eZ.AlloyEditorButton.ButtonEmbedCenter = ButtonEmbedCenter;
});

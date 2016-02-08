/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-embedleft', function (Y) {
    "use strict";
    /**
     * Provides the embed left align button
     *
     * @module ez-alloyeditor-button-embedleft
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonEmbedLeft;

    /**
     * The ButtonEmbedLeft class provides functionality for aligning an embed
     * element on the left
     *
     * @uses eZ.AlloyEditorButton.ButtonEmbedAlign
     *
     * @class ButtonEmbedLeft
     * @namespace eZ.AlloyEditorButton
     */
    ButtonEmbedLeft = React.createClass({
        mixins: [
            Y.eZ.AlloyEditorButton.ButtonEmbedAlign,
        ],

        statics: {
            key: 'ezembedleft'
        },

        getDefaultProps: function() {
            return {
                alignment: 'left',
                classIcon: 'embedleft',
                label: 'Left',
            };
        },
    });

    AlloyEditor.Buttons[ButtonEmbedLeft.key] = ButtonEmbedLeft;

    Y.eZ.AlloyEditorButton.ButtonEmbedLeft = ButtonEmbedLeft;
});

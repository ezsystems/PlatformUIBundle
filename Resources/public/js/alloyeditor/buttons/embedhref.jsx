/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-embedhref', function (Y) {
    "use strict";
    /**
     * Provides the embedhref href button
     *
     * @module ez-alloyeditor-button-remove
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonEmbedHref;

    /**
     * The ButtonEmbedHref component represents a button to set the target
     * content on an embed element.
     *
     * @uses Y.eZ.AlloyEditorButton.ButtonEmbedDiscoverContent
     *
     * @class ButtonEmbedHref
     * @namespace eZ.AlloyEditorButton
     */
    ButtonEmbedHref = React.createClass({
        mixins: [
            Y.eZ.AlloyEditorButton.ButtonEmbedDiscoverContent,
        ],

        statics: {
            key: 'ezembedhref'
        },

        getDefaultProps: function () {
            return {
                udwTitle: "Select a content to embed",
                udwContentDiscoveredMethod: "_updateEmbed",
            };
        },

        /**
         * Updates the emebed element with the selected content in UDW.
         *
         * @method _updateEmbed
         * @param {EventFacade} e the contentDiscovered event facade
         * @protected
         */
        _updateEmbed: function (e) {
            this._setContent(e.selection.content);
        },

        render: function () {
            return (
                <button className="ae-button" onClick={this._chooseContent} tabIndex={this.props.tabIndex}>
                    <span className="ez-font-icon ae-icon-udw ez-ae-icon-udw"></span>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonEmbedHref.key] = ButtonEmbedHref;

    Y.eZ.AlloyEditorButton.ButtonEmbedHref = ButtonEmbedHref;
});

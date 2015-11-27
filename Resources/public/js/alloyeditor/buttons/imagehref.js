/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
// **NOTICE:**
// THIS IS AN AUTO-GENERATED FILE
// DO YOUR MODIFICATIONS IN THE CORRESPONDING .jsx FILE
// AND REGENERATE IT WITH: grunt jsx
// END OF NOTICE
YUI.add('ez-alloyeditor-button-imagehref', function (Y) {
    "use strict";
    /**
     * Provides the ezimagehref button
     *
     * @module ez-alloyeditor-button-imagehref
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonImageHref;

    /**
     * The ButtonImageHref component represents a button to set the target
     * content on an image element.
     *
     * @uses Y.eZ.AlloyEditorButton.ButtonEmbedDiscoverContent
     * @uses Y.eZ.AlloyEditorButton.ButtonEmbedImage
     *
     * @class ButtonImageHref
     * @namespace eZ.AlloyEditorButton
     */
    ButtonImageHref = React.createClass({displayName: "ButtonImageHref",
        mixins: [
            Y.eZ.AlloyEditorButton.ButtonEmbedDiscoverContent,
            Y.eZ.AlloyEditorButton.ButtonEmbedImage,
        ],

        statics: {
            key: 'ezimagehref'
        },

        getDefaultProps: function () {
            return {
                udwTitle: "Select an image to embed",
                udwContentDiscoveredMethod: "_updateEmbed",
                udwIsSelectableMethod: '_isImage',
                udwLoadContent: true,
            };
        },

        /**
         * Updates the image element with the selected content in UDW.
         *
         * @method _updateEmbed
         * @param {EventFacade} e the contentDiscovered event facade
         * @protected
         */
        _updateEmbed: function (e) {
            var contentInfo = e.selection.contentInfo;

            this._setContentInfo(contentInfo);
            this._getWidget().setWidgetContent('Loading the image...');
            this._loadEmbedImage(e.selection);
        },

        render: function () {
            return (
                React.createElement("button", {className: "ae-button", onClick: this._chooseContent, tabIndex: this.props.tabIndex}, 
                    React.createElement("span", {className: "ez-font-icon ae-icon-image ez-ae-icon-image"})
                )
            );
        },
    });

    AlloyEditor.Buttons[ButtonImageHref.key] = ButtonImageHref;

    Y.eZ.AlloyEditorButton.ButtonImageHref = ButtonImageHref;
});

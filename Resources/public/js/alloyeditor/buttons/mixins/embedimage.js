/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-button-mixin-embedimage', function (Y) {
    "use strict";

    /**
     * Provides the ButtonEmbedImage mixin
     *
     * @module ez-alloyeditor-button-mixin-embedimage
     */
    Y.namespace('eZ.AlloyEditorButton');

    /**
     * ButtonEmbedImage is a mixing providing the necessary code to
     * trigger UDW and use the content choosen by the user to correctly set the
     * properties of an embed element that represents an image.
     *
     * @class ButtonEmbedImage
     * @namespace eZ.AlloyEditorButton
     */
    Y.eZ.AlloyEditorButton.ButtonEmbedImage = {
        /**
         * Checks whether the current selection can be considered as an image.
         * This is the case if the content type has an ezimage field definition
         * and if the corresponding field is not empty. This method is meant to
         * be used as a `isSelectable` function implementation for the UDW.
         *
         * @method _isImage
         * @protected
         * @param {Object} contentStruct the UDW potential selection
         * @return {Boolean}
         */
        _isImage: function (contentStruct) {
            var contentType = contentStruct.contentType,
            content = contentStruct.content;

            return !!(
                contentType.hasFieldType('ezimage')
                && this._getImageField(contentType, content).fieldValue
            );
        },

        /**
         * Returns the image field object of the given content.
         *
         * @method _getImageField
         * @protected
         * @param {eZ.ContentType} contentType
         * @param {eZ.Content} content
         * @return {Object}
         */
        _getImageField: function(contentType, content) {
            var imageIdentifier = contentType.getFieldDefinitionIdentifiers('ezimage');

            return content.get('fields')[imageIdentifier[0]];
        },

        /**
         * Creates the <img> element with the provided image variation.
         *
         * @method _insertImage
         * @protected
         * @param {false|CAPIError} imgVariation
         * @param {Object} imgVariation
         */
        _insertImage: function (error, imgVariation) {
            var img = new CKEDITOR.dom.element('img');

            // TODO error handling, this is also related to the improvement
            // of the transitions between the loading state and the state where
            // we display the image
            // see https://jira.ez.no/browse/EZP-25138
            img.setAttribute('src', imgVariation.uri);
            this._getWidget().setWidgetContent(img);
        },

        /**
         * Loads the 'medium' variation of the embed image by firing the
         * `loadImageVariation`event.
         *
         * @method _loadEmbedImage
         * @param {Object} selection
         * @protected
         */
        _loadEmbedImage: function (selection) {
            var editor = this.props.editor.get('nativeEditor'),
                // TODO make the default variation configurable
                // see https://jira.ez.no/browse/EZP-25139
                variation = 'medium';

            this._getWidget().setConfig('size', variation);
            editor.fire('loadImageVariation', {
                variation: variation,
                field: this._getImageField(selection.contentType, selection.content),
                callback: this._insertImage,
            });
        },
    };
});

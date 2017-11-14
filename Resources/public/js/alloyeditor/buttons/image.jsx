/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-image', function (Y) {
    "use strict";

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonImage;

    /**
     * The ButtonImage component represents a button to add an image in the
     * editor.
     *
     * @uses AlloyEditor.ButtonCommand
     * @uses AlloyEditor.ButtonStateClasses
     * @uses eZ.AlloyEditorToolbarConfig.ButtonImageDiscoverContent
     *
     * @class eZ.AlloyEditor.ButtonImage
     */
    ButtonImage = React.createClass({
        mixins: [
            AlloyEditor.ButtonCommand,
            AlloyEditor.ButtonStateClasses,
            Y.eZ.AlloyEditorButton.WidgetButton,
            Y.eZ.AlloyEditorButton.ButtonEmbedDiscoverContent,
            Y.eZ.AlloyEditorButton.ButtonEmbedImage,
        ],

        statics: {
            key: 'ezimage'
        },

        getDefaultProps: function () {
            return {
                command: 'ezembed',
                modifiesSelection: true,
                udwTitle: 'Select an image to embed',
                udwContentDiscoveredMethod: '_addImage',
                udwIsSelectableMethod: '_isImage',
                udwLoadContent: true,
            };
        },

        /**
         * Returns the UDW title to pick a Content to embed.
         *
         * @method _getUDWTitle
         * @protected
         * @return {String}
         */
        _getUDWTitle: function () {
            return Y.eZ.trans('select.an.image.to.embed', {}, 'onlineeditor');
        },

        /**
         * Checks if the command is disabled in the current selection.
         *
         * @method isDisabled
         * @return {Boolean} True if the command is disabled, false otherwise.
         */
        isDisabled: function () {
            return !this.props.editor.get('nativeEditor').ezembed.canBeAdded();
        },

        /**
         * Executes the command generated by the ezembed plugin and set the
         * correct value based on the choosen image.
         *
         * @method _addImage
         * @param {EventFacade} e the result of the choice in the UDW
         * @protected
         */
        _addImage: function (e) {
            var scrollX = window.pageXOffset || document.documentElement.scrollLeft,
                scrollY = window.pageYOffset || document.documentElement.scrollTop,
                widget;

            this.execCommand();
            // Workaround for https://jira.ez.no/browse/EZP-28078
            window.scrollTo(scrollX, scrollY);

            this._setContentInfo(e.selection.contentInfo);

            widget = this._getWidget()
                .setConfig('size', 'medium')
                .setImageType()
                .setWidgetContent('');
            this._fireUpdatedEmbed(e.selection);
            widget.setFocused(true);
        },

        render: function () {
            var css = "ae-button ez-ae-labeled-button" + this.getStateClasses(), disabled = this.isDisabled();

            return (
                <button className={css} disabled={disabled} onClick={this._chooseContent} tabIndex={this.props.tabIndex}>
                    <span className="ez-ae-icon ez-ae-icon-image ez-font-icon"></span>
                    <p className="ez-ae-label">{Y.eZ.trans('image', {}, 'onlineeditor')}</p>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonImage.key] = AlloyEditor.ButtonImage = ButtonImage;
});

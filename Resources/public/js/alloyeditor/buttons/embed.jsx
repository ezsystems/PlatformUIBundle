/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-embed', function (Y) {
    "use strict";

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonEmbed;

    /**
     * The ButtonEmbed component represents a button to add an embed element.
     *
     * @uses AlloyEditor.ButtonCommand
     * @uses AlloyEditor.ButtonStateClasses
     * @uses eZ.AlloyEditorToolbarConfig.ButtonEmbedDiscoverContent
     *
     * @class eZ.AlloyEditor.ButtonEmbed
     */
    ButtonEmbed = React.createClass({
        mixins: [
            AlloyEditor.ButtonCommand,
            AlloyEditor.ButtonStateClasses,
            Y.eZ.AlloyEditorButton.WidgetButton,
            Y.eZ.AlloyEditorButton.ButtonEmbedDiscoverContent,
        ],

        statics: {
            key: 'ezembed'
        },

        getDefaultProps: function () {
            return {
                command: 'ezembed',
                modifiesSelection: true,
                udwTitle: 'Select a content to embed',
                udwContentDiscoveredMethod: '_addEmbed',
            };
        },

        /**
         * Lifecycle. Invoked once before the component is mounted.
         * The return value will be used as the initial value of this.state.
         *
         * @method getInitialState
         */
        getInitialState: function() {
            return {
                isDisabled: false,
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
            return Y.eZ.trans('select.a.content.to.embed', {}, 'onlineeditor');
        },

        /**
         * Checks if the command is disabled in the current selection.
         *
         * @method isDisabled
         * @return {Boolean} True if the command is disabled, false otherwise.
         */
        isDisabled: function () {
            var path = this.props.editor.get('nativeEditor').elementPath();

            // http://docs.ckeditor.com/#!/api/CKEDITOR.dom.elementPath
            // There is also isContextFor( tag ), so if there is a way to specify where embeds
            // are valid that would potentially be cleaner
            this.state.isDisabled = path && path.contains('table', true) !== null;

            return this.state.isDisabled;
        },

        /**
         * Executes the command generated by the ezembed plugin and set the
         * correct value based on the choosen content.
         *
         * @method _addEmbed
         * @param {EventFacade} e the result of the choice in the UDW
         * @protected
         */
        _addEmbed: function (e) {
            var contentInfo = e.selection.contentInfo,
                widget;

            this.execCommand();
            this._setContentInfo(contentInfo);
            widget = this._getWidget().setWidgetContent('');
            this._fireUpdatedEmbed(e.selection);
            widget.setFocused(true);
        },

        render: function () {
            var css = "ae-button ez-ae-labeled-button" + this.getStateClasses(), disabled = this.state.isDisabled;

            return (
                <button className={css} disabled={disabled} onClick={this._chooseContent} tabIndex={this.props.tabIndex}>
                    <span className="ez-ae-icon ez-ae-icon-embed ez-font-icon"></span>
                    <p className="ez-ae-label">{Y.eZ.trans('embed', {}, 'onlineeditor')}</p>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonEmbed.key] = AlloyEditor.ButtonEmbed = ButtonEmbed;
});

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
     *
     * @class eZ.AlloyEditor.ButtonEmbed
     */
    ButtonEmbed = React.createClass({
        mixins: [
            AlloyEditor.ButtonCommand,
            AlloyEditor.ButtonStateClasses,
        ],

        statics: {
            key: 'ezembed'
        },

        getDefaultProps: function () {
            return {
                command: 'eZAddContent',
                modifiesSelection: true,
            };
        },

        /**
         * Executes the eZAddContent to add an embed element in the editor.
         *
         * @method _addEmbed
         * @protected
         */
        _addEmbed: function () {
            this.execCommand({
                tagName: 'ezembed',
                attributes: {
                    href: 'ezlocation://2',
                }
            });
            this._refreshWidget();
        },

        /**
         * Makes the newly added ezembed element is recognized as a widget in
         * CKEditor
         *
         * @method _refreshWidget
         * @protected
         */
        _refreshWidget: function () {
            var editor = this.props.editor.get('nativeEditor'),
                embed = editor.getSelection().getStartElement();

            editor.widgets.initOn(embed, 'ezembed');
        },

        render: function () {
            var css = "ae-button ez-ae-labeled-button" + this.getStateClasses();

            return (
                <button className={css} onClick={this._addEmbed} tabIndex={this.props.tabIndex}>
                    <span className="ez-ae-icon ez-ae-icon-embed ez-font-icon"></span>
                    <p className="ez-ae-label">Embed</p>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonEmbed.key] = AlloyEditor.ButtonEmbed = ButtonEmbed;
});

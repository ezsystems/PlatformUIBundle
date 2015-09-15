/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-blockremove', function (Y) {
    "use strict";
    /**
     * Provides the block remove button
     *
     * @module ez-alloyeditor-button-remove
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonBlockRemove;

    /**
     * The ButtonBlockRemove component represents a button to remove the block
     * element holding the caret in the editor.
     *
     * @uses AlloyEditor.ButtonCommand
     *
     * @class ButtonBlockRemove
     * @namespace eZ.AlloyEditorButton
     */
    ButtonBlockRemove = React.createClass({
        mixins: [
            AlloyEditor.ButtonCommand,
        ],

        statics: {
            key: 'ezblockremove'
        },

        getDefaultProps: function () {
            return {
                command: 'eZRemoveBlock',
                modifiesSelection: true,
            };
        },

        render: function () {
            return (
                <button className="ae-button" onClick={this.execCommand} tabIndex={this.props.tabIndex}>
                    <span className="ez-font-icon ae-icon-remove ez-ae-icon-remove"></span>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonBlockRemove.key] = ButtonBlockRemove;

    Y.eZ.AlloyEditorButton.ButtonBlockRemove = ButtonBlockRemove;
});

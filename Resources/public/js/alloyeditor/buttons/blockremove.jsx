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
     * Note: this component does not use AlloyEditorButton.ButtonCommand mixin
     * because after executing the eZRemoveBlock command we don't want the
     * `actionPerformed` event to be fired.
     *
     * @class ButtonBlockRemove
     * @namespace eZ.AlloyEditorButton
     */
    ButtonBlockRemove = React.createClass({
        statics: {
            key: 'ezblockremove'
        },

        propTypes: {
            /**
             * The label of the button
             *
             * @property {String} label
             * @deprecated
             */
            label: React.PropTypes.string,

            /**
             * The command that should be executed.
             *
             * @property {String} command
             */
            command: React.PropTypes.string.isRequired,

            /**
             * Indicates that the command may cause the editor to have a different.
             *
             * @property {boolean} modifiesSelection
             * @deprecated
             */
            modifiesSelection: React.PropTypes.bool
        },

        getDefaultProps: function () {
            return {
                command: 'eZRemoveBlock',
                label: "Remove this block",
            };
        },

        /**
         * Executes the configured command.
         *
         * @method execCommand
         * @param {Mixed} data command parameters
         */
        execCommand: function(data) {
            var editor = this.props.editor.get('nativeEditor');

            editor.execCommand(this.props.command, data);
            editor.selectionChange(true);
        },

        render: function () {
            return (
                <button className="ae-button" onClick={this.execCommand}
                    tabIndex={this.props.tabIndex} title={Y.eZ.trans('remove.this.block', {}, 'onlineeditor')}>
                    <span className="ez-font-icon ae-icon-remove ez-ae-icon-remove"></span>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonBlockRemove.key] = ButtonBlockRemove;

    Y.eZ.AlloyEditorButton.ButtonBlockRemove = ButtonBlockRemove;
});

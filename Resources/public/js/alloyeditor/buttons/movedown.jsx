/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-movedown', function (Y) {
    "use strict";
    /**
     * Provides the move down button
     *
     * @module ez-alloyeditor-button-movedown
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonMoveDown;

    /**
     * The ButtonMoveDown component represents a button to move the currently
     * focused element in the editor after its following sibling element.
     *
     * @class ButtonMoveDown
     * @namespace eZ.AlloyEditorButton
     */
    ButtonMoveDown = React.createClass({
        statics: {
            key: 'ezmovedown'
        },

        /**
         * Executes the eZMoveDown command.
         *
         * @method _moveDown
         * @protected
         */
        _moveDown: function() {
            var editor = this.props.editor.get('nativeEditor');

            editor.execCommand('eZMoveDown');
        },

        render: function () {
            return (
                <button className="ae-button" onClick={this._moveDown}
                    tabIndex={this.props.tabIndex} title={Y.eZ.trans('move.down', {}, 'onlineeditor')}>
                    <span className="ez-font-icon ae-icon-remove ez-ae-icon-movedown"></span>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonMoveDown.key] = AlloyEditor.ButtonMoveDown = ButtonMoveDown;

    Y.eZ.AlloyEditorButton.ButtonMoveDown = ButtonMoveDown;
});

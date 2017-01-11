/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
// **NOTICE:**
// THIS IS AN AUTO-GENERATED FILE
// DO YOUR MODIFICATIONS IN THE CORRESPONDING .jsx FILE
// AND REGENERATE IT WITH: grunt jsx
// END OF NOTICE
YUI.add('ez-alloyeditor-button-moveup', function (Y) {
    "use strict";
    /**
     * Provides the move up button
     *
     * @module ez-alloyeditor-button-moveup
     */
    Y.namespace('eZ.AlloyEditorButton');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonMoveUp;

    /**
     * The ButtonMoveUp component represents a button to move the currently
     * focused element in the editor before its preceding sibling element.
     *
     * @class ButtonMoveUp
     * @namespace eZ.AlloyEditorButton
     */
    ButtonMoveUp = React.createClass({displayName: "ButtonMoveUp",
        statics: {
            key: 'ezmoveup'
        },

        /**
         * Executes the eZMoveUp command.
         *
         * @method _moveUp
         * @protected
         */
        _moveUp: function() {
            var editor = this.props.editor.get('nativeEditor');

            editor.execCommand('eZMoveUp');
        },

        render: function () {
            return (
                React.createElement("button", {className: "ae-button", onClick: this._moveUp, 
                    tabIndex: this.props.tabIndex, title: Y.eZ.trans('move.up', {}, 'onlineeditor')}, 
                    React.createElement("span", {className: "ez-font-icon ae-icon-remove ez-ae-icon-moveup"})
                )
            );
        },
    });

    AlloyEditor.Buttons[ButtonMoveUp.key] = AlloyEditor.ButtonMoveUp = ButtonMoveUp;

    Y.eZ.AlloyEditorButton.ButtonMoveUp = ButtonMoveUp;
});

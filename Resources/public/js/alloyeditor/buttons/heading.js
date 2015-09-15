/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
// **NOTICE:**
// THIS IS AN AUTO-GENERATED FILE
// DO YOUR MODIFICATIONS IN THE CORRESPONDING .jsx FILE
// AND REGENERATE IT WITH: grunt jsx
// END OF NOTICE
YUI.add('ez-alloyeditor-button-heading', function (Y) {
    "use strict";

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonHeading;

    /**
     * The ButtonHeading component represents a button to add a heading (h1).
     *
     * @uses AlloyEditor.ButtonCommand
     * @uses AlloyEditor.ButtonStateClasses
     *
     * @class eZ.AlloyEditor.ButtonHeading
     */
    ButtonHeading = React.createClass({displayName: "ButtonHeading",
        mixins: [
            AlloyEditor.ButtonCommand,
            AlloyEditor.ButtonStateClasses,
        ],

        statics: {
            key: 'ezheading'
        },

        getDefaultProps: function () {
            return {
                command: 'eZAddContent',
                modifiesSelection: true,
            };
        },

        /**
         * Executes the eZAppendContent to add a heading element in the editor.
         *
         * @method _addHeading
         * @protected
         */
        _addHeading: function () {
            this.execCommand({
                tagName: 'h1',
            });
        },

        render: function () {
            var css = "ae-button ez-ae-labeled-button" + this.getStateClasses();

            return (
                React.createElement("button", {className: css, onClick: this._addHeading, tabIndex: this.props.tabIndex}, 
                    React.createElement("span", {className: "ez-ae-icon ae-icon-h1"}), React.createElement("p", {className: "ez-ae-label"}, "Heading")
                )
            );
        },
    });

    AlloyEditor.Buttons[ButtonHeading.key] = AlloyEditor.ButtonHeading = ButtonHeading;
});

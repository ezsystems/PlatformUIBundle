/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-list', function (Y) {
    "use strict";

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonList;

    /**
     * The ButtonList component represents a button to add an unordered list (ul).
     *
     * @uses AlloyEditor.ButtonCommand
     * @uses AlloyEditor.ButtonStateClasses
     *
     * @class eZ.AlloyEditor.ButtonList
     */
    ButtonList = React.createClass({
        mixins: [
            AlloyEditor.ButtonCommand,
            AlloyEditor.ButtonStateClasses,
        ],

        statics: {
            key: 'ezlist'
        },

        getDefaultProps: function () {
            return {
                command: 'eZAddContent',
                modifiesSelection: true,
            };
        },

        /**
         * Executes the eZAppendContent command to add an unordered list containing
         * an empty list item.
         *
         * @method _addList
         * @protected
         */
        _addList: function () {
            this.execCommand({
                tagName: 'ul',
                content: '<li></li>',
                focusElement: 'li',
            });
        },

        render: function () {
            var css = "ae-button ez-ae-labeled-button" + this.getStateClasses();

            return (
                <button className={css} onClick={this._addList} tabIndex={this.props.tabIndex}>
                    <span className="ez-ae-icon ae-icon-bulleted-list"></span>
                    <p className="ez-ae-label">List</p>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonList.key] = AlloyEditor.ButtonList = ButtonList;
});

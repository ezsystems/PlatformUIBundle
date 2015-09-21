/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-paragraph', function (Y) {
    "use strict";

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonParagraph;

    /**
     * The ButtonParagraph component represents a button to add a paragraph (p).
     *
     * @uses AlloyEditor.ButtonCommand
     * @uses AlloyEditor.ButtonStateClasses
     *
     * @class eZ.AlloyEditor.ButtonParagraph
     */
    ButtonParagraph = React.createClass({
        mixins: [
            AlloyEditor.ButtonCommand,
            AlloyEditor.ButtonStateClasses,
        ],

        statics: {
            key: 'ezparagraph'
        },

        getDefaultProps: function () {
            return {
                command: 'eZAddContent',
                modifiesSelection: true,
            };
        },

        /**
         * Executes the eZAppendContent to add a paragraph element in the editor.
         *
         * @method _addParagraph
         * @protected
         */
        _addParagraph: function () {
            this.execCommand({
                tagName: 'p',
                content: '<br>',
            });
        },

        render: function () {
            var css = "ae-button ez-ae-labeled-button" + this.getStateClasses();

            return (
                <button className={css} onClick={this._addParagraph} tabIndex={this.props.tabIndex}>
                    <span className="ez-ae-icon ez-ae-icon-paragraph"></span>
                    <p className="ez-ae-label">Paragraph</p>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonParagraph.key] = AlloyEditor.ButtonParagraph = ButtonParagraph;
});

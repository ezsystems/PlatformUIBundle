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
                command: 'ezAddContent'
            };
        },

        _addHeading: function () {
            console.log('_addHeading');
            this.execCommand({
                tagName: 'h1',
                attributes: {
                    "data-ez-placeholder": "Heading 1",
                },
            });
        },

        render: function () {
            var css = "ae-button " + this.getStateClasses();

            // TODO: remove that config and switch to ESLint
            // see https://jira.ez.no/browse/EZP-23209
            /* jshint maxlen: false */
            return (
                React.createElement("button", {className: css, onClick: this._addHeading, tabIndex: this.props.tabIndex}, 
                    React.createElement("span", {className: "ae-icon-h1"})
                )
            );
            /* jshint maxlen: 120 */
        },
    });

    AlloyEditor.Buttons[ButtonHeading.key] = AlloyEditor.ButtonHeading = ButtonHeading;
});

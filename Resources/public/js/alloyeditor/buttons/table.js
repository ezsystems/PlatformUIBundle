/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
// **NOTICE:**
// THIS IS AN AUTO-GENERATED FILE
// DO YOUR MODIFICATIONS IN THE CORRESPONDING .jsx FILE
// AND REGENERATE IT WITH: grunt jsx
// END OF NOTICE
YUI.add('ez-alloyeditor-button-table', function (Y) {
    "use strict";

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        EzButtonTable;

    /**
     * The ButtonTable component represents a button to add a table.
     *
     * This component is a copy of AlloyEditor.ButtonTable, with slightly different render() logic.
     *
     * @uses AlloyEditor.ButtonCommand
     * @uses AlloyEditor.ButtonStateClasses
     *
     * @class eZ.AlloyEditor.ButtonTable
     */
    EzButtonTable = React.createClass({displayName: "EzButtonTable",
        propTypes: {
            editor: React.PropTypes.object.isRequired,
            label: React.PropTypes.string,
            tabIndex: React.PropTypes.number,
        },

        statics: {
            key: 'eztable',
        },

        render: function () {
            if (this.props.renderExclusive) {
                return (
                    React.createElement(AlloyEditor.ButtonTableEdit, React.__spread({},  this.props))
                );
            }

            var css = "ae-button ez-ae-labeled-button";

            return (
                React.createElement("button", {className: css, onClick: this.props.requestExclusive, tabIndex: this.props.tabIndex}, 
                    React.createElement("span", {className: "ez-ae-icon ez-ae-icon-table ae-icon-table"}), 
                    React.createElement("p", {className: "ez-ae-label"}, Y.eZ.trans('table', {}, 'onlineeditor'))
                )
            );
        },
    });

    AlloyEditor.Buttons[EzButtonTable.key] = AlloyEditor.EzButtonTable = EzButtonTable;
});

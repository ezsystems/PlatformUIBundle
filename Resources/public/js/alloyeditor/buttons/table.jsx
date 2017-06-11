/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-table', function (Y) {
    "use strict";

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonTable;

    /**
     * The ButtonTable class provides functionality for creating and editing a table in a document. ButtonTable
     * renders in two different modes:
     *
     * - Normal: Just a button that allows to switch to the edition mode
     * - Exclusive: The ButtonTableEdit UI with all the table edition controls.
     *
     * This component is a copy of AlloyEditor.ButtonTable, with slightly different render() logic.
     *
     * @class ButtonTable
     */
    ButtonTable = React.createClass({
        propTypes: {
            editor: React.PropTypes.object.isRequired,
            label: React.PropTypes.string,
            tabIndex: React.PropTypes.number,
        },

        statics: {
            key: 'eztable'
        },

        render: function () {
            if (this.props.renderExclusive) {
                return (
                    <AlloyEditor.ButtonTableEdit {...this.props} />
                );
            }

            var css = "ae-button ez-ae-labeled-button";

            return (
                <button className={css} onClick={this.props.requestExclusive} tabIndex={this.props.tabIndex}>
                    <span className="ez-ae-icon ez-ae-icon-table ae-icon-table"></span>
                    <p className="ez-ae-label">{Y.eZ.trans('table', {}, 'onlineeditor')}</p>
                </button>
            );
        },
    });

    AlloyEditor.Buttons[ButtonTable.key] = AlloyEditor.ButtonTable = ButtonTable;
});

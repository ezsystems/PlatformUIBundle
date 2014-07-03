/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-selection-table', function (Y) {
    "use strict";
    /**
     * The selection table extension
     *
     * @module ez-selection-table
     */
    Y.namespace('eZ');

    var SELECTED_ROW_CLASS = 'is-row-selected',
        _events = {
            '.ez-selection-table-checkbox': {
                'change': '_handleRowSelection'
            }
        },
        /**
         * Extension for the views providing a table that is meant to select
         * some items and to enable one or several buttons depending on the
         * selection.
         *
         * This extensions expects the following markup to work correctly:
         *
         *      <table class="ez-selection-table" data-selection-buttons=".mybutton">
         *      <tr class="ez-selection-table-row">
         *          <td>
         *              <input type="checkbox" class="ez-selection-table-checkbox">
         *          </td>
         *      </tr>
         *      <!-- ... -->
         *      </table>
         *      <button class="mybutton" disabled="disabled">Do!</button>
         *
         * When a ez-selection-table-checkbox checkbox is checked, its
         * ez-selection-table-row ancestor gets the is-row-selected class and if
         * there's at least one checked checkbox, the buttons that match the
         * selector in the data-selection-buttons attribute are enabled.
         *
         * @namespace eZ
         * @class SelectionTable
         * @extensionfor Y.View
         */
        SelectionTable = function () {};

    SelectionTable.prototype.initializer = function () {
        this.events = Y.merge(_events, this.events);
    };

    /**
     * Change event handler for the ez-selection-table-checkbox checkboxes
     *
     * @method _handleRowSelection
     * @protected
     * @param {Object} e event facade
     */
    SelectionTable.prototype._handleRowSelection = function (e) {
        var buttons = this.get('container').all(
                e.target.ancestor('.ez-selection-table').getAttribute('data-selection-buttons')
            );

        this._uiSelectRow(e.target);
        this._uiEnableButtons(buttons);
    };

    /**
     * Adds or removes the selected class on the row in which the checkbox is
     *
     * @method _uiSelectRow
     * @protected
     * @param {Node} checkbox
     */
    SelectionTable.prototype._uiSelectRow = function (checkbox) {
        var row = checkbox.ancestor('.ez-selection-table-row');

        if ( checkbox.get('checked') ) {
            row.addClass(SELECTED_ROW_CLASS);
        } else {
            row.removeClass(SELECTED_ROW_CLASS);
        }
    };

    /**
     * Enables or disableds the buttons depending on the number of selected
     * checkboxes
     *
     * @method _uiEnableButtons
     * @protected
     * @param {NodeList} buttons
     */
    SelectionTable.prototype._uiEnableButtons = function (buttons) {
        if ( this.get('container').all('.' + SELECTED_ROW_CLASS).size() !== 0 ) {
            buttons.set('disabled', false);
        } else {
            buttons.set('disabled', true);
        }
    };

    Y.eZ.SelectionTable = SelectionTable;
});

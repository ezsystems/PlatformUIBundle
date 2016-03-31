/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistview', function (Y) {
    "use strict";
    /**
     * Provides the subitem list view.
     *
     * @module ez-subitemlistview
     */
    Y.namespace('eZ');

    var IS_PAGE_LOADING = 'is-page-loading',
        IS_DISABLED = 'is-disabled';

    function linkIsDisabled(link) {
        return link.hasClass(IS_DISABLED);
    }

    /**
     * The subitem list view.
     *
     * @namespace eZ
     * @class SubitemListView
     * @constructor
     * @extends eZ.SubitemBaseView
     */
    Y.eZ.SubitemListView = Y.Base.create('subitemListView', Y.eZ.SubitemBaseView, [Y.eZ.AsynchronousView], {
        events: {
            '.ez-subitemlist-navigation-link': {
                'tap': '_handlePagination',
            },
            '.ez-subitem-priority-input': {
                'tap': '_displayPriorityButtons',
                'blur': '_validatePriority',
                'valuechange': '_validatePriority',
                'mouseover': '_displayEditIcon',
                'mouseout': '_hideEditIcon',
            },
            '.ez-subitem-priority-cancel': {
                'tap': '_restorePriorityCell',
            },
            '.ez-subitem-priority-form': {
                'submit': '_setPriority'
            },
        },

        initializer: function () {
            this._fireMethod = this._fireLocationSearch;
            this._watchAttribute = 'subitems';

            this.after(['subitemsChange', 'loadingErrorChange'], this._uiPageEndLoading);

            this.after('offsetChange', this._refresh);

            this.get('location').after(['hiddenChange', 'invisibleChange'], Y.bind(this._refresh, this));
        },

        /**
         * Refreshes the subitem list
         *
         * @protected
         * @method _refresh
         */
        _refresh: function () {
            if ( this.get('active') ) {
                this._uiPageLoading();
                this._fireLocationSearch();
            }
        },

        /**
         * Sets the UI in the loading the state
         *
         * @protected
         * @method _uiPageLoading
         */
        _uiPageLoading: function () {
            this.get('container').addClass(IS_PAGE_LOADING);
        },

        /**
         * Removes the loading state of the UI
         *
         * @method _uiPageEndLoading
         * @protected
         */
        _uiPageEndLoading: function () {
            this.get('container').removeClass(IS_PAGE_LOADING);
        },

        /**
         * tap event handler on the navigation links. Changes the page if the
         * link is not disabled
         *
         * @method _handlePagination
         * @param {EventFacade} e
         * @protected
         */
        _handlePagination: function (e) {
            var type = e.target.getAttribute('rel');

            e.preventDefault();
            if ( !linkIsDisabled(e.target) ) {
                this._getGotoMethod(type).call(this);
            }
        },

        /**
         * Returns the *goto* function for the given type operation
         *
         * @method _getGotoMethod
         * @private
         * @param {String} type
         * @return {Function}
         */
        _getGotoMethod: function (type) {
            return this['_goto' + type.charAt(0).toUpperCase() + type.substr(1)];
        },

        /**
         * Go to the first page
         *
         * @method _gotoFirst
         * @protected
         */
        _gotoFirst: function () {
            this.set('offset', 0);
        },

        /**
         * Go to the next page
         *
         * @method _gotoNext
         * @protected
         */
        _gotoNext: function () {
            this.set('offset', this.get('offset') + this.get('limit'));
        },

        /**
         * Go to the previous page
         *
         * @method _gotoPrev
         * @protected
         */
        _gotoPrev: function () {
            this.set('offset', this.get('offset') - this.get('limit'));
        },

        /**
         * Go to the last page
         *
         * @method _gotoLast
         * @protected
         */
        _gotoLast: function () {
            var limit = this.get('limit');

            this.set('offset', (Math.ceil(this.get('location').get('childCount') / limit) - 1) * limit);
        },

        render: function () {
            this.get('container').setHTML(this.template({
                location: this.get('location').toJSON(),
                subitems: this._convertToJSONList(),
                loadingError: this.get('loadingError'),
                isFirst: this._isFirstPage(),
                isLast: this._isLastPage(),
                hasPages: this._hasPages(),
            }));

            return this;
        },

        /**
         * Show the edit icon to inform the user input can be edited.
         *
         * @method _displayEditIcon
         * @protected
         * @param {Object} e event facade
         */
        _displayEditIcon: function (e) {
            var selectedCell = this._getPriorityCell(e.target.getAttribute('data-location-id'));

            if (!this.get('editingPriority')) {
                selectedCell.addClass('ez-subitem-hovered-priority-cell');
            }
        },

        /**
         * Show the error icon to inform the user input is not correctly filled.
         *
         * @method _displayErrorIcon
         * @protected
         * @param {Node} input the DOM node of the input
         * @param {Node} selectedCell the DOM node of the current selected cell
         */
        _displayErrorIcon: function (input, selectedCell) {
            selectedCell.addClass('ez-subitem-error-priority-cell');
            selectedCell.removeClass('ez-subitem-selected-priority-cell');
        },

        /**
         * Hide the edit icon to inform the user input can be edited.
         *
         * @method _hideEditIcon
         * @protected
         * @param {Object} e event facade
         */
        _hideEditIcon: function (e) {
            var selectedCell = this._getPriorityCell(e.target.getAttribute('data-location-id'));

            selectedCell.removeClass('ez-subitem-hovered-priority-cell');
        },

        /**
         * Hide the error icon.
         *
         * @method _hideErrorIcon
         * @protected
         * @param {Object} input the DOM node of the input
         * @param {Object} selectedCell the DOM node of the current selected cell
         */
        _hideErrorIcon: function (input, selectedCell) {
            selectedCell.removeClass('ez-subitem-error-priority-cell');
            selectedCell.addClass('ez-subitem-selected-priority-cell');
        },

        /**
         * Show the 'validate' & 'cancel' buttons which allow to update or not the priority.
         *
         * @method _displayPriorityButtons
         * @protected
         * @param {Object} e event facade
         */
        _displayPriorityButtons: function (e) {
            var selectedCell = this._getPriorityCell(e.target.getAttribute('data-location-id'));

            e.preventDefault();
            if (!this.get('editingPriority')) {
                this._set('editingPriority', true);
                selectedCell.removeClass('ez-subitem-hovered-priority-cell');
                selectedCell.addClass('ez-subitem-selected-priority-cell');
                e.target.removeAttribute('readonly');
            }
        },

        /**
         * Hide the 'validate' & 'cancel' buttons which allow to update or not the priority.
         * Also fill back priority input with the current sub item priority.
         *
         * @method _restorePriorityCell
         * @protected
         * @param {Object} e event facade
         */
        _restorePriorityCell: function (e) {
            e.preventDefault();
            this._hidePriorityButtons();
            this._restorePriorityValue(e);
        },

        /**
         * Restore the input value with the priority of the sub item
         *
         * @method _restorePriorityValue
         * @protected
         * @param {Object} e event facade
         */
        _restorePriorityValue: function (e) {
            var input = this._getPriorityInput('#' + e.target.getAttribute('data-priority-input')),
                subItem = this._getSubItemStruct(input.getAttribute('data-location-id'));

            input.set('value', subItem.location.get('priority'));
            input.setAttribute('readonly', 'readonly');
        },

        /**
         * Return the sub item struct with the giiven locationId
         *
         * @method _getSubItemStruct
         * @protected
         * @param {Number} locationId
         * @return {Object}
         */
        _getSubItemStruct: function (locationId) {
            return Y.Array.find(this.get('subitems'), function (locStruct) {
                return locStruct.location.get('locationId') == locationId;
            });
        },

        /**
         * Hide the validate and cancel buttons displayed while editing priority
         *
         * @method _hidePriorityButtons
         * @protected
         */
        _hidePriorityButtons: function () {
            var selectedCell = this.get('container').one('.ez-subitem-selected-priority-cell');

            selectedCell.removeClass('ez-subitem-selected-priority-cell');
            this._set('editingPriority', false);
        },

        /**
         *  Event handler allowing to change the priority of the subitem
         *
         * @method _setPriority
         * @protected
         * @param {Object} e event facade
         */
        _setPriority: function (e) {
            var button = this.get('container').one('#priority-validate-' + e.target.getAttribute('data-location-id')),
                selectedCell = this.get('container').one('.ez-subitem-selected-priority-cell'),
                input = this._getPriorityInput('#' + button.getAttribute('data-priority-input')),
                subItem = this._getSubItemStruct(input.getAttribute('data-location-id'));

            this.fire('updatePriority', {location: subItem.location, priority: input.get('value')});
            input.setAttribute('readonly', 'readonly');
            selectedCell.removeClass('ez-subitem-selected-priority-cell');
            this._set('editingPriority', false);
            e.preventDefault();
        },

        /**
         * Validates the current input of priority
         *
         * @method _validatePriority
         * @protected
         * @param {Object} e event facade
         */
        _validatePriority: function (e) {
            var validity = this._getInputValidity(e.target),
                selectedCell = this._getPriorityCell(e.target.getAttribute('data-location-id'));

            if ( validity.patternMismatch || validity.valueMissing ) {
                this._displayErrorIcon(e.target, selectedCell);
            } else if (selectedCell.hasClass('ez-subitem-error-priority-cell')) {
                this._hideErrorIcon(e.target, selectedCell);
            }
        },

        /**
         * Return the priority cell for a given location
         *
         * @method _getPriorityCell
         * @param {String} locationId
         * @return {Node}
         */
        _getPriorityCell: function (locationId) {
            return this.get('container').one('#priority-cell-' + locationId);
        },

        /**
         * Return the priority input from its id
         *
         * @method _getPriorityInput
         * @param {String} inputId
         * @return {Node}
         */
        _getPriorityInput: function (inputId) {
            return this.get('container').one(inputId);
        },

        /**
         * Returns the input validity state object for the input generated by
         * the Integer template
         *
         * See https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
         *
         * @protected
         * @method _getInputValidity
         * @return {ValidityState}
         */
        _getInputValidity: function (input) {
            return input.get('validity');
        },

        /**
         * Checks whether the pagination will be useful
         *
         * @method _hasPages
         * @private
         * @return {Boolean}
         */
        _hasPages: function () {
            return this.get('location').get('childCount') > this.get('limit');
        },

        /**
         * Checks whether the user is on the first "page".
         *
         * @method _isLastPage
         * @private
         * @return {Boolean}
         */
        _isFirstPage: function () {
            return (this.get('offset') === 0);
        },

        /**
         * Checks whether the user is on the last "page".
         *
         * @method _isLastPage
         * @private
         * @return {Boolean}
         */
        _isLastPage: function () {
            return this.get('offset') >= (this.get('location').get('childCount') - this.get('limit'));
        },

        /**
         * Converts the subitems array to JSON so that it can be used in the
         * template.
         *
         * @method _convertToJSONList
         * @protected
         * @return undefined|Array
         */
        _convertToJSONList: function () {
            if ( !this.get('subitems') ) {
                return this.get('subitems');
            }
            return Y.Array.map(this.get('subitems'), function (locStruct) {
                return locStruct.location.toJSON();
            });
        },

        /**
         * Fires the `locationSearch` event to fetch the subitems of the
         * currently displayed Location.
         *
         * @method _fireLocationSearch
         * @protected
         */
        _fireLocationSearch: function () {
            var locationId = this.get('location').get('locationId');

            this.fire('locationSearch', {
                viewName: 'subitemlist-' + locationId,
                resultAttribute: 'subitems',
                search: {
                    criteria: {
                        "ParentLocationIdCriterion": this.get('location').get('locationId'),
                    },
                    offset: this.get('offset'),
                    limit: this.get('limit'),
                    /*
                     * @TODO see https://jira.ez.no/browse/EZP-24315
                     * this is not yet supported by the views in the REST API
                    sortClauses: {
                        SortClause: {
                            SortField: this.get('location').get('sortField'),
                            SortOrder: this.get('location').get('sortOrder'),
                        },
                    },
                    */
                },
            });
        },
    }, {
        ATTRS: {
            identifier: {
                readOnly: true,
                value: 'list',
            },

            name: {
                readOnly: true,
                value: "List view",
            },

            /**
             * The max number of the Locations to display in the subitem list
             * per "page".
             *
             * @attribute limit
             * @default 10
             * @type Number
             */
            limit: {
                value: 10,
            },

            /**
             * The offset in the Location list.
             *
             * @attribute offset
             * @default 0
             * @type Number
             */
            offset: {
                value: 0,
            },

            /**
             * The location being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             * @writeOnce
             */
            location: {
                writeOnce: 'initOnly',
            },

            /**
             * The subitems list.
             *
             * @attribute subitems
             * @type Array of {Object} array containing location structs
             */
            subitems: {},

            /**
             * Boolean to check if a subitem priority is currently selected.
             *
             * @attribute editingPriority
             * @default false
             * @type Boolean
             */
            editingPriority: {
                value: false,
            },
        }
    });
});

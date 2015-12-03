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
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.SubitemListView = Y.Base.create('subitemListView', Y.eZ.TemplateBasedView, [Y.eZ.AsynchronousView], {
        events: {
            '.ez-subitemlist-navigation-link': {
                'tap': '_handlePagination',
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
            this._uiPageLoading();
            this._fireLocationSearch();
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
        }
    });
});

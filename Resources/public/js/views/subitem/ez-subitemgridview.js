/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemgridview', function (Y) {
    "use strict";
    /**
     * Provides the subitem grid view.
     *
     * @module ez-subitemgridview
     */
    Y.namespace('eZ');

    function logDeprecatedWarning(what, replace) {
        console.log('[DEPRECATED] `' + what + '` is deprecated');
        console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');
        console.log('[DEPRECATED] Please use `' + replace + '` instead');
    }

    /**
     * The subitem grid view.
     *
     * @namespace eZ
     * @class SubitemGridView
     * @constructor
     * @extends eZ.SubitemBaseView
     */
    Y.eZ.SubitemGridView = Y.Base.create('subitemGridView', Y.eZ.SubitemBaseView, [Y.eZ.AsynchronousView, Y.eZ.LoadMorePagination], {
        initializer: function () {
            this._set('identifier', 'grid');
            this._set('name', 'Grid view');
            this._fireMethod = this._prepareInitialLoad;
            this._errorHandlingMethod = this._handleError;

            this._ItemView = Y.eZ.SubitemGridItemView;
            this._itemViewBaseConfig = {};
            this._getExpectedItemsCount = this._getChildCount;

            this.after('offsetChange', function (e) {
                if ( this.get('offset') >= 0 ) {
                    this._fireLocationSearch();
                }
            });
            this.after('loadingErrorChange', function () {
                this._set('loading', false);
            });
        },

        /**
         * Handles the loading error. It fires a notification and makes sure the
         * state of the view is consistent with what is actually loaded.
         *
         * @method _handleError
         * @protected
         */
        _handleError: function () {
            if ( this.get('loadingError') ) {
                this.fire('notify', {
                    notification: {
                        text: "An error occurred while the loading the subitems",
                        identifier: 'subitem-grid-load-error-' + this.get('location').get('id'),
                        state: 'error',
                        timeout: 0
                    }
                });
                this.set('offset', this.get('offset') - this.get('limit'));
                this._uiUpdatePagination();
            }
        },

        /**
         * `activeChange` handler. Set the view in loading mode and fire the
         * first location search event if the subitems are not already filled.
         *
         * @method _prepareInitialLoad
         * @protected
         */
        _prepareInitialLoad: function () {
            if ( this.get('offset') < 0 ) {
                this.set('offset', 0);
            }
        },


        /**
         * Sets the UI in the loading the state
         *
         * @protected
         * @deprecated
         * @method _uiLoading
         */
        _uiLoading: function () {
            logDeprecatedWarning('_uiLoading', '_uiPageLoading');
            this._uiPageLoading();
        },

        /**
         * Removes the loading state of the UI
         *
         * @method _uiEndLoading
         * @deprecated
         * @protected
         */
        _uiEndLoading: function () {
            logDeprecatedWarning('_uiEndLoading', '_uiPageEndLoading');
            this._uiPageEndLoading();
        },

        render: function () {
            var subitemCount = this._getChildCount();

            if ( !this.get('items') ) {
                this.get('container').setHTML(this.template({
                    limit: this.get('limit'),
                    subitemCount: subitemCount,
                    displayCount: Math.min(this.get('limit'), subitemCount),
                }));
            }

            return this;
        },

        /**
         * Appends a rendred grid item view for the last loaded subitem.
         *
         * @method _appendGridItem
         * @deprecated
         * @protected
         * @param {Array} newSubitems
         */
        _appendGridItem: function (newSubitems) {
            logDeprecatedWarning('_appendGridItem', '_appendItems');
            this._appendItems(newSubitems);
            this._gridItemViews = this._itemViews;
        },

        /**
         * Counts the number of loaded items.
         *
         * @method _countLoadedSubitems
         * @deprecated
         * @protected
         * @return {Number}
         */
        _countLoadedSubitems: function () {
            logDeprecatedWarning('_countLoadedSubitems', '_countLoadedItems');
            return this._countLoadedItems();
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

            this.set('loadingError', false);
            this.fire('locationSearch', {
                viewName: 'subitemgrid-' + locationId,
                resultAttribute: 'items',
                loadContentType: true,
                loadContent: true,
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
             * The subitems list. This attribute is deprecated, it will be
             * removed in PlatformUI 2.0. Use `items` instead.
             *
             * @attribute subitems
             * @deprecated
             * @type Array of {Object} array containing location structs
             */
            subitems: {
                setter: function (value, attr, info) {
                    this.set('items', value);
					return this.get('items');
                },
                getter: function () {
                    return this.get('items');
                },
            },
        }
    });
});

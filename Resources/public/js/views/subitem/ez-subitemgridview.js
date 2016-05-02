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

    var IS_PAGE_LOADING = 'is-page-loading',
        SubitemGridItemView;

    /**
     * The subitem grid item view. Note: This component is **private** as this
     * part will shortly change and will be replaced by the concept of content
     * cards.
     *
     * @private
     * @class SubitemGridItemView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    SubitemGridItemView = Y.Base.create('subitemGridItemView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {
            this.containerTemplate = '<div class="ez-subitemgrid-item"/>';
        },

        render: function () {
            this.get('container').setHTML(this.template({
                content: this.get('content').toJSON(),
                location: this.get('location').toJSON(),
                contentType: this.get('contentType').toJSON(),
            }));
            return this;
        },
    }, {
        ATTRS: {
            /**
             * The content type of the content being displayed
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             */
            contentType: {},

            /**
             * The location of the content item being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             */
            location: {},

            /**
             * The content being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             */
            content: {},
        },
    });


    /**
     * The subitem grid view.
     *
     * @namespace eZ
     * @class SubitemGridView
     * @constructor
     * @extends eZ.SubitemBaseView
     */
    Y.eZ.SubitemGridView = Y.Base.create('subitemGridView', Y.eZ.SubitemBaseView, [Y.eZ.AsynchronousView], {
        events: {
            '.ez-subitemgrid-more': {
                'tap': '_loadMore',
            },
        },

        initializer: function () {
            this._set('identifier', 'grid');
            this._set('name', 'Grid view');
            this._fireMethod = this._prepareInitialLoad;
            this._errorHandlingMethod = this._handleError;

            /**
             * Holds the grid item view instances for the current grid.
             *
             * @property _gridItemViews
             * @protected
             * @type Array<SubitemGridItemView>
             */
            this._gridItemViews = [];

            this.after('offsetChange', function (e) {
                if ( this.get('offset') >= 0 ) {
                    this._uiLoading();
                    this._fireLocationSearch();
                    this._disableLoadMore();
                }
            });
            this.after('subitemsChange', function (e) {
                this._uiUpdatePagination();
                this._appendGridItem(this._getNewlyAddedSubitems(e.newVal, e.prevVal));
            });
            this.after(['subitemsChange', 'loadingErrorChange'], this._uiEndLoading);
        },

        destructor: function () {
            this._gridItemViews.forEach(function (item) {
                item.destroy();
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
         * Updates the pagination displayed to the editor.
         *
         * @method _uiUpdatePagination
         * @protected
         */
        _uiUpdatePagination: function () {
            this._updateDisplayedCount();
            this._updateMoreCount();
            if ( this._countLoadedSubitems() < this.get('location').get('childCount') ) {
                this._enableLoadMore();
            }
        },

        /**
         * Counts the number of loaded subitems.
         *
         * @method _countLoadedSubitems
         * @protected
         * @return {Number}
         */
        _countLoadedSubitems: function () {
            return this.get('subitems') ? this.get('subitems').length : 0;
        },

        /**
         * Returns the load more button
         *
         * @method _getLoadMore
         * @protected
         * @return {Y.Node}
         */
        _getLoadMore: function () {
            return this.get('container').one('.ez-subitemgrid-more');
        },

        /**
         * Disables the load more button
         *
         * @method _disableLoadMore
         * @protected
         */
        _disableLoadMore: function () {
            this._getLoadMore().set('disabled', true);
        },

        /**
         * Enables the load more button
         *
         * @method _enableLoadMore
         * @protected
         */
        _enableLoadMore: function () {
            this._getLoadMore().set('disabled', false);
        },

        /**
         * Updates the display count with the number of currently loaded
         * subitems.
         *
         * @method _updateDisplayedCount
         * @protected
         */
        _updateDisplayedCount: function () {
            this.get('container').one('.ez-subitemgrid-display-count').setContent(
                this._countLoadedSubitems()
            );
        },

        /**
         * Updates the more count in the load more button.
         *
         * @method _updateMoreCount
         * @protected
         */
        _updateMoreCount: function () {
            var moreCount = Math.min(
                    this.get('limit'),
                    this.get('location').get('childCount') - this._countLoadedSubitems()
                );

            if ( !moreCount ) {
                moreCount = this.get('limit');
            }
            this.get('container').one('.ez-subitemgrid-more-count').setContent(moreCount);
        },

        /**
         * Sets the UI in the loading the state
         *
         * @protected
         * @method _uiLoading
         */
        _uiLoading: function () {
            this.get('container').addClass(IS_PAGE_LOADING);
        },

        /**
         * Removes the loading state of the UI
         *
         * @method _uiEndLoading
         * @protected
         */
        _uiEndLoading: function () {
            this.get('container').removeClass(IS_PAGE_LOADING);
        },

        render: function () {
            var subitemCount = this.get('location').get('childCount');

            if ( !this.get('subitems') ) {
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
         * @protected
         * @param {Array} newSubitems
         */
        _appendGridItem: function (newSubitems) {
            var gridContent = this.get('container').one('.ez-subitemgrid-content');

            newSubitems.forEach(function (struct) {
                var itemView = new SubitemGridItemView(struct);

                this._gridItemViews.push(itemView);
                gridContent.append(
                    itemView.render().get('container')
                );
            }, this);
        },

        /**
         * Return an array containing the subitems that we want to append
         * in the grid view.
         *
         * @method _getNewlyAddedSubitems
         * @private
         * @param {Array} subitemNewVal an array containing the new subitems.
         * @param {Array} subitemPrevVal an array containing the old subitems.
         */
        _getNewlyAddedSubitems: function (subitemNewVal, subitemPrevVal) {
            var subitemPreviousCount = subitemPrevVal ? subitemPrevVal.length : 0,
                subitemNewCount = subitemNewVal.length;

            return this.get('subitems').slice(subitemPreviousCount - subitemNewCount);
        },

        /**
         * `tap` event handler on the load more button.
         *
         * @method _loadMore
         * @protected
         */
        _loadMore: function (e) {
            e.preventDefault();
            this.set('offset', this.get('offset') + this.get('limit'));
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
                resultAttribute: 'subitems',
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
             * The max number of the Locations to display per 'show more'
             * session
             *
             * @attribute limit
             * @default 10
             * @type Number
             */
            limit: {
                value: 10,
            },

            /**
             * The offset in the Location list. A value below zero means no
             * loading has not been made yet.
             *
             * @attribute offset
             * @default minus the limit
             * @type Number
             */
            offset: {
                valueFn: function () {
                    return -1 * this.get('limit');
                },
            },

            /**
             * The subitems list.
             *
             * @attribute subitems
             * @type Array of {Object} array containing location structs
             */
            subitems: {
                setter: function (value) {
                    var current = this.get('subitems');

                    if ( current ) {
                        return current.concat(value);
                    }
                    return value;
                },
            },
        }
    });
});

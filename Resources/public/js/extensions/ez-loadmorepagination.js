/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-loadmorepagination', function (Y) {
    "use strict";
    /**
     * Provide the LoadMorePagination extension
     *
     * @module ez-loadmorepagination
     */
    Y.namespace('eZ');

    var IS_PAGE_LOADING = 'is-page-loading';

    /**
     * View extension providing a pagination based on a *load more* button.
     * A *Load More Pagination* view can render and append an item view per new
     * item added in the `items` attribute. The view output should provide an
     * element with the class `ez-loadmorepagination-more`, when the user *taps*
     * on its element, the `offset` attribute is incremented by `limit` value.
     * The view is free to handle that event in its own way but this extension
     * is primarily design to be used with the `eZ.AsynchronousView` extension.
     * It also handles a `loading` state which result in the `is-page-loading`
     * class to be added/removed from the view container.
     * The extension also expects the rendered view to have the following
     * elements:
     * * an element with the class `ez-loadmorepagination-content` where the
     * item view containers are added
     * * an element with the class `ez-loadmorepagination-more-count` where the
     * remaing number of element to load is displayed
     * * an element with the class `ez-loadmorepagination-display-count` where
     * the number of currently displayed element is shown.
     *
     * When a View is extended with this extension, it should define the
     * following properties:
     * * `_getExpectedItemsCount` a function that should return the number of
     * expected items in total
     * * `_ItemViews` a constructor function to build the View items
     * * `_itemViewBaseConfig` the base configuration to pass the item views.
     *   This object will be merged with the item object and will be passed to
     *   the item view.
     *
     * @namespace eZ
     * @class LoadMorePagination
     * @extensionfor Y.View
     */
    Y.eZ.LoadMorePagination = Y.Base.create('loadMorePagination', Y.View, [], {
        events: {
            '.ez-loadmorepagination-more': {
                'tap': '_loadMore',
            },
        },

        initializer: function () {
            /**
             * Holds the grid item view instances for the current grid.
             * This property is deprecated and will be removed in PlatformUI
             * 2.0, please use `this._itemViews` instead.
             *
             * @property _gridItemViews
             * @protected
             * @deprecated
             * @type Array<SubitemGridItemView>
             */
            this._gridItemViews = [];

            /**
             * Holds the item view instances
             *
             * @property _itemViews
             * @protected
             * @type Array<eZ.View>
             */
            this._itemViews = [];

            /**
             * Holds a function returning the number of items the view is supposed
             * to display
             *
             * @property _getExpectedItemsCount
             * @protected
             * @required
             * @type {Function}
             */

            /**
             * Holds the View constructor to use to render each item.
             *
             * @property _ItemView
             * @protected
             * @required
             * @type {Function}
             */

            /**
             * Holds the base configuration object for the item view. This
             * object will be merged with the item object and the resulting
             * object is used as the configuraton for the item view instance.
             *
             * @property _itemViewBaseConfig
             * @protected
             * @required
             * @type {Object}
             */

            this.get('container').addClass('ez-loadmorepagination');
            if ( this.get('loading') ) {
                this._uiPageLoading();
            }
            this.after('loadingChange', function () {
                if ( this.get('loading') ) {
                    this._uiPageLoading();
                } else {
                    this._uiPageEndLoading();
                }
            });

            this.after('offsetChange', function (e) {
                this._set('loading', true);
                this._disableLoadMore();
            });
            this.after('itemsChange', function (e) {
                this._set('loading', false);
                this._appendItems(this._getNewlyAddedItems(e.newVal, e.prevVal));
                this._uiUpdatePagination();
            });
        },

        /**
         * Destroys the item views
         *
         * @private
         * @method _destroyItemViews
         */
        _destroyItemViews: function () {
            this._itemViews.forEach(function (item) {
                item.destroy({remove: true});
            });
            this._itemViews = [];
        },

        destructor: function () {
            this._destroyItemViews();
        },

        /**
         * `tap` event handler on the load more button.
         *
         * @method _loadMore
         * @protected
         */
        _loadMore: function (e) {
            e.preventDefault();
            if ( !e.currentTarget.get('disabled') ) {
                this.set('offset', this.get('offset') + this.get('limit'));
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
         * Counts the number of loaded and displayed items.
         *
         * @method _countLoadedItems
         * @protected
         * @return {Number}
         */
        _countLoadedItems: function () {
            return this._itemViews.length;
        },

        /**
         * Returns the load more button
         *
         * @method _getLoadMore
         * @protected
         * @return {Y.Node}
         */
        _getLoadMore: function () {
            return this.get('container').one('.ez-loadmorepagination-more');
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
         * Updates the pagination displayed to the editor.
         *
         * @method _uiUpdatePagination
         * @protected
         */
        _uiUpdatePagination: function () {
            this._updateDisplayedCount();
            this._updateMoreCount();
            if ( this._countLoadedItems() < this._getExpectedItemsCount() ) {
                this._enableLoadMore();
            } else {
                this._disableLoadMore();
            }
        },

        /**
         * Updates the display count with the number of currently loaded
         * subitems.
         *
         * @method _updateDisplayedCount
         * @protected
         */
        _updateDisplayedCount: function () {
            this.get('container').one('.ez-loadmorepagination-display-count').setContent(
                this._countLoadedItems()
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
                    this._getExpectedItemsCount() - this._countLoadedItems()
                );

            if ( !moreCount ) {
                moreCount = this.get('limit');
            }
            this.get('container').one('.ez-loadmorepagination-more-count').setContent(moreCount);
        },

        /**
         * Returns the item view configuration for the given `struct`.
         * It mixes the view configuration, the  base item view configuration
         * and the struct.
         *
         * @private
         * @method _getItemViewConfig
         * @param {Object} struct
         * @return {Object}
         */
        _getItemViewConfig: function (struct) {
            return Y.merge(
                {config: this.get('config')},
                this._itemViewBaseConfig,
                struct
            );
        },

        /**
         * Appends a rendered item view for the last loaded items.
         *
         * @method _appendItems
         * @deprecated
         * @protected
         * @param {Array} newItems
         */
        _appendItems: function (newItems) {
            var content = this.get('container').one('.ez-loadmorepagination-content'),
                ItemView = this._ItemView;

            newItems.forEach(function (struct) {
                var itemView = new ItemView(this._getItemViewConfig(struct));

                itemView.addTarget(this);
                this._itemViews.push(itemView);
                content.append(
                    itemView.render().get('container')
                );
                itemView.set('active', true);
            }, this);
        },

        /**
         * Return an array containing the items that we want to append
         * in the view.
         *
         * @method _getNewlyAddedItems
         * @private
         * @param {Array} itemNewVal an array containing the new items.
         * @param {Array} itemPrevVal an array containing the old items.
         */
        _getNewlyAddedItems: function (itemNewVal, itemPrevVal) {
            var itemPreviousCount = itemPrevVal ? itemPrevVal.length : 0,
                itemNewCount = itemNewVal.length;

            return this.get('items').slice(itemPreviousCount - itemNewCount);
        },
    }, {
        ATTRS: {
            /**
             * Indicates the whether the subitem list is currently in loading.
             *
             * @attribute loading
             * @type {Boolean}
             * @readOnly
             */
            loading: {
                readOnly: true,
            },


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
             * loading has been made yet.
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
             * The items to display
             *
             * @attribute items
             * @type Array<Mixed>
             */
            items: {
                setter: function (value, attr, info) {
                    var current = this.get('items'),
                        flag = info || {};

                    if ( flag.reset ) {
                        return value;
                    }
                    if ( current ) {
                        return current.concat(value);
                    }
                    return value;
                },
            },
        },
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchlistview', function (Y) {
    "use strict";

    /**
     * Provides the search list view class
     *
     * @module ez-searchlistview
     */
    Y.namespace('eZ');

    /**
     * The search list view
     *
     * @namespace eZ
     * @class SearchListView
     * @constructor
     * @extends Y.eZ.TemplateBasedView
     */
    Y.eZ.SearchListView = Y.Base.create('searchListView', Y.eZ.TemplateBasedView, [Y.eZ.LoadMorePagination], {
        initializer: function () {
            this._ItemView = this.get('itemViewConstructor');
            this._itemViewBaseConfig = {
                displayedProperties: this.get('displayedProperties'),
            };
            this._getExpectedItemsCount = this._getSearchResultCount;
        },
        
        render: function () {
            var itemsCount = this.get('items').length,
                remainingItemsCount = this._getSearchResultCount() - itemsCount;

            this.get('container').setHTML(this.template({
                searchResultCount: this._getSearchResultCount(),
                displayCount: itemsCount,
                remainingCount: Math.min(this.get('limit'), remainingItemsCount),
                columns: this._getColumns(),
            }));
            this._renderItems();
            if( this._getSearchResultCount() > this._countLoadedItems() ) {
                this._enableLoadMore();
            }
            return this;
        },

        /**
         * Returns the search result count.
         *
         * @protected
         * @method _getSearchResultCount
         */
        _getSearchResultCount: function () {
            return this.get('searchResultCount');
        },

        /**
         * Renders an item view per result item.
         *
         * @protected
         * @method _renderItems
         */
        _renderItems: function () {
            var contentNode = this.get('container').one('.ez-searchlist-content'),
                ItemView = this.get('itemViewConstructor');

            if ( !this.get('items') || this.get('items').length === 0 ) {
                return;
            }
            this.get('items').forEach(function (struct) {
                var view = new ItemView({
                    displayedProperties: this.get('displayedProperties'),
                    location: struct.location,
                    content: struct.content,
                    contentType: struct.contentType,
                    bubbleTargets: this,
                });

                this._itemViews.push(view);
               
                contentNode.append(view.render().get('container'));
            }, this);
           
        },

        /**
         * Returns an array of objects describing the columns to add to the
         * list. Each object contains an `identifier` and a `name`.
         *
         * @method _getColumns
         * @protected
         * @return Array
         */
        _getColumns: function () {
            return this.get('displayedProperties').map(function (identifier) {
                return {
                    name: this.get('propertyNames')[identifier],
                    identifier: identifier,
                };
            }, this);
        },

    }, {
        ATTRS: {
            /**
             * The number of item returned by the searchRequest
             *
             * @attribute searchResultCount
             * @type Number
             */
            searchResultCount: {},
            
            /**
             * The properties to display
             *
             * @attribute displayedProperties
             * @type Array
             */
            displayedProperties: {
                value: ['name', 'lastModificationDate', 'contentType', 'translations'],
            },

            /**
             * A key value object to store the human readable names of the
             * columns.
             *
             * @attribute propertyNames
             * @type {Object}
             */
            propertyNames: {
                valueFn: function () {
                    return {
                        'name': Y.eZ.trans('name', {}, 'search'),
                        'lastModificationDate': Y.eZ.trans('modified', {}, 'search'),
                        'contentType': Y.eZ.trans('content.type', {}, 'search'),
                        'translations': Y.eZ.trans('translations', {}, 'search'),
                    };
                }
            },

            /**
             * The constructor function to use to instance the item view
             * instances.
             *
             * @attribute itemViewConstructor
             * @type {Function}
             * @default {Y.eZ.SubitemListItemView}
             */
            itemViewConstructor: {
                valueFn: function () {
                    return Y.eZ.SubitemListItemView;
                },
            },
        }
    });
});

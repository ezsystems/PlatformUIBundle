/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderexplorerlevelview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery finder explorer level view
     *
     * @module ez-universaldiscoveryfinderexplorerlevelview
     */
    Y.namespace('eZ');

    var events = {
            '.ez-explorer-level-item': {
                'tap': '_fireExplorerNavigate',
            }
        },
        viewName = 'universalDiscoveryFinderExplorerLevelView',
        HAS_SELECTED_ITEM = 'has-selected-item',
        IS_LOADING = 'is-loading';

    /**
     * The universal discovery finder explorer level. It shows content of a given depth
     *
     * @namespace eZ
     * @class UniversalDiscoveryFinderExplorerLevelView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoveryFinderExplorerLevelView = Y.Base.create(viewName, Y.eZ.TemplateBasedView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            var container = this.get('container');
            this._fireMethod = this._fireLocationSearch;
            this._watchAttribute = 'items';
            container.addClass(IS_LOADING);

            this.after('searchResultListChange', this._setItems);
            this.on('itemsChange', function () {
                this.set('scroll', true);
                container.removeClass(IS_LOADING);
            });
            container.on('scroll', this._handleScroll, this);

            this.after('ownSelectedItemChange', function () {
                if (!this.get('ownSelectedItem')) {
                    container.removeClass(HAS_SELECTED_ITEM);
                } else {
                    container.addClass(HAS_SELECTED_ITEM);
                }
            });
            this._addDOMEventHandlers(events);
        },

        render: function () {
            var container = this.get('container'),
                itemsJSONified = [];

            Y.Array.each(this.get('items'), function (item) {
                itemsJSONified.push({
                    location: item.location.toJSON(),
                    contentInfo: item.location.get('contentInfo').toJSON(),
                    selectedLocationId: item.location.get('locationId') == this.get('selectLocationId') ? true : false,
                });
            }, this);
            container.setHTML(this.template({
                items: itemsJSONified,
                loadingError: this.get('loadingError'),
            }));
            return this;
        },

        /**
         * Scrolls to fully display the levelView.
         *
         * @method displayLevelView
         */
        displayLevelView: function () {
            this.get('container').one('.ez-ud-finder-explorerlevel-anchor').scrollIntoView({behavior: "smooth"});
        },

        /**
         * Handles user scrolling to determine if it needs to load more items.
         *
         * @method _handleScroll
         * @protected
         */
        _handleScroll: function (e) {
            var isScrolledEnough = e.target._node.scrollHeight - e.target._node.scrollTop <= 2 * e.target._node.offsetHeight,
                offset = this.get('offset'),
                limit = this.get('limit');
            
            if (isScrolledEnough && limit + offset < this.get('searchResultCount') && this.get('scroll')) {
                this.get('container').addClass(IS_LOADING);
                this.set('scroll', false);
                this.set('offset', offset + limit);
                this._fireLocationSearch();
            }
        },

        /**
         * Fires the `locationSearch` event to fetch the result list of the search.
         *
         * @method _fireLocationSearch
         * @protected
         */
        _fireLocationSearch: function () {
            this.fire('locationSearch', {
                viewName: 'udwexplorerlevel-',
                resultAttribute: 'searchResultList',
                resultTotalCountAttribute: 'searchResultCount',
                loadContent: true,
                loadContentType: true,
                search: {
                    filter: {
                        "ParentLocationIdCriterion": this.get('parentLocation').get('locationId'),
                    },
                    sortLocation: this.get('parentLocation'),
                    offset: this.get('offset'),
                    limit: this.get('limit'),
                },
            });
        },

        /**
         * `searchResultListChange` event handler. It sets items attribute with the results.
         *
         * @method _setItems
         * @protected
         */
        _setItems: function () {
            var items = [];

            Y.Array.each(this.get('searchResultList'), function (hit) {
                var location = hit.location,
                    contentType = hit.contentType,
                    content = hit.content,
                    data = {
                        location: location,
                        contentInfo: location.get('contentInfo'),
                        contentType: contentType,
                        content: content,
                    };

                items.push(data);
            }, this);
            if (this.get('items').length) {
                this.set('items', this.get('items').concat(items));
            } else {
                this.set('items', items);
            }
        },
        
        /**
         * Finds location in item by a given locationId and returns the item.
         *
         * @method _findItemByLocationId
         * @param {Number} locationId
         * @protected
         * @return {Object} Returns an item containing a location.
         */
        _findItemByLocationId: function (locationId) {
            var item;

            Y.Array.each(this.get('items'), function (hit) {
                if (hit.location.get('locationId') == locationId) {
                  item = hit;
                }
            }, this);
            return item;
        },

        /**
         * Fires the `explorerNavigate` event to explore the chosen location.
         *
         * @method _fireExplorerNavigate
         * @protected
         */
        _fireExplorerNavigate: function (e) {
            var nodeLocationId = e.target.getData('location-id'),
                item = this._findItemByLocationId(nodeLocationId);
            if ((this.get('selectLocationId') != nodeLocationId || !this.get('ownSelectedItem')) && item) {
                this.set('selectLocationId', nodeLocationId);
                
                /**
                 * Navigates to the given item's location in the explorer.
                 *
                 * @event explorerNavigate
                 * @param {Object} data
                 * @param {eZ.Location} location
                 * @param {Number} depth
                 *
                 */
                this.fire('explorerNavigate', {
                    data: item,
                    location: item.location,
                    depth: this.get('depth')
                });
            }
        },
    }, {
        ATTRS: {
            /**
             * The items to display
             *
             * @attribute items
             * @type Array
             */
            items: {
                value: []
            },

            /**
             * Defines if the level view own the current selected item
             *
             * @attribute ownSelecteditem
             * @type Boolean
             */
            ownSelectedItem: {
                value: false
            },

            /**
             * The search result list containing the result of the locationSearch
             *
             * @attribute searchResultList
             * @type Array
             */
            searchResultList: {
                value: []
            },

            /**
             * The location id of the selected item
             *
             * @attribute selectLocationId
             * @default 0
             * @type Number
             */
            selectLocationId: {
                value: 0
            },

            /**
             * The depth of the level view (the first level view depth is 1)
             *
             * @attribute depth
             * @type Number
             */
            depth: {},

            /**
             * The offset to start the locationSearch to
             *
             * @attribute offset
             * @type Number
             */
            offset: {
                value: 0
            },

            /**
             * The limit of the results
             *
             * @attribute limit
             * @type Number
             */
            limit: {
                value: 50
            },

            /**
             * Flag to stop the scroll event handler
             *
             * @attribute scroll
             * @type Boolean
             */
            scroll: {
                value: true
            },

            /**
             * The number of total search results. -1 means we are waiting for
             * the results.
             *
             * @attribute searchResultCount
             * @default -1
             * @type Number
             */
            searchResultCount: {
                value: -1,
            },
        },
    });
});

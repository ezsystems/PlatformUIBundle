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
        IS_LOADING = 'is-loading';

    /**
     * The universal discovery finder explorer level. It shows content of a given depth
     *
     * @namespace eZ
     * @class UniversalDiscoveryFinderExplorerLevelView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoveryFinderExplorerLevelView = Y.Base.create( viewName, Y.eZ.TemplateBasedView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLocationSearch;
            this._watchAttribute = 'items';
            this.get('container').addClass(IS_LOADING);

            this.after('searchResultListChange', this._setItems);
            this.on('itemsChange', function () {
                this.get('container').removeClass(IS_LOADING);
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
                loading: this.get('loading'),
                loadingError: this.get('loadingError')
            }));
            return this;
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
                loadContent: true,
                loadContentType: true,
                search: {
                    filter: {
                        "ParentLocationIdCriterion": this.get('parentLocation').get('locationId'),
                    },
                    sortLocation: this.get('parentLocation'),
                    offset: 0,
                    limit: 50,
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
            this.set('items', items);
        },

        /**
         * Finds location in item by a given locationId and returns the item.
         *
         * @method _findLocationInItems
         * @param {Number} locationId
         * @protected
         * @return {Object} Returns an item containing a location.
         */
        _findLocationInItems: function (locationId) {
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
                item = this._findLocationInItems(nodeLocationId);
            
            if ( this.get('selectLocationId') !== nodeLocationId && item) {
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
        },
    });
});

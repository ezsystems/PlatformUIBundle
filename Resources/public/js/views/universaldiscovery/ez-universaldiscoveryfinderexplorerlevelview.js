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
        IS_LOADING = 'is-loading',
        IS_DISABLED = 'is-disabled';

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

            /**
             * FLag to indicate if we are currently watching the scroll and trying to load items.
             *
             * @property _watchingScroll
             * @type Boolean
             * @protected
             */
            this._watchingScroll = true;
            this._fireMethod = this._fireLocationSearch;
            this._watchAttribute = 'items';
            container.addClass(IS_LOADING);

            this.after('activeChange', function () {
                if (!this.get('active')) {
                    this.get('container').addClass(IS_LOADING);
                }
            });
            this.on('itemsChange', function () {
                this._watchingScroll = true;
                container.removeClass(IS_LOADING);
            });
            this.after('offsetChange', function () {
                this._watchingScroll = false;
                this.get('container').addClass(IS_LOADING);
                this._fireLocationSearch();
            });
            container.plug(Y.Plugin.ScrollInfo);
            container.scrollInfo.on('scrollDown', this._handleScroll, this);

            this.after('ownSelectedItemChange', this._uiOwnSelectedItem);
            this._uiDisableLevelView();
            this._uiOwnSelectedItem();
            this._addDOMEventHandlers(events);
        },

        /**
         * Adds the is disabled item class on the container
         * depending on the `disabled` attribute value.
         *
         * @method _uiDisableLevelView
         * @protected
         */
        _uiDisableLevelView: function () {
            var container = this.get('container');

            if (this.get('disabled')) {
                container.addClass(IS_DISABLED);
            }
        },

        /**
         * Adds or removes the has selected item class on the container
         * depending on the `ownSelectedItem` attribute value.
         *
         * @method _uiOwnSelectedItem
         * @protected
         */
        _uiOwnSelectedItem: function () {
            var container = this.get('container');

            if (!this.get('ownSelectedItem')) {
                container.removeClass(HAS_SELECTED_ITEM);
            } else {
                container.addClass(HAS_SELECTED_ITEM);
            }
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
         * Custom reset implementation to explicitly reset the items.
         *
         * @method reset
         */
        reset: function (name) {
            if (name == 'items') {
                this.set('items', null);
            } else {
                this.constructor.superclass.reset.apply(this, arguments);
            }
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
        _handleScroll: function () {
            var offset = this.get('offset'),
                limit = this.get('limit');

            if (this._watchingScroll && this._hasScrolledEnough() && limit + offset < this.get('childCount')) {
                this.set('offset', offset + limit);
            }
        },

        /**
         * Determines if user has scrolled enough to try to load other items.
         *
         * @method _hasScrolledEnough
         * @protected
         */
        _hasScrolledEnough: function () {
            var container = this.get('container');

            return container.get('scrollHeight') - container.get('scrollTop') <= 2 * container.get('offsetHeight');
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
                resultAttribute: 'items',
                resultTotalCountAttribute: 'childCount',
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
         * items attribute setter. It sets items attribute with the results.
         *
         * @method _setItems
         * @param {Array} newItems
         * @protected
         */
        _setItems: function (newItems) {
            var items = [];

            Y.Array.each(newItems, function (hit) {
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
            if (this.get('items')) {
                return  this.get('items').concat(items);
            } else {
                return items;
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

            if (!this.get('disabled') && (this.get('selectLocationId') != nodeLocationId || !this.get('ownSelectedItem')) && item) {
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
                setter: function (resultList) {
                    if (resultList !== null) {
                        return this._setItems(resultList);
                    }
                }
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
             * The number of total child the parent location has.
             *
             * @attribute childCount
             * @type Number
             */
            childCount: {},

            /**
             * Boolean that tell if the view is disabled or not.
             * The items of a disabled level view can not be explored.
             * 
             * @attribute disabled
             * @writeOnce
             * @default false
             * @type Boolean
             */
            disabled: {
                writeOnce: 'initOnly',
                value: false,
            },
        },
    });
});

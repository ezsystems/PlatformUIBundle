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
        };

    /**
     * The universal discovery finder explorer level. It shows content of a given depth
     *
     * @namespace eZ
     * @class UniversalDiscoveryFinderExplorerLevelView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoveryFinderExplorerLevelView = Y.Base.create(
        'universalDiscoveryFinderExplorerLevelView', 
        Y.eZ.TemplateBasedView, 
        [Y.eZ.AsynchronousView], 
        {
            
        initializer: function () {
            this._fireMethod = this._fireLocationSearch;
            this._watchAttribute = 'items';

            this.after('searchResultListChange', this._searchResultChanged);
            this.on('itemsChange', function () {
                this.set('loading', false);
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
                    contentType: item.contentType.toJSON(),
                    content: item.content.toJSON(),
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
                resultTotalCountAttribute: 'searchResultCount',
                loadContent: true,
                loadContentType: true,
                search: {
                    filter: {
                        "ParentLocationIdCriterion": this.get('parentLocation').get('locationId'),
                    },
                    offset: 0,
                    limit: 50,
                },
            });
        },

        /**
         * `searchResultListChange` event handler. It sets items attribute with the results.
         *
         * @method _searchResultChanged
         * @protected
         */
        _searchResultChanged: function () {
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
         * Fires the `explorerNavigate` event to explore the chosen location.
         *
         * @method _fireExplorerNavigate
         * @protected
         */
        _fireExplorerNavigate: function (e) {
            var nodeLocationId = e.target.getData('location-id');
            
            if ( this.get('selectLocationId') !== nodeLocationId ) {
                Y.Array.each(this.get('items'), function (item) {
                    if (item.location.get('locationId') == nodeLocationId){
                        this.set('selectLocationId', nodeLocationId);
                        this.fire('explorerNavigate', {
                            data: item,
                            location: item.location,
                            depth: this.get('depth')
                        });
                    }
                }, this);
            }
        },
    }, {
        ATTRS: {
            /**
             * The search result list containing the items to display
             *
             * @attribute searchResultList
             * @type Array
             */
            items: {
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
             * Flag which represent if the view is loading 
             *
             * @attribute loading
             * @default true
             * @type Boolean
             */
            loading: {
                value: true
            }
          
        },
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchview', function (Y) {
    "use strict";
    /**
     * Provides the search view class
     *
     * @module ez-searchview
     */
    Y.namespace('eZ');

    /**
     * The search view
     *
     * @namespace eZ
     * @class SearchView
     * @constructor
     * @extends Y.eZ.TemplateBasedView
     */
    Y.eZ.SearchView = Y.Base.create('searchView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-search-form': {
                'submit': '_setUserSearchString'
            },
        },

        initializer: function () {
            this.after('userSearchStringChange', function() {
                this._fireSearchRequest(this.get('userSearchString'), this.get('loadMoreAddingNumber'));
            });
            this.after('searchListView:offsetChange', function(e) {
                this._set('limit', this.get('limit') + this.get('loadMoreAddingNumber'));
                this._fireSearchRequest(this.get('searchString'), this.get('limit'));
            });
        },

        render: function () {
            this.get('container').setHTML(
                this.template({
                    "searchString": this.get("searchString"),
                })
            );
            this._uiSetMinHeight();

            if (this.get('searchString')) {
                this._renderSearchListView();
            }
            return this;
        },

        /**
         * Renders the view which handle the list results
         *
         * @private
         * @method _renderSearchListView
         */
        _renderSearchListView: function () {
            this.get('container').one('.ez-searchlist-content').append(
                this.get('searchListView').render().get('container')
            );
        },

        /**
         * Fire the searchRequest with a searchString and a limit in params
         *
         * @protected
         * @param {String} searchString The string used to search
         * @param {Integer} limit The limit of result to show
         * @method _fireSearchRequest
         */
        _fireSearchRequest: function (searchString, limit) {
            this.fire('searchRequest', {
                searchString: searchString,
                limit: limit,
            });
        },

        /**
         * Submit form event handler, will set the userSearchString
         *
         * @protected
         * @param {EventFacade} e
         * @method _setUserSearchString
         */
        _setUserSearchString: function (e) {
            var form = e.currentTarget,
                searchString = form.one('.ez-search-form-input').get('value');

            e.preventDefault();
            this._set('userSearchString', searchString);
        },

        /**
         * Sets the minimum height of the view
         *
         * @private
         * @method _uiSetMinHeight
         */
        _uiSetMinHeight: function () {
            var container = this.get('container');

            container.one('.ez-searchview-content').setStyle(
                'minHeight', container.get('winHeight') + 'px'
            );
        },
    }, {
        ATTRS: {
            /**
             * The search string the user wants to search
             *
             * @attribute userSearchString
             * @default true
             * @type Boolean
             * @readOnly
             */
            userSearchString: {
                readOnly: true
            },

            /**
             * The limit of the results
             *
             * @attribute limit
             * @type Number
             */
            limit: {},

            /**
             * The number of elements that should increase the limit
             *  after loading more contents
             *
             * @attribute limit
             * @type Number
             */
            loadMoreAddingNumber: {},

            /**
             * The search string used for the search request
             *
             * @attribute searchString
             * @default true
             * @type String
             */
            searchString: {},

            /**
             * The search result list containing the items to display
             *
             * @attribute searchResultList
             * @type Array
             */
            searchResultList: {},

            /**
             * The number of item returned by the searchRequest
             *
             * @attribute searchResultCount
             * @type Number
             */
            searchResultCount: {},

            /**
             * The view which handle the result list
             *
             * @attribute searchListView
             * @type {ez.SearchListView}
             */
            searchListView: {
                writeOnce: 'initOnly',
                valueFn: function () {
                    return new Y.eZ.SearchListView({
                        items: this.get('searchResultList'),
                        searchResultCount: this.get('searchResultCount'),
                        limit: this.get('loadMoreAddingNumber'),
                        offset: this.get('limit'),
                        bubbleTargets: this,
                    });
                },
            },
        }
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverysearchview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery search method
     *
     * @module ez-universaldiscoverysearchview
     */
    Y.namespace('eZ');

    var events = {
            '.ez-ud-search-form': {
                'submit': '_search',
            },
            '.ez-ud-searchresult-preview-button': {
                'tap': '_selectContent',
            },
            '.ez-searchresult-navigation-link': {
                'tap': '_handlePagination',
            },
        },
        IS_SELECTED_ROW_CLASS = 'is-selected',
        IS_PAGE_LOADING = 'is-page-loading',
        IS_DISABLED = 'is-disabled';

    function linkIsDisabled(link) {
        return link.hasClass(IS_DISABLED);
    }

    /**
     * The universal discovery search method view. It allows the user to pick a
     * content from the list which is the result of the search.
     *
     * @namespace eZ
     * @class UniversalDiscoverySearchView
     * @constructor
     * @extends eZ.UniversalDiscoveryMethodBaseView
     */
    Y.eZ.UniversalDiscoverySearchView = Y.Base.create('universalDiscoverySearchView',
        Y.eZ.UniversalDiscoveryMethodBaseView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLocationSearch;
            this._watchAttribute = 'searchResultList';

            this.events = Y.merge(this.events, events);

            this.on('searchResultListChange', this._searchResultChanged);
            this.on('selectContent', this._uiSelectContent);

            this.after(['multipleChange', 'isSelectableChange'], this._setSelectedViewAttrs);
            this.after('searchTextChange', this._fireLocationSearch);
            this.after('visibleChange', this._unselectContent);
        },

        /**
         * Custom reset implementation to explicitely reset the sub views.
         *
         * @method reset
         * @param {String} [name]
         */
        reset: function (name) {
            if ( name === 'selectedView' ) {
                this.get('selectedView').reset();
                return;
            }
            this.constructor.superclass.reset.apply(this, arguments);
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                searchText: this.get('searchText'),
                searchResultCount: this.get('searchResultCount'),
                searchResultList: this._convertToJSONList(),
                isFirst: this._isFirstPage(),
                isLast: this._isLastPage(),
                hasPages: this._hasPages(),
                loadingError: this.get('loadingError'),
                multiple: this.get('multiple')
            }));

            container.one('.ez-ud-search-selected').append(
                this.get('selectedView').render().get('container')
            );
            return this;
        },

        onUnselectContent: function (contentId) {
            var selectedViewStruct = this.get('selectedView').get('contentStruct');

            if ( selectedViewStruct && selectedViewStruct.contentInfo.get('id') === contentId ) {
                this.get('selectedView').set('confirmButtonEnabled', true);
            }
        },

        /**
         * `searchResultListChange` event handler. It clears selectedView and hides page loading mask.
         *
         * @method _searchResultChanged
         * @protected
         */
        _searchResultChanged: function () {
            this.get('selectedView').set('contentStruct', null);
            this._uiPageEndLoading();
        },

        /**
         * `multipleChange` and `isSelectableChange` events handler. It sets the selected view
         * `addConfirmButton` flag according to the new `multiple` attribute value and passes
         * new `isSelectable` function to the selected view.
         *
         * @method _setSelectedViewAttrs
         * @protected
         */
        _setSelectedViewAttrs: function () {
            this.get('selectedView').setAttrs({
                'addConfirmButton': this.get('multiple'),
                'isSelectable': this.get('isSelectable')
            });
        },

        /**
         * Search form `submit` event handler. It sets the attributes that take part in the search
         * and proceeds with the firing location search.
         *
         * @method _search
         * @protected
         * @param {EventFacade} e
         */
        _search: function (e) {
            var searchInput = e.target.one('.ez-ud-search-text'),
                searchText = searchInput.get('value');

            e.preventDefault();

            this.set('offset', 0);
            this.set('searchText', searchText);
        },

        /**
         * Fires the `locationSearch` event to fetch the result list of the search.
         *
         * @method _fireLocationSearch
         * @protected
         */
        _fireLocationSearch: function () {
            var searchText = this.get('searchText');

            this._uiPageLoading();

            if (searchText.length > 0) {
                this.fire('locationSearch', {
                    viewName: 'udwsearch-' + searchText,
                    resultAttribute: 'searchResultList',
                    resultTotalCountAttribute: 'searchResultCount',
                    loadContent: this.get('loadContent'),
                    loadContentType: true,
                    search: {
                        criteria: {
                            "FullTextCriterion": searchText,
                        },
                        offset: this.get('offset'),
                        limit: this.get('limit'),
                    },
                });
            } else {
                this.reset();
            }
        },

        /**
         * Converts the search result list array to JSON so that it can be used in the
         * template.
         *
         * @method _convertToJSONList
         * @protected
         * @return undefined|Array
         */
        _convertToJSONList: function () {
            if ( !this.get('searchResultList') ) {
                return this.get('searchResultList');
            }
            return Y.Array.map(this.get('searchResultList'), function (locationStruct) {
                return {
                    location: locationStruct.location.toJSON(),
                    contentType: locationStruct.contentType.toJSON()
                };
            });
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
         * `selectContent` event handler. It highlights only selected content and unhighlights other
         * contents. If selection in given event facade is empty then it just unhighlights all contents.
         *
         * @method _uiSelectContent
         * @param {EventFacade} e
         * @param {null|Object} e.selection selected contentStruct
         */
        _uiSelectContent: function (e) {
            var c = this.get('container'),
                locationId;

            c.all('.ez-searchresult-row').removeClass(IS_SELECTED_ROW_CLASS);

            if (e.selection) {
                locationId = e.selection.location.get('id');
                c.one('.ez-searchresult-row[data-location-id="' + locationId + '"]').addClass(IS_SELECTED_ROW_CLASS);
            }
        },

        /**
         * Fires the `selectContent` event for the given `selection`
         *
         * @method _fireSelectContent
         * @param {Object|Null} selection
         * @protected
         */
        _fireSelectContent: function (selection) {
            /**
             * Fired when a content is selected or unselected. The event facade
             * provides the content structure (the contentInfo, location and content
             * type models) if a selection was made.
             *
             * @event selectContent
             * @param selection {Object|Null}
             * @param selection.contentInfo {eZ.ContentInfo}
             * @param selection.location {eZ.Location}
             * @param selection.contentType {eZ.ContentType}
             */
            this.fire('selectContent', {
                selection: selection,
            });
        },

        /**
         * `visibleChange` event handler. It makes to reset the current
         * selection when the search method is hidden/showed
         *
         * @method _unselectContent
         * @protected
         */
        _unselectContent: function () {
            this._fireSelectContent(null);
            this.get('selectedView').set('contentStruct', null);
        },

        /**
         * Preview button `tap` event handler. It prepares contentStruct by taking location from
         * result list basing on location's id and adding contentInfo and contentType. After that
         * the row containing selected location is highlighted.
         *
         * @method _selectContent
         * @protected
         * @param {EventFacade} e
         */
        _selectContent: function (e) {
            var locationId = e.target.getAttribute('data-location-id'),
                locationStruct = this._getLocationStructFromResultList(locationId),
                location = locationStruct.location,
                contentType = locationStruct.contentType,
                contentInfo = location.get('contentInfo'),
                contentStruct = {
                    contentInfo: contentInfo,
                    location: location,
                    contentType: contentType
                },
                that = this;

            e.preventDefault();

            if (this.get('loadContent')) {
                contentStruct.content = locationStruct.content;
            }

            that._fireSelectContent(contentStruct);
            that.get('selectedView').set('contentStruct', contentStruct);
        },

        /**
         * Gets single location from the results list basing on the locations id.
         * If there is no location in search result with given location id then `undefined` is returned.
         *
         * @method _getLocationStructFromResultList
         * @protected
         * @param {String} locationId
         * @return {Object|Null} locationStruct
         * @return {eZ.Location} locationStruct.location
         * @return {eZ.ContentType} locationStruct.contentType
         */
        _getLocationStructFromResultList: function (locationId) {
            var locationStruct;

            Y.Array.each(this.get('searchResultList'), function (locStruct) {
                if (locStruct.location.get('id') === locationId) {
                    locationStruct = locStruct;
                }
            });

            return locationStruct;
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
                this._fireLocationSearch();
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

            this.set('offset', (Math.ceil(this.get('searchResultCount') / limit) - 1) * limit);
        },

        /**
         * Checks whether the pagination will be useful
         *
         * @method _hasPages
         * @private
         * @return {Boolean}
         */
        _hasPages: function () {
            return this.get('searchResultCount') > this.get('limit');
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
            return this.get('offset') >= (this.get('searchResultCount') - this.get('limit'));
        },
    }, {
        ATTRS: {
            /**
             * @attribute title
             * @default 'Search'
             */
            title: {
                value: 'Search',
                readOnly: true,
            },

            /**
             * @attribute identifier
             * @default 'search'
             */
            identifier: {
                value: 'search',
                readOnly: true,
            },

            /**
             * The max number of the Locations to display in the search result list
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
             * The offset in the search result list.
             *
             * @attribute offset
             * @default 0
             * @type Number
             */
            offset: {
                value: 0,
            },

            /**
             * The search text used in full text search.
             *
             * @attribute searchText
             * @default ''
             * @type String
             */
            searchText: {
                value: '',
            },

            /**
             * The number of total search results.
             *
             * @attribute searchResultCount
             * @default 0
             * @type Number
             */
            searchResultCount: {
                value: 0
            },

            /**
             * The search result list which is array containing location structs. Single location struct
             * is indexed object containing `location` (eZ.Location) and `contentType` (eZ.ContentType)
             *
             * @attribute searchResultList
             * @default []
             * @type Array of {Object} array containing location structs
             */
            searchResultList: {
                value: []
            },

            /**
             * Holds the selected view that displays the currently selected
             * content (if any)
             *
             * @attribute selectedView
             * @type {eZ.UniversalDiscoverySelectedView}
             */
            selectedView: {
                valueFn: function () {
                    return new Y.eZ.UniversalDiscoverySelectedView({
                        bubbleTargets: this,
                        addConfirmButton: this.get('multiple'),
                        isAlreadySelected: this.get('isAlreadySelected'),
                    });
                },
            },
        },
    });
});

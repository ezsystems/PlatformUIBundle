/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistview', function (Y) {
    "use strict";
    /**
     * Provides the subitem list view. This module is deprecated
     *
     * @module ez-subitemlistview
     * @deprecated
     */
    Y.namespace('eZ');

    var IS_PAGE_LOADING = 'is-page-loading',
        IS_DISABLED = 'is-disabled';

    function linkIsDisabled(link) {
        return link.hasClass(IS_DISABLED);
    }

    console.log('[DEPRECRATED] eZ.SubitemListView is deprecated');
    console.log('[DEPRECRATED] it will be removed from PlatformUI 2.0');
    console.log('[DEPRECRATED] use eZ.SubitemListMoreView instead');

    /**
     * The subitem list view.
     *
     * @namespace eZ
     * @class SubitemListView
     * @deprecated
     * @constructor
     * @extends eZ.SubitemBaseView
     */
    Y.eZ.SubitemListView = Y.Base.create('subitemListView', Y.eZ.SubitemBaseView, [Y.eZ.AsynchronousView], {
        events: {
            '.ez-subitemlist-navigation-link': {
                'tap': '_handlePagination',
            },
        },

        initializer: function () {
            this._set('identifier', 'list');
            this._set('name', 'List view');
            this._fireMethod = this._fireLocationSearch;
            this._watchAttribute = 'subitems';

            this.after(['subitemsChange', 'loadingErrorChange'], function (e) {
                this._set('loading', false);
            });

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

            this.after('offsetChange', this._refresh);

            this.get('location').after(['hiddenChange', 'invisibleChange'], Y.bind(this._refresh, this));

            /**
             * Holds the displayed subitem list item view instances
             *
             * @property _itemViews
             * @type {Array}
             * @protected
             */
            this._itemViews = [];

            this.after('*:editingPriorityChange', function (e) {
                if ( e.newVal ) {
                    this._lockPriorityEdit(e.target);
                } else {
                    this._unlockPriorityEdit();
                }
            });
        },

        /**
         * Restores the `canEditPriority` attribute so that the priority can be
         * editing in all views
         *
         * @method _unlockPriorityEdit
         * @protected
         */
        _unlockPriorityEdit: function () {
            this._itemViews.forEach(function (itemView) {
                itemView.set('canEditPriority', true);
            });
        },

        /**
         * Makes sure only one priority can be edited at a time.
         *
         * @protected
         * @method _lockPriorityEdit
         * @param {View} view the view where the priority occurs
         */
        _lockPriorityEdit: function (view) {
            this._itemViews.forEach(function (itemView) {
                itemView.set('canEditPriority', (itemView === view));
            });
        },

        destructor: function () {
            this._destroyItemViews();
        },

        /**
         * Refreshes the subitem list
         *
         * @protected
         * @method _refresh
         */
        _refresh: function () {
            if ( this.get('active') ) {
                this._fireLocationSearch();
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

            this.set('offset', (Math.ceil(this.get('location').get('childCount') / limit) - 1) * limit);
        },

        render: function () {
            this.get('container').setHTML(this.template({
                location: this.get('location').toJSON(),
                subitems: this._convertToJSONList(),
                loadingError: this.get('loadingError'),
                isFirst: this._isFirstPage(),
                isLast: this._isLastPage(),
                hasPages: this._hasPages(),
                columns: this._getColumns(),
            }));
            this._renderItems();
            return this;
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

        /**
         * Destroys the instantiated item views.
         *
         * @method _destroyItemViews
         * @protected
         */
        _destroyItemViews: function () {
            this._itemViews.forEach(function(view) {
                view.destroy();
            });
            this._itemViews = [];
        },

        /**
         * Renders an item view per subitem.
         *
         * @protected
         * @method _renderItems
         */
        _renderItems: function () {
            var contentNode = this.get('container').one('.ez-subitemlist-content'),
                ItemView = this.get('itemViewConstructor');

            if ( !this.get('subitems') ) {
                return;
            }
            this._destroyItemViews();
            this.get('subitems').forEach(function (struct) {
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
         * Checks whether the pagination will be useful
         *
         * @method _hasPages
         * @private
         * @return {Boolean}
         */
        _hasPages: function () {
            return this.get('location').get('childCount') > this.get('limit');
        },

        /**
         * Checks whether the user is on the first "page".
         *
         * @method _isFirstPage
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
            return this.get('offset') >= (this.get('location').get('childCount') - this.get('limit'));
        },

        /**
         * Converts the subitems array to JSON so that it can be used in the
         * template.
         * **Deprecated:** this method and the corresponding `subitems` template
         * variable will be removed in PlatformUI 2.0
         *
         * @method _convertToJSONList
         * @protected
         * @deprecated in 1.3
         * @return undefined|Array
         */
        _convertToJSONList: function () {
            if ( !this.get('subitems') ) {
                return this.get('subitems');
            }
            return Y.Array.map(this.get('subitems'), function (locStruct) {
                return locStruct.location.toJSON();
            });
        },

        /**
         * Fires the `locationSearch` event to fetch the subitems of the
         * currently displayed Location.
         *
         * @method _fireLocationSearch
         * @protected
         */
        _fireLocationSearch: function () {
            var location = this.get('location'),
                locationId = location.get('locationId');

            if ( !location.get('childCount') ) {
                this._set('loading', false);
                return;
            }
            this._set('loading', true);
            this.fire('locationSearch', {
                viewName: 'subitemlist-' + locationId,
                resultAttribute: 'subitems',
                loadContentType: true,
                loadContent: true,
                search: {
                    criteria: {
                        "ParentLocationIdCriterion": locationId,
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
             * Indicates the whether the subitem list is currently in loading.
             * The default value depends on the number of subitems.
             *
             * @attribute loading
             * @type {Boolean}
             * @readOnly
             */
            loading: {
                valueFn: function () {
                    return this.get('location').get('childCount') > 0;
                },
                readOnly: true,
            },

            /**
             * The max number of the Locations to display in the subitem list
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
             * The offset in the Location list.
             *
             * @attribute offset
             * @default 0
             * @type Number
             */
            offset: {
                value: 0,
            },

            /**
             * The subitems list.
             *
             * @attribute subitems
             * @type Array of {Object} array containing location structs
             */
            subitems: {},

            /**
             * The properties to display
             *
             * @attribute displayedProperties
             * @type Array
             */
            displayedProperties: {
                value: ['name', 'lastModificationDate', 'contentType', 'priority', 'translations'],
            },

            /**
             * A key value object to store the human readable names of the
             * columns.
             *
             * @attribute propertyNames
             * @type {Object}
             */
            propertyNames: {
                value: {
                    'name': 'Name',
                    'lastModificationDate': 'Modified',
                    'contentType': 'Content type',
                    'priority': 'Priority',
                    'translations': 'Translations',
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

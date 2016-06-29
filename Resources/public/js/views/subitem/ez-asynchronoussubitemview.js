/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-asynchronoussubitemview', function (Y) {
    "use strict";
    /**
     * Provides the base class for the asynchronous subitem views
     *
     * @module ez-subitemlistmoreview
     */
    Y.namespace('eZ');

    /**
     * It's an abstract view for the asynchronous subitem views. It avoids
     * duplicating the same method in every asynchronous subitem views.
     *
     * @namespace eZ
     * @class AsynchronousSubitemView
     * @constructor
     * @extends eZ.SubitemBaseView
     */
    Y.eZ.AsynchronousSubitemView = Y.Base.create('asynchronousSubitemView', Y.eZ.SubitemBaseView, [Y.eZ.AsynchronousView, Y.eZ.LoadMorePagination], {
        initializer: function () {
            this._fireMethod = this._prepareInitialLoad;
            this._errorHandlingMethod = this._handleError;

            this._getExpectedItemsCount = this._getChildCount;

            this._set('loading', (this._getChildCount() > 0));

            this.after('offsetChange', function (e) {
                if ( this.get('offset') >= 0 ) {
                    this._fireLocationSearch();
                }
            });
            this.after('loadingErrorChange', function (e) {
                this._set('loading', false);
            });
            this.get('location').after(
                ['sortOrderChange', 'sortFieldChange'],
                Y.bind(this._refresh, this)
            );
        },

        /**
         * Sets for the `offset` attribute to launch the initial loading of the
         * subitems. This method is supposed to be called when the view becomes
         * active.
         *
         * @method _prepareInitialLoad
         * @protected
         */
        _prepareInitialLoad: function () {
            if ( this.get('offset') < 0 && this._getChildCount() ) {
                this.set('offset', 0);
            }
        },

        /**
         * Refreshes the view if it's active. The subitems are reloaded and then
         * rerendered.
         *
         * @method _refresh
         * @protected
         */
        _refresh: function () {
            if ( this._getChildCount() ) {
                if ( this.get('active') ) {
                    this.set('items', [], {reset: true});
                    this._set('loading', true);
                    this.once('loadingChange', function () {
                        this._destroyItemViews();
                    });
                    this._fireLocationSearch(this.get('offset') + this.get('limit'));
                } else if ( this.get('offset') >= 0 ) {
                    this._destroyItemViews();
                    this.set('items', [], {reset: true});
                    this.reset('offset');
                }
            }
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
                        identifier: 'subitem-load-error-' + this.get('location').get('id'),
                        state: 'error',
                        timeout: 0
                    }
                });
                this._disableLoadMore();
            }
        },

        /**
         * Fires the `locationSearch` event to fetch the subitems of the
         * currently displayed Location.
         *
         * @method _fireLocationSearch
         * @param {Number} forceLimit indicates if we should force a limit value
         * (and offset to 0). This is used to reload the current list of
         * subitems.
         * @protected
         */
        _fireLocationSearch: function (forceLimit) {
            var locationId = this.get('location').get('locationId');

            this.set('loadingError', false);
            this.fire('locationSearch', {
                viewName: 'subitems-' + locationId,
                resultAttribute: 'items',
                loadContentType: true,
                loadContent: true,
                search: {
                    criteria: {
                        "ParentLocationIdCriterion": this.get('location').get('locationId'),
                    },
                    offset: forceLimit ? 0 : this.get('offset'),
                    limit: forceLimit ? forceLimit : this.get('limit'),
                    sortLocation: this.get('location'),
                },
            });
        },
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service component for the discovery bar
     *
     * @module ez-discoverybarviewservice
     */
    Y.namespace('eZ');

    /**
     * Discovery bar view service.
     *
     * @namespace eZ
     * @class DiscoveryBarViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.DiscoveryBarViewService = Y.Base.create('discoveryBarViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        initializer: function () {
            this.on('*:viewTrashAction', this._redirectToTrashView);
            this.on('*:viewSearchAction', this._redirectToSearchView);
            this.on('*:browseAction', this._fireContentDiscover);
        },

        /**
         * Checks whether the currently active view is a LocationViewView.
         *
         * @method _isLocationViewDisplayed
         * @protected
         * @return {Boolean}
         */
        _isLocationViewDisplayed: function () {
            return this.get('app').get('activeView') instanceof Y.eZ.LocationViewView;
        },

        /**
         * Launch UDW to the current location view if there is one.
         *
         * @method _fireContentDiscover
         * @protected
         */
        _fireContentDiscover: function () {
            var startingLocationId,
                rootDepth;

            if (this._isLocationViewDisplayed()) {
               startingLocationId = this.get('app').get('activeView').get('location').get('id');
               rootDepth = 1;
            }

            this.fire('contentDiscover', {
                config: {
                    title: Y.eZ.trans('content.browser.title', {}, 'bar'),
                    multiple: false,
                    contentDiscoveredHandler: Y.bind(this._navigateToLocation, this),
                    startingLocationId: startingLocationId,
                    minDiscoverDepth: rootDepth,
                    confirmLabel: Y.eZ.trans('view.content.label', {}, 'bar'),
                    isSelectable: function (contentStruct) {
                        return startingLocationId !== contentStruct.location.get('id');
                    }
                },
            });
        },

        /**
         * Navigate to the selected location.
         *
         * @method _navigateToLocation
         * @param {eventFacade} e
         * @protected
         */
        _navigateToLocation: function (e) {
            this.get('app').navigateTo('viewLocation', {
                id: e.selection.location.get('id'),
                languageCode: e.selection.content.get('mainLanguageCode')
            });
        },

        /**
         * Redirects to the Trash
         *
         * @method _redirectToTrashView
         * @protected
         */
        _redirectToTrashView: function () {
            this.get('app').navigateTo("viewTrash");
        },

        /**
         * Redirects to the Search view
         *
         * @method _redirectToSearchView
         * @protected
         */
        _redirectToSearchView: function () {
            this.get('app').navigateTo("viewSearch");
        },
    });
});

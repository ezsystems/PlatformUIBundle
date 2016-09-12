/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service the universal discovery
     *
     * @module ez-universaldiscoveryviewservice
     */
    Y.namespace('eZ');

    /**
     * View service for the universal discovery widget. It only provides the
     * configuration to the universal discovery view.
     *
     * @namespace eZ
     * @class UniversalDiscoveryViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.UniversalDiscoveryViewService = Y.Base.create('universalDiscoveryViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        initializer: function () {
            this.on('*:loadContentTypes', this._loadContentTypes);
        },

        /**
         * `loadContentTypes` event handler.
         *
         * @method _loadContentTypes
         * @param {EventFacade} e
         * @protected
         */
        _loadContentTypes: function (e) {
            var view = e.target;

            this.contentType.loadAllContentTypes(function (error, groups) {
                if ( error ) {
                    view.set('loadingError', true);
                    return;
                }
                view.setAttrs({
                    'contentTypeGroups': groups,
                    'loadingError': false,
                });
            });
        },

        /**
         * Returns the value of the `parameters` attribute. This attribute is set
         * when the app shows the universal discovery side view with the
         * configuration provided in the `contentDiscover` event.
         *
         * @method _getViewParameters
         * @protected
         * @return mixed
         */
        _getViewParameters: function () {
            return this.get('parameters');
        },
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockallcontentview', function (Y) {
    'use strict';

    /**
     * Provides the All Content Dashboard Block View class
     *
     * @module ez-dashboardblockallcontentview
     */
    Y.namespace('eZ');

    var BLOCK_IDENTIFIER = 'all-content';

    /**
     * The all content dashboard block view
     *
     * @namespace eZ
     * @class DashboardBlockAllContentView
     * @constructor
     * @extends eZ.DashboardBlockAsynchronousView
     */
    Y.eZ.DashboardBlockAllContentView = Y.Base.create('dashboardBlockAllContentView', Y.eZ.DashboardBlockAsynchronousView, [], {
        initializer: function () {
            this._set('identifier', BLOCK_IDENTIFIER);
        },

        _getTemplateItem: function (item) {
            return {
                contentType: item.contentType.toJSON(),
                location: item.location.toJSON(),
                contentInfo: item.location.get('contentInfo').toJSON(),
            };
        },

        /**
         * Fires a `locationSearch` event to search for the last modified
         * content under the root Location.
         *
         * @method _fireLoadDataEvent
         * @protected
         */
        _fireLoadDataEvent: function () {
            var rootLocation = this.get('rootLocation');

            this.fire('locationSearch', {
                viewName: 'all-content-' + rootLocation.get('locationId'),
                resultAttribute: 'items',
                loadContentType: true,
                search: {
                    criteria: {SubtreeCriterion: rootLocation.get('pathString')},
                    sortClauses: {DateModified: 'descending'},
                    limit: 10
                }
            });
        }
    });
});

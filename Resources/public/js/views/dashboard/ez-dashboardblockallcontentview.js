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

    var BLOCK_IDENTIFIER = 'all-content',
        events = {
            '.ez-edit-content-button': {
                'tap': '_callFireEditContentRequest'
            },
        };

    /**
     * The all content dashboard block view
     *
     * @namespace eZ
     * @class DashboardBlockAllContentView
     * @constructor
     * @extends eZ.DashboardBlockAsynchronousView
     */
    Y.eZ.DashboardBlockAllContentView = Y.Base.create('dashboardBlockAllContentView', Y.eZ.DashboardBlockAsynchronousView, [Y.eZ.DraftConflict], {

        initializer: function () {
            this._set('identifier', BLOCK_IDENTIFIER);
            this._addDOMEventHandlers(events);
        },

        _getTemplateItem: function (item) {
            return {
                contentType: item.contentType.toJSON(),
                location: item.location.toJSON(),
                contentInfo: item.location.get('contentInfo').toJSON(),
            };
        },

        _callFireEditContentRequest: function (e) {
            var item = this._getItem(e.target.getAttribute('data-content-id'));

            e.preventDefault();

            if (item) {
                this._fireEditContentRequest(
                    item.location.get('contentInfo'),
                    item.contentType
                );
            }
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
                    filter: {SubtreeCriterion: rootLocation.get('pathString')},
                    sortClauses: {DateModified: 'descending'},
                    limit: 10
                }
            });
        }
    });
});

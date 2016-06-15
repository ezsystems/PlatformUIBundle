/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockmydraftsview', function (Y) {
    'use strict';

    /**
     * Provides the My Drafts Dashboard Block View class
     *
     * @module ez-dashboardblockmydraftstview
     */
    Y.namespace('eZ');

    var BLOCK_IDENTIFIER = 'my-drafts';

    /**
     * The my drafts dashboard block view
     *
     * @namespace eZ
     * @class DashboardBlockMyDraftsView
     * @constructor
     * @extends eZ.DashboardBlockAsynchronousView
     */
    Y.eZ.DashboardBlockMyDraftsView = Y.Base.create('dashboardBlockMyDraftsView', Y.eZ.DashboardBlockAsynchronousView, [], {
        initializer: function () {
            this._set('identifier', BLOCK_IDENTIFIER);
        },

        _getTemplateItem: function (draft) {
            return {
                version: draft.version.toJSON(),
                contentType: draft.contentType.toJSON(),
                contentInfo: draft.contentInfo.toJSON()
            };
        },

        /**
         * Fires the `loadUserDrafts` event to retrieve the user's drafts with
         * the corresponding ContentInfo and ContentType objects.
         *
         * @method _fireLoadDataEvent
         * @protected
         */
        _fireLoadDataEvent: function () {
            /**
             * Makes request for my drafts dashboard block data.
             * Listened in {eZ.Plugin.UserDrafts}
             *
             * @event loadUserDrafts
             * @param attributeName {String} the name of attribute to be updated when data is loaded
             * @param limit {Number} number of results
             */
            this.fire('loadUserDrafts', {
                attributeName: 'items',
                limit: 10
            });
        }
    });
});

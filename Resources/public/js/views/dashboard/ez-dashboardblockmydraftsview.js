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
     * @extends eZ.DashboardBlockBaseView
     */
    Y.eZ.DashboardBlockMyDraftsView = Y.Base.create('dashboardBlockMyDraftsView', Y.eZ.DashboardBlockAsynchronousView, [], {
        initializer: function () {
            this._set('identifier', BLOCK_IDENTIFIER);
            this.get('container').addClass(this._generateViewClassName(Y.eZ.DashboardBlockAsynchronousView.NAME));
        },

        /**
         * Renders the dashboard block view
         *
         * @method render
         * @return {eZ.DashboardBlockView} the view itself
         */
        render: function () {
            var drafts = this.get('content') || [];

            if ('toJSON' in drafts) {
                drafts = drafts.toJSON();
            }

            this.get('container').setHTML(this.template({drafts: drafts}));

            return this;
        },

        /**
         * Makes request for data
         *
         * @method _getDraftsData
         * @protected
         * @param event {Object} event facade
         */
        _getContent: function () {
            /**
             * Makes request for my drafts dashboard block data.
             * Listened in {eZ.Plugin.UserDrafts}
             *
             * @event loadUserDrafts
             * @param attributeName {String} the name of attribute to be updated when data is loaded
             * @param limit {Number} number of results
             */
            this.fire('loadUserDrafts', {
                attributeName: 'content',
                limit: 10
            });
        }
    }, {
        ATTRS: {
            /**
             * The dashboard block content. The versions list.
             *
             * @attribute content
             * @type Y.ModelList
             */
            content: {},
        },
    });
});

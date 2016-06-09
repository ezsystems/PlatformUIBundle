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
     * @extends eZ.DashboardBlockBaseView
     */
    Y.eZ.DashboardBlockAllContentView = Y.Base.create('dashboardBlockAllContentView', Y.eZ.DashboardBlockAsynchronousView, [], {
        initializer: function () {
            this._set('identifier', BLOCK_IDENTIFIER);
            this.get('container').addClass(this._generateViewClassName(Y.eZ.DashboardBlockAsynchronousView.NAME));
        },

        /**
         * Renders the dashboard block view
         *
         * @method render
         * @return {eZ.DashboardBlockAllContentView} the view itself
         */
        render: function () {
            var items = this.get('content').map(function (item) {
                    return {
                        /*
                         * @TODO remove content model
                         * see  https://jira.ez.no/browse/EZP-25842
                         */
                        content: item.content.toJSON(),
                        contentType: item.contentType.toJSON(),
                        location: item.location.toJSON(),
                        contentInfo: item.location.get('contentInfo').toJSON(),
                    };
                });

            this.get('container').setHTML(this.template({
                items: items,
                loadingError: this.get('loadingError'),
            }));

            return this;
        },

        /**
         * Makes request for data
         *
         * @method _getContent
         * @protected
         * @param event {Object} event facade
         */
        _getContent: function () {
            var rootLocation = this.get('rootLocation');

            this.fire('locationSearch', {
                viewName: 'all-content-' + rootLocation.get('locationId'),
                resultAttribute: 'content',
                loadContentType: true,
                /*
                 * @TODO remove the loadContent flag
                 * see  https://jira.ez.no/browse/EZP-25842
                 */
                loadContent: true,
                search: {
                    criteria: {SubtreeCriterion: rootLocation.get('pathString')},
                    /*
                     * @TODO sort items by modification date
                     * see https://jira.ez.no/browse/EZP-24998
                     *
                     * sortClauses: {DateModifiedClause: 'DESC'},
                     */
                    limit: 10
                }
            });
        }
    }, {
        ATTRS: {
            /**
             * The block content - items list.
             *
             * @attribute content
             * @type Array of objects containing location structs
             */
            content: {
                value: []
            }
        }
    });
});

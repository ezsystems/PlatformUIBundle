/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-linkviewserversideviewservice', function (Y) {
    "use strict";

    /**
     * Provides the link view server side view service class
     *
     * @method ez-linkviewserversideviewservice
     */
    Y.namespace('eZ');

    /**
     * The Link View Server Side View Service class.
     *
     * @namespace eZ
     * @class LinkViewServerSideViewService
     * @constructor
     * @extends eZ.ServerSideViewService
     */
    Y.eZ.LinkViewServerSideViewService = Y.Base.create('linkViewServerSideViewService', Y.eZ.ServerSideViewService, [], {
        initializer: function () {
            this.on('*:viewLinkUsage', this._handleViewLinkUsage);
            this.on('*:editLinkUsage', this._handleEditLinkUsage);
        },

        /**
         * Redirects user to the main location of content.
         *
         * @method _handleViewLinkUsage
         * @protected
         * @param {Object} e event facade
         */
        _handleViewLinkUsage: function(e) {
            var app = this.get('app'),
                content = null;

            app.set('loading', true);

            content = new Y.eZ.ContentInfo({id: e.contentId});
            content.load({api: this.get('capi')}, function(error, response) {
                if (error) {
                    app.set('loading', false);
                    return ;
                }

                app.navigateTo('viewLocation', {
                    id: content.get('resources').MainLocation,
                    languageCode: e.languageCode
                });
            });
        },

        /**
         * Redirects user to the content edit form
         *
         * @method _handleViewLinkUsage
         * @protected
         * @param {Object} e event facade
         */
        _handleEditLinkUsage: function(e) {
            var app = this.get('app');

            app.navigateTo('editContent', {
                id: e.contentId,
                languageCode: e.languageCode
            });
        }
    });
});

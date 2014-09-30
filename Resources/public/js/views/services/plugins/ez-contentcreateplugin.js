/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateplugin', function (Y) {
    'use strict';
    /**
     * Provides the content tree plugin for the discovery bar view service.
     *
     * @module ez-contenttreeplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Content Tree Plugin. It enhances the discovery bar to handle the content
     * tree related events and fetching.
     *
     * @namespace eZ.Plugin
     * @class ContentTree
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ContentCreate = Y.Base.create('contentCreate', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this._extendRouting();
            this.onHostEvent('*:createContent', this._handleCreateContentAction);
            this.afterHostEvent('createContentActionView:activeChange', this._getContentTypesList);
        },

        _extendRouting: function () {
            var app = this.get('host').get('app');

            app.route({
                name: 'addContent',
                path: '/add/:contentTypeIdentifier/:contentTypeLang/:id',
                service: Y.eZ.ContentEditViewService,
                sideViews: {},
                view: 'contentEditView',
                callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
            });
        },

        setNextViewServiceParameters: function (service) {
            var host = this.get('host'),
                app = host.get('app');

            service.set('closeRedirectionUrl', app.routeUri('viewLocation', {id: host.get('location').get('id')}));
            service.set('discardRedirectionUrl', app.routeUri('viewLocation', {id: host.get('location').get('id')}));
        },

        /**
         * Fetches content groups list and sends it to the target view
         *
         * @protected
         * @method _getContentTypesList
         * @param {Object} event event facade
         */
        _getContentTypesList: function (event) {
            var that = this,
                contentGroupsList = this.get('contentGroupsList');

            if (!contentGroupsList) {
                Y.io(this.get('host').get('app').get('baseUri') + 'ajax/get-content-types-list', {
                    on: {
                        success: function (id, xhr) {
                            contentGroupsList = JSON.parse(xhr.response);

                            that.set('contentGroupsList', contentGroupsList);
                            event.target.set('contentGroupsList', contentGroupsList);
                        }
                    }
                });
            } else {
                event.target.set('contentGroupsList', contentGroupsList);
            }
        },

        /**
         * Redirects a user to the create content view
         *
         * @protected
         * @method _handleCreateContentAction
         * @param {Object} event event facade
         */
        _handleCreateContentAction: function (event) {
            var app = this.get('host').get('app');

            app.navigate(
                app.routeUri('addContent', {
                    contentTypeLang: event.contentTypeLang,
                    contentTypeIdentifier: event.contentTypeIdentifier,
                    id: this.get('host').get('location').get('id')
                })
            );
        }
    }, {
        NS: 'createContent',
        ATTRS: {
            /**
             * Stores content type data as a result of AJAX request
             *
             * @attribute contentGroupsList
             * @type {Object}
             */
            contentGroupsList: {}
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ContentCreate, ['locationViewViewService']
    );
});

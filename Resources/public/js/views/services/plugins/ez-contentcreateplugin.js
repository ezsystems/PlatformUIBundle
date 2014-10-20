/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateplugin', function (Y) {
    'use strict';
    /**
     * Provides the content create plugin for the location view view service.
     *
     * @module ez-contentcreateplugin
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
            this.afterHostEvent('*:createContentAction', this._getContentTypes);
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
         * Fetches the content type groups and the content types.
         *
         * @protected
         * @method _getContentTypesList
         * @param {Object} event event facade
         */
        _getContentTypes: function (event) {
            var capi = this.get('host').get('capi'),
                view = event.target,
                typeService = this.get('host').get('capi').getContentTypeService();

            if ( !view.get('expanded') ) {
                return;
            }
            typeService.loadContentTypeGroups(function (error, response) {
                var groups = [], hasError = false,
                    parallel = new Y.Parallel();

                if ( error ) {
                    return view.set('loadingError', true);
                }

                Y.Array.each(response.document.ContentTypeGroupList.ContentTypeGroup, function (groupHash) {
                    var group = new Y.eZ.ContentTypeGroup();

                    group.set('id', groupHash._href);
                    group.loadFromHash(groupHash);
                    groups.push(group);

                    group.loadContentTypes({api: capi}, parallel.add(function (error) {
                        if ( error ) {
                            hasError = true;
                        }
                    }));
                });

                parallel.done(function () {
                    if ( hasError ) {
                        view.set('loadingError', true);
                    } else {
                        view.set('contentTypeGroups', groups);
                    }
                });
            });
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
        NS: 'contentCreate',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ContentCreate, ['locationViewViewService']
    );
});

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
                capi = this.get('host').get('capi'),
                app = this.get('host').get('app'),
                contentGroupsList = this.get('contentGroupsList'),
                responseData = {
                    groups: [],
                    types: [],
                    source: []
                };

            if (!contentGroupsList) {
                new Y.Promise(function (resolve, reject) {
                    app.set('loading', true);
                    capi.getContentTypeService().loadContentTypeGroups(function (error, response) {
                        if (error) {
                            reject(error);
                        }

                        resolve(response);
                    });
                }).then(function (response) {
                    var contentTypeGroups = response.document.ContentTypeGroupList.ContentTypeGroup,
                        contentTypeService = capi.getContentTypeService(),
                        contentTypePromises = [];

                    Y.Array.each(contentTypeGroups, function (group) {
                        responseData[group.id] = {identifier: group.identifier};
                        responseData.groups.push({
                            id: group.id,
                            name: group.identifier
                        });

                        contentTypePromises.push(new Y.Promise(function (resolve, reject) {
                            contentTypeService.loadContentTypes(group._href, function (error, xhr) {
                                if (error) {
                                    reject(error);
                                }

                                xhr.groupId = group.id;

                                resolve(xhr);
                            });
                        }));
                    });

                    return Y.Promise.all(contentTypePromises);
                }, that._handlePromiseError)
                .then(function (contentTypeGroups) {
                    Y.Array.each(contentTypeGroups, function (group) {
                        var contentTypes = group.document.ContentTypeInfoList.ContentType;

                        Y.Array.each(contentTypes, function (type) {
                            var typeName = type.names.value[0]['#text'];

                            responseData.types[typeName] = {
                                id: type.id,
                                groupId: group.groupId,
                                identifier: type.identifier,
                                name: typeName,
                                lang: type.mainLanguageCode
                            };

                            responseData.source.push(typeName);
                        });
                    });

                    app.set('loading', false);
                    that.set('contentGroupsList', responseData);
                    event.target.set('contentGroupsList', responseData);
                }, that._handlePromiseError);
            } else {
                event.target.set('contentGroupsList', contentGroupsList);
            }
        },

        /**
         * Promise error handler. Displays an error message in the console.
         *
         * @protected
         * @method _handlePromiseError
         * @param {Object} error
         */
        _handlePromiseError: function (error) {
            this.get('host').get('app').set('loading', false);
            console.error('Promise has been rejected:', error);
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

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
     * Content create plugin.
     *
     * @namespace eZ.Plugin
     * @class ContentCreate
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ContentCreate = Y.Base.create('contentCreate', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:createContent', this._handleCreateContentAction);
            this.afterHostEvent('*:createContentAction', this._getContentTypes);
        },

        /**
         * Resets the state of the plugin's attributes
         *
         * @method parallelLoad
         * @param {Function} next
         */
        parallelLoad: function (next) {
            this.set('contentType', undefined);
            this.set('languageCode', undefined);
            this.set('parentLocation', undefined);
            next();
        },

        /**
         * Sets the contentType, languageCode and parentLocation on the next
         * view service if the users wants to create a new content
         *
         * @method setNextViewServiceParameters
         * @param {eZ.ViewService} service
         */
        setNextViewServiceParameters: function (service) {
            if ( this.get('contentType') && this.get('languageCode') && this.get('parentLocation') ) {
                service.setAttrs({
                    contentType: this.get('contentType'),
                    languageCode: this.get('languageCode'),
                    parentLocation: this.get('parentLocation'),
                    parentContent: this.get('parentContent'),
                });
            }
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
         * Retrieves and stores the content creation parameters from
         * the createContent event and redirect the user to the createContent
         * route.
         *
         * @protected
         * @method _handleCreateContentAction
         * @param {Object} event event facade
         */
        _handleCreateContentAction: function (event) {
            var service = this.get('host'),
                app = service.get('app');

            this.setAttrs({
                contentType: event.contentType,
                languageCode: event.languageCode,
                parentLocation: service.get('location'),
                parentContent: service.get('content')
            });
            app.navigate(app.routeUri('createContent'));
        },
    }, {
        NS: 'contentCreate',

        ATTRS: {
            /**
             * The content type to use to create the new content
             *
             * @attribute contentType
             * @default undefined
             * @type Y.eZ.ContentType
             */
            contentType: {},

            /**
             * The language code to use to create the new content
             *
             * @attribute languageCode
             * @default undefined
             * @type String
             */
            languageCode: {},

            /**
             * The parent location of the content that will be created
             *
             * @attribute parentLocation
             * @type Y.eZ.Location
             * @default undefined
             */
            parentLocation: {},

            /**
             * The parent content of the content that will be created
             *
             * @attribute parentContent
             * @type Y.eZ.Content
             * @default undefined
             */
            parentContent: {},
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ContentCreate, ['locationViewViewService']
    );
});

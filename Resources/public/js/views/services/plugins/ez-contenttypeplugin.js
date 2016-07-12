/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypeplugin', function (Y) {
    'use strict';
    /**
     * Provides the content type plugin
     *
     * @module ez-contenttypeplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Content type plugin.
     *
     * @namespace eZ.Plugin
     * @class ContentType
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ContentType = Y.Base.create('contentType', Y.eZ.Plugin.ViewServiceBase, [], {
        /**
         * Loads all the Content Type Groups and the Content Types
         *
         * @method loadAllContentTypes
         * @param {Function} callback
         * @param {Boolean} callback.error
         * @param {Array} callback.groups array of eZ.ContentTypeGroup
         */
        loadAllContentTypes: function (callback) {
            var capi = this.get('host').get('capi'),
                GroupConstructor = this.get('contentTypeGroupConstructor'),
                typeService = this.get('host').get('capi').getContentTypeService();

            typeService.loadContentTypeGroups(function (error, response) {
                var groups = [], hasError = false,
                    parallel = new Y.Parallel();

                if ( error ) {
                    callback(error);
                    return;
                }

                response.document.ContentTypeGroupList.ContentTypeGroup.forEach(function (groupHash) {
                    var group = new GroupConstructor();

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
                        callback(hasError);
                    } else {
                        callback(hasError, groups);
                    }
                });
            });
        },
    }, {
        NS: 'contentType',

        ATTRS: {
            /**
             * The constructor function of the Content Type Group model.
             *
             * @attribute contentTypeGroupConstructor
             * @readOnly
             * @type {Function}
             * @default Y.eZ.ContentTypeGroup
             */
            contentTypeGroupConstructor: {
                readOnly: true,
                value: Y.eZ.ContentTypeGroup,
            }
        },
    });
});

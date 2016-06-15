/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-userdraftsplugin', function (Y) {
    'use strict';

    /**
     * Provides the user load plugin
     *
     * @module ez-userloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object user drafts plugin.
     *
     * In order to use it you need to fire the `loadUserDrafts` event with two parameters:
     *  - `attributeName` where to store the result
     *  - `limit` limit of results
     *
     * @namespace eZ.Plugin
     * @class UserDrafts
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.UserDrafts = Y.Base.create('userDraftsPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:loadUserDrafts', this._loadUserDrafts);
        },

        /**
         * Loads the user's draft with the corresponding ContentInfo and
         * ContentType.
         *
         * @protected
         * @method _loadUserDrafts
         * @param {Object} event loadUserDrafts event facade
         */
        _loadUserDrafts: function (event) {
            var service = this.get('host'),
                options = {api: service.get('capi')},
                target = event.target;

            service.get('app').get('user').loadDrafts(options, Y.bind(function (error, versions) {
                if (error) {
                    target.set('loadingError', true);
                    return;
                }

                versions = this._extractLastDrafts(versions, event.limit);
                this._collectDraftsData(target, event.attributeName, versions);
            }, this));
        },

        /**
         * Returns the last `limit` draft. It also initializes the version
         * structures that will be filled asynchronously with the ContentInfo
         * and the ContentType.
         *
         * @method _extractLastDrafts
         * @param versions {Array} array of versions
         * @param limit {Number} the number of versions to keep
         * @return an array of Object containing a `version` entry referencing
         * the corresponding `eZ.Version`.
         */
        _extractLastDrafts: function (versions, limit) {
            versions = versions.reverse();
            versions.length = Math.min(limit, versions.length);

            return versions.map(function (version) {
                return {version: version};
            });
        },

        /**
         * Prepares the loading of the ContentInfo and the ContentType of the
         * Versions.
         *
         * @method _collectDraftsData
         * @protected
         * @param target {eZ.View} event target view
         * @param attributeName {String} name of an attribute to be updated with data
         * @param limit {Number} number of items to be returned in the end
         * @param error {Boolean} is error?
         * @param versions {Array} list of versions
         * @return {Y.Promise}
         */
        _collectDraftsData: function (target, attributeName, versions) {
            Y.Promise
                .resolve(versions)
                .then(Y.bind(this._loadDraftContentInfo, this))
                .then(Y.bind(this._loadDraftContentType, this))
                .then(function (versions) {
                    var res = {
                            loadingError: false,
                        };

                    res[attributeName] = versions;
                    target.setAttrs(res);
                })
                .catch(function () {
                    target.set('loadingError', true);
                });
        },

        /**
         * Prepares the loading of the ContentInfo corresponding to each
         * Versions.
         *
         * @method _loadDraftContentInfo
         * @protected
         * @param versions {Array} list of version structures
         * @return {Y.Promise}
         */
        _loadDraftContentInfo: function (versions) {
            var promises,
                capi = this.get('host').get('capi');

            promises = versions.map(function (versionStruct) {
                return new Y.Promise(function (resolve, reject) {
                    var contentInfo = new Y.eZ.ContentInfo({
                            id: versionStruct.version.get('resources').Content
                        });

                    contentInfo.load({api: capi}, function (error) {
                        if (error) {
                            reject(error);

                            return;
                        }

                        versionStruct.contentInfo = contentInfo;
                        resolve(versionStruct);
                    });
                });
            });

            return Y.Promise.all(promises);
        },

        /**
         * Prepares the loading of the Content Type corresponding to each
         * Versions.
         *
         * @method _loadDraftContentType
         * @protected
         * @param data {Array} list of version structures
         * @return {Y.Promise}
         */
        _loadDraftContentType: function (versions) {
            var promises,
                capi = this.get('host').get('capi');

            promises = versions.map(function (versionStruct) {
                return new Y.Promise(function (resolve, reject) {
                    var contentType = new Y.eZ.ContentType({
                            id: versionStruct.contentInfo.get('resources').ContentType
                        });

                    contentType.load({api: capi}, function (error) {
                        if (error) {
                            reject(error);

                            return;
                        }

                        versionStruct.contentType = contentType;
                        resolve(versionStruct);
                    });
                });
            });

            return Y.Promise.all(promises);
        },
    }, {
        NS: 'userDrafts',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.UserDrafts, ['dashboardBlocksViewService']
    );
});

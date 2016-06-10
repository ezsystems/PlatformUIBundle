/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-userdraftsplugin', function (Y) {
    "use strict";
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
         * Loads user drafts. Once this is done, it sets the content in
         * the attribute defined in the event parameter of the event target.
         * @protected
         * @method _loadUser
         * @param {Object} e loadUser event facade
         */
        _loadUserDrafts: function (event) {
            var host = this.get('host');

            host.get('app').get('user').loadDrafts(
                {api: host.get('capi')},
                Y.bind(this._collectDraftsData, this, event.target, event.attributeName, event.limit)
            );
        },

        /**
         * Sorts versions by modification date
         *
         * @method _sortByModificationDate
         * @protected
         * @param a {Object} version hash
         * @param b {Object} version hash
         * @return Number
         */
        _sortByModificationDate: function (a, b) {
            return (new Date(b.get('modificationDate'))).getTime() - (new Date(a.get('modificationDate'))).getTime();
        },

        /**
         * Collects drafts data
         *
         * @method _collectDraftsData
         * @protected
         * @param target {Y.View} event target view
         * @param attributeName {String} name of an attribute to be updated with data
         * @param limit {Number} number of items to be returned in the end
         * @param error {Boolean} is error?
         * @param versions {Array} list of versions
         * @return {Y.Promise}
         */
        _collectDraftsData: function (target, attributeName, limit, error, versions) {
            if (error) {
                target.set('loadingError', true);

                return;
            }

            versions.sort(this._sortByModificationDate);
            versions.length = limit;

            Y.Promise
                .resolve(versions)
                .then(Y.bind(this._loadDraftContentInfo, this))
                .then(Y.bind(this._loadDraftContentType, this))
                .then(Y.bind(this._fillDraftContentTypeModel, this, target, attributeName))
                .catch(function () {
                    console.log(arguments[0]);
                    target.set('loadingError', true);
                });
        },

        /**
         * Gets content info for each version
         *
         * @method _collectDraftsData
         * @protected
         * @param versions {Array} list of versions
         * @return {Y.Promise}
         */
        _loadDraftContentInfo: function (versions) {
            var drafts = this.get('drafts'),
                promises = [];

            versions.forEach(Y.bind(function (version) {
                drafts.add({
                    version: version,
                    contentType: null,
                    contentInfo: null
                });

                promises.push(new Y.Promise(Y.bind(function (resolve, reject) {
                    var contentInfo = new Y.eZ.ContentInfo({id: version.get('resources.Content')});

                    contentInfo.load({api: this.get('host').get('capi')}, function (error) {
                        if (error) {
                            reject(error);

                            return;
                        }

                        resolve(contentInfo);
                    })
                }, this)));
            }, this));

            return Y.Promise.all(promises);
        },

        /**
         * Loads content types for each content version
         *
         * @method _loadDraftContentType
         * @protected
         * @param data {Array} list of content
         * @return {Y.Promise}
         */
        _loadDraftContentType: function (data) {
            var drafts = this.get('drafts'),
                promises = [];

            data.forEach(Y.bind(function (contentInfo, index) {
                var contentType = new Y.eZ.ContentType({id: contentInfo.get('resources.ContentType')});

                drafts.item(index).set('contentInfo', contentInfo);

                promises.push(new Y.Promise(Y.bind(function (resolve, reject) {
                    contentType.load({api: this.get('host').get('capi')}, function (error) {
                        if (error) {
                            reject(error);

                            return;
                        }

                        resolve(contentType);
                    });
                }, this)));
            }, this));

            return Y.Promise.all(promises);
        },

        /**
         * Creates a content type model, fills with data and assigns it to each draft
         *
         * @method _fillDraftContentTypeModel
         * @protected
         * @param target {Y.View} event target view
         * @param attributeName {String} name of an attribute to be updated with data
         * @param data {Array} list of content types
         */
        _fillDraftContentTypeModel: function (target, attributeName, data) {
            var drafts = this.get('drafts');

            data.forEach(function (contentType, index) {
                drafts.item(index).set('contentType', contentType);
            });

            drafts.sort();

            target.set(attributeName, drafts);
        },
    }, {
        NS: 'userDrafts',
        ATTRS: {
            /**
             * The drafts list
             *
             * @attribute drafts
             * @type Y.ModelList
             */
            drafts: {
                valueFn: function () {
                    return new Y.ModelList({
                        comparator: function (model) {
                            return new Date(model.get('modificationDate')).getTime();
                        }
                    });
                }
            }
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.UserDrafts, ['dashboardBlocksViewService']
    );
});

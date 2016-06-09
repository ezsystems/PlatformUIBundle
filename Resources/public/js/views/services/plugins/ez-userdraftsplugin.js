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
            this._resetTempVariables();
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

            this._target = event.target;
            this._targetAttributeName = event.attributeName;
            this._targetLimit = event.limit;

            host.get('app').get('user').loadDrafts(
                {api: host.get('capi')},
                Y.bind(this._collectDraftsData, this)
            );
        },

        /**
         * Resets temporary variables
         *
         * @protected
         * @method _resetTempVariables
         */
        _resetTempVariables: function () {
            /**
             * Holds a temporary reference to `loadUserDrafts` event target
             *
             * @property _target
             * @type {Y.View}
             * @protected
             */
            this._target = null;
            /**
             * Holds a temporary reference to attribute to be updated,
             * after loading data, in an event target
             *
             * @property _targetAttributeName
             * @type {String}
             * @protected
             */
            this._targetAttributeName = null;
            /**
             * Holds a temporary reference to limit of items to be returned in an event target
             *
             * @property _targetLimit
             * @type {Number}
             * @protected
             */
            this._targetLimit = null;
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
         * @param error {Boolean} is error?
         * @param versions {Array} list of versions
         * @return {Y.Promise}
         */
        _collectDraftsData: function (error, versions) {
            var host = this.get('host');

            if (error) {
                host._error(error.message);
                this._target.set('loadingError', true);
                this._resetTempVariables();

                return;
            }

            versions.sort(this._sortByModificationDate);
            versions.length = this._targetLimit;

            Y.Promise
                .resolve(versions)
                .then(Y.bind(this._loadDraftContentInfo, this))
                .then(Y.bind(this._loadDraftContentType, this))
                .then(Y.bind(this._fillDraftContentTypeModel, this))
                .catch(Y.bind(host._error, host));
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
                contentService = this.get('host').get('capi').getContentService(),
                promises = [];

            versions.forEach(function (version) {
                var contentId = version.get('resources.Content');

                drafts.add(version);

                promises.push(new Y.Promise(Y.bind(function (resolve, reject) {
                    contentService.loadContentInfo(contentId, Y.bind(function (error, response) {
                        if (error) {
                            reject('Cannot load content info: ' + contentId);
                            this._target.set('loadingError', true);
                            this._resetTempVariables();

                            return;
                        }

                        resolve(response.document.Content);
                    }, this));
                }, this)));
            });

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
            var contentTypeService = this.get('host').get('capi').getContentTypeService(),
                drafts = this.get('drafts'),
                promises = [];

            data.forEach(Y.bind(function (contentInfo, index) {
                drafts.item(index).set('contentInfo', contentInfo);

                promises.push(new Y.Promise(Y.bind(function (resolve, reject) {
                    contentTypeService.loadContentType(contentInfo.ContentType._href, Y.bind(function (error, response) {
                        if (error) {
                            reject('Cannot load content type data: ' + contentInfo.ContentType._href);
                            this._target.set('loadingError', true);
                            this._resetTempVariables();

                            return;
                        }

                        resolve(response.document.ContentType);
                    }, this));
                }, this)));
            }, this));

            return Y.Promise.all(promises);
        },

        /**
         * Creates a content type model, fills with data and assigns it to each draft
         *
         * @method _fillDraftContentTypeModel
         * @protected
         * @param data {Array} list of content types
         */
        _fillDraftContentTypeModel: function (data) {
            var drafts = this.get('drafts');

            drafts.each(function (version, index) {
                var contentType = new Y.eZ.ContentType();

                contentType.loadFromHash(data[index]);

                version.set('contentType', contentType);
            }).sort();

            this._target.set(this._targetAttributeName, drafts);
            this._resetTempVariables();
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

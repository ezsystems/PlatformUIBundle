/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-allcontent-dashboardblockserviceplugin', function (Y) {
    'use strict';

    /**
     * Provides the all content dashboard block service plugin class
     *
     * @module ez-allcontent-dashboardblockserviceplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Provides the all content dashboard block service plugin
     *
     * @namespace eZ.Plugin
     * @class AllContentDashboardBlock
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.AllContentDashboardBlockService = Y.Base.create('allContentDashboardBlockServicePlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:getAllContent', this._getAllContent, this);
            this.onHostEvent('*:dashboardBlockRendered', this._hideLoadingScreen, this);
            this.onHostEvent('*:gotoContentEdit', this._goToContentEdit, this);
            this.onHostEvent('*:gotoContentPreview', this._goToContentPreview, this);
        },

        /**
         * Gets all content for the all content dashboard block view
         *
         * @method _getAllContent
         * @protected
         * @param event {Object} event facade
         */
        _getAllContent: function (event) {
            var host = this.get('host');

            host.get('app').set('loading', true);

            this._getContentTypeGroups()
                .then(Y.bind(this._loadGroupContentTypeGroupsData, this))
                .then(Y.bind(this._getContentTypes, this))
                .then(Y.bind(this._createContentTypeList, this))
                .then(Y.bind(this._getContentData, this))
                .then(Y.bind(this._populateContentList, this, event.target))
                .catch(Y.bind(host._handleError, host));
        },

        /**
         * Gets content type groups
         *
         * @method _getContentTypeGroups
         * @protected
         * @return {Y.Promise}
         */
        _getContentTypeGroups: function () {
            var errorData;

            if (this.get('contentTypeList').length) {
                return true;
            }

            this.get('host').get('app').set('loading', true);

            errorData = {
                message: this.get('loadContentTypeGroupsErrorMessage'),
                identifier: this.get('loadContentTypeGroupsErrorIdentifier')
            };

            return new Y.Promise(Y.bind(function (resolve, reject) {
                this.get('host').get('capi').getContentTypeService().loadContentTypeGroups(function (error, response) {
                    if (error) {
                        reject(errorData, response);

                        return;
                    }

                    try {
                        resolve(response.document.ContentTypeGroupList.ContentTypeGroup);
                    } catch (e) {
                        reject(errorData, e);
                    }
                });
            }, this));
        },

        /**
         * Loads content type groups data
         *
         * @method _loadGroupContentTypeGroupsData
         * @protected
         * @param groups {Array} content type groups data
         * @return {Y.Promise}
         */
        _loadGroupContentTypeGroupsData: function (groups) {
            var promises = [],
                errorData = {},
                contentTypeService = this.get('host').get('capi').getContentTypeService();

            this.get('host').get('app').set('loading', true);

            groups.forEach(Y.bind(function (group) {
                promises.push(new Y.Promise(function (resolve, reject) {
                    contentTypeService.loadContentTypeGroup(group._href, function (error, response) {
                        if (error) {
                            reject(errorData, response);

                            return;
                        }

                        try {
                            resolve(response.document);
                        } catch (e) {
                            reject(errorData, e);
                        }
                    });
                }));
            }, this));

            return Y.Promise.all(promises);
        },

        /**
         * Gets content types from content group
         *
         * @method _getContentTypes
         * @protected
         * @param contentTypeGroupsData {Array} content type groups data
         * @return {Y.Promise}
         */
        _getContentTypes: function (contentTypeGroupsData) {
            var contentTypeService = this.get('host').get('capi').getContentTypeService(),
                errorData,
                contentGroup;

            if (Object.keys(this.get('contentTypeList')).length) {
                return true;
            }

            this.get('host').get('app').set('loading', true);

            contentGroup = contentTypeGroupsData.filter(function (group) {
                return group.ContentTypeGroup.identifier === 'Content';
            })[0];

            errorData = {
                message: this.get('loadContentTypeErrorMessage'),
                identifier: this.get('loadContentTypeErrorIdentifier')
            };

            return new Y.Promise(function (resolve, reject) {
                contentTypeService.loadContentTypes(contentGroup.ContentTypeGroup._href, function (error, response) {
                    if (error) {
                        reject(errorData, response);

                        return;
                    }

                    try {
                        resolve(response.document.ContentTypeInfoList.ContentType);
                    } catch (e) {
                        reject(errorData, e);
                    }
                });
            });
        },

        /**
         * Creates a hash containing list of content types
         *
         * @method _createContentTypeList
         * @protected
         * @param contentTypes {Array} content type data
         * @return {Boolean}
         */
        _createContentTypeList: function (contentTypes) {
            var contentTypeList = {};

            if (Object.keys(this.get('contentTypeList')).length) {
                return true;
            }

            this.get('host').get('app').set('loading', true);

            contentTypes.forEach(function (contentTypeData) {
                contentTypeList[contentTypeData._href] = {
                    id: contentTypeData.id,
                    identifier: contentTypeData.identifier,
                    mainLanguageCode: contentTypeData.mainLanguageCode,
                    names: contentTypeData.names.value,
                    descriptions: contentTypeData.descriptions.value
                };
            });

            this.set('contentTypeList', contentTypeList);
        },

        /**
         * Gets content data from the server
         *
         * @method _getContentData
         * @protected
         * @return {Y.Promise}
         */
        _getContentData: function () {
            var host = this.get('host'),
                contentService = host.get('capi').getContentService(),
                query = contentService.newViewCreateStruct('all-content', 'ContentQuery'),
                errorData = {
                    message: this.get('getContentViewDataErrorMessage'),
                    identifier: this.get('getContentViewDataErrorIdentifier')
                };

            this.get('host').get('app').set('loading', true);

            query.body.ViewInput.ContentQuery.Criteria.SubtreeCriterion = host.get('rootLocation').get('pathString');
            query.body.ViewInput.ContentQuery.SortClauses.DateModifiedClause = 'DESC';
            query.body.ViewInput.ContentQuery.limit = 15;

            return new Y.Promise(function (resolve, reject) {
                contentService.createView(query, function (error, response) {
                    if (error) {
                        reject(errorData, response);

                        return;
                    }

                    try {
                        resolve(response.document.View.Result.searchHits.searchHit);
                    } catch (e) {
                        reject(errorData, e);
                    }
                });
            });
        },

        /**
         * Populates model list with content models
         *
         * @method _populateContentList
         * @protected
         * @param target {eZ.AllContentDashboardBlockView} the dashboard block view
         * @param data {Array} content data
         */
        _populateContentList: function (target, data) {
            var contentList = this.get('contentList'),
                contentTypeList = this.get('contentTypeList');

            this.get('host').get('app').set('loading', true);

            contentList.reset();

            data.forEach(function (contentData) {
                var contentType = contentData.value.Content.ContentType;

                contentData.value.Content.ContentType = Y.merge(contentType, contentTypeList[contentType._href]);

                contentList.add(contentData.value.Content);
            });

            target.set('content', contentList);
        },

        /**
         * Hides a loading screen
         *
         * @method _hideLoadingScreen
         * @protected
         */
        _hideLoadingScreen: function () {
            this.get('host').get('app').set('loading', false);
        },

        /**
         * Redirects user to content edit
         *
         * @method _goToContentEdit
         * @protected
         * @param event {Object} event facade
         * @param event.contentId {String} REST content id
         * @param event.languageCode {String} content language
         */
        _goToContentEdit: function (event) {
            this.get('host').get('app').navigateTo('editContent', {
                id: event.contentId,
                languageCode: event.languageCode
            });
        },

        /**
         * Redirects user to location preview
         *
         * @method _goToContentPreview
         * @protected
         * @param event {Object} event facade
         * @param event.locationId {String} REST location id
         * @param event.languageCode {String} content language
         */
        _goToContentPreview: function (event) {
            this.get('host').get('app').navigateTo('viewLocation', {
                id: event.locationId,
                languageCode: event.languageCode
            });
        },

        destructor: function () {
            this.get('contentList').destroy();
            this.get('contentTypeList').destroy();
        }
    }, {
        NS: 'AllContentDashboardBlockServicePlugin',
        ATTRS: {
            /**
             * The content list
             *
             * @attribute contentList
             * @type Y.LazyModelList
             */
            contentList: {
                cloneDefaultValue: false,
                valueFn: function () {
                    return new Y.LazyModelList({
                        model: Y.eZ.Content
                    });
                }
            },

            /**
             * The content types list
             *
             * @attribute contentTypeList
             * @type {}
             */
            contentTypeList: {
                cloneDefaultValue: false,
                value: {}
            },

            /**
             * The error message to be displayed
             * when getting content view data from the server fails
             *
             * @attribute getContentViewDataErrorMessage
             * @type String
             * @default 'Cannot get data for the dashboard block'
             */
            getContentViewDataErrorMessage: {
                value: 'Cannot get data for the dashboard block'
            },

            /**
             * The content view error identifier
             *
             * @attribute getContentViewDataErrorIdentifier
             * @type String
             * @default 'load-all-content-dashboard-block-data-error'
             */
            getContentViewDataErrorIdentifier: {
                value: 'load-all-content-dashboard-block-data-error'
            },

            /**
             * The error message to be displayed
             * when getting content type groups data from the server fails
             *
             * @attribute loadContentTypeGroupsErrorMessage
             * @type String
             * @default 'Cannot load content type groups data'
             */
            loadContentTypeGroupsErrorMessage: {
                value: 'Cannot load content type groups data'
            },

            /**
             * The load content groups error identifier
             *
             * @attribute loadContentTypeGroupsErrorIdentifier
             * @type String
             * @default 'load-content-type-groups-error'
             */
            loadContentTypeGroupsErrorIdentifier: {
                value: 'load-content-type-groups-error'
            },

            /**
             * The error message to be displayed
             * when getting content type data from the server fails
             *
             * @attribute loadContentTypeErrorMessage
             * @type String
             * @default 'Cannot load content type data'
             */
            loadContentTypeErrorMessage: {
                value: 'Cannot load content type data'
            },

            /**
             * The load content type error identifier
             *
             * @attribute loadContentTypeErrorIdentifier
             * @type String
             * @default 'load-content-type-error'
             */
            loadContentTypeErrorIdentifier: {
                value: 'load-content-type-error'
            },
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.AllContentDashboardBlockService, ['dashboardBlockBasedViewService']
    );
});

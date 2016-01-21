/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchplugin', function (Y) {
    "use strict";
    /**
     * Provides the location search plugin
     *
     * @module ez-searchplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Search plugin. It listens to `locationSearch` and `contentSearch` events
     * and execute the corresponding search.
     *
     * @namespace eZ.Plugin
     * @class Search
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.Search = Y.Base.create('searchPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:locationSearch', this._doLocationSearch);
            this.onHostEvent('*:contentSearch', this._doContentSearch);
        },

        /**
         * Returns the content service
         *
         * @method _getContentService
         * @private
         * @return Object
         */
        _getContentService: function () {
            return this.get('host').get('capi').getContentService();
        },

        /**
         * Returns a ViewCreateStruct
         *
         * @method _createNewCreateViewStruct
         * @private
         * @param {String} name
         * @param {String} type
         * @param {Object} search
         * @param {Object} search.criteria
         * @param {Number} [search.limit]
         * @param {Number} [search.offset]
         * @return {Object}
         */
        _createNewCreateViewStruct: function (name, type, search) {
            var query,
                contentService = this._getContentService();

            query = contentService.newViewCreateStruct(name, type);
            // TODO ViewCreateStruct should expose an API
            // see https://jira.ez.no/browse/EZP-24808
            query.body.ViewInput[type].Criteria = search.criteria;
            query.body.ViewInput[type].offset = search.offset;
            query.body.ViewInput[type].limit = search.limit;

            // not yet supported by the REST API
            // see eZ.SubItemListView and https://jira.ez.no/browse/EZP-24315
            // query.body.ViewInput[type].SortClauses = e.search.sortClauses;

            return query;
        },

        /**
         * `contentSearch` event handler. It executes a content search and calls
         * the callback provided in the event parameters when done.
         *
         * @method _doContentSearch
         * @protected
         * @param {EventFacade} e
         * @param {Object} e.search
         * @param {Object} e.search.criteria the search criteria used as Criteria in ContentQuery
         * @param {Integer} e.search.offset the offset for the search result
         * @param {Integer} e.search.limit number of records returned
         * @param {Bool} e.loadContentType the flag indicating whether the eZ.ContentType should be loaded for all
         * of the locations searched. If it is set to *TRUE* then `contentType` field will be present inside
         * every search result (struct)
         */
        _doContentSearch: function (e) {
            var query = this._createNewCreateViewStruct(e.viewName, 'ContentQuery', e.search),
                contentService = this._getContentService();

            contentService.createView(query, Y.bind(function (error, result) {
                var parsedResult,
                    endContentTypeLoad;

                if ( error ) {
                    return e.callback(error);
                }
                parsedResult = this._parseSearchResult(result, 'content', '_createContent');
                if ( e.loadContentType ) {
                    endContentTypeLoad = function (error, response) {
                        e.callback(error, parsedResult, result.document.View.Result.count);
                    };

                    this._loadContentTypeForStruct(parsedResult, function (struct) {
                        return struct.content.get('resources').ContentType;
                    }, endContentTypeLoad);
                } else {
                    e.callback(error, parsedResult, result.document.View.Result.count);
                }
            }, this));
        },

        /**
         * `locationSearch` event handler. It executes the location search and
         * set the result on the target of the event.
         *
         * @method _doLocationSearch
         * @protected
         * @param {EventFacade} e
         * @param {Object} e.search
         * @param {Object} e.search.criteria the search criteria used as Criteria in LocationQuery
         * @param {Integer} e.search.offset the offset for the search result
         * @param {Integer} e.search.limit number of records returned
         * @param {String} e.resultAttribute the name of attribute that will by updated with search results
         * @param {String} e.resultTotalCountAttribute the name of attribute that will be updated with total
         * number of records matching search criteria
         * @param {Bool} e.loadContent the flag indicating whether the eZ.Content should be loaded for all
         * of the locations searched. If it is set to *TRUE* then `content` field will be present inside
         * every search result (locationStruct)
         * @param {Bool} e.loadContentType the flag indicating whether the eZ.ContentType should be loaded for all
         * of the locations searched. If it is set to *TRUE* then `contentType` field will be present inside
         * every search result (locationStruct)
         */
        _doLocationSearch: function (e) {
            var listView = e.target,
                contentService = this._getContentService(),
                query;

            query = this._createNewCreateViewStruct(e.viewName, 'LocationQuery', e.search);
            contentService.createView(query, Y.bind(function (error, result) {
                var attrs = {'loadingError': true};

                if ( !error ) {
                    var parsedResult = this._parseSearchResult(result, 'location', '_createLocation');

                    attrs.loadingError = false;
                    if (e.resultTotalCountAttribute) {
                        attrs[e.resultTotalCountAttribute] = result.document.View.Result.count;
                    }
                    attrs[e.resultAttribute] = parsedResult;
                }

                if (e.loadContentType || e.loadContent) {
                    this._loadResources(
                        e.viewName,
                        e.loadContentType,
                        e.loadContent,
                        attrs[e.resultAttribute],
                        function (error, locationStructArr){
                            if (error) {
                                attrs = {'loadingError': true};
                            }

                            attrs[e.resultAttribute] = locationStructArr;

                            listView.setAttrs(attrs);
                        }
                    );
                } else {
                    listView.setAttrs(attrs);
                }
            }, this));
        },

        /**
         * Parses the search result to create a model and return the array of struct
         *
         * @method _parseSearchResult
         * @protected
         * @param {Response} result the CAPI Response
         * @param {String} property the property to fill in the struct
         * @param {String} methodName the name of the method to get the model
         * @return {Array} ret array of stuct
         */
        _parseSearchResult: function (result, property, methodName) {
            var ret = [];

            Y.Array.each(result.document.View.Result.searchHits.searchHit, function (hit) {
                var struct = {};

                struct[property] = this[methodName](hit);
                ret.push(struct);
            }, this);

            return ret;
        },

        /**
         * Creates a Location for the searchHit
         *
         * @method _createLocation
         * @param {Object} searchHit
         * @protected
         * @return {eZ.Location}
         */
        _createLocation: function (searchHit) {
            var Location = this.get('locationModelConstructor'),
                location;

            location = new Location();
            location.loadFromHash(searchHit.value.Location);

            return location;
        },

        /**
         *
         * @method _createContent
         * @param {Object} searchHit
         * @protected
         * @return {eZ.Location}
         */
        _createContent: function (searchHit) {
            var Content= this.get('contentModelConstructor'),
                content;

            content = new Content();
            content.loadFromHash(searchHit.value.Content);

            return content;
        },


        /**
         * Loads resources for the given array of location structs. Depending on given
         * `loadContentType` and `loadContent` bool parameters it loads Content and ContentType
         * and includes them into the location structs.
         *
         * @method _loadResources
         * @protected
         * @param {Bool|undefined} loadContentType
         * @param {Bool|undefined} loadContent
         * @param {Array} locationStructArr
         * @param {Function} callback
         */
        _loadResources: function (viewName, loadContentType, loadContent, locationStructArr, callback) {
            var tasks = new Y.Parallel(),
                loadResourcesError = false;

            if (loadContentType) {
                var endContentTypeLoad = tasks.add(function (error, response) {
                        if (error) {
                            loadResourcesError = true;
                            return;
                        }
                    });

                this._loadContentTypeForStruct(locationStructArr, function (struct) {
                    return struct.location.get('contentInfo').get('resources').ContentType;
                }, endContentTypeLoad);
            }

            if (loadContent) {
                var endContentLoad = tasks.add(function (error, response) {
                        if (error) {
                            loadResourcesError = true;
                            return;
                        }
                    });

                this._loadContentForLocations(viewName, locationStructArr, endContentLoad);
            }

            tasks.done(function () {
                callback(loadResourcesError, locationStructArr);
            });
        },

        /**
         * Loads ContentType for each location struct in given array and puts it in the new `contentType`
         * field for the location struct.
         *
         * @method _loadContentTypeForLocations
         * @protected
         * @param {Array|Null} locationStructArr
         * @param {Function} callback
         */
        _loadContentTypeForStruct: function (structArray, getContentTypeIdFunc, callback) {
            var tasks = new Y.Parallel(),
                loadContentTypeError = false;

            Y.Array.each(structArray, function (struct, i) {
                var contentType = new Y.eZ.ContentType(
                        {id: getContentTypeIdFunc(struct)}
                    ),
                    capi = this.get('host').get('capi'),
                    options = {api: capi},
                    endContentTypeLoad = tasks.add(function (error, response) {
                        if (error) {
                            loadContentTypeError = error;
                            return;
                        }

                        structArray[i].contentType = contentType;
                    });

                contentType.load(options, endContentTypeLoad);
            }, this);

            tasks.done(function () {
                callback(loadContentTypeError, structArray);
            });
        },

        /**
         * Loads Content for each location struct in given array and puts it in the new `content`
         * field for the location struct.
         *
         * @method _loadContentForLocations
         * @protected
         * @param {Array|Null} locationStructArr
         * @param {Function} callback
         */
        _loadContentForLocations: function (viewName, locationStructArr, callback) {
            var contentService = this._getContentService(),
                contentIds,
                query;

            contentIds = Y.Array.reduce(locationStructArr, '', function (previousId, struct) {
                return previousId + "," + struct.location.get('contentInfo').get('contentId');
            });

            query = this._createNewCreateViewStruct('contents-loading-' + viewName, 'ContentQuery', {
                criteria: {
                    "ContentIdCriterion": contentIds
                }
            });

            contentService.createView(query, Y.bind(function (err, response) {
                if (err) {
                    callback(err, locationStructArr);
                    return;
                }
                Y.Array.each(response.document.View.Result.searchHits.searchHit, function (hit, i) {
                    locationStructArr[i].content = this._createContent(hit);
                }, this);
                callback(err, locationStructArr);
            }, this));
        },
    }, {
        NS: 'search',

        ATTRS: {
            /**
             * Holds the eZ.Location constructor function
             *
             * @attribute locationModelConstructor
             * @type {Function}
             * @default Y.eZ.Location
             */
            locationModelConstructor: {
                value: Y.eZ.Location
            },

            /**
             * Holds the eZ.Content constructor function
             *
             * @attribute contentModelConstructor
             * @type {Function}
             * @default Y.eZ.Content
             */
            contentModelConstructor: {
                value: Y.eZ.Content
            },
        },
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.Search, [
            'locationViewViewService', 'universalDiscoveryViewService',
            'contentEditViewService', 'contentCreateViewService'
        ]
    );
});

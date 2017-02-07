/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchplugin', function (Y) {
    "use strict";
    /**
     * Provides the search plugin
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
     * @since 1.2
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
         * @param {Object} [search.criteria]
         * @param {Object} [search.query]
         * @param {Object} [search.filter]
         * @param {Object} search.sortClauses
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
            if (search.query) {
                query.setQuery(search.query);
            }
            if (search.filter) {
                query.setFilter(search.filter);
            }
            if (search.criteria) {
                query.setCriteria(search.criteria);
                console.log('[DEPRECATED] Criteria property is deprecated');
                console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');
                console.log('[DEPRECATED] Please use Query or Filter instead');
            }

            query.setLimitAndOffset(search.limit, search.offset);
            if ( search.sortClauses ) {
                query.setSortClauses(search.sortClauses);
            } else if (search.sortCondition) {
                query.setSortClauses(this._getSortClause(
                    search.sortCondition.sortField,
                    search.sortCondition.sortOrder
                ));
            } else if ( search.sortLocation ) {
                query.setSortClauses(this._getSortClause(
                    search.sortLocation.get('sortField'),
                    search.sortLocation.get('sortOrder')
                ));
            }

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
         * @param {Object} e.search.sortClauses the search sort clauses
         * @param {Integer} e.search.offset the offset for the search result
         * @param {Integer} e.search.limit number of records returned
         * @param {Bool} e.loadContentType the flag indicating whether the eZ.ContentType should be loaded for all
         * of the locations searched. If it is set to *TRUE* then `contentType` field will be present inside
         * every search result (struct)
         * @param {Function} e.callback the callback to execute when the search
         * is done
         * @param {false|Error} e.callback.error
         * @param {Array} e.callback.results array of struct objects containing a `content` property
         * and optionally a `contentType` (depending on `loadContentType`)
         * @param {Number} e.callback.count the total number of search result
         */
        _doContentSearch: function (e) {
            var search = Y.merge(e.search);

            search.viewName = e.viewName;
            search.loadContentType = e.loadContentType;
            search.loadLocation = e.loadLocation;
            delete search.callback;
            this.findContent(search, e.callback);
        },

        /**
         * Executes a Content search based on the provided `search` object.
         *
         * @method findContent
         * @param {Object} search
         * @param {String} search.viewName the name of the REST view to use
         * @param {Object} search.criteria (deprecated) the search criteria used as Criteria in ContentQuery
         * @param {Object} search.query  the search query used as Query in ContentQuery
         * @param {Object} search.filter the search filter used as Filter in ContentQuery
         * @param {Object} [search.sortClauses] the sort clauses
         * @param {Number} [search.offset]
         * @param {Number} [search.limit]
         * @param {Boolean} [search.loadContentType] flag indicating whether the
         * Content Type of each result has to be loaded in addition
         * @param {Function} callback
         * @param {Error|null} callback.error
         * @param {Response|Array} callback.result the Response object in case
         * of error or an array of Content struct. A Content struct is object
         * containing the Content item and the Content
         * Type depending on the `loadContentType` flag.
         * @param {Number} callback.resultCount the total result number of the
         * search
         */
        findContent: function (search, callback) {
            var query = this._createNewCreateViewStruct(search.viewName, 'ContentQuery', search),
                contentService = this._getContentService();

            contentService.createView(query, Y.bind(function (error, result) {
                var parsedResult;

                if ( error ) {
                    return callback(error);
                }
                parsedResult = this._parseSearchResult(result, 'content', '_createContent');
                if (parsedResult.length && (search.loadLocation || search.loadContentType)) {
                    this._loadContentResources(
                        search.viewName,
                        search.loadContentType,
                        search.loadLocation,
                        parsedResult,
                        function (error, structs) {
                            callback(error, structs, result.document.View.Result.count);
                        }
                    );
                } else {
                    callback(error, parsedResult, result.document.View.Result.count);
                }
            }, this));
        },

        /**
         * Returns the REST API sort order based on the sortOrder attribute
         *
         * @protected
         * @method _getSortDirection
         * @param {String} sortOrder
         * @return 'ascending' or 'descending'
         */
        _getSortDirection: function (sortOrder) {
            return sortOrder === 'ASC' ? 'ascending' : 'descending';
        },

        /**
         * Returns the REST API sort clause identifier based on the sortField
         * attribute.
         *
         * @protected
         * @method _getSortClauseIdentifier
         * @param {String} sortField
         * @return {String|Null}
         */
        _getSortClauseIdentifier: function (sortField) {
            switch(sortField) {
                case 'MODIFIED':
                    return 'DateModified';
                case 'PUBLISHED':
                    return 'DatePublished';
                case 'PATH':
                    return 'LocationPath';
                case 'SECTION':
                    return 'SectionIdentifier';
                case 'DEPTH':
                    return 'LocationDepth';
                case 'CLASS_IDENTIFIER':
                case 'CLASS_NAME':
                    console.warn(sortField + ' sort order is unsupported');
                    return null;
                case 'PRIORITY':
                    return 'LocationPriority';
                case 'NAME':
                    return 'ContentName';
                default:
                    console.warn("Unknow sortField '" + this.get('sortField') + "'");
                    return 'DateModified';
            }
        },

        /**
         * Returns the sort clause suitable for the Search Plugin based on the
         * Location's sortOrder and sortField attribute.
         *
         * @method getSortClause
         * @param {String} sortField
         * @param {String} sortOrder
         * @return {Object}
         */
        _getSortClause: function (sortField, sortOrder) {
            var clause = {},
                identifier = this._getSortClauseIdentifier(sortField);

            if ( identifier ) {
                clause[identifier] = this._getSortDirection(sortOrder);
            }
            return clause;
        },

        /**
         * Executes a location search based on the provide `search` object.
         *
         * @method findLocations
         * @param {Object} search
         * @param {String} search.viewName the name of the REST view to use
         * @param {Object} search.criteria (deprecated) the search criteria used as Criteria in LocationQuery
         * @param {Object} search.query  the search query used as Query in LocationQuery
         * @param {Object} search.filter the search filter used as Filter in LocationQuery
         * @param {Object} [search.sortClauses] the sort clauses
         * @param {eZ.Location} [search.sortLocation] the Location to use to
         * generate the sort clauses
         * @param {Number} [search.offset]
         * @param {Number} [search.limit]
         * @param {Boolean} [search.loadContent] flag indicating whether the
         * Content item of each result has to be loaded in addition
         * @param {Boolean} [search.loadContentType] flag indicating whether the
         * Content Type of each result has to be loaded in addition
         * @param {Function} callback
         * @param {Error|null} callback.error
         * @param {Response|Array} callback.result the Response object in case
         * of error or an array of Location struct. A Location struct is object
         * containing the Location and/or the Content item and/or the Content
         * Type depending on the `loadContent` and `loadContentType` flags.
         * @param {Number} callback.resultCount the total result number of the
         * search
         */
        findLocations: function (search, callback) {
            var contentService = this._getContentService(),
                query;

            query = this._createNewCreateViewStruct(search.viewName, 'LocationQuery', search);
            contentService.createView(query, Y.bind(function (error, result) {
                var parsedResult = [];

                if ( error ) {
                    return callback(error, result, 0);
                }
                parsedResult = this._parseSearchResult(result, 'location', '_createLocation');
                if (parsedResult.length && (search.loadContentType || search.loadContent)) {
                    this._loadLocationResources(
                        search.viewName,
                        search.loadContentType,
                        search.loadContent,
                        parsedResult,
                        function (error, structs) {
                            callback(error, structs, result.document.View.Result.count);
                        }
                    );
                } else {
                    callback(error, parsedResult, result.document.View.Result.count);
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
         * @param {Object} e.search.criteria (deprecated) the search criteria used as Criteria in LocationQuery
         * @param {Object} e.search.query  the search query used as Query in LocationQuery
         * @param {Object} e.search.filter the search filter used as Filter in LocationQuery
         * @param {Object} [e.search.sortClauses] the search sort clauses
         * @param {eZ.Location} [search.sortLocation] the Location to use to
         * generate the sort clauses
         * @param {Integer} e.search.offset the offset for the search result
         * @param {Integer} e.search.limit number of records returned
         * @param {Function} [e.callback] callback to call when search is done
         * @param {String} [e.resultAttribute] the name of attribute that will by updated with search results
         * @param {String} [e.resultTotalCountAttribute] the name of attribute that will be updated with total
         * number of records matching search criteria
         * @param {Bool} [e.loadContent] the flag indicating whether the eZ.Content should be loaded for all
         * of the locations searched. If it is set to *TRUE* then `content` field will be present inside
         * every search result (locationStruct)
         * @param {Bool} [e.loadContentType] the flag indicating whether the eZ.ContentType should be loaded for all
         * of the locations searched. If it is set to *TRUE* then `contentType` field will be present inside
         * every search result (locationStruct)
         */
        _doLocationSearch: function (e) {
            var search = Y.merge(e.search),
                listView = e.target,
                attrs = {'loadingError': false},
                callback = function (error, result, resultCount) {
                    attrs.loadingError = error ? true : false;
                    if ( !error ) {
                        attrs[e.resultAttribute] = result;
                        if ( e.resultTotalCountAttribute ) {
                            attrs[e.resultTotalCountAttribute] = resultCount;
                        }
                    }
                    listView.setAttrs(attrs);
                };

            if ( e.callback ) {
                callback = e.callback;
            }

            search.viewName = e.viewName;
            search.loadContent = e.loadContent;
            search.loadContentType = e.loadContentType;
            this.findLocations(search, callback);
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
         * @deprecated
         * @param {Bool|undefined} loadContentType
         * @param {Bool|undefined} loadContent
         * @param {Array} locationStructArr
         * @param {Function} callback
         */
        _loadResources: function (viewName, loadContentType, loadContent, locationStructArr, callback) {
            console.log('[DEPRECATED] _loadResources is deprecated, it will be removed from PlatformUI 2.0');
            console.log('[DEPRECATED] Use _loadLocationResources instead');
            this._loadLocationResources(viewName, loadContentType, loadContentType, locationStructArr, callback);
        },

        /**
         * Loads resources for the given array of location structs. Depending on
         * given `loadContentType` and `loadContent` bool parameters it loads
         * Content and ContentType and includes them into the location structs.
         *
         * @method _loadLocationResources
         * @protected
         * @param {Bool|undefined} loadContentType
         * @param {Bool|undefined} loadContent
         * @param {Array} locationStructArr
         * @param {Function} callback
         */
        _loadLocationResources: function (viewName, loadContentType, loadContent, locationStructArr, callback) {
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
         * Loads resources for the given array of content structs. Depending on
         * given `loadContentType` and `loadLocation` bool parameters it loads
         * ContentType and Location and includes them into the content structs.
         *
         * @method _loadContentResources
         * @protected
         * @param {Bool|undefined} loadContentType
         * @param {Bool|undefined} loadLocation
         * @param {Array} contentStructArr
         * @param {Function} callback
         */
        _loadContentResources: function (viewName, loadContentType, loadLocation, contentStructArr, callback) {
            var tasks = new Y.Parallel(),
                loadResourcesError = false;

            if (loadContentType) {
                var endContentTypeLoad = tasks.add(function (error) {
                        if (error) {
                            loadResourcesError = error;
                            return;
                        }
                    });

                this._loadContentTypeForStruct(contentStructArr, function (struct) {
                    return struct.content.get('resources').ContentType;
                }, endContentTypeLoad);
            }

            if (loadLocation) {
                var endContentLoad = tasks.add(function (error) {
                        if (error) {
                            loadResourcesError = error;
                            return;
                        }
                    });

                this._loadLocationForContent(viewName, contentStructArr, endContentLoad);
            }

            tasks.done(function () {
                callback(loadResourcesError, contentStructArr);
            });
        },

        /**
         * Loads ContentType for each location struct in given array and puts it in the new `contentType`
         * field for the location struct.
         *
         * @method _loadContentTypeForLocations
         * @protected
         * @param {Array|Null} structArray
         * @param {Function} getContentTypeIdFunc
         * @param {Function} callback
         */
        _loadContentTypeForStruct: function (structArray, getContentTypeIdFunc, callback) {
            var tasks = new Y.Parallel(),
                loadContentTypeError = false,
                contentTypList = [],
                contentTypeIds = [];

            // Get list of content types ids
            contentTypeIds = Y.Array.map(structArray, function (struct, i) {
                return getContentTypeIdFunc(struct);
            });

            // Get rid of duplicates to avoid loading same item several times
            contentTypeIds = Y.Array.dedupe(contentTypeIds);

            // Load the unique content types
            Y.Array.each(contentTypeIds, function (contentTypeId) {
                var contentType = new Y.eZ.ContentType(
                        {id: contentTypeId}
                    ),
                    capi = this.get('host').get('capi'),
                    options = {api: capi},
                    endContentTypeLoad = tasks.add(function (error, response) {
                        if (error) {
                            loadContentTypeError = error;
                            contentTypList[contentTypeId] = null;
                            return;
                        }
                        contentTypList[contentTypeId] = contentType;
                    });

                contentType.load(options, endContentTypeLoad);
            }, this);

            tasks.done(function () {
                // Add the loaded content types on the structArray
                Y.Array.each(structArray, function (struct, i) {
                    structArray[i].contentType = contentTypList[getContentTypeIdFunc(struct)];
                });

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
                contentIdsLocationIndexMap = {},
                query;

            contentIds = Y.Array.reduce(locationStructArr, '', function (previousId, struct, index) {
                var contentId = struct.location.get('contentInfo').get('contentId');

                if (!contentIdsLocationIndexMap[contentId]) {
                    contentIdsLocationIndexMap[contentId] = [index];
                } else {
                    contentIdsLocationIndexMap[contentId].push(index);
                }

                previousId = previousId ? previousId + ',' : previousId;
                return previousId + contentId;
            });

            query = this._createNewCreateViewStruct('contents-loading-' + viewName, 'ContentQuery', {
                filter: {
                    "ContentIdCriterion": contentIds
                },
                // In case we are asking for more then 25 items which is default limit, specify limit
                limit: Object.keys(contentIdsLocationIndexMap).length
            });

            contentService.createView(query, Y.bind(function (err, response) {
                if (err) {
                    callback(err, locationStructArr);
                    return;
                }
                Y.Array.each(response.document.View.Result.searchHits.searchHit, function (hit) {
                    var content = this._createContent(hit),
                        locationIndexes = contentIdsLocationIndexMap[content.get('contentId')];

                    locationIndexes.forEach(function(index) {
                        locationStructArr[index].content = content;
                    });
                }, this);
                callback(err, locationStructArr);
            }, this));
        },

        /**
         * Loads Location for each content struct in given array and puts it in the new `location`
         * field for the content struct.
         *
         * @method _loadLocationForContent
         * @protected
         * @param {Array|Null} contentStructArr
         * @param {Function} callback
         */
        _loadLocationForContent: function (viewName, contentStructArr, callback) {
            var contentService = this._getContentService(),
                locationsIds,
                query;

            locationsIds = Y.Array.reduce(contentStructArr, '', function (previousId, struct) {
                var locationId;

                if (struct.content.get('resources').MainLocation) {
                    locationId = struct.content.get('resources').MainLocation.split('/').pop();

                    previousId = previousId ? previousId + ',' : previousId;
                    return previousId + locationId;
                }
                return;
            });

            if (locationsIds) {
                query = this._createNewCreateViewStruct('locations-loading-' + viewName, 'LocationQuery', {
                    filter: {
                        "LocationIdCriterion": locationsIds,
                    },
                    limit: contentStructArr.length
                });

                contentService.createView(query, Y.bind(function (err, response) {
                    if (err) {
                        callback(err, contentStructArr);
                        return;
                    }
                    Y.Array.each(response.document.View.Result.searchHits.searchHit, function (hit) {
                        var location = this._createLocation(hit);

                        Y.Array.some(contentStructArr, function (struct) {
                            if ( struct.content.get('resources').MainLocation === location.get('id') ) {
                                struct.location = location;
                                return true;
                            }
                            return false;
                        });
                    }, this);
                    callback(err, contentStructArr);
                }, this));
            } else {
                callback(false, contentStructArr);
            }
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
            'contentEditViewService', 'contentCreateViewService',
            'dashboardBlocksViewService', 'contentPeekViewService',
        ]
    );
});

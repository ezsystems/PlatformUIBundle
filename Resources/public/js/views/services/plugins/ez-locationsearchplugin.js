/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationsearchplugin', function (Y) {
    "use strict";
    /**
     * Provides the location search plugin
     *
     * @module ez-locationsearchplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Location search plugin. It listens to the `locationSearch` event and
     * execute the corresponding location search.
     *
     * @namespace eZ.Plugin
     * @class LocationSearch
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.LocationSearch = Y.Base.create('locationSearchPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:locationSearch', this._doLocationSearch);
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
            var service = this.get('host'),
                listView = e.target,
                contentService = service.get('capi').getContentService(),
                query;

            query = contentService.newViewCreateStruct(e.viewName, 'LocationQuery');
            // TODO ViewCreateStruct should expose an API
            // see https://jira.ez.no/browse/EZP-24808
            query.body.ViewInput.LocationQuery.Criteria = e.search.criteria;
            query.body.ViewInput.LocationQuery.offset = e.search.offset;
            query.body.ViewInput.LocationQuery.limit = e.search.limit;

            // not yet supported by the REST API
            // see eZ.SubItemListView and https://jira.ez.no/browse/EZP-24315
            // query.body.ViewInput.LocationQuery.SortClauses = e.search.sortClauses;

            contentService.createView(query, Y.bind(function (error, result) {
                var attrs = {'loadingError': true};

                if ( !error ) {
                    var parsedResult = this._parseSearchResult(result);

                    attrs.loadingError = false;
                    if (e.resultTotalCountAttribute) {
                        attrs[e.resultTotalCountAttribute] = result.document.View.Result.count;
                    }
                    attrs[e.resultAttribute] = parsedResult;
                }

                if (e.loadContentType || e.loadContent) {
                    this._loadResources(
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
         * Parses the search result to create the Location model and return the array of location structs.
         *
         * @method _parseSearchResult
         * @protected
         * @param {Response} result the CAPI Response
         * @return {Array} ret array of location structs
         * @return {eZ.Location} ret.location
         */
        _parseSearchResult: function (result) {
            var ret = [];

            Y.Array.each(result.document.View.Result.searchHits.searchHit, function (hit) {
                ret.push({location: this._createLocation(hit)});
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
        _loadResources: function (loadContentType, loadContent, locationStructArr, callback) {
            var tasks = new Y.Parallel(),
                loadResourcesError = false;

            if (loadContentType) {
                var endContentTypeLoad = tasks.add(function (error, response) {
                        if (error) {
                            loadResourcesError = true;
                            return;
                        }
                    });

                this._loadContentTypeForLocations(locationStructArr, endContentTypeLoad);
            }

            if (loadContent) {
                var endContentLoad = tasks.add(function (error, response) {
                        if (error) {
                            loadResourcesError = true;
                            return;
                        }
                    });

                this._loadContentForLocations(locationStructArr, endContentLoad);
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
        _loadContentTypeForLocations: function (locationStructArr, callback) {
            var tasks = new Y.Parallel(),
                loadContentTypeError = false;

            Y.Array.each(locationStructArr, function (locationStruct, i) {
                var contentType = new Y.eZ.ContentType(
                        {id: locationStruct.location.get('contentInfo').get('resources').ContentType}
                    ),
                    capi = this.get('host').get('capi'),
                    options = {api: capi},
                    endContentTypeLoad = tasks.add(function (error, response) {
                        if (error) {
                            loadContentTypeError = true;
                            return;
                        }

                        locationStructArr[i].contentType = contentType;
                    });

                contentType.load(options, endContentTypeLoad);
            }, this);

            tasks.done(function () {
                callback(loadContentTypeError, locationStructArr);
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
        _loadContentForLocations: function (locationStructArr, callback) {
            var tasks = new Y.Parallel(),
                loadContentError = false;

            Y.Array.each(locationStructArr, function (locationStruct, i) {
                var content = new Y.eZ.Content(
                        {id: locationStruct.location.get('contentInfo').get('id')}
                    ),
                    capi = this.get('host').get('capi'),
                    options = {api: capi},
                    endContentLoad = tasks.add(function (error, response) {
                        if (error) {
                            loadContentError = true;
                            return;
                        }

                        locationStructArr[i].content = content;
                    });

                content.load(options, endContentLoad);
            }, this);

            tasks.done(function () {
                callback(loadContentError, locationStructArr);
            });
        }
    }, {
        NS: 'locationSearch',

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
            }
        },
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.LocationSearch, ['locationViewViewService', 'universalDiscoveryViewService']
    );
});

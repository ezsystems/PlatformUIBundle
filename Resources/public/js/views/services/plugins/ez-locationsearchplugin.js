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
                    attrs.loadingError = false;
                    attrs[e.resultAttribute] = this._parseSearchResult(result);
                }

                listView.setAttrs(attrs);
            }, this));
        },

        /**
         * Parses the search result to create the Location model.
         *
         * @method _parseSearchResult
         * @protected
         * @param {Response} result the CAPI Response
         */
        _parseSearchResult: function (result) {
            var ret = [];

            Y.Array.each(result.document.View.Result.searchHits.searchHit, function (hit) {
                ret.push(this._createLocation(hit));
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
        Y.eZ.Plugin.LocationSearch, ['locationViewViewService']
    );
});

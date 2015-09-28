/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationsloadplugin', function (Y) {
    "use strict";
    /**
     * Provides the locations list load plugin
     *
     * @module ez-locationsloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object locations load plugin. It sets an event handler to load locations
     * of content for locations tab in location view.
     *
     * In order to use it you need to fire `loadLocations` event with parameter
     * `content` containing the eZ.Content object for which you want to load locations.
     *
     * @namespace eZ.Plugin
     * @class LocationsLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.LocationsLoad = Y.Base.create('locationsloadplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:loadLocations', this._loadLocations);
        },

        /**
         * Loads locations list for content given in event facade. When loading of locations
         * is finished, then it is set in `locations` attribute of the event target.
         *
         * @method _loadLocations
         * @private
         * @param {EventFacade} e loadLocations event facade
         */
        _loadLocations: function (e) {
            var service = this.get('host'),
                capi = service.get('capi'),
                options = {api: capi};

            e.content.loadLocations(options, function (error, locations) {
                if (error) {
                    e.target.set('loadingError', true);
                } else {
                    e.target.set('locations', locations);
                }
            });

        },
    }, {
        NS: 'locationsLoad'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.LocationsLoad, ['locationViewViewService']
    );
});

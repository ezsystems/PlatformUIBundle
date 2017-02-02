/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service the universal discovery
     *
     * @module ez-universaldiscoveryviewservice
     */
    Y.namespace('eZ');

    /**
     * View service for the universal discovery widget. It only provides the
     * configuration to the universal discovery view.
     *
     * @namespace eZ
     * @class UniversalDiscoveryViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.UniversalDiscoveryViewService = Y.Base.create('universalDiscoveryViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        /**
         *
         * @method _load
         * @protected
         * @param {Function} callback
         */
        _load: function (callback) {
            var startingLocation = new Y.eZ.Location(),
                path = [];

            if (this.get('parameters').startingLocationId) {
                startingLocation.set('id', this.get('parameters').startingLocationId);
                this.get('app').set('loading', true);
                this._loadStartingLocationPath(startingLocation, Y.bind(function() {
                    startingLocation.get('path').unshift(this.get('virtualRootLocation'));
                    this.get('parameters').startingLocation = startingLocation;
                    this.get('app').set('loading', false);
                    callback();
                }, this));
            } else {
                this.get('parameters').startingLocation = this.get('virtualRootLocation');
                callback();
            }
        },

        /**
         * `Get the path of the UDW starting Location.
         *
         * @method _loadStartingLocationPath
         * @protected
         * @param {eZ.Location} startingLocation
         * @param {Function} callback
         */
        _loadStartingLocationPath: function (startingLocation, callback) {
            var options = {api: this.get('capi')};

            startingLocation.load(options, function (error) {
                if (!error) {
                    startingLocation.loadPath(options, function (error, response) {
                        if (!error) {
                            callback();
                        }
                    });
                }
            });
        },

        /**
         * Returns the value of the `parameters` attribute. This attribute is set
         * when the app shows the universal discovery side view with the
         * configuration provided in the `contentDiscover` event.
         *
         * @method _getViewParameters
         * @protected
         * @return mixed
         */
        _getViewParameters: function () {
            return this.get('parameters');
        },
    }, {
        ATTRS: {
            /**
             * Holds the virtual root location
             *
             * @attribute virtualRootLocation
             * @type {eZ.Location}
             */
            virtualRootLocation: {
                valueFn: function () {
                    return new Y.eZ.Location({
                        id: '/api/ezp/v2/content/locations/1',
                        locationId: 1,
                        sortField: 'SECTION',
                        sortOrder: 'ASC',
                    });
                },
            },
        }
    });
});

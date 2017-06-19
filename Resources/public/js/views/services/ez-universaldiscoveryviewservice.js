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
         * Loads the starting location of the UDW if there is a provided starting location id.
         * Else starting location is set to false.
         *
         * @method _load
         * @protected
         * @param {Function} callback
         */
        _load: function (callback) {
            var startingLocation,
                parameters = this.get('parameters'),
                app = this.get('app');

            if ( parameters.startingLocationId ) {
                startingLocation = new Y.eZ.Location();
                startingLocation.set('id', parameters.startingLocationId);
                app.set('loading', true);

                this._loadStartingLocationPath(startingLocation, Y.bind(function(startingLoc) {
                    this.set('startingLocation', startingLoc);
                    app.set('loading', false);

                    callback();
                }, this));
            } else {
                this.set('startingLocation', false);
                callback();
            }
        },

        /**
         * Loads the path of the UDW starting Location.
         *
         * @method _loadStartingLocationPath
         * @protected
         * @param {eZ.Location} startingLocation
         * @param {Function} callback Executed after loading the path. Takes the
         * location containing the path in parameter or false if loading error.
         */
        _loadStartingLocationPath: function (startingLocation, callback) {
            var options = {api: this.get('capi')};

            startingLocation.load(options, function (error) {
                if (!error) {
                    startingLocation.loadPath(options, function (error) {
                        if (!error) {
                            callback(startingLocation);
                        } else {
                            callback(false);
                        }
                    });
                } else {
                    callback(false);
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
            var params = Y.merge(this.get('parameters'));

            params.virtualRootLocation = this.get('virtualRootLocation');
            params.startingLocation = this.get('startingLocation');
            return params;
        },
    }, {
        ATTRS: {
            /**
             * Holds the starting location where the UDW will start.
             * False if no starting location defined
             *
             * @attribute startingLocation
             * @default false
             * @type {eZ.Location|False}
             */
            startingLocation: {
                value: false,
            },

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
                        // this is hardcoded but the actual value does not
                        // really matter, what matters is the fact the virtual
                        // root has at least a child.
                        childCount: 4,
                    });
                },
            },
        }
    });
});

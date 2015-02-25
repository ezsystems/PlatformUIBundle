/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global google */
YUI.add('ez-googlemapapiloader', function (Y) {
    "use strict";
    /**
     * Provides the Google map api loader service
     *
     * @module ez-googlemapapiloader
     */
    Y.namespace('eZ.services');

    var EVENT_MAP_API_READY = 'mapAPIReady',
        EVENT_MAP_API_FAILED = 'mapAPIFailed',
        GMAP_JSONP_URI = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback={callback}';

    /**
     * Google Maps API loader. It fires the `mapAPIReady` event when the Google
     * Map API is ready or `mapAPIFailed` event if a loading error occurs.
     *
     * @class GoogleMapAPILoader
     * @namespace eZ
     * @constructor
     * @param {Function} [JSONPRequest] constructor function of an object
     *                   having the same behaviour as Y.JSONPRequest
     */
    function GoogleMapAPILoader(JSONPRequest) {
        /**
         * Constructor function of the object used to load the Google Map API
         *
         * @property _JSONPRequest
         * @type Function
         * @default Y.JSONPRequest
         */
        this._JSONPRequest = JSONPRequest || Y.JSONPRequest;

        /**
         * Flag indicating if the loader is currently in progress of loading.
         * Needed to avoid concurrent loading.
         *
         * @property _isLoading
         * @type boolean
         * @default false
         * @protected
         */
        this._isLoading = false;

        /**
         * Fired once map API is correctly loaded
         *
         * @event mapAPIReady
         */
        this.publish(EVENT_MAP_API_READY, {fireOnce: true});

        /**
         * Fired once map API have failed to load
         *
         * @event mapAPIFailed
         */
        this.publish(EVENT_MAP_API_FAILED, {fireOnce: true});
    }

    GoogleMapAPILoader.prototype = {
        /**
         * Trying to load Google Maps API via JSONP and firing either
         * `mapAPIReady` or `mapAPIFailed` depending on results
         *
         * @method load
         */
        load: function () {
            var request;

            if (this._isLoading) {
                // Avoiding concurrent loading
                return;
            }

            if (this.isAPILoaded()) {
                this.fire(EVENT_MAP_API_READY);
            } else {
                this._isLoading = true;
                request = new this._JSONPRequest(GMAP_JSONP_URI, {
                    on: {
                        success: Y.bind(this._mapReady, this),
                        failure: Y.bind(this._mapFailed, this)
                    }
                });
                request.send();
            }
        },

        /**
         * Checking if the map API is loaded already
         *
         * @method isAPILoaded
         * @return {boolean} true if map API was loaded, false if not
         */
        isAPILoaded: function () {
            return (typeof google === 'object' && typeof google.maps === 'object');
        },

        /**
         * Method handling successfull maps API loading
         *
         * @method _mapReady
         * @protected
         */
        _mapReady: function () {
            this._isLoading = false;
            this.fire(EVENT_MAP_API_READY);
        },

        /**
         * Method handling failures during maps API loading
         *
         * @method _mapFailed
         * @protected
         */
        _mapFailed: function () {
            this._isLoading = false;
            this.fire(EVENT_MAP_API_FAILED);
        }
    };

    Y.augment(GoogleMapAPILoader, Y.EventTarget);
    Y.eZ.GoogleMapAPILoader = GoogleMapAPILoader;
    Y.eZ.services.mapAPILoader = new GoogleMapAPILoader();
});

/* global google */
YUI.add('ez-googlemapapiloader', function (Y) {
    "use strict";

    Y.namespace('eZ');

    var EVENT_MAP_API_READY = 'mapAPIReady',
        EVENT_MAP_API_FAILED = 'mapAPIFailed';

    /**
     * A Component with one specific task - try to load Google Maps API and fire
     * the EVENT_MAP_API_READY event in case of success or
     * EVENT_MAP_API_FAILED event in case of problems encountered
     *
     * @class GoogleMapAPILoader
     * @namespace eZ
     * @constructor
     */
    function GoogleMapAPILoader() {
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
         * @event EVENT_MAP_API_READY
         */
        this.publish(EVENT_MAP_API_READY, {fireOnce: true});

        /**
         * Fired once map API have failed to load
         *
         * @event EVENT_MAP_API_FAILED
         */
        this.publish(EVENT_MAP_API_FAILED, {fireOnce: true});
    }

    GoogleMapAPILoader.prototype = {
        /**
         * Trying to load Google Maps API via JSONP and firing either
         * EVENT_MAP_API_READY or EVENT_MAP_API_FAILED depending on results
         *
         * @method load
         */
        load: function (JSONRequestConstructor) {
            var request;

            if (this._isLoading) {
                // Avoiding concurrent loading
                return;
            }

            if (this.isAPILoaded()) {
                this.fire(EVENT_MAP_API_READY);
            } else {
                if (!JSONRequestConstructor) {
                    JSONRequestConstructor = Y.JSONPRequest;
                }
                this._isLoading = true;
                request = new JSONRequestConstructor('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback={callback}', {
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
});

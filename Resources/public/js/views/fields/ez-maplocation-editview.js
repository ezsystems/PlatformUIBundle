/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global google */
YUI.add('ez-maplocation-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Map Location (ezgmaplocation) fields
     *
     * @module ez-maplocation-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezgmaplocation',
        DEFAULT_LATITUDE_WITHOUT_LOCATION = 0,
        DEFAULT_LONGITUDE_WITHOUT_LOCATION = 0,
        DEFAULT_ZOOM_WITHOUT_LOCATION = 1,
        DEFAULT_ZOOM = 8,
        MARKER_TITLE = "Current location",
        CONTROL_MAP_TYPE = false,
        CONTROL_STREET_VIEW = false,
        FIND_ADDRESS_BUTTON_SEL = ".ez-maplocation-find-address-button",
        FIND_ADDRESS_INPUT_SEL = ".ez-maplocation-find-address-input input",
        ERRORS_SEL = ".ez-maplocation-errors",
        MAP_CONTAINER_SEL = ".ez-maplocation-map-container",
        LATITUDE_SPAN_SEL = ".ez-maplocation-latitude",
        LONGITUDE_SPAN_SEL = ".ez-maplocation-longitude",
        LOCATE_ME_BUTTON_SEL = ".ez-maplocation-locate-me-button",
        LOCATE_ME_ERRORS_SEL = ".ez-maplocation-locate-me-errors",
        COORDINATES_SEL = ".ez-maplocation-coordinates li",
        IS_LOADING_CLASS = "is-loading",
        IS_ERROR_CLASS = "is-error",
        IS_BUTTON_DISABLED_CLASS = "pure-button-disabled",
        ENTER_KEY = 13;

    /**
     * Map Location edit view
     *
     * @namespace eZ
     * @class MapLocationEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.MapLocationEditView = Y.Base.create('mapLocationEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-maplocation-find-address-button': {
                'tap': '_findAddress'
            },
            '.ez-maplocation-find-address-input input': {
                'keyup': '_findAddressInputKeyUp',
            },
            '.ez-maplocation-locate-me-button': {
                'tap': '_locateMe'
            }
        },

        /**
         * Custom initializer method, it initializes maps API loader and
         * initializes the map in case of success, or shows an error message in
         * case of failure
         *
         * @method initializer
         */
        initializer: function () {
            var mapLoader = this.get('mapAPILoader');

            mapLoader.load();

            this.after('activeChange', function (e) {
                var that = this;

                if ( e.newVal ) {
                    mapLoader.on('mapAPIReady', Y.bind(this._initMap, this));

                    mapLoader.on('mapAPIFailed', function () {
                        var container = that.get('container');
                        container.one(ERRORS_SEL).setHTML('Failed to retrieve Google Maps API');
                        container.all(COORDINATES_SEL).removeClass(IS_LOADING_CLASS);
                    });
                }
            });
        },

        /**
         * Initializes the map instance, adds a marker to the map, taking
         * into account default values (if any)
         *
         * @method _initMap
         * @protected
         */
        _initMap: function () {
            var mapOptions = {
                    streetViewControl: CONTROL_STREET_VIEW,
                    mapTypeControl: CONTROL_MAP_TYPE,
                    zoom: DEFAULT_ZOOM_WITHOUT_LOCATION,
                    center: new google.maps.LatLng(DEFAULT_LATITUDE_WITHOUT_LOCATION, DEFAULT_LONGITUDE_WITHOUT_LOCATION)
                },
                field = this.get('field'),
                marker,
                map;

            // If some location is already defined preparing to
            // show it on the map
            if (field && field.fieldValue) {
                mapOptions.zoom = DEFAULT_ZOOM;
                mapOptions.center = new google.maps.LatLng(field.fieldValue.latitude, field.fieldValue.longitude);
            }

            // Saving location into view attribute for the future use
            this.after('locationChange', Y.bind(this._locationChange, this));
            this.set('location', mapOptions.center);

            // Creating a map
            map = new google.maps.Map(
                this.get('container').one(MAP_CONTAINER_SEL).getDOMNode(),
                mapOptions
            );
            this.set('map', map);

            // Adding a marker
            marker = new google.maps.Marker({
                position: mapOptions.center,
                map: map,
                draggable: true,
                title: MARKER_TITLE
            });
            this.set('marker', marker);

            google.maps.event.addListener(marker, 'drag', Y.bind(this._markerDrag, this));
            google.maps.event.addListener(map, 'click', Y.bind(this._mapClick, this));
            google.maps.event.addListenerOnce(map, 'idle', Y.bind(this._mapFirstLoad, this));
        },

        /**
         * Event handler which is triggered only the first time the map is fully
         * loaded (http://stackoverflow.com/questions/832692/how-to-check-if-google-maps-is-fully-loaded)
         * For now enabling buttons (if needed) and switching off loaders
         *
         * @protected
         * @method _mapFirstLoad
         */
        _mapFirstLoad: function () {
            var container = this.get('container');

            container.one(FIND_ADDRESS_BUTTON_SEL).removeClass(IS_BUTTON_DISABLED_CLASS);
            container.all(COORDINATES_SEL).removeClass(IS_LOADING_CLASS);

            if (this._geolocationAvailable()) {
                container.one(LOCATE_ME_BUTTON_SEL).removeClass(IS_BUTTON_DISABLED_CLASS);
            }
        },

        /**
         * Attempts to find location of the address in the address input and
         * change coordinates and marker position accordingly
         *
         * @protected
         * @method _findAddress
         * @param e {Object} event facade
         */
        _findAddress: function (e) {
            var that = this,
                geocoder = new google.maps.Geocoder(),
                container = this.get('container'),
                button = container.one(FIND_ADDRESS_BUTTON_SEL),
                addressInput = container.one(FIND_ADDRESS_INPUT_SEL),
                errorsOutput = container.one(ERRORS_SEL);

            if (e) {
                e.preventDefault();
            }

            if (this.get('mapAPILoader').isAPILoaded()) {

                errorsOutput.empty();
                addressInput.get('parentNode').removeClass(IS_ERROR_CLASS);
                button.addClass(IS_LOADING_CLASS);

                geocoder.geocode(
                    {'address': addressInput.get('value')},
                    function (results, status) {
                        button.removeClass(IS_LOADING_CLASS);
                        if (status === google.maps.GeocoderStatus.OK) {
                            that.set('location', results[0].geometry.location);
                            that._updateMapCenter();
                        } else {
                            addressInput.get('parentNode').addClass(IS_ERROR_CLASS);
                            if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                                errorsOutput.setHTML('Unable to find this address');
                            } else {
                                errorsOutput.setHTML('An error occurred during the geocoding request for this address');
                            }
                        }
                    }
                );
            } else {
                errorsOutput.setHTML('Google maps are not loaded correctly, try reloading the page');
            }
        },

        /**
         * Catches "Enter" key strokes and triggers location finding process
         *
         * @protected
         * @method _findAddressInputKeyUp
         * @param {Object} e event facade of the keyboard event
         */
        _findAddressInputKeyUp: function (e) {
            if (e.keyCode === ENTER_KEY) {
                this._findAddress();
            }
        },

        /**
         * Attempts to locate the current user's device position using
         * HTML5 Geolocation API
         *
         * @protected
         * @method _locateMe
         * @param e {Object} event facade
         */
        _locateMe: function (e) {
            var that = this,
                container = this.get('container'),
                button = container.one(LOCATE_ME_BUTTON_SEL),
                errorsOutput = container.one(LOCATE_ME_ERRORS_SEL);

            e.preventDefault();
            errorsOutput.empty();

            if (this._geolocationAvailable()) {
                button.addClass(IS_LOADING_CLASS);
                navigator.geolocation.getCurrentPosition(
                    // Request success
                    function (myPosition) {
                        button.removeClass(IS_LOADING_CLASS);

                        that.set('location', {
                                latitude: myPosition.coords.latitude,
                                longitude: myPosition.coords.longitude
                            }
                        );
                        that._updateMapCenter();
                    },
                    // Request failure
                    function () {
                        button.removeClass(IS_LOADING_CLASS);
                        errorsOutput.setHTML('An error occurred during geolocation request of your current position');
                    });
            } else {
                errorsOutput.setHTML('Your browser does not support HTML5 Geolocation API');
            }
        },

        /**
         * Callback which is called upon any change of the 'location' attribute
         * For now only updates the coordinates which are shown to the user
         * in the "dashboard" and updates the marker position
         *
         * @protected
         * @method _locationChange
         */
        _locationChange: function () {
            var container = this.get('container'),
                location = this.get('location'),
                locationLatLng = this._getLocationAsLatLng(),
                marker = this.get('marker');

            container.one(LATITUDE_SPAN_SEL).setHTML(location.latitude.toFixed(6));
            container.one(LONGITUDE_SPAN_SEL).setHTML(location.longitude.toFixed(6));

            if (marker) {
                marker.setPosition(
                    locationLatLng
                );
            }
        },

        /**
         * Centers the map on the current location's position
         *
         * @protected
         * @method _updateMapCenter
         */
        _updateMapCenter: function () {
            var location = this._getLocationAsLatLng();
            if (location) {
                this.get('map').setCenter(
                    location
                );
            }
        },

        /**
         * Marker dragging event handler
         *
         * @protected
         * @method _markerDrag
         * @param {Object} e the event object of the marker drag event
         */
        _markerDrag: function (e) {
            this.set('location', e.latLng);
        },

        /**
         * Marker dragging event handler
         *
         * @method _markerDrag
         * @protected
         * @param {Object} e the event object of the map click event
         */
        _mapClick: function (e) {
            this.set('location', e.latLng);
        },

        /**
         * Checking if the geolocation API is available
         *
         * @method _geolocationAvailable
         * @protected
         * @return {boolean} true, if geolocation API is available
         */
        _geolocationAvailable: function () {
            return (navigator && navigator.geolocation);
        },

        /**
         * Returns current location as a Google LatLng object
         *
         * @method _getLocationAsLatLng
         * @protected
         * @return {google.maps.LatLng}
         */
        _getLocationAsLatLng: function () {
            var location = this.get('location');
            return new google.maps.LatLng(
                location.latitude,
                location.longitude
            );
        },

        /**
         * Defines the variables to import in the field edit template for the
         * map location
         *
         * @protected
         * @method _variables
         * @return {Object} containing isRequired entry
         */
        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired
            };
        },

        /**
         * Returns the currently filled location. The location contains the
         * latitude, the longitude and an address if it is filled by the user.
         *
         * @protected
         * @method _getFieldValue
         * @return Object
         */
        _getFieldValue: function () {
            var value = Y.clone(this.get('location'));

            value.address = this.get('container').one(FIND_ADDRESS_INPUT_SEL).get('value');
            return value;
        },
    }, {
        ATTRS: {
            /**
             * The instance of the google map which is initialized in the widget
             *
             * @attribute map
             * @type {Object}
             * @default null
             */
            map: {
                value: null
            },

            /**
             * The location marker on the widget google map
             *
             * @attribute marker
             * @type {Object}
             * @default null
             */
            marker: {
                value: null
            },

            /**
             * Current location object
             *
             * @attribute location
             * @type {Object}
             * @default {latitude: 0, longitude: 0}
             */
            location: {
                value: {
                    latitude: 0,
                    longitude: 0
                },
                setter: function (newLocation) {
                    // In case if google.maps.LatLng is passed
                    if (newLocation.lat && newLocation.lng) {
                        return {
                            latitude: newLocation.lat(),
                            longitude: newLocation.lng()
                        };
                    } else {
                        return newLocation;
                    }
                }
            },

            /**
             * Instance of a map API loader component.
             *
             * @attribute mapAPILoader
             * @type {Object} instance of a map API loader
             * @readonly
             */
            mapAPILoader: {
                valueFn: function () {
                    return Y.eZ.services.mapAPILoader;
                },
                cloneDefaultValue: false, // important so that all the MapLocationEditView instances have the same loader instance
                readOnly: true
            }
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.MapLocationEditView
    );

});

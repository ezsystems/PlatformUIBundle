/* global google */
YUI.add('ez-maplocation-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Map Location (ezstring) fields
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
                'click': '_findAddress'
            },
            '.ez-maplocation-find-address-input input': {
                'keyup': '_findAddressInputKeyUp'
            },
            '.ez-maplocation-locate-me-button': {
                'click': '_locateMe'
            }
        },

        /**
         * Custom initializer method, it initializes google maps API (if needed)
         *
         * @method initializer
         */
        initializer: function () {
            var that = this;

            if (typeof google != 'object' || typeof google.maps != 'object') {

                /* For a case when 2 or more similar editviews are trying to
                 load we have to create a queue workflow, so the google maps API
                 will be loaded only once and at the same time each map will be
                 initialized after the API retrieval */
                window.eZ = window.eZ || {};
                if (window.eZ.mapLocationEditViewQueue) {
                    window.eZ.mapLocationEditViewQueue.push({
                        run: this.initMap,
                        context: this
                    });
                } else {
                    window.eZ.mapLocationEditViewQueue = [];
                    window.eZ.mapLocationEditViewQueue.push({
                        run: this.initMap,
                        context: this
                    });

                    Y.jsonp('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback={callback}', {
                        on: {
                            success: function () {
                                var mapInitializer;

                                // Emptying the queue
                                while (!!(mapInitializer = window.eZ.mapLocationEditViewQueue.shift())) {
                                    mapInitializer.run.apply(mapInitializer.context);
                                }
                            },
                            failure: function () {
                                var container = that.get('container');
                                container.one(ERRORS_SEL).setHTML('Failed to retrieve Google Maps API');
                                container.all(COORDINATES_SEL).removeClass(IS_LOADING_CLASS);
                            }
                        }
                    });
                }
            } else {
                // Google maps API is already loaded
                this.initMap();
            }
        },

        /**
         * Initializes the map instance, adds a marker to the map, taking
         * into account default values (if any)
         *
         * @method initMap
         */
        initMap: function () {
            var mapOptions = {
                    streetViewControl: CONTROL_STREET_VIEW,
                    mapTypeControl: CONTROL_MAP_TYPE,
                    zoom: DEFAULT_ZOOM_WITHOUT_LOCATION,
                    center: new google.maps.LatLng(DEFAULT_LATITUDE_WITHOUT_LOCATION, DEFAULT_LONGITUDE_WITHOUT_LOCATION)
                },
                map,
                marker,
                field = this.get('field');

            // If some location is already defined preparing to
            // show it on the map
            if (field.fieldValue) {
                mapOptions.zoom = DEFAULT_ZOOM;
                mapOptions.center = new google.maps.LatLng(field.fieldValue.latitude, field.fieldValue.longitude);
            }

            // Saving location into view attribute for the future use
            this.after('locationChange', Y.bind(this._locationChange, this));
            this.set('location', mapOptions.center);

            // Creating a map
            map = new google.maps.Map(
                this.get('container').one('.ez-maplocation-map-container').getDOMNode(),
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
         * Event which is triggered only the first time the map is fully loaded
         * (http://stackoverflow.com/questions/832692/how-to-check-if-google-maps-is-fully-loaded)
         * For now enabling buttons (if needed) and switching off loaders
         *
         * @protected
         * @method _mapFirstLoad
         */
        _mapFirstLoad: function () {
            var container = this.get('container');

            container.one(FIND_ADDRESS_BUTTON_SEL).removeClass(IS_BUTTON_DISABLED_CLASS);
            container.all(COORDINATES_SEL).removeClass(IS_LOADING_CLASS);

            if (navigator && navigator.geolocation) {
                container.one(LOCATE_ME_BUTTON_SEL).removeClass(IS_BUTTON_DISABLED_CLASS);
            }
        },

        /**
         * Attempts to find location of the address in the address input and
         * change coordinates and marker position accordingly
         *
         * @protected
         * @method _findAddress
         */
        _findAddress: function () {
            var that = this,
                geocoder = new google.maps.Geocoder(),
                container = this.get('container'),
                button = container.one(FIND_ADDRESS_BUTTON_SEL),
                addressInput = container.one(FIND_ADDRESS_INPUT_SEL),
                errorsOutput = container.one(ERRORS_SEL);

            if (typeof google === 'object' || typeof google.maps === 'object') {

                errorsOutput.empty();
                addressInput.get('parentNode').removeClass(IS_ERROR_CLASS);
                button.addClass(IS_LOADING_CLASS);

                geocoder.geocode(
                    {'address': addressInput.get('value')},
                    function(results, status) {
                        button.removeClass(IS_LOADING_CLASS);
                        if (status == google.maps.GeocoderStatus.OK) {
                            that.set('location', results[0].geometry.location);
                            that._updateMarkerPosition();
                            that._updateMapCenter();
                        } else {
                            addressInput.get('parentNode').addClass(IS_ERROR_CLASS);
                            if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
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
         */
        _locateMe: function () {
            var that = this,
                container = this.get('container'),
                button = container.one(LOCATE_ME_BUTTON_SEL),
                errorsOutput = container.one(LOCATE_ME_ERRORS_SEL);

            errorsOutput.empty();
            button.addClass(IS_LOADING_CLASS);

            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    // Request success
                    function(myPosition) {
                        button.removeClass(IS_LOADING_CLASS);

                        that.set(
                            'location',
                            new google.maps.LatLng(
                                myPosition.coords.latitude,
                                myPosition.coords.longitude
                            )
                        );
                        that._updateMarkerPosition();
                        that._updateMapCenter();
                    },
                    // Request failure
                    function() {
                        button.removeClass(IS_LOADING_CLASS);
                        errorsOutput.setHTML('An error occured during geolocation request of your current position');
                    });
            } else {
                errorsOutput.setHTML('Your browser does not support HTML5 Geolocation API');
            }
        },

        /**
         * Callback which is called upon any change of the 'location' attribute
         * For now only updates the coordinates which are shown to the user
         * in the "dashboard"
         *
         * @protected
         * @method _locationChange
         */
        _locationChange: function () {
            var container = this.get('container'),
                location = this.get('location');
            if (location) {
                container.one(LATITUDE_SPAN_SEL).setHTML(location.lat().toFixed(6));
                container.one(LONGITUDE_SPAN_SEL).setHTML(location.lng().toFixed(6));
            }
        },

        /**
         * Updates the position of the map marker
         *
         * @protected
         * @method _updateMarkerPosition
         */
        _updateMarkerPosition: function () {
            var location = this.get('location');
            if (location) {
                this.get('marker').setPosition(
                    location
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
            var location = this.get('location');
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
         * @protected
         * @method _markerDrag
         * @param {Object} e the event object of the map click event
         */
        _mapClick: function (e) {
            this.set('location', e.latLng);
            this._updateMarkerPosition();
        },

        /**
         * Defines the variables to imported in the field edit template for text
         * line.
         *
         * @protected
         * @method _variables
         * @return {Object} containing isRequired, maxLength and minLength
         * entries
         */
        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired
            };
        }
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
             * Current location
             *
             * @attribute location
             * @type {google.maps.LatLng}
             * @default null
             */
            location: {
                value: null
            }
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.MapLocationEditView
    );
});

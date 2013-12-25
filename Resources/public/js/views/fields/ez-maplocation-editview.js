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
        FIND_ADDRESS_ERRORS_SEL = ".ez-maplocation-find-address-errors",
        LATITUDE_SPAN_SEL = ".ez-maplocation-latitude",
        LONGITUDE_SPAN_SEL = ".ez-maplocation-longitude",
        IS_LOADING_CLASS = "is-loading",
        IS_ERROR_CLASS = "is-error",
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
         * Custom initializer method, it initializes google maps (if needed)
         *
         * @method initializer
         */
        initializer: function () {
            var that = this;

            if (typeof google != 'object' || typeof google.maps != 'object') {
                Y.jsonp('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback={callback}', {
                    on: {
                        success: function () {
                            var mapOptions = {
                                    streetViewControl: CONTROL_STREET_VIEW,
                                    mapTypeControl: CONTROL_MAP_TYPE
                                },
                                map,
                                marker,
                                field = that.get('field');

                            // If some location is already defined preparing to
                            // show it on the map
                            if (field.fieldValue) {
                                mapOptions.zoom = DEFAULT_ZOOM;
                                mapOptions.center = new google.maps.LatLng(field.fieldValue.latitude, field.fieldValue.longitude);
                            } else {
                                // Empty location
                                mapOptions.zoom = DEFAULT_ZOOM_WITHOUT_LOCATION;
                                mapOptions.center = new google.maps.LatLng(DEFAULT_LATITUDE_WITHOUT_LOCATION, DEFAULT_LONGITUDE_WITHOUT_LOCATION);
                            }

                            map = new google.maps.Map(
                                that.get('container').one('.ez-maplocation-map-container').getDOMNode(),
                                mapOptions
                            );
                            that.set('map', map);

                            marker = new google.maps.Marker({
                                position: mapOptions.center,
                                map: map,
                                draggable: true,
                                title: MARKER_TITLE
                            });
                            that.set('marker', marker);

                            google.maps.event.addListener(marker, 'drag', Y.bind(that._markerDrag, that) );
                            google.maps.event.addListener(map, 'click', Y.bind(that._mapClick, that) );

                        },
                        failure: function () {
                            console.log("Throw fatal error here!");
                        }
                    }
                });
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
            if (typeof google === 'object' || typeof google.maps === 'object') {
                var that = this,
                    geocoder = new google.maps.Geocoder(),
                    container = this.get('container'),
                    button = container.one(FIND_ADDRESS_BUTTON_SEL),
                    addressInput = container.one(FIND_ADDRESS_INPUT_SEL),
                    errorsOutput = container.one(FIND_ADDRESS_ERRORS_SEL);

                errorsOutput.empty();
                addressInput.get('parentNode').removeClass(IS_ERROR_CLASS);
                button.addClass(IS_LOADING_CLASS);

                geocoder.geocode(
                    {'address': addressInput.get('value')},
                    function(results, status) {
                        button.removeClass(IS_LOADING_CLASS);
                        if (status == google.maps.GeocoderStatus.OK) {
                            that.set('latitude', results[0].geometry.location.lat());
                            that.set('longitude', results[0].geometry.location.lng());
                            that._updateCoordinates();
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
                console.log("Throw fatal error here!");
            }
        },

        /**
         * Catches "Enter" key press and triggers geolocation if it is pressed
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
         * Attempts to locate the current user's device position using Geolocation API
         *
         * @protected
         * @method _locateMe
         */
        _locateMe: function () {
            console.log("Locate Me!");
        },

        /**
         * Updates the coordinates which are shown to the user in the "dashboard"
         *
         * @protected
         * @method _updateCoordinates
         */
        _updateCoordinates: function () {
            var container = this.get('container');
            container.one(LATITUDE_SPAN_SEL).setHTML(this.get('latitude').toFixed(6));
            container.one(LONGITUDE_SPAN_SEL).setHTML(this.get('longitude').toFixed(6));
        },

        /**
         * Updates the position of the map marker
         *
         * @protected
         * @method _updateMarkerPosition
         */
        _updateMarkerPosition: function () {
            this.get('marker').setPosition(
                new google.maps.LatLng(
                    this.get('latitude'),
                    this.get('longitude')
                )
            );
        },

        /**
         * Centers the map on the current location's position
         *
         * @protected
         * @method _updateMapCenter
         */
        _updateMapCenter: function () {
            this.get('map').setCenter(
                new google.maps.LatLng(
                    this.get('latitude'),
                    this.get('longitude')
                )
            );
        },

        /**
         * Marker dragging event handler
         *
         * @protected
         * @method _markerDrag
         * @param {Object} e the event object of the marker drag event
         */
        _markerDrag: function (e) {
            this.set('latitude', e.latLng.lat());
            this.set('longitude', e.latLng.lng());

            this._updateCoordinates();
        },

        /**
         * Marker dragging event handler
         *
         * @protected
         * @method _markerDrag
         * @param {Object} e the event object of the map click event
         */
        _mapClick: function (e) {
            this.set('latitude', e.latLng.lat());
            this.set('longitude', e.latLng.lng());

            this._updateCoordinates();
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
             * Latitude of the current location
             *
             * @attribute latitude
             * @type {Float}
             * @default 0
             */
            latitude: {
                value: 0
            },

            /**
             * Longitude of the current location
             *
             * @attribute longitude
             * @type {Float}
             * @default 0
             */
            longitude: {
                value: 0
            }
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.MapLocationEditView
    );
});

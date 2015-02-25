/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global google */
YUI.add('ez-maplocation-view', function (Y) {
    "use strict";
    /**
     * Provides the Map Location field view
     *
     * @module ez-maplocation-view
     */
    Y.namespace('eZ');

    var LOADING = 'is-maplocationview-loading',
        LOADING_FAILED = 'is-maplocationview-loading-failed',
        MSG_SELECTOR = '.ez-maplocation-message',
        MAP_SELECTOR = '.ez-maplocation-map',
        DATA_SELECTOR = '.ez-maplocation-data',
        FAILED_MSG = 'Failed to load the map';

    /**
     * Map Location edit view
     *
     * @namespace eZ
     * @class MapLocationEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.MapLocationView = Y.Base.create('mapLocationView', Y.eZ.FieldView, [], {
        /**
         * Initialize the view by loading the map API if the field is not empty
         * and make sure to load the map once the view is active
         *
         * @method initializer
         */
        initializer: function () {
            var mapLoader = this.get('mapAPILoader');

            if ( !this._isFieldEmpty() && mapLoader ) {
                mapLoader.load();
                this.after('activeChange', function (e) {
                    if ( e.newVal ) {
                        mapLoader.on('mapAPIReady', Y.bind(this._initMap, this));
                        mapLoader.on('mapAPIFailed', Y.bind(this._mapAPIFailed, this));
                    }
                });
            }
        },

        /**
         * Renders the map location view
         *
         * @method render
         * @return eZ.MapLocationView the view it self
         */
        render: function () {
            this.constructor.superclass.render.call(this);
            this.get('container').addClass(LOADING);
            return this;
        },

        /**
         * Returns a clone of the DOM Node containing the field data
         *
         * @method _getInfoContent
         * @protected
         * @return DOM Node
         */
        _getInfoContent: function () {
            var list = this.get('container').one(DATA_SELECTOR);

            return list.cloneNode(true).getDOMNode();
        },

        /**
         * mapAPIFailed event handler
         *
         * @method _mapAPIFailed
         * @protected
         */
        _mapAPIFailed: function () {
            var container = this.get('container');

            container.removeClass(LOADING).addClass(LOADING_FAILED);
            container.one(MSG_SELECTOR).setContent(FAILED_MSG);
        },

        /**
         * mapAPIReady event handler. It calls the map api to render a map with
         * the data stored in the field
         *
         * @method _initMap
         * @protected
         */
        _initMap: function () {
            var map, marker, info,
                value = this._getFieldValue(),
                mapOptions = {
                    streetViewControl: true,
                    mapTypeControl: true,
                    zoom: 8,
                    center: new google.maps.LatLng(value.latitude, value.longitude)
                },
                container = this.get('container');

            container.removeClass(LOADING);
            info = new google.maps.InfoWindow({content: this._getInfoContent()});
            map = new google.maps.Map(this._getMapDomNode(), mapOptions);
            marker = new google.maps.Marker({
                position: mapOptions.center,
                map: map,
            });
            info.open(map, marker);

            google.maps.event.addListener(marker, 'click', function () {
                info.open(map, marker);
            });
        },

        /**
         * Returns the placeholder DOM Node for the map
         *
         * @method _getMapDomNode
         * @private
         */
        _getMapDomNode: function () {
            return this.get('container').one(MAP_SELECTOR).getDOMNode();
        },

        /**
         * Returns a normalized value from the value stored in the field
         *
         * @method _getFieldValue
         * @protected
         * @return an object with the data stored in the field or undefined if
         * the field does not a valid value
         */
        _getFieldValue: function () {
            var value = this.get('field') ? this.get('field').fieldValue : false;

            if ( !value || Y.Object.isEmpty(value) || (value.latitude === "" && value.longitude === "") ) {
                return undefined;
            }

            return {
                address: value.address,
                latitude: value.latitude,
                longitude: value.longitude
            };
        },
    }, {
        ATTRS: {
            /**
             * Instance of a map API loader component
             *
             * @attribute mapAPILoader
             * @type {Object} instance of a map loader component
             * @default the map api loader service if it is defined
             */
            mapAPILoader: {
                valueFn: function () {
                    if ( Y.eZ.services && Y.eZ.services.mapAPILoader ) {
                        return Y.eZ.services.mapAPILoader;
                    }
                },
                cloneDefaultValue: false,
            }
        }
    });

    Y.eZ.FieldView.registerFieldView('ezgmaplocation', Y.eZ.MapLocationView);
});

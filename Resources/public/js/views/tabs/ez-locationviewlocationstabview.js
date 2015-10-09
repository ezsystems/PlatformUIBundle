/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewlocationstabview', function (Y) {
    "use strict";
    /**
     * Provides the Location View Locations Tab view class.
     *
     * @module ez-locationviewlocationstabview
     */
    Y.namespace('eZ');

    var events = {
            '.ez-add-location-button': {
                'tap': '_addLocation'
            },
            '.ez-main-location-radio': {
                'tap': '_setMainLocation'
            },
            '.ez-locations-hidden-button': {
                'tap': '_switchVisibility'
            },
        };

    /**
     * The Location View Locations Tab View class.
     *
     * @namespace eZ
     * @class LocationViewLocationsTabView
     * @constructor
     * @extends eZ.LocationViewTabView
     */
    Y.eZ.LocationViewLocationsTabView = Y.Base.create('locationViewLocationsTabView', Y.eZ.LocationViewTabView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this.events = Y.merge(this.events, events);
            this._fireMethod = this._fireLoadLocations;
            this._watchAttribute = 'locations';
        },

        render: function () {
            var container = this.get('container'),
                mainLocationId = this.get('content').get('resources').MainLocation,
                locations = [];

            Y.Array.each(this.get('locations'), function (loc) {
                var locJSON = loc.toJSON();

                locJSON.isMainLocation = (locJSON.id === mainLocationId);
                locations.push(locJSON);
            });

            container.setHTML(this.template({
                "locations": locations,
                "loadingError": this.get('loadingError')
            }));

            return this;
        },

        /**
         * Fire the `loadLocations` event
         *
         * @method _fireLoadLocations
         * @protected
         */
        _fireLoadLocations: function () {
            /**
             * Fired when the locations tab view needs content's locations
             *
             * @event loadLocations
             * @param {eZ.Content} content the content for which locations will be loaded
             */
            this.fire('loadLocations', {
                content: this.get('content')
            });
        },

        /**
         * Tap event handler on the `Add location` button. It fires the
         * `createLocation` event
         *
         * @method _addLocation
         * @protected
         * @param {EventFacade} e
         */
        _addLocation: function (e) {
            /**
             * Fired when the user clicks on `Add location` button
             *
             * @event createLocation
             * @param {eZ.Content} content the content for which locations will be created
             * @param {Function} afterCreateCallback callback function that will be called after
             *                   creating location(s)
             */
            this.fire('createLocation', {
                content: this.get('content'),
                afterCreateCallback: Y.bind(this._refresh, this)
            });
        },

        /**
         * After create location callback function. It fires `loadLocations` event
         * for refresh the view.
         *
         * @method _refresh
         * @protected
         */
        _refresh: function () {
            this._fireLoadLocations();
        },

        /**
         * Tap event handler on the main location radio input. It fires the
         * `setMainLocation` event
         *
         * @method _setMainLocation
         * @protected
         * @param {EventFacade} e
         */
        _setMainLocation: function (e) {
            var locationId = e.target.getAttribute('data-location-id');

            e.preventDefault();

            if (locationId === this.get('content').get('resources').MainLocation) {
                return;
            }

            this.get('container').all('.ez-main-location-radio').set('disabled', true);

            this.fire('setMainLocation', {
                locationId: locationId,
                afterSetMainLocationCallback: Y.bind(this._refresh, this),
                cancelSetMainLocationCallback: Y.bind(this._enableSetMainLocationRadios, this)
            });
        },

        /**
         * Turns off disabled state for main location radio inputs.
         *
         * @method _enableSetMainLocationRadios
         * @private
         */
        _enableSetMainLocationRadios: function () {
            this.get('container').all('.ez-main-location-radio').set('disabled', false);
        },

        /**
         * Switches the visibility of the location provided in the `switchVisibility` event
         *
         * @method _switchVisibility
         * @protected
         * @param {EventFacade} e
         */
        _switchVisibility: function (e) {
            var locationId = e.target.getAttribute('data-location-id'),
                callback = Y.bind(function (error) {
                    if (error) {
                        e.target.set('disabled', false).removeClass('is-switching-visibility');
                    } else {
                        this._refresh();
                    }
                }, this);


            Y.Array.every(this.get('locations'), function (location) {
                if(location.get('id') === locationId) {
                    e.target.set('disabled', true).addClass('is-switching-visibility');

                    /**
                     * Fired when the user clicks on the hide/reveal button
                     *
                     * @event switchVisibility
                     * @param {eZ.Location} location Location who's visibility needs to be changed
                     *        callback called ones the visibility has been updated
                     *
                     */
                    this.fire('switchVisibility', {
                        location: location,
                        callback: callback
                    });
                    return false;
                } else {
                    return true;
                }
            }, this);
        },
    }, {
        ATTRS: {
            /**
             * The title of the tab
             *
             * @attribute title
             * @type {String}
             * @default "Locations"
             * @readOnly
             */
            title: {
                value: "Locations",
                readOnly: true,
            },

            /**
             * The identifier of the tab
             *
             * @attribute identifier
             * @type {String}
             * @default "locations"
             * @readOnly
             */
            identifier: {
                value: "locations",
                readOnly: true,
            },

            /**
             * The content being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             * @writeOnce
             */
            content: {
                writeOnce: 'initOnly',
            },

            /**
             * List of locations of the content
             *
             * @attribute locations
             * @type {Array}
             */
            locations: {},

            /**
             * The config
             *
             * @attribute config
             * @type mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            },
        }
    });
});

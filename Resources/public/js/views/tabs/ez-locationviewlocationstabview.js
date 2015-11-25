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
            '.ez-remove-locations-button': {
                'tap': '_removeSelectedLocations'
            }
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
             * @param {eZ.Location} location currently being displayed
             */
            this.fire('loadLocations', {
                content: this.get('content'),
                location: this.get('location'),
                loadPath:true,
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

        /**
         * Tap event handler on the `Remove selected` button. It fires the
         * `removeLocations` event
         *
         * @method _removeSelectedLocations
         * @protected
         * @param {EventFacade} e
         */
        _removeSelectedLocations: function (e) {
            var c = this.get('container'),
                locations = [];

            locations = Y.Array.reject(this.get('locations'), function (location) {
                var checkbox = c.one('.ez-location-checkbox[data-location-id="' + location.get('id') + '"]');

                if (checkbox && checkbox.get('checked')) {
                    return false;
                }
                return true;
            });

            if (locations.length > 0) {
                this._disableLocationsCheckboxes();
                this.fire('removeLocations', {
                    locations: locations,
                    afterRemoveLocationsCallback: Y.bind(this._afterRemoveLocationCallback, this)
                });
            }
        },

        /**
         * Callback function called after removing location(s).
         *
         * @method _afterRemoveLocationCallback
         * @protected
         * @param {Boolean} locationsRemoved if TRUE the view is reloaded, if FALSE it just enables checkboxes
         */
        _afterRemoveLocationCallback: function (locationsRemoved) {
            if (locationsRemoved) {
                this._refresh();
            } else {
                this._enableLocationsCheckboxes();
            }
        },

        /**
         * Disables all checkboxes on locations list preventing from making use of them.
         *
         * @method _disableLocationsCheckboxes
         * @private
         */
        _disableLocationsCheckboxes: function () {
            this.get('container').all('.ez-location-checkbox').set('disabled', true);
        },

        /**
         * Enables checkboxes on locations list. Checkbox of main location remains disabled.
         *
         * @method _enableLocationsCheckboxes
         * @private
         */
        _enableLocationsCheckboxes: function () {
            var c = this.get('container');

            c.all('.ez-location-checkbox[data-main-location="0"]').set('disabled', false);
        }
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
             * The location being displayed in the location view.
             *
             * @attribute location
             * @type {eZ.Location}
             * @writeOnce
             */
            location: {
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

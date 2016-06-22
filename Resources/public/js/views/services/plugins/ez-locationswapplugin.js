/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationswapplugin', function (Y) {
    "use strict";
    /**
     * Provides the plugin for swap location
     *
     * @module ez-locationswapplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Swap location plugin. It sets an event handler to swap location
     *
     * In order to use it you need to fire `swapLocation` event with parameter
     * `location` containing the eZ.Location object you want swap with other.
     *
     * @namespace eZ.Plugin
     * @class LocationSwap
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.LocationSwap = Y.Base.create('locationswapplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:swapLocation', this._selectDestinationLocation);
        },

        /**
         * swapLocation event handler, launch the universal discovery widget
         * to choose the location you want to swap with the given one
         *
         * @method _selectDestinationLocation
         * @private
         * @param {EventFacade} e swapLocation event facade
         */
        _selectDestinationLocation: function (e) {
            var service = this.get('host'),
                originLocationId = e.location.get('id'),
                originLocationCanHaveChildren = service.get('contentType').get('isContainer'),
                originLocationHasChildren = originLocationCanHaveChildren &&
                    (service.get('location').get('childCount') > 0);

            service.fire('contentDiscover', {
                config: {
                    title: "Select the location you want to swap with the given one",
                    contentDiscoveredHandler: Y.bind(this._swapLocations, this, e.location),
                    multiple: false,
                    isSelectable: function(contentStruct) {
                        if (originLocationId === contentStruct.location.get('id')) {
                            return false;
                        }

                        if (originLocationHasChildren && !contentStruct.contentType.get('isContainer')) {
                            return false;
                        }

                        if (!originLocationCanHaveChildren && (contentStruct.location.get('childCount') > 0)) {
                            return false;
                        }

                        return true;
                    }
                },
            });
        },

        /**
         * Swaps the given location with the selected one
         *
         * @method _swapLocations
         * @protected
         * @param {EventFacade} e
         */
        _swapLocations: function (location, e) {
            var service = this.get('host'),
                app = service.get('app'),
                capi = service.get('capi'),
                notificationIdentifier = 'swap-location-' + location.get('id'),
                destinationLocation = e.selection.location,
                that = this;

            this._notify(
                "Swaping location for '" + location.get('contentInfo').get('name') + "'",
                notificationIdentifier,
                'started',
                5
            );

            location.swap({api: capi}, destinationLocation, function (error) {
                if (error) {
                    that._notify(
                        "Swaping location for '" + location.get('contentInfo').get('name') + "' failed",
                        notificationIdentifier,
                        'error',
                        0
                    );
                }
                else {
                    var contentInfo = location.get('contentInfo');
                    that._notify(
                        "Location for '" + contentInfo.get('name') + "' " +
                        "has been swapped with '" + destinationLocation.get('contentInfo').get('name') + "'",
                        notificationIdentifier,
                        'done',
                        5
                    );
                    /**
                     * Fired when a Location is swapped with another one.
                     *
                     * @event swappedLocation
                     * @param {eZ.Location} location
                     */
                    service.fire('swappedLocation', {
                        location: location,
                    });

                    app.navigateTo('viewLocation', {
                        id: location.get('id'),
                        languageCode: contentInfo.get('mainLanguageCode')
                    });
                }
            });
        },

        /**
         * Fire 'notify' event
         *
         * @method _notify
         * @protected
         * @param {String} text the text shown during the notification
         * @param {String} identifier the identifier of the notification
         * @param {String} state the state of the notification
         * @param {Integer} timeout the number of second, the notification will be shown
         */
        _notify: function (text, identifier, state, timeout) {
            this.get('host').fire('notify', {
                notification: {
                    text: text,
                    identifier: identifier,
                    state: state,
                    timeout: timeout,
                }
            });
        },
    }, {
        NS: 'swapLocation'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.LocationSwap, ['locationViewViewService']
    );
});

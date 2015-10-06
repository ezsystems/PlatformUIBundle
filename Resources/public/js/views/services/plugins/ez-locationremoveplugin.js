/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationremoveplugin', function (Y) {
    "use strict";
    /**
     * Provides the plugin for removing location
     *
     * @module ez-locationremoveplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Remove locations plugin. It sets an event handler to remove locations.
     *
     * In order to use it you need to fire `removeLocations` event with parameter
     * `locations` containing the array with eZ.Location objects that will be removed.
     *
     * @namespace eZ.Plugin
     * @class LocationRemove
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.LocationRemove = Y.Base.create('locationremoveplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:removeLocations', this._removeLocationsConfirm);
        },

        /**
         * removeLocations event handler, opens confirm box to confirm that selected locations
         * are going to be removed
         *
         * @method _removeLocationsConfirm
         * @private
         * @param {EventFacade} e removeLocations event facade
         */
        _removeLocationsConfirm: function (e) {
            var service = this.get('host');

            service.fire('confirmBoxOpen', {
                config: {
                    title: "Are you sure you want to remove selected locations?",
                    confirmHandler: Y.bind(function () {
                        this._removeLocations(e.locations, e.afterRemoveLocationsCallback);
                    }, this),
                    cancelHandler: Y.bind(e.afterRemoveLocationsCallback, this, false)
                }
            });
        },

        /**
         * Removes given locations. After that calls the callback function. If location that
         * is currently being displayed is removed, the app will navigate to the view location
         * of main location of content
         *
         * @method _removeLocations
         * @protected
         * @param {Array} locations array containing eZ.Location objects for removal
         * @param {Function} callback
         */
        _removeLocations: function (locations, callback) {
            var that = this,
                service = this.get('host'),
                content = service.get('content'),
                notificationIdentifier = 'remove-locations-' + content.get('id') + '-' + locations.length,
                countRemovedLocations = 0,
                countRemoveLocationsFails = 0,
                tasks = new Y.Parallel(),
                redirectToMainLocation = false;

            this._notify(
                "Removing locations for '" + content.get('name') + "'",
                notificationIdentifier,
                'started',
                5
            );

            Y.Array.each(locations, function (location) {
                var locationId = location.get('id'),
                    end = tasks.add(function (error, response) {
                        if (error) {
                            countRemoveLocationsFails++;
                            return;
                        }

                        if (service.get('location').get('id') === locationId) {
                            redirectToMainLocation = true;
                        }
                        countRemovedLocations++;
                    });

                location.destroy({remove: true, api: service.get('capi')}, end);
            });

            tasks.done(function () {
                var errorNotificationIdentifier, successNotificationIdentifier,
                    locationsRemoved = (countRemovedLocations > 0);

                if (countRemovedLocations === locations.length) {
                    successNotificationIdentifier = notificationIdentifier;
                    errorNotificationIdentifier = notificationIdentifier + '-error';
                } else {
                    successNotificationIdentifier = notificationIdentifier + '-success';
                    errorNotificationIdentifier = notificationIdentifier;
                }

                if (countRemovedLocations > 0) {
                    that._notify(
                        countRemovedLocations + " location(s) of '" + content.get('name') + "' have been removed",
                        successNotificationIdentifier,
                        'done',
                        5
                    );
                }

                if (countRemoveLocationsFails > 0) {
                    that._notify(
                        "Removing of " + countRemoveLocationsFails + " location(s) of '" + content.get('name') + "' has failed",
                        errorNotificationIdentifier,
                        'error',
                        0
                    );
                }

                if (redirectToMainLocation) {
                    service.get('app').navigateTo('viewLocation',
                        {
                            id: content.get('resources').MainLocation,
                            languageCode: content.get('mainLanguageCode')
                        });
                } else {
                    callback(locationsRemoved);
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
        NS: 'removeLocation'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.LocationRemove, ['locationViewViewService']
    );
});

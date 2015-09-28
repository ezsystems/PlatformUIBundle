/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationcreateplugin', function (Y) {
    "use strict";
    /**
     * Provides the plugin for creating location
     *
     * @module ez-locationcreateplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Create location plugin. It sets an event handler to create location
     * for given content.
     *
     * In order to use it you need to fire `createLocation` event with parameter
     * `content` containing the eZ.Content object for which you want to create location.
     *
     * @namespace eZ.Plugin
     * @class LocationCreate
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.LocationCreate = Y.Base.create('locationcreateplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:createLocation', this._createSelectLocation);
        },

        /**
         * createLocation event handler, launch the universal discovery widget
         * to choose a parent location for new location of given content
         *
         * @method _createSelectLocation
         * @private
         * @param {EventFacade} e createLocation event facade
         */
        _createSelectLocation: function (e) {
            var service = this.get('host');

            service.fire('contentDiscover', {
                config: {
                    title: "Select the location where you want to create new location",
                    contentDiscoveredHandler: Y.bind(this._createLocation, this),
                    data: {
                        afterCreateCallback: e.afterCreateCallback
                    }
                },
            });
        },

        /**
         * Creates new location as a descendant of selected location
         *
         * @method _createLocation
         * @protected
         * @param {EventFacade} e
         */
        _createLocation: function (e) {
            var service = this.get('host'),
                capi = service.get('capi'),
                contentService = capi.getContentService(),
                content = service.get('content'),
                parentLocationId = e.selection.location.get('id'),
                locationCreateStruct = contentService.newLocationCreateStruct(parentLocationId),
                notificationIdentifier = 'create-location-' + content.get('id') + '-' + parentLocationId,
                data = e.target.get('data'),
                that = this;

            this._notify(
                "Creating new location for '" + content.get('name') + "'",
                notificationIdentifier,
                'started',
                5
            );

            contentService.createLocation(content.get('id'), locationCreateStruct, function (error, response) {
                if (error) {
                    that._notify(
                        "Creating new location for '" + content.get('name') + "' failed",
                        notificationIdentifier,
                        'error',
                        0
                    );
                    return;
                }

                that._notify(
                    "New location for '" + content.get('name') + "' has been successfully created",
                    notificationIdentifier,
                    'done',
                    5
                );

                data.afterCreateCallback();
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
        NS: 'createLocation'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.LocationCreate, ['locationViewViewService']
    );
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentsetmainlocationplugin', function (Y) {
    "use strict";
    /**
     * Provides the plugin for set the main location
     *
     * @module ez-contentsetmainlocationplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Set main location plugin. It sets an event handler to set the given location as
     * main location of given content.
     *
     * In order to use it you need to fire `setMainLocation` event with parameter
     * `locationId` containing the location id which will be set as main location of content.
     *
     * @namespace eZ.Plugin
     * @class ContentSetMainLocation
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ContentSetMainLocation = Y.Base.create('contentsetmainlocationplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:setMainLocation', this._setMainLocationConfirm);
        },

        /**
         * setMainLocation event handler, opens confirm box to confirm that given location
         * to be set as main location
         *
         * @method _setMainLocationConfirm
         * @private
         * @param {EventFacade} e setMainLocation event facade
         */
        _setMainLocationConfirm: function (e) {
            var service = this.get('host');

            service.fire('confirmBoxOpen', {
                config: {
                    title: "Are you sure you want to set this location as main location of content?",
                    confirmHandler: Y.bind(function () {
                        this._setMainLocation(e.locationId, e.afterSetMainLocationCallback);
                    }, this),
                    cancelHandler: Y.bind(e.cancelSetMainLocationCallback, this)
                }
            });
        },

        /**
         * Sets the given location as the main location of content. After that calls the callback function.
         *
         * @method _setMainLocation
         * @protected
         * @param {String} locationId
         * @param {Function} callback
         */
        _setMainLocation: function (locationId, callback) {
            var service = this.get('host'),
                capi = service.get('capi'),
                content = service.get('content'),
                notificationIdentifier = 'set-main-location-' + content.get('id') + '-' + locationId,
                that = this;

            this._notify(
                "Changing the main location of '" + content.get('name') + "'",
                notificationIdentifier,
                'started',
                5
            );

            content.setMainLocation({api: capi}, locationId, function (error, response) {
                callback();

                if (error) {
                    that._notify(
                        "Changing main location of '" + content.get('name') + "' failed",
                        notificationIdentifier,
                        'error',
                        0
                    );
                    return;
                }

                that._notify(
                    "The main location of '" + content.get('name') + "' has been changed",
                    notificationIdentifier,
                    'done',
                    5
                );
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
        NS: 'setMainLocation'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ContentSetMainLocation, ['locationViewViewService']
    );
});

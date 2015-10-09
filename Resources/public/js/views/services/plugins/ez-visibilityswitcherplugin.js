/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-visibilityswitcherplugin', function (Y) {
    "use strict";
    /**
     * Provides the visibility switcher plugin
     *
     * @module ez-visibilityswitcherplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Location visibility switcher plugin. It sets an event handler to update the
     * visibility of a location
     *
     * In order to use it you need to fire the `switchVisibility` event with two parameters:
     *  - `location` to be modified
     *  - `callback` to be called once done
     *
     * @namespace eZ.Plugin
     * @class VisibilitySwitcherPlugin
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.VisibilitySwitcherPlugin = Y.Base.create('visibilityswitcherplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:switchVisibility', this._switchVisibility);
        },

        /**
         * Switch the `hidden` status of a given location
         * @protected
         * @method _switchVisibility
         * @param {Object} e switchVisibility event facade
         *      e.location: the location to be modified
         *      e.callback: function to run once done
         */
        _switchVisibility: function (e) {
            var location = e.location,
                locationId = location.get('id'),
                hidden = location.get('hidden'),
                hideOptions = {api: this.get('host').get('capi')},
                that = this,
                notificationIdentifier = 'location-switch-visibility-' + locationId,
                notificationStartedMessage = "Hiding: " + locationId;

            if (hidden) {
                notificationStartedMessage = "Revealing: " + locationId;
            }

            that._notify(
                notificationStartedMessage,
                notificationIdentifier,
                'started',
                5
            );

            if (hidden) {
                location.unhide(hideOptions, function (error) {
                    if (error) {
                        that._notify(
                            "Error while revealing location " + locationId,
                            notificationIdentifier,
                            'error',
                            0
                        );
                    } else {
                        that._notify(
                            "Location " + locationId + " has been revealed",
                            notificationIdentifier,
                            'done',
                            5
                        );
                    }
                    e.callback(error);
                });
            } else {
                location.hide(hideOptions, function (error) {
                    if (error) {
                        that._notify(
                            "Error while hiding location " + locationId,
                            notificationIdentifier,
                            'error',
                            0
                        );
                    } else {
                        that._notify(
                            "Location " + locationId + " has been hidden",
                            notificationIdentifier,
                            'done',
                            5
                        );
                    }
                    e.callback(error);
                });
            }
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
        NS: 'visibilitySwitcher',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.VisibilitySwitcherPlugin, ['locationViewViewService']
    );
});

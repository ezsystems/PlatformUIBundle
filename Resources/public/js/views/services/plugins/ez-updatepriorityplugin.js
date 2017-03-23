/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-updatepriorityplugin', function (Y) {
    "use strict";
    /**
     * Provides the Update Priority plugin.
     *
     * @module ez-updatepriorityplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * UpdatePriorityPlugin allow to update the priority of a content
     *
     * @namespace eZ.Plugin
     * @class UpdatePriority
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.UpdatePriority = Y.Base.create('updatePriorityPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:updatePriority', Y.bind(this._updatePriority, this));
        },

        /**
         * Update the priority of the location.
         *
         * @protected
         * @method _updatePriority
         * @param {Object} e the event facade of the sortUpdate event
         */
        _updatePriority: function (e) {
            var loadOptions = {api: this.get('host').get('capi')};

            e.location.updatePriority(loadOptions, e.priority, Y.bind(function (error) {
                if (error) {
                    this._notify(
                        Y.eZ.trans('failed.updated.priority', {}, 'locationview'),
                        'update-priority-' + e.location.get('locationId'),
                        'error',
                        0
                    );
                }
            }, this));
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
        NS: 'updatePriority'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.UpdatePriority, ['locationViewViewService', 'subitemBoxViewService']
    );
});

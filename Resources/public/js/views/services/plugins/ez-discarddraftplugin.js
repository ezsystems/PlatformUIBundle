/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discarddraftplugin', function (Y) {
    "use strict";
    /**
     * Provides the discard draft plugin.
     *
     * @module ez-discarddraftplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Discard draft plugin. It discards the draft when the discardAction is
     * triggered.
     *
     * @namespace eZ.Plugin
     * @class DiscardDraft
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.DiscardDraft = Y.Base.create('discardDraftPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:discardAction', this._discardDraft);
        },

        /**
         * Event handler for the discardAction event. It deletes the version
         * from the repositry and fire the discardedDraft event.
         *
         * @method _discardDraft
         * @protected
         * @param {Object} e event facade
         */
        _discardDraft: function (e) {
            var service = this.get('host'),
                version = service.get('version'),
                app = service.get('app');

            app.set('loading', true);
            version.destroy({
                remove: true,
                api: service.get('capi')
            }, function () {
                /**
                 * Fired when the draft is destroyed.
                 *
                 * @event discardedDraft
                 */
                service.fire('discardedDraft');
            });
        },
    }, {
        NS: 'discardDraft',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.DiscardDraft, ['contentEditViewService', 'contentCreateViewService']
    );
});

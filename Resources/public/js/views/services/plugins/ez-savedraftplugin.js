/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-savedraftplugin', function (Y) {
    "use strict";
    /**
     * Provides the save draft plugin.
     *
     * @module ez-savedraftplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Save draft plugin. It saves the draft when the `saveAction` event is
     * triggered.
     *
     * @namespace eZ.Plugin
     * @class SaveDraft
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.SaveDraft = Y.Base.create('saveDraftPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:saveAction', this._saveDraft);
        },

        /**
         * Event handler for the saveAction event. It stores the version if the
         * form is valid
         *
         * @method _saveDraft
         * @protected
         * @param {Object} e saveAction event facade
         */
        _saveDraft: function (e) {
            var service = this.get('host'),
                version = service.get('version');

            if ( e.formIsValid ) {
                version.save({
                    api: service.get('capi'),
                    fields: e.fields
                }, function (error, response) {});
            }
        },
    }, {
        NS: 'saveDraft',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.SaveDraft, ['contentEditViewService']
    );
});

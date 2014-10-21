/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-publishdraftplugin', function (Y) {
    "use strict";
    /**
     * Provides the publish draft plugin
     *
     * @module ez-publishdraftplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Publish draft plugin. It publishes the version hold by the host object (a
     * service) when the publishAction event is triggered.
     *
     * @namespace eZ.Plugin
     * @class PublishDraft
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.PublishDraft = Y.Base.create('publishDraftPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:publishAction', this._publishDraft);
        },

        /**
         * Event handler for the publishAction event. It publishes the version
         * if the form is valid and redirect the user to the URL hold by the
         * `publishRedirectionUrl` attribute.
         *
         * @method _publishDraft
         * @protected
         * @param {Object} e publishAction event facade
         */
        _publishDraft: function (e) {
            var service = this.get('host'),
                version = service.get('version'),
                app = service.get('app');

            if ( e.formIsValid ) {
                app.set('loading', true);
                version.save({
                    api: service.get('capi'),
                    fields: e.fields,
                    publish: true
                }, function () {
                    app.navigate(service.get('publishRedirectionUrl'));
                });
            }
        },
    }, {
        NS: 'publishDraft',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.PublishDraft, ['contentEditViewService']
    );
});

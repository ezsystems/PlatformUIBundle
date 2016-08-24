/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditplugin', function (Y) {
    "use strict";
    /**
     * Provides the edit content plugin
     *
     * @module ez-contenteditplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Content Edit plugin. It sets an event handler to edit content
     *
     * In order to use it you need to fire the `editContentRequest`.
     *
     * @namespace eZ.Plugin
     * @class ContentEdit
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ContentEdit = Y.Base.create('contenteditplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:editContentRequest', this._checkExistingDraft);
        },

        /**
         * editContentRequest event handler, makes the application display a
         * draft conflict screen if needed or redirects to the edit screen.
         *
         * @method _checkExistingDraft
         * @protected
         * @param {Object} e event facade of the editContentRequest event
         * @param {eZ.Content} e.content being edited
         * @param {String} e.languageCode
         * @param {eZ.ContentType} e.contentType of the content
         */
        _checkExistingDraft: function (e) {
            var service = this.get('host'),
                app = service.get('app'),
                content = e.content,
                languageCode = e.languageCode,
                capi = service.get('capi'),
                options = {
                    api: capi,
                };

            app.set('loading', true);

            content.loadVersionsSortedByStatus(options, function (error, versions) {
                app.set('loading', false);

                if (!error && versions.DRAFT && versions.DRAFT.length >= 1) {
                    service.fire('confirmBoxOpen', {
                        config: {
                            title: "Select an Open Draft",
                            view: new Y.eZ.DraftConflictView({
                                drafts: versions.DRAFT,
                                content: content,
                                languageCode: languageCode,
                                contentType: e.contentType,
                            }),
                            renderDefaultButtons: false,
                            confirmHandler: function (e) {
                                app.navigate(e.route);
                            },
                        },
                    });
                } else {
                    app.navigate(
                        app.routeUri('editContent', {
                            id: content.get('id'),
                            languageCode: languageCode
                        })
                    );
                }
            });
        },
    }, {
        NS: 'contentEdit',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ContentEdit, ['locationViewViewService']
    );
});

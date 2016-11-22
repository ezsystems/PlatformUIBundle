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
         * @param {eZ.Content} e.content (deprecated use contentInfo) being edited
         * @param {eZ.ContentInfo} e.contentInfo being edited
         * @param {String} e.languageCode
         * @param {eZ.ContentType} e.contentType of the content
         */
        _checkExistingDraft: function (e) {
            var service = this.get('host'),
                app = service.get('app'),
                contentItem,
                contentItemConfig,
                languageCode = e.languageCode,
                capi = service.get('capi'),
                options = {
                    api: capi,
                };

            app.set('loading', true);

            if (e.content instanceof Y.eZ.Content) {
                console.warn('[DEPRECATED] the `content` parameter is deprecated and it will be removed in PlatformUI 2.0');
                console.warn('[DEPRECATED] use the `contentInfo` parameter instead');

                contentItem = e.content;
                contentItemConfig = {content: contentItem};
            } else {
                contentItem = e.contentInfo;
                contentItemConfig = {contentInfo: contentItem};
            }

            contentItem.loadVersionsSortedByStatus(options, function (error, versions) {
                app.set('loading', false);

                if (!error && versions.DRAFT && versions.DRAFT.length >= 1) {
                    service.fire('confirmBoxOpen', {
                        config: {
                            title: Y.eZ.trans('select.a.draft', {}, 'contentedit'),
                            view: new Y.eZ.DraftConflictView(Y.merge({
                                drafts: versions.DRAFT,
                                languageCode: languageCode,
                                contentType: e.contentType,
                            }, contentItemConfig)),
                            renderDefaultButtons: false,
                            confirmHandler: function (e) {
                                app.navigate(e.route);
                            },
                        },
                    });
                } else {
                    app.navigate(
                        app.routeUri('editContent', {
                            id: contentItem.get('id'),
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
        Y.eZ.Plugin.ContentEdit, ['locationViewViewService', 'dashboardBlocksViewService']
    );
});

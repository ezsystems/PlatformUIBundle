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
            var content = this.get('host').get('content');

            if ( !e.formIsValid ) {
                return;
            }
            if ( content.isNew() ) {
                this._createContent(e.fields);
            } else {
                this._saveVersion(e.fields);
            }
        },

        /**
         * Save draft callback. For now it does nothing
         *
         * @method _saveDraftCallback
         * @protected
         */
        _saveDraftCallback: function (error, response) {
            // TODO visual feedback + error handling
            // see https://jira.ez.no/browse/EZP-23512
        },

        /**
         * Creates a draft of a new content with the given fields
         *
         * @method _createContent
         * @param Array fields the fields structures coming from the saveAction
         * event
         * @protected
         */
        _createContent: function (fields) {
            var service = this.get('host'),
                capi = service.get('capi'),
                version = service.get('version'),
                content = service.get('content'),
                that = this;

            content.save({
                api: capi,
                languageCode: service.get('languageCode'),
                contentType: service.get('contentType'),
                parentLocation: service.get('parentLocation'),
                fields: fields,
            }, function (error, response) {
                version.setAttrs(version.parse({document: response.document.Content.CurrentVersion}));
                that._saveDraftCallback(error, response);
            });
        },

        /**
         * Sets the given fields on the version and stores it with the REST API.
         *
         * @method _saveVersion
         * @param Array fields the fields structures coming from the saveAction
         * event
         * @protected
         */
        _saveVersion: function (fields) {
            var service = this.get('host'),
                capi = service.get('capi'),
                version = service.get('version'),
                content = service.get('content');

            version.save({
                api: capi,
                fields: fields,
                contentId: content.get('id'),
                languageCode: service.get('languageCode'),
            }, this._saveDraftCallback);
        },
    }, {
        NS: 'saveDraft',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.SaveDraft, ['contentEditViewService', 'contentCreateViewService']
    );
});

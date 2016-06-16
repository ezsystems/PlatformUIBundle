/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versionsplugin', function (Y) {
    "use strict";
    /**
     * Provides the versions plugin
     *
     * @module ez-versionsplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object versions plugin. It sets event handlers to handle versions
     * of content for versions tab in location view.
     *
     * Loading versions:
     * In order to use it you need to fire `loadVersions` event with parameter
     * `content` containing the eZ.Content object for which you want to load versions.
     *
     * Creating draft based on an archived version:
     * In order to use it you need to fire 'createDraft' with corresponding
     * parameters (see method).
     *
     * @namespace eZ.Plugin
     * @class Versions
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.Versions = Y.Base.create('versionsplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:loadVersions', this._loadVersions);
            this.onHostEvent('*:createDraft', this._createDraftFromArchivedVersion);
        },

        /**
         * Loads versions list for content given in event facade. When loading of versions
         * is finished, then it is set in `versions` attribute of the event target.
         *
         * The version attribute should be an object with the given properties: `archived`,
         * `published` and `draft`
         *
         * @method _loadVersions
         * @private
         * @param {EventFacade} e loadVersions event facade
         * @param {eZ.Content} e.content the content
         *
         */
        _loadVersions: function (e) {
            var service = this.get('host'),
                capi = service.get('capi'),
                options = {
                    api: capi,
                };

            e.content.loadVersions(options, Y.bind(function (error, versions) {
                if (error) {
                    e.target.set('loadingError', true);
                } else {
                    e.target.set('loadingError', false);
                    e.target.set('versions', this._sortVersions(versions));
                }
            }, this));
        },

        /**
         * Sorts an array of version info by status
         *
         * @method _sortVersions
         * @protected
         * @param versions {Array} of eZ.VersionInfo
         * @return {Object} of sorted versions by status:
         *              struct.<status_name>: {Array} of eZ.VersionInfo
         */
        _sortVersions: function(versions) {
            var versionsByStatus = {};

            versions.forEach(function (version) {
                if ( !versionsByStatus[version.get('status')]) {
                    versionsByStatus[version.get('status')] = [];
                }
                versionsByStatus[version.get('status')].push(version);
             });

            return versionsByStatus;
        },

        /**
         * Creates a draft based on an archived version and redirect to the edit page in order
         * to edit it.
         *
         * @method _createDraftFromArchivedVersion
         * @private
         * @param {EventFacade} e
         * @param {eZ.Content} e.content the content
         * @param {String} e.versionNo of the archived version. Ex: 42
         *
         */
        _createDraftFromArchivedVersion: function (e) {
            var options = {
                    api: this.get('host').get('capi'),
                },
                app = this.get('host').get('app'),
                content = e.content;

            content.createDraft(options, e.versionNo, Y.bind(function (error, version) {
                var routeName = 'editContentVersion',
                    routeParams;

                if (error) {
                    this._notify(
                        "Creating new draft for '" + content.get('name') + "' based on version " + e.versionNo + " failed.",
                        "create-draft-from-archived-" + content.get('id'),
                        'error',
                        0
                    );
                    return;
                }

                routeParams = {
                    id: content.get('id'),
                    languageCode: version.get('initialLanguageCode'),
                    versionId: version.get('id'),
                };

                app.navigate(
                    app.routeUri(routeName, routeParams)
                );
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
         * @param {Number} timeout the number of second, the notification will be shown
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
        NS: 'versionsLoad'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.Versions, ['locationViewViewService']
    );
});

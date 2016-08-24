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
     * Deleting versions:
     * In order to use it you need to fire `deleteVersion`
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
            this.onHostEvent('*:deleteVersion', this._confirmDeleteVersion);
            this.onHostEvent('*:editVersion', this._redirectToEditVersion);
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

            e.content.loadVersionsSortedByStatus(options, function (error, versions) {
                if (error) {
                    e.target.set('loadingError', true);
                } else {
                    e.target.set('loadingError', false);
                    e.target.set('versions', versions);
                }
            });
        },

        /**
         * Sorts an array of version info by status
         *
         * @method _sortVersions
         * @protected
         * @deprecated
         * @param versions {Array} of eZ.VersionInfo
         * @return {Object} of sorted versions by status:
         *              struct.<status_name>: {Array} of eZ.VersionInfo
         */
        _sortVersions: function(versions) {
            var versionsByStatus = {};

            console.log('[DEPRECATED] The method `_sortVersions` is deprecated please use `eZ.Content.loadVersionsSortedByStatus` instead');
            console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');

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
         * Edits a given version by redirecting to the edit page
         *
         * @method _redirectToEditVersion
         * @private
         * @param {EventFacade} e
         * @param {eZ.Content} e.content the content
         * @param {eZ.Version} e.version to be edited
         *
         */
        _redirectToEditVersion: function (e) {
            var app = this.get('host').get('app'),
                version = e.version,
                routeParams = {
                    id: e.content.get('id'),
                    languageCode: version.get('initialLanguageCode'),
                    versionId: version.get('id'),
                };

                app.navigate(
                    app.routeUri('editContentVersion', routeParams)
                );
        },

        /**
         * deleteVersion event handler, opens confirm box to confirm that selected versions
         * are going to be deleted
         *
         * @method _confirmDeleteVersion
         * @private
         * @param {EventFacade} e deleteVersion event facade
         */
        _confirmDeleteVersion: function (e) {
            var service = this.get('host');

            service.fire('confirmBoxOpen', {
                config: {
                    title: "Are you sure you want to remove selected version(s)?",
                    confirmHandler: Y.bind(function () {
                        this._deleteVersion(e.versions, e.afterDeleteVersionsCallback);
                    }, this),
                    cancelHandler: Y.bind(e.afterDeleteVersionsCallback, this, false)
                }
            });
        },

        /**
         * Removes given versions. After that, calls the callback function.
         *
         * @method _deleteVersion
         * @protected
         * @param {Array} versions array containing eZ.VersionInfo objects for removal
         * @param {Function} callback
         */
        _deleteVersion: function (versions, callback) {
            var service = this.get('host'),
                content = service.get('content'),
                notificationIdentifier = 'delete-versions-' + content.get('id') + '-' + versions.length,
                countRemovedVersions = 0,
                countRemovedVersionsFails = 0,
                tasks = new Y.Parallel();

            this._notify(
                "Removing versions for '" + content.get('name') + "'",
                notificationIdentifier,
                'started',
                5
            );

            Y.Array.each(versions, function (version) {
                var end = tasks.add(function (error, response) {
                        if (error) {
                            countRemovedVersionsFails++;
                            return;
                        }

                        countRemovedVersions++;
                    });

                version.destroy({remove: true, api: service.get('capi')}, end);
            });

            tasks.done(Y.bind(function () {
                var errorNotificationIdentifier = notificationIdentifier + '-error',
                    versionsRemoved = (countRemovedVersions > 0);

                if (versionsRemoved) {
                    this._notify(
                        countRemovedVersions + " version(s) of '" + content.get('name') +
                         "' have been removed",
                        notificationIdentifier,
                        'done',
                        5
                    );
                } else {
                    // start notification will be removed by an error
                    errorNotificationIdentifier = notificationIdentifier;
                }

                if (countRemovedVersionsFails > 0) {
                    this._notify(
                        "Removing of " + countRemovedVersionsFails + " version(s) of '" +
                         content.get('name') + "' has failed",
                        errorNotificationIdentifier,
                        'error',
                        0
                    );
                }

                callback(versionsRemoved);
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

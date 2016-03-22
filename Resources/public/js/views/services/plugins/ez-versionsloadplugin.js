/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versionsloadplugin', function (Y) {
    "use strict";
    /**
     * Provides the versions list load plugin
     *
     * @module ez-versionsloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object versions load plugin. It sets an event handler to load versions
     * of content for versions tab in location view.
     *
     * In order to use it you need to fire `loadVersions` event with parameter
     * `content` containing the eZ.Content object for which you want to load versions.
     *
     * @namespace eZ.Plugin
     * @class VersionsLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.VersionsLoad = Y.Base.create('versionsloadplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:loadVersions', this._loadVersions);
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
    }, {
        NS: 'versionsLoad'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.VersionsLoad, ['locationViewViewService']
    );
});

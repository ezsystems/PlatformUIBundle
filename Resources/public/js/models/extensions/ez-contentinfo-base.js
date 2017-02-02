/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentinfo-base', function (Y) {
    "use strict";
    /**
     * The content info base extension
     *
     * @module ez-contentinfo-base
     */
    Y.namespace('eZ');

    /**
     * Extension providing ContentInfo attributes and methods for Models needing them.
     *
     * @namespace eZ
     * @class ContentInfoBase
     * @extensionfor eZ.RestModel
     */
    Y.eZ.ContentInfoBase = Y.Base.create('contentInfoBaseExtension', Y.eZ.RestModel, [], {
        /**
         * Loads content's version list
         *
         * @method loadVersions
         * @param {Object} options
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback
         */
        loadVersions: function (options, callback) {
            var versions = [],
                contentService = options.api.getContentService();

            contentService.loadVersions(this.get('id'), function (error, response) {
                if (error) {
                    callback(error, response);
                    return;
                }

                Y.Array.each(response.document.VersionList.VersionItem, function (versionItemHash) {
                    var versionInfo = new Y.eZ.VersionInfo();
                    versionInfo.loadFromHash(versionItemHash);
                    versions.push(versionInfo);
                });

                callback(error, versions);
            });
        },

        /**
         * Loads content's version list sorted by status
         *
         * @method loadVersionsSortedByStatus
         * @param {Object} options
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback
         */
        loadVersionsSortedByStatus: function (options, callback) {
            this.loadVersions(options, Y.bind(function (error, versions) {
                callback(error, this._sortVersions(versions));
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

            Y.Array.each(versions, function (version) {
                if ( !versionsByStatus[version.get('status')]) {
                    versionsByStatus[version.get('status')] = [];
                }
                versionsByStatus[version.get('status')].push(version);
             });

            return versionsByStatus;
        },
    }, {
        ATTRS: {
            /**
             * The content id of the content in the eZ Publish repository
             *
             * @attribute contentId
             * @default ''
             * @type string
             */
            contentId: {
                value: ''
            },

            /**
             * The name of the content
             *
             * @attribute name
             * @default ''
             * @type string
             */
            name: {
                value: ''
            },

            /**
             * The remote id of the content in the eZ Publish repository
             *
             * @attribute remoteId
             * @default ''
             * @type string
             */
            remoteId: {
                value: ''
            },

            /**
             * The always available flag of the content
             *
             * @attribute alwaysAvailable
             * @default false
             * @type boolean
             */
            alwaysAvailable: {
                setter: '_setterBoolean',
                value: false
            },

            /**
             * The last modification date of the content
             *
             * @attribute lastModificationDate
             * @default epoch
             * @type Date
             */
            lastModificationDate: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The main language code of the content (eng-GB, fre-FR, ...)
             *
             * @attribute mainLanguageCode
             * @default ''
             * @type string
             */
            mainLanguageCode: {
                value: ''
            },

            /**
             * The published date of the content
             *
             * @attribute publishedDate
             * @default epoch
             * @type Date
             */
            publishedDate: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The current version number
             *
             * @attribute currentVersionNo
             * @default 0
             * @type Number
             */
            currentVersionNo: {
                value: 0
            }
        }
    });
});

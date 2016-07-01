/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versioninfomodel', function (Y) {
    "use strict";
    /**
     * Provides the VersionInfo model class
     *
     * @module ez-versioninfomodel
     */

    Y.namespace('eZ');

    /**
     * VersionInfo model
     *
     * @namespace eZ
     * @class VersionInfo
     * @constructor
     * @extends eZ.RestModel
     */
    Y.eZ.VersionInfo = Y.Base.create('versionInfoModel', Y.eZ.RestModel, [], {


        /**
         * sync implementation for the VersionInfo. For now, it supports deleting it.
         *
         * @method sync
         * @param {String} action the action, only delete is supported
         * @param {Object} options the options for the sync.
         * @param {Object} options.api the JS REST client instance
         * @param {Function} callback a callback executed when the operation is finished
         */
        sync: function (action, options, callback) {
            if ( action === 'delete' ) {
                this._deleteVersion(options, callback);
            } else {
                callback(action + " not supported");
            }
        },

        /**
         * Override of the eZ.RestModel _parseStruct method to locate the VersionInfo in the
         * REST_STRUCT_ROOT hierarchy and add the Version Id
         *
         * @protected
         * @method _parseStruct
         * @param {Object} struct
         * @param {Object} responseDoc the full response document
         * @return {Object}
         */
        _parseStruct: function (struct, responseDoc) {
            var attrs = this.constructor.superclass._parseStruct.call(this, struct.VersionInfo);

            attrs.id = struct.Version._href;
            return attrs;
        },

        /**
         * Deletes the version in the repository.
         *
         * @protected
         * @method _deleteVersion
         * @param {Object} options
         * @param {Object} options.api the JS REST client instance
         * @param {Function} callback
         */
        _deleteVersion: function (options, callback) {
            var contentService = options.api.getContentService(),
                version = this;

            if ( !this.get('id') ) {
                return callback(false);
            }
            contentService.deleteVersion(this.get('id'), function (error, response) {
                if ( error ) {
                    callback(error);
                    return;
                }
                version.reset();
                callback();
            });
        },

        /**
         * Return list of translations of version as array of language codes
         *
         * @method getTranslationsList
         * @return {Array} language codes of translations
         */
        getTranslationsList: function () {
            return this.get('languageCodes').split(',');
        },

        /**
         * Checks whether the version is translated into `languageCode`
         *
         * @method hasTranslation
         * @param {String} languageCode
         * @return {Boolean}
         */
        hasTranslation: function (languageCode) {
            return (this.getTranslationsList().indexOf(languageCode) !== -1);
        },

        /**
         * Checks whether the version is a draft
         *
         * @method isDraft
         * @return {Boolean}
         */
        isDraft: function () {
            return (this.get('status') === 'DRAFT');
        },

        /**
         * Checks whether the version was created by the `user`
         *
         * @method createdBy
         * @param {eZ.User} user
         * @return {Boolean}
         */
        createdBy: function (user) {
            return (this.get('resources').Creator === user.get('id'));
        },
    }, {
        REST_STRUCT_ROOT: "VersionInfo",
        ATTRS_REST_MAP: [
            {"id": "versionId"}, "status", "versionNo",
            "creationDate", "modificationDate",
            "languageCodes", "initialLanguageCode", "names",
        ],
        LINKS_MAP: ['Content', 'Creator'],

        ATTRS: {
            /**
             * The version id (f.e. "450")
             *
             * @attribute versionId
             * @type String
             * @default ""
             */
            versionId: {
                value: ""
            },

            /**
             * The version status
             *
             * @attribute status
             * @type String
             * @default ""
             */
            status: {
                value: ""
            },

            /**
             * The version number
             *
             * @attribute versionNo
             * @type Number
             * @default 1
             */
            versionNo: {
                value: 1
            },

            /**
             * The creation date of the version
             *
             * @attribute creationDate
             * @type Date
             * @default epoch
             */
            creationDate: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The modification date of the version
             *
             * @attribute modificationDate
             * @type Date
             * @default epoch
             */
            modificationDate: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The language codes
             *
             * @attribute languageCodes
             * @type String
             * @default ""
             */
            languageCodes: {
                value: ""
            },

            /**
             * The initial language code
             *
             * @attribute initialLanguageCode
             * @type String
             * @default ""
             */
            initialLanguageCode: {
                value: ""
            },

            /**
             * The names of the version per language
             *
             * @attribute names
             * @type Object
             * @default {}
             */
            names: {
                setter: '_setterLocalizedValue',
                value: {}
            },
        }
    });
});

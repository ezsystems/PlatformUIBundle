/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versionmodel', function (Y) {
    "use strict";
    /**
     * Provides the Version model class
     *
     * @module ez-versionmodel
     */

    Y.namespace('eZ');

    /**
     * Version model
     *
     * @namespace eZ
     * @class Version
     * @constructor
     * @extends eZ.RestModel
     */
    Y.eZ.Version = Y.Base.create('versionModel', Y.eZ.RestModel, [], {
        /**
         * sync implementation for the Version. For now, it supports reading a
         * version from its id, creating a new one based on the content current
         * version, updating it and deleting it. The update can also publish the
         * version
         *
         * @method sync
         * @param {String} action the action, read, create, update, delete are
         * supported
         * @param {Object} options the options for the sync.
         * @param {Object} options.api the JS REST client instance
         * @param {Object} options.languageCode the language in which the fields
         * should be loaded
         * @param {Function} callback a callback executed when the operation is finished
         */
        sync: function (action, options, callback) {
            var api = options.api,
                contentService = api.getContentService();

            if ( action === 'read' ) {
                contentService.loadContent(this.get('id'), options.languageCode, callback);
            } else if ( action === 'create' ) {
                this._createVersion(options, callback);
            } else if ( action === 'update' ) {
                this._updateVersion(options, callback);
            } else if ( action === 'delete' ) {
                this._deleteVersion(options, callback);
            } else {
                callback(action + " not supported");
            }
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
         * Saves the version in the repository. Only the version with a status
         * different than PUBLISHED can be saved. In addtion, if options
         * contains a publish property with a truthy value, it will also publish
         * the version.
         *
         * @method save
         * @param {Object} options
         * @param {Array} options.fields the fields to updated
         * @param {Boolean} [options.publish] if evaluated to true, publish the
         * version in addition
         * @param {Function} callback called when the operation finishes
         * @param {Error|Boolean} callback.err
         * @param {Object} callback.response the response object of the update
         * request (even with the publish operation
         */

        /**
         * Creates a new version for a given contentId in the repository
         *
         * @method _createVersion
         * @param {Object} options
         * @param {Object} options.api the JS REST client instance
         * @param {Object} options.contentId
         * @param {Function} callback
         */
        _createVersion: function (options, callback) {
            var api = options.api,
                contentService = api.getContentService(),
                version = this;

            contentService.createContentDraft(options.contentId, function (error, response) {
                if ( error ) {
                    return callback(error);
                }
                version.setAttrs(version.parse(response));
                version._updateVersion(options, callback);
            });
        },

        /**
         * Updates a version in the repository and potentially publish it
         *
         * @protected
         * @method _updateVersion
         * @param {Object} options
         * @param {Array} options.fields an array of fields
         * @param {Boolean} [options.publish=false] whether to publish the version after
         * the update
         * @param {Function} cb
         */
        _updateVersion: function (options, cb) {
            var cs = options.api.getContentService(),
                struct = cs.newContentUpdateStruct(options.languageCode),
                version = this;

            struct.body.VersionUpdate.fields.field = options.fields;
            cs.updateContent(this.get('id'), struct, function (error, response) {
                if ( error ) {
                    return cb(error, response);
                }
                version.setAttrs(version.parse(response));
                if ( !options.publish ) {
                    return cb(error, response);
                }
                version.publishVersion({api: options.api}, function (error, pubResponse) {
                    if ( error ) {
                        version.undo();
                        return cb(error);
                    }
                    version.set('status', 'PUBLISHED');
                    cb();
                });
            });
        },

        /**
         * Publishes the version in the repository
         *
         * @method publishVersion
         * @param {Object} options
         * @param {Object} options.api the JS REST client instance
         * @param {Function} callback
         */
        publishVersion: function (options, callback) {
            var cs = options.api.getContentService();

            cs.publishVersion(this.get('id'), callback);
        },

        /**
         * Override of the eZ.RestModel _parseStruct method to read the fields
         * of the version and the id which are not available under the
         * REST_STRUCT_ROOT hierarchy
         *
         * @protected
         * @method _parseStruct
         * @param {Object} struct
         * @param {Object} responseDoc the full response document
         * @return {Object}
         */
        _parseStruct: function (struct, responseDoc) {
            var attrs, fields = {};

            attrs = this.constructor.superclass._parseStruct.call(this, struct);

            Y.Array.each(responseDoc.Version.Fields.field, function (field) {
                fields[field.fieldDefinitionIdentifier] = field;
            });
            attrs.fields = fields;
            attrs.id = responseDoc.Version._href;
            return attrs;
        },

        /**
         * Returns the field which identifier is in parameter
         *
         * @method getField
         * @param {String} identifier the field definition identifier
         * @return {Object} or undefined if the field does not exists
         */
        getField: function (identifier) {
            return this.get('fields')[identifier];
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
        REST_STRUCT_ROOT: "Version.VersionInfo",
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

            /**
             * The fields of the version by field identifier
             *
             * @attribute fields
             * @type Object
             * @default {}
             */
            fields: {
                value: {}
            }
        }
    });
});

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
     * @extends eZ.VersionInfo
     */
    Y.eZ.Version = Y.Base.create('versionModel', Y.eZ.VersionInfo, [], {
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
                    return callback(error, response);
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
                        return cb(error, pubResponse);
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
            var attrs, fields = responseDoc.Version.Fields.field;

            attrs = Y.eZ.RestModel.prototype._parseStruct.call(this, struct);

            attrs.fields = this._indexFieldsByIdentifier(fields);
            attrs.fieldsByLanguage = this._indexFieldsByLanguages(fields);
            attrs.id = responseDoc.Version._href;
            return attrs;
        },

        /**
         * Indexes the given `fields` by identifier. This is buggy by design but
         * kept for BC as the fields can be translated so the same identifier
         * can appears several times in the REST response.
         *
         * @deprecated
         * @method _indexFieldsByIdentifier
         * @protected
         * @param {Array} fields
         * @return {Object}
         */
        _indexFieldsByIdentifier: function (fields) {
            var fieldsByIdentifier = {};

            fields.forEach(function (field) {
                fieldsByIdentifier[field.fieldDefinitionIdentifier] = field;
            });

            return fieldsByIdentifier;
        },

        /**
         * Indexes the given `fields` by language code and identifier.
         *
         * @method _indexFieldsByLanguages
         * @protected
         * @param {Array} fields
         * @return {Object}
         */
        _indexFieldsByLanguages: function (fields) {
            var fieldsByLanguage = {};

            fields.forEach(function (field) {
                var language = field.languageCode,
                    identifier = field.fieldDefinitionIdentifier;

                fieldsByLanguage[language] = fieldsByLanguage[language] || {};
                fieldsByLanguage[language][identifier] = field;
            });

            return fieldsByLanguage;
        },

        /**
         * Returns the field which identifier is in parameter in the given
         * language. For BC, `languageCode` can be omitted but such case,
         * `getField` falls back to a deprecated and buggy behaviour with a
         * version available in several languages.
         *
         * @method getField
         * @param {String} identifier the field definition identifier
         * @param {String} languageCode the language code in which the field
         * should be returned
         * @return {Object} or undefined if the field does not exists
         */
        getField: function (identifier, languageCode) {
            var fields;

            if ( !languageCode ) {
                console.log('[DEPRECATED] `Version#getField` call without language code is deprecated');
                console.log('[DEPRECATED] Please specify a language code');
                return this.get('fields')[identifier];
            }
            if ( Y.Object.isEmpty(this.get('fieldsByLanguage')) ) {
                console.log('[DEPRECATED] `Version#getField` call with the fields by language not set');
                console.log('[DEPRECATED] Falling back on `field` attribute. This usage of `getFields` is deprecated');
                console.log('[DEPRECATED] Please set the fields by language with `setFieldsIn`');
                return this.get('fields')[identifier];
            }
            fields = this.getFieldsIn(languageCode);
            return fields ? fields[identifier] : undefined;
        },

        /**
         * Returns the fields in the given language.
         *
         * @method getFieldsIn
         * @param {String} languageCode
         * @return {Object|undefined}
         */
        getFieldsIn: function (languageCode) {
            return this.get('fieldsByLanguage')[languageCode];
        },

        /**
         * Sets the fields in the given language
         *
         * @method setFieldsIn
         * @param {Object} fields
         * @param {String} languageCode
         */
        setFieldsIn: function (fields, languageCode) {
            this.get('fieldsByLanguage')[languageCode] = fields;
        },

        /**
         * Checks whether the version is the current version of the given
         * `content`
         *
         * @method isCurrentVersionOf
         * @param {eZ.Content} content
         * @return {Boolean}
         */
        isCurrentVersionOf: function (content) {
            var id = this.get('id');

            return !!(id && id === content.get('currentVersion').get('id'));
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
             * The fields of the version by field identifier
             *
             * @attribute fields
             * @type Object
             * @default {}
             * @deprecated
             */
            fields: {
                value: {}
            },

            /**
             * The fields of the version by language code and field identifier,
             * e.g
             *      'fre-FR': {
             *          'title': {},
             *          'body': {},
             *      }, {
             *      'eng-GB': {
             *          'title: {},
             *          'body': {},
             *      }
             *
             * Do not use this attribute directly, use `setFieldsIn`,
             * `getFieldsIn` or `getField`.
             *
             * @attribute fieldsByLanguage
             * @type {Object}
             * @default {}
             */
            fieldsByLanguage: {
                value: {},
            },
        }
    });
});

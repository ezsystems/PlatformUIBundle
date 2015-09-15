/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentmodel', function (Y) {
    "use strict";
    /**
     * Provides the Content model class
     *
     * @module ez-contentmodel
     */

    Y.namespace('eZ');

    /**
     * Content model
     *
     * @namespace eZ
     * @class Content
     * @constructor
     * @extends eZ.RestModel
     */
    Y.eZ.Content = Y.Base.create('contentModel', Y.eZ.RestModel, [Y.eZ.ContentInfoAttributes], {
        /**
         * Override of the eZ.RestModel _parseStruct method to also read the
         * fields of the current version
         *
         * @protected
         * @method _parseStruct
         * @param {Object} struct the struct to transform
         * @return {Object}
         */
        _parseStruct: function (struct) {
            var attrs, fields = {}, relations = [];

            attrs = this.constructor.superclass._parseStruct.call(this, struct);
            Y.Array.each(struct.CurrentVersion.Version.Relations.Relation, function (relation) {
                relations.push({
                    id: relation._href,
                    type: relation.RelationType,
                    destination: relation.DestinationContent._href,
                    source: relation.SourceContent._href,
                    fieldDefinitionIdentifier: relation.SourceFieldDefinitionIdentifier
                });
            });

            Y.Array.each(struct.CurrentVersion.Version.Fields.field, function (field) {
                fields[field.fieldDefinitionIdentifier] = field;
            });
            attrs.relations = relations;
            attrs.fields = fields;
            attrs.currentVersion = struct.CurrentVersion;
            return attrs;
        },

        /**
         * Creates a new content (ie the content must not have an id) in the
         * repository.
         *
         * @method save
         * @param {Object} options
         * @param {Object} options.api (required) the JS REST client instance
         * @param {eZ.ContentType} options.contentType (required) the content
         * type to use to create the content
         * @param {eZ.Location} options.parentLocation (required) the parent
         * location
         * @param {String} options.languageCode (required)
         * @param {Array} options.fields (required) an array containing a
         * literal object for each fields in the content with the properties
         * `fieldDefinitionIdentifier` and `fieldValue
         * @param {Function} callback
         */

        /**
         * sync implementation that relies on the JS REST client.
         * It only supports the 'read' and 'create' action. The callback is
         * directly passed to the corresponding ContentService methods.
         *
         * @method sync
         * @param {String} action the action, currently only 'read' and 'create' are supported
         * @param {Object} options the options for the sync.
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback a callback executed when the operation is finished
         */
        sync: function (action, options, callback) {
            var api = options.api;

            if ( action === 'read' ) {
                api.getContentService().loadContentInfoAndCurrentVersion(
                    this.get('id'), options.languageCode, callback
                );
            } else if ( action === 'create' ) {
                this._createContent(options, callback);
            } else {
                callback("Only read and create operations are supported at the moment");
            }
        },

        /**
         * Creates a content in the repository
         *
         * @method _createContent
         * @protected
         * @param {Object} options
         * @param {Object} options.api (required) the JS REST client instance
         * @param {eZ.ContentType} options.contentType (required) the content
         * type to use to create the content
         * @param {eZ.Location} options.parentLocation (required) the parent
         * location
         * @param {String} options.languageCode (required)
         * @param {Array} options.fields (required) an array containing a
         * literal object for each fields in the content with the properties
         * `fieldDefinitionIdentifier` and `fieldValue
         * @param {Function} callback
         */
        _createContent: function (options, callback) {
            var api = options.api,
                content = this;

            api.getContentService().createContent(this._createContentStruct(options), function (error, response) {
                if  ( !error ) {
                    content.setAttrs(content.parse(response));
                }
                callback(error, response);
            });
        },

        /**
         * Creates the content create struct to create the content in the
         * repository
         *
         * @method _createContentStruct
         * @param {Object} options see _createContent
         * @private
         */
        _createContentStruct: function (options) {
            var contentService = options.api.getContentService(),
                type = options.contentType,
                struct;

            struct = options.api.getContentService().newContentCreateStruct(
                type.get('id'),
                contentService.newLocationCreateStruct(options.parentLocation.get('id')),
                options.languageCode
            );

            Y.Array.each(options.fields, function (field) {
                struct.addField(field.fieldDefinitionIdentifier, field.fieldValue);
            });
            return struct;
        },

        /**
         * Returns the field which identifier is in parameter
         *
         * @method getField
         * @param {String} identifier the field definition identifier
         * @return {Object} or undefined if the field does not exists
         */
        getField: function (identifier) {
            var fields = this.get('fields');
            return fields[identifier];
        },

        /**
         * Filters the relations on this content by type or optionally by field
         * definition identifier.
         *
         * @method relations
         * @param {String} type of the relation ('ATTRIBUTE', 'COMMON', 'EMBED', 'LINK')
         * @param {String} [fieldDefinitionIdentifier]
         * @return {Array}
         */
        relations: function (type, fieldDefinitionIdentifier) {
            var relations,
                fieldDefFilter = (typeof fieldDefinitionIdentifier !== "undefined");

            relations = Y.Array.filter(this.get('relations'), function (relation) {
                if (
                    fieldDefFilter
                    && type === relation.type
                    && fieldDefinitionIdentifier === relation.fieldDefinitionIdentifier
                ) {
                    return true;
                } else if ( !fieldDefFilter && type === relation.type ) {
                    return true;
                }
                return false;
            });
            return relations;
        },

        /**
         * copy implementation that relies on the JS REST client.
         *
         * @method copy
         * @param {Object} options the options for the copy.
         * @param {Object} options.api (required) the JS REST client instance
         * @param {String} parentLocationId the location id where we should copy the content
         * @param {Function} callback a callback executed when the operation is finished
         */
        copy: function (options, parentLocationId, callback) {
            options.api.getContentService().copyContent(this.get('id'), parentLocationId, callback);
        },
    }, {
        REST_STRUCT_ROOT: "Content",
        ATTRS_REST_MAP: [
            'alwaysAvailable', 'lastModificationDate',
            'mainLanguageCode', 'publishedDate',
            {'_remoteId': 'remoteId'},
            {'Name': 'name'},
            {'_id': 'contentId'},
            {'_href': 'id'},
        ],
        LINKS_MAP: [
            'Owner', 'MainLocation', 'ContentType'
        ],
        ATTRS: {
            /**
             * Fields in the current version of the content indexed by field
             * definition identifier
             *
             * @attribute fields
             * @default {}
             * @type Object
             */
            fields: {
                value: {}
            },

            /**
             * The relations set by this content
             *
             * @attribute relations
             * @type Object
             * @default {}
             */
            relations: {
                value: {}
            },

            /**
             * The current version of the content
             *
             * @attribute currentVersion
             * @type eZ.Version
             */
            currentVersion: {
                getter: function (value) {
                    var version = new Y.eZ.Version();

                    if ( value ) {
                        version.setAttrs(version.parse({document: value}));
                    }
                    return version;
                }
            }
        }
    });
});

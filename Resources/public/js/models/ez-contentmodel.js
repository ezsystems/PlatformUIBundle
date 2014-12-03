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
    Y.eZ.Content = Y.Base.create('contentModel', Y.eZ.RestModel, [], {
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
         * @param {String} action the action, currently only 'read' is supported
         * @param {Object} options the options for the sync.
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Function} callback a callback executed when the operation is finished
         */
        sync: function (action, options, callback) {
            var api = options.api;

            if ( action === 'read' ) {
                api.getContentService().loadContentInfoAndCurrentVersion(
                    this.get('id'), callback
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
         * Filters the relations on this content by type or optionnally by field
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
                value: ''
            },

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
            }
        }
    });
});

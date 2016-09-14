/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypemodel', function (Y) {
    "use strict";
    /**
     * Provides the Content type model class
     *
     * @module ez-contenttypemodel
     */

    Y.namespace('eZ');

    var L = Y.Lang;

    /**
     * Content type model
     *
     * @namespace eZ
     * @class ContentType
     * @constructor
     * @extends eZ.RestModel
     */
    Y.eZ.ContentType = Y.Base.create('contentTypeModel', Y.eZ.RestModel, [], {
        /**
         * sync implementation that relies on the JS REST client.
         * For now, it only supports the 'read' action. The callback is
         * directly passed to the ContentService.loadContentType method.
         *
         * @method sync
         * @param {String} action the action, currently only 'read' is supported
         * @param {Object} options the options for the sync.
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Boolean} [options.loadGroups=false] also load the Content
         *        Type Groups id the Content Type belongs to (only applicable for
         *        the 'read' operation).
         * @param {Function} callback a callback executed when the operation is finished
         */
        sync: function (action, options, callback) {
            if ( action === 'read' ) {
                this._readType(options, callback);
            } else {
                callback("Only read operation is supported at the moment");
            }
        },

        /**
         * `sync` implementation for the `read` action. It takes into account
         * the optional `loadGroups` flag to load the Content Type Group ids.
         *
         * @method _readType
         * @protected
         * @param {Object} options the options for the sync.
         * @param {Object} options.api (required) the JS REST client instance
         * @param {Boolean} [options.loadGroups=false] also load the Content
         *        Type Groups the Content Type belongs to.
         * @param {Function} callback a callback executed when the operation is finished
         */
        _readType: function (options, callback) {
            var typeService = options.api.getContentTypeService(),
                contentTypeId = this.get('id'),
                cb = callback;

            if ( options.loadGroups ) {
                cb = function (error, response) {
                    if ( error ) {
                        return callback(error, response);
                    }
                    typeService.loadGroupsOfContentType(contentTypeId, function (groupError, groupResponse) {
                        if ( groupError ) {
                            return callback(groupError, groupResponse);
                        }
                        response.document.ContentTypeGroups = groupResponse.document.ContentTypeGroupRefList.ContentTypeGroupRef;
                        callback(error, response);
                    });
                };
            }
            typeService.loadContentType(contentTypeId, cb);
        },

        /**
         * Override of the eZ.RestModel _parseStruct method to also read the
         * content type group ids when the content type is loaded with the
         * `loadGroups` flag.
         *
         * @protected
         * @method _parseStruct
         * @param {Object} struct the struct to transform
         * @param {Object} responseDoc the full response document
         * @return {Object}
         */
        _parseStruct: function (struct, responseDoc) {
            var attrs;

            attrs = this.constructor.superclass._parseStruct.call(this, struct);
            if ( responseDoc.ContentTypeGroups ) {
                attrs.contentTypeGroupIds = responseDoc.ContentTypeGroups.map(function (groupRef) {
                    return groupRef._href;
                });
            }

            return attrs;
        },

        /**
         * Returns the field definitions organized by field group. Each element
         * of the array is a hash containing the `fieldGroupName` (string) and
         * the `fieldDefinitions` (array of field definition) entries.
         *
         * @method getFieldGroups
         * @return {Array}
         */
        getFieldGroups: function () {
            var fieldDefinitions = this.get('fieldDefinitions'),
                fieldGroups = [],
                fieldGroupNames = [];

            Y.Object.each(fieldDefinitions, function (item) {
                var fieldGroupName = item.fieldGroup,
                    fieldGroup;

                // Add new field group, if FieldDefinition.fieldGroup is unique
                if (fieldGroupNames.indexOf(fieldGroupName) === -1) {
                    fieldGroups.push({
                        fieldGroupName: fieldGroupName,
                        fieldDefinitions: []
                    });

                    fieldGroupNames.push(fieldGroupName);
                }

                // Add field to appropriate FieldGroup
                fieldGroup = Y.Array.find(fieldGroups, function (group) {
                    return group.fieldGroupName == fieldGroupName;
                });

                fieldGroup.fieldDefinitions.push(item);
            });

            return fieldGroups;
        },

        /**
         * Checks whether the content type has a field definition which field
         * type is the given fieldTypeIdentifier (ezstring, ezuser, ...)
         *
         * @method hasFieldType
         * @param {String} fieldTypeIdentifier
         * @return {Boolean}
         */
        hasFieldType: function (fieldTypeIdentifier) {
            return Y.Object.some(this.get('fieldDefinitions'), function (fieldDef) {
                return (fieldDef.fieldType === fieldTypeIdentifier);
            });
        },

        /**
         * Returns the fieldIdentifiers of a given type.
         *
         * @method getFieldDefinitionIdentifiers
         * @param {String} fieldTypeIdentifier like ezimage, ezstring, ...
         * @return {Array}
         */
        getFieldDefinitionIdentifiers: function (fieldTypeIdentifier) {
            var identifiers = [];

            Y.Object.each(this.get('fieldDefinitions'), function (def, id) {
                if ( def.fieldType === fieldTypeIdentifier ) {
                    identifiers.push(id);
                }
            });
            return identifiers;
        },

        /**
         * Checks whether the Content Type belongs to the Content Type Group
         * which id is given in parameter.
         *
         * @method belongTo
         * @param {String} contentTypeGroupId
         * @return {Boolean}
         */
        belongTo: function (contentTypeGroupId) {
            return this.get('contentTypeGroupIds').indexOf(contentTypeGroupId) !== -1;
        },

        /**
         * Returns a hash representing the fields with the default values for a
         * Content of this type.
         *
         * @method getDefaultFields
         * @return {Object}
         */
        getDefaultFields: function () {
            var defaultFields = {};

            Y.Object.each(this.get('fieldDefinitions'), function (fieldDef, identifier) {
                defaultFields[identifier] = {
                    fieldDefinitionIdentifier: identifier,
                    fieldValue: fieldDef.defaultValue,
                };
            });
            return defaultFields;
        },

        /**
         * Returns the name of the Content Type in the given `languageCode`, if
         * the name in this languageCode does not exist, it returns the first
         * available name.
         *
         * @method getName
         * @param {String} languageCode
         * @return {String}
         */
        getName: function (languageCode) {
            var names = this.get('names');

            return names[languageCode] || names[Object.keys(names)[0]];
        },
    }, {
        REST_STRUCT_ROOT: 'ContentType',
        ATTRS_REST_MAP: [
            'creationDate', 'defaultAlwaysAvailable',
            'defaultSortField', 'defaultSortOrder', 'descriptions',
            'identifier', 'isContainer', 'mainLanguageCode',
            'modificationDate', 'names', 'nameSchema',
            'remoteId', 'status', 'urlAliasSchema',
            {'FieldDefinitions': 'fieldDefinitions'}
        ],
        ATTRS: {
            /**
             * The content type's creation date
             *
             * @attribute creationDate
             * @default epoch
             * @type Date
             */
            creationDate: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The content type's default always available flag
             *
             * @attribute defaultAlwaysAvailable
             * @default false
             * @type boolean
             */
            defaultAlwaysAvailable: {
                setter: '_setterBoolean',
                value: false
            },

            /**
             * The content type's default sort field
             *
             * @attribute defaultSortField
             * @default "PATH"
             * @type string
             */
            defaultSortField: {
                value: "PATH"
            },

            /**
             * The content type's default sort order
             *
             * @attribute defaultSortOrder
             * @default "ASC"
             * @type string
             */
            defaultSortOrder: {
                value: "ASC"
            },

            /**
             * The content type's descriptions
             *
             * @attribute descriptions
             * @default {}
             * @type Object
             */
            descriptions: {
                setter: '_setterLocalizedValue',
                value: {}
            },

            /**
             * The content type's identifier
             *
             * @attribute identifier
             * @default ""
             * @type string
             */
            identifier: {
                value: ""
            },

            /**
             * The content type's is container flag
             *
             * @attribute isContainer
             * @default false
             * @type boolean
             */
            isContainer: {
                setter: '_setterBoolean',
                value: false
            },

            /**
             * The content type's main language code (eng-GB, ....)
             *
             * @attribute mainLanguageCode
             * @default ""
             * @type boolean
             */
            mainLanguageCode: {
                value: ""
            },

            /**
             * The content type's modification date
             *
             * @attribute modificationDate
             * @default epoch
             * @type Date
             */
            modificationDate: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The content type's names
             *
             * @attribute names
             * @default {}
             * @type Object
             */
            names: {
                setter: '_setterLocalizedValue',
                value: {}
            },

            /**
             * The content type's name schema
             *
             * @attribute nameSchema
             * @default ""
             * @type string
             */
            nameSchema: {
                value: ""
            },

            /**
             * The content type's remote id
             *
             * @attribute remoteId
             * @default ""
             * @type string
             */
            remoteId: {
                value: ""
            },

            /**
             * The content type's status
             *
             * @attribute status
             * @default "DEFINED"
             * @type string
             */
            status: {
                value: "DEFINED"
            },

            /**
             * The content type's url alias schema
             *
             * @attribute urlAliasSchema
             * @default ""
             * @type string
             */
            urlAliasSchema: {
                value: ""
            },

            /**
             * The content type's field definitions indexed by field definition
             * identifier. The localized properties names and description of
             * each field definition are normalized with
             * {{#crossLink "eZ.RestModel/_setterLocalizedValue:method"}}_setterLocalizedValue{{/crossLink}}
             *
             * @attribute fieldDefinitions
             * @default undefined
             * @type Object
             */
            fieldDefinitions: {
                setter: function (val) {
                    var that = this,
                        newval = {};

                    if ( !val || !L.isObject(val) ) {
                        return Y.Attribute.INVALID_VALUE;
                    }

                    if ( val.FieldDefinition ) {
                        // val comes from the REST API, it needs to be
                        // normalized
                        Y.Array.each(val.FieldDefinition, function (item, index) {
                            var identifier = val.FieldDefinition[index].identifier;

                            newval[identifier] = val.FieldDefinition[index];
                            newval[identifier].names = that._setterLocalizedValue(item.names);
                            newval[identifier].descriptions = that._setterLocalizedValue(item.descriptions);
                        });
                        return newval;
                    }
                    return val;
                }
            },

            /**
             * The Content Type Group Ids the Content Type belongs to. This
             * attribute is only filled if the Content Type was loaded in the
             * `loadGroups` flag.
             *
             * @attribute contentTypeGroupIds
             * @type {Array}
             */
            contentTypeGroupIds: {
                value: [],
            },
        }
    });
});

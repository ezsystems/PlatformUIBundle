YUI.add('ez-contenttypemodel', function (Y) {
    "use strict";
    /**
     * Provides the Content type model class
     *
     * @module ez-contenttypemodel
     */

    Y.namespace('eZ');

    /**
     * Content type model
     *
     * @namespace eZ
     * @class ContentType
     * @constructor
     * @extends Model
     */
    Y.eZ.ContentType = Y.Base.create('contentTypeModel', Y.eZ.RestModel, [], {

        sync: function (action, options, callback) {
            var api = options.api;

            if ( action === 'read' ) {
                api.getContentTypeService().loadContentType(
                    this.get('id'), callback
                );
            } else {
                callback("Only read operation is supported at the moment");
            }
        },

        /**
         * Parses the response from the eZ Publish REST API
         *
         * @method parse
         * @param {Object} response the response object from the eZ JS REST Client
         * @return {Object} attribute hash
         */
        parse: function (response) {
            var type;

            try {
                type = Y.JSON.parse(response.body);
            } catch (ex) {
                /**
                 * Fired when a parsing error occurs
                 *
                 * @event error
                 * @param {String} src "parse"
                 * @param {String} error the error message
                 * @param {Object} response the response object that failed to
                 * be parsed
                 */
                this.fire('error', {
                    src: 'parse',
                    error: "No content in the response",
                    response: response
                });
                return null;
            }
            return this._parseStruct(type.ContentType);
        }

    }, {
        ATTRS_REST_MAP: [
            'creationDate', 'defaultAlwaysAvailable',
            'defaultSortField', 'defaultSortOrder', 'descriptions',
            'identifier', 'isContainer', 'mainLanguageCode',
            'modificationDate', 'names', 'nameSchema',
            'remoteId', 'status', 'urlAliasSchema'
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
            }
        }
    });

});

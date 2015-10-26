/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-restmodel', function (Y) {
    "use strict";
    /**
     * Provides the RestModel abstract class
     *
     * @module ez-restmodel
     */

    Y.namespace('eZ');

    var L = Y.Lang,
        REST_ROOT_LEVEL_SEP = '.';

    /**
     * Abstract class for the model objects loaded from the
     * eZ Publish REST API. It provides some helper methods to deal with type
     * conversions and generic mapping system to map the JSON structure the
     * attributes.
     *
     * @namespace eZ
     * @class RestModel
     * @constructor
     * @extends Model
     */
    Y.eZ.RestModel = Y.Base.create('restModel', Y.Model, [], {
        /**
         * Setter function for the boolean attribute.
         * Makes sure the string "true" is tranformed to true,
         * any other value (except a boolean value) is considered
         * as false
         *
         * @method _setterBoolean
         * @protected
         * @param {Any} val the value to transform
         * @return {Boolean}
         */
        _setterBoolean: function (val) {
            if ( L.isBoolean(val) ) {
                return val;
            }
            return val === 'true';
        },

        /**
         * Setter function for the date attribute.
         * Make sure to transform the string input value into a date.
         *
         * @method _setterDate
         * @protected
         * @param {String} val the value to transform
         * @return {Date}
         */
        _setterDate: function (val) {
            var parsed;

            if ( val instanceof Date ) {
                return val;
            }
            parsed = Date.parse(val);
            if ( !isNaN(parsed) ) {
                return new Date(val);
            }
            return new Date();
        },

        /**
         * Setter function for the localized attribute.
         * It transforms any value like
         *
         *     {
         *        value: [{
         *            '_languageCode': 'fre-FR',
         *            '#text': "Français"
         *        }, {
         *            '_languageCode': 'eng-GB',
         *            '#text': "English"
         *        }]
         *     }
         *
         * into:
         *
         *     {
         *         'fre-FR': 'Français',
         *         'eng-GB': 'English'
         *     }
         *
         * @method _setterLocalizedValue
         * @protected
         * @param {Object} val the localized object to transform
         * @return {Object}
         */
        _setterLocalizedValue: function (val) {
            var res = {};

            if ( !L.isObject(val) ) {
                return Y.Attribute.INVALID_VALUE;
            }
            if ( L.isArray(val.value) ) {
                Y.Array.each(val.value, function (item) {
                    res[item._languageCode] = item["#text"];
                });
            }
            return res;
        },

        /**
         * Parses the hash returned by the eZ Publish REST API
         * based on ATTRS_REST_MAP and LINKS_MAP properties
         *
         * @protected
         * @method _parseStruct
         * @param {Object} struct the struct to transform
         * @param {Object} doc The complete object
         * @return {Object}
         */
        _parseStruct: function (struct, doc) {
            var attrs = {},
                links = {};

            Y.Array.each(this.constructor.ATTRS_REST_MAP, function (item) {
                var key;

                if ( L.isString(item) ) {
                    // simple mapping
                    attrs[item] = struct[item];
                } else if ( L.isObject(item) ) {
                    // translating the identifier in the result struct
                    key = Y.Object.keys(item)[0];
                    attrs[item[key]] = struct[key];
                }
            });
            Y.Array.each(this.constructor.LINKS_MAP, function (item) {
                if ( struct[item] ) {
                    links[item] = struct[item]._href;
                }
            });
            attrs.resources = links;
            return attrs;
        },

        /**
         * Parses an object (usually a response object from the JS REST client)
         *
         * @method parse
         * @param {Object} response an object with a `document` property holding
         * the struct to parse like the response object from the eZ JS REST
         * Client
         * @return {Object} attribute hash
         */
        parse: function (response) {
            var content = response.document,
                root = this.constructor.REST_STRUCT_ROOT;

            if ( root ) {
                Y.Array.each(root.split(REST_ROOT_LEVEL_SEP), function (val) {
                    content = content[val];
                });
            }
            return this._parseStruct(content, response.document);
        },

        /**
         * Loads the model from a simple literal object. It applies
         * the mapping described by the ATTRS_REST_MAP and LINKS_MAP.
         *
         * @method loadFromHash
         * @param {Object} hash a literal object to import
         */
        loadFromHash: function (hash) {
            var root = this.constructor.REST_STRUCT_ROOT,
                doc = {},
                tmp = doc;

            if ( root ) {
                Y.Array.each(root.split(REST_ROOT_LEVEL_SEP), function (val) {
                    tmp[val] = {};
                    tmp = tmp[val];
                });
            }
            tmp = hash;
            this.setAttrs(this._parseStruct(hash, doc));
        },

        /**
         * Overrides the default implementation to make sure the id is also
         * resetted to its default value (null) when necessary.
         * It's a workaround for https://github.com/yui/yui3/issues/1982 which
         * causes https://jira.ez.no/browse/EZP-23584
         *
         * @method reset
         * @param {String} [name] The name of the attribute to reset. If
         * omitted, all attributes are reset.
         * @return {Model} A reference to the host object.
         */
        reset: function (name) {
            var ret = Y.Model.superclass.reset.call(this, name);
            if ( !name || name === 'id' ) {
                this.set('id', null);
            }
            return ret;
        },

        /**
         * Overrides the default implementation to make sure the models in
         * attributes are also jsonified.
         *
         * @method toJSON
         * @return {Object}
         */
        toJSON: function () {
            var attrs = Y.Model.prototype.toJSON.call(this);

            Y.Object.each(attrs, function (value, key) {
                if ( L.isObject(value) && L.isFunction(value.toJSON) ) {
                    attrs[key] = value.toJSON();
                }
            });
            return attrs;
        },
    }, {
        /**
         * Root element in the REST API response where the data is located.
         * It can contains points to target a deep structure.
         *
         * @static
         * @property REST_STRUCT_ROOT
         * @type string
         * @default ""
         */
        REST_STRUCT_ROOT: "",

        /**
         * Mapping between properties in a hash structure
         * and the attributes of the model object. Each element can be
         * a string or a hash with one pair key/value.
         * A string means a simple mapping between the rest structure
         * property and the attribute. The simple hash allows to have
         * a different attribute identifier than the property name.
         * Example:
         *
         *     // REST structure
         *     {"name": "my name", "id": 42}
         *
         * With the following map:
         *
         *     ["name", {'id': 'myId'}]
         *
         * Would result in the following hash:
         *
         *     {"name": "my name", "myId": 42}
         *
         * when parsed in the _parseStruct method.
         *
         * @static
         * @property ATTRS_REST_MAP
         * @type Array
         */
        ATTRS_REST_MAP: [],

        /**
         * Array of linked resources to parse and make available
         * in the resources attribute
         * Example:
         *
         *     ['Owner', 'MainLocation']
         *
         * @static
         * @property LINKS_MAP
         * @type Array
         */
        LINKS_MAP: [],

        ATTRS: {
            /**
             * Contains the URI to linked resources
             * Example:
             *
             *     {
             *        Owner: '/api/ezp/v2/user/users/14',
             *        MainLocation: '/api/ezp/v2/content/locations/1/2/61'
             *     }
             *
             * @attribute resources
             * @type Object
             * @default {}
             */
            resources: {
                value: {}
            }
        }
    });
});

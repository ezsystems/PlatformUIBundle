YUI.add('ez-restmodel', function (Y) {
    "use strict";
    /**
     * Provides the RestModel abstract class
     *
     * @module ez-restmodel
     */

    Y.namespace('eZ');

    var L = Y.Lang;

    /**
     * Abstract class for the model objects loaded from the
     * eZ Publish REST API.
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
            if ( val instanceof Date ) {
                return val;
            }
            return new Date(val);
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

            if ( !L.isObject(val) || !L.isArray(val.value) ) {
                return Y.Attribute.INVALID_VALUE;
            }
            Y.Array.each(val.value, function (item) {
                res[item._languageCode] = item["#text"];
            });
            return res;
        },

        /**
         * Parses the hash returned by the eZ Publish REST API
         * based on ATTRS_REST_MAP and LINKS_MAP properties
         *
         * @protected
         * @method _parseStruct
         * @param {Object} struct the struct to transform
         * @return {Object}
         */
        _parseStruct: function (struct) {
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
        }

    }, {
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

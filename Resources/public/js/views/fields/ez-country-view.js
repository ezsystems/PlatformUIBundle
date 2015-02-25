/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-country-view', function (Y) {
    "use strict";
    /**
     * Provides the Country field view
     *
     * @module ez-country-view
     */
    Y.namespace('eZ');

    /**
     * The country field view
     *
     * @namespace eZ
     * @class CountryView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.CountryView = Y.Base.create('countryView', Y.eZ.FieldView, [], {

        /**
         * Returns the name of the countries that will be used in the template.
         * If a country is missing, it returns a country code (alpha2)
         * and send a warning.
         *
         * @method _getFieldValue
         * @protected
         * @return {Array|String}
         */
        _getFieldValue: function () {
            var that = this,
                field = this.get('field'),
                fieldValue = field.fieldValue,
                isMultiple = this.get('fieldDefinition').fieldSettings.isMultiple,
                res = [];

            if (field && fieldValue) {
                if (!isMultiple ) {
                    return this._getCountryName(fieldValue[0]);
                }
                Y.Array.each(fieldValue, function (country) {
                    res.push(that._getCountryName(country));
                });
            }
            return res;
        },

        /**
         * Returns the current country name.
         * If the country is missing, it will return a country code and send a warning.
         *
         * @method _getCountryName
         * @param {String} alpha2Code The country code (Alpha2)
         * @protected
         * @return {String}
         */
        _getCountryName: function (alpha2Code) {
            var config = this.get('config');

            if (config[alpha2Code]) {
                return config[alpha2Code].Name;
            } else {
                console.warn("Unknown country code: " + alpha2Code);
                return alpha2Code;
            }
        },

        _isFieldEmpty: function () {
            var fieldValue = this.get('field').fieldValue;

            return (!fieldValue || fieldValue.length === 0);
        },

        /**
         * Returns isMultiple variable in the template
         *
         * @method _variables
         * @protected
         * @return Object
         */
        _variables: function () {
            return {
                "isMultiple": this.get('fieldDefinition').fieldSettings.isMultiple
            };
        },
    },{
        ATTRS: {
            /**
             * Stores the country list, indexed by alpha2 code
             *
             * @type Object
             * @attribute config
             */
            config: {
                value: {},
            },
        }
    });

    Y.eZ.FieldView.registerFieldView('ezcountry', Y.eZ.CountryView);
});

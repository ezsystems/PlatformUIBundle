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
        initializer: function () {
            var config = this.get('config');

            if ( config && config.countriesInfo ) {
                this._set('countryList', config.countriesInfo);
            }
        },

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
            var list = this.get('countryList');

            if (list[alpha2Code]) {
                return list[alpha2Code].Name;
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
    }, {
        ATTRS: {
            /**
             * The country list indexed by alpha2 code
             *
             * @attribute countryList
             * @readOnly
             * @type {Object}
             */
            countryList: {
                readOnly: true,
                value: {},
            },
        },
    });

    Y.eZ.FieldView.registerFieldView('ezcountry', Y.eZ.CountryView);
});

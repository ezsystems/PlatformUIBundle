/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-country-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the country fields
     *
     * @module ez-country-editview
     */

    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezcountry';

    /**
     * Country edit view
     *
     * @namespace eZ
     * @class CountryEditView
     * @constructor
     * @extends eZ.SelectionEditView
     */
    Y.eZ.CountryEditView = Y.Base.create('countryEditView', Y.eZ.SelectionEditView, [], {
        initializer: function () {
            var config = this.get('config');

            this._useStandardFieldDefinitionDescription = false;
            this.containerTemplate = '<div class="' +
                this._generateViewClassName(this._getName()) + ' ' +
                this._generateViewClassName(Y.eZ.SelectionEditView.NAME) + '"/>';

            if ( config && config.countriesInfo ) {
                this._set('countryList', config.countriesInfo);
            }
        },

        /**
         * Returns the country name corresponding to the given alpha2Code.
         * If the country is missing, it will return a country code and send a warning.
         *
         * @method _getCountryName
         * @param {String} alpha2Code The country code (Alpha2)
         * @protected
         * @return {String}
         */
        _getCountryName: function (alpha2Code) {
            var countryList = this.get('countryList');

            if (countryList[alpha2Code]) {
                return countryList[alpha2Code].Name;
            } else {
                console.warn("Unknown country code: " + alpha2Code);
                return alpha2Code;
            }
        },

        _getSelectionFilter: function () {
            var container = this.get('container'),
                selectedObjectArray = this._getSelectedTextValues(),
                input = container.one('.ez-selection-filter-input'),
                source = this._getSource(),
                selected = [];

            Y.Array.each(selectedObjectArray, function (selectedObject) {
                selected.push(selectedObject.text);
            });
            return new Y.eZ.SelectionFilterView({
                container: input.get('parentNode'),
                inputNode: input,
                listNode: this.get('container').one('.ez-selection-options'),
                selected: selected,
                source: source,
                filter: true,
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
                isMultiple: this.get('isMultiple'),
                resultTextLocator: function (sourceElement) {
                    return sourceElement.Name;
                },
                resultAttributesFormatter: function (sourceElement) {
                    return {
                        alpha2: sourceElement.Alpha2,
                        text: sourceElement.Name,
                    };
                },
            });
        },

        _getSource: function () {
            var countriesArray = [];

            Y.Object.each(this.get('countryList'), function (country) {
                countriesArray.push(country);
            });
            return countriesArray;
        },

        _getSelectedTextValues: function () {
            var field = this.get('field'),
                valueIndexes = [],
                that =  this,
                res = [];

            if ( field && field.fieldValue ) {
                valueIndexes = field.fieldValue;
            }
            Y.Array.each(valueIndexes, function (index) {
                res.push({text: that._getCountryName(index), alpha2: index});
            });
            return res;
        },

        _getFieldValue: function () {
            var res = [];

            Y.Array.each(this.get('values'), function(value) {
                res.push(value.alpha2);
            });
            return res;
        }
    },  {
        ATTRS: {
            /**
             * The text and id values of the selected options
             *
             * @attribute values
             * @readonly
             * @default []
             * @type Array
             */

            /**
             * The country list indexed by alpha2 code
             *
             * @attribute countryList
             * @readOnly
             * @type {Object}
             */
            countryList: {
                value: {},
                readOnly: true,
            },
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.CountryEditView
    );
});

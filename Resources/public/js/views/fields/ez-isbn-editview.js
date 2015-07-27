/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-isbn-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the ISBN field
     *
     * @module ez-isbn-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezisbn';

    /**
     * ISBN edit view
     *
     * @namespace eZ
     * @class ISBNEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.ISBNEditView = Y.Base.create('isbnEditView', Y.eZ.FieldEditView, [], {

        events: {
            '.ez-isbn-input-ui input': {
                'blur': 'validate',
                'valuechange': 'validate',
            },
        },

        /**
         * Validates the current input of the ISBN field
         *
         * @method validate
         */
        validate: function () {
            this.set('errorStatus', false);
            if ( this.get('fieldDefinition').isRequired && this._isFieldEmpty() ){
                this.set('errorStatus', 'This field is required');
            } else if ( !this._isFieldEmpty() ) {
                if ( this.get('fieldDefinition').fieldSettings.isISBN13 ) {
                    this._checkISBN13();
                } else {
                    this._checkISBN10();
                }
            }
        },

        /**
         * Get the raw field value (without dashes)
         *
         * @method _getRawFieldValue
         * @protected
         * @return {String}
         */
        _getRawFieldValue: function () {
            return this._getFieldValue().replace(/-/g, "");
        },

        /**
         * Checks whether the field is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            return (this._getRawFieldValue().length === 0);
        },

        /**
         * Defines the variables to imported in the field edit template for ISBN
         *
         * @protected
         * @method _variables
         * @return {Object} containing isRequired
         */
        _variables: function () {
            var def = this.get('fieldDefinition');

            return {
                "isRequired": def.isRequired
            };
        },

        /**
         * Checks if the  ISBN 13 is valid
         *
         * @protected
         * @method _checkISBN13
         */
        _checkISBN13: function () {
            var rawInputString = this._getRawFieldValue(),
                checksum13 = 0,
                weight13 = 1,
                checkDigit;

            if ( /^(97[89][0-9]{10})$/.test(rawInputString)) {
                Y.Array.each(rawInputString, function (char) {
                    checksum13 = checksum13 + weight13 * char;
                    weight13 = (weight13 + 2) % 4;
                });
            } else {
                this.set('errorStatus', "This is not a correct ISBN13 pattern");
            }
            if (this.isValid()) {
                if ((checksum13 % 10) !== 0) {
                    checkDigit = (10 - ((checksum13 - ((weight13 + 2) % 4) * rawInputString[12]) %10)) %10;
                    this.set('errorStatus', "Bad checksum, last digit of ISBN 13 should be " + checkDigit );
                }
            }
        },

        /**
         * Checks if the  ISBN 10 is valid
         *
         * @protected
         * @method _checkISBN10
         */
        _checkISBN10: function () {
            var rawInputString = this._getRawFieldValue(),
                sumResult = 0;

            if (/^([0-9]{9}[0-9X])$/.test(rawInputString)) {
                Y.Array.each(rawInputString, function (char, index) {
                    if ((index === 9) && (char === "X")) {
                        sumResult = sumResult + 100;
                    } else {
                        sumResult = sumResult + (index + 1) * char;
                    }
                });
            } else {
                this.set('errorStatus', 'invalid ISBN 10');
            }
            if (this.get('errorStatus') === false && sumResult % 11 !== 0) {
                this.set('errorStatus', "invalid ISBN 10 (sum is not a multiple of 11");
            }
        },

        /**
         * Returns the currently filled ISBN
         *
         * @protected
         * @method _getFieldValue
         * @return {String}
         */
        _getFieldValue: function () {
            return this.get('container').one('.ez-isbn-input-ui input').get('value');
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.ISBNEditView
    );
});

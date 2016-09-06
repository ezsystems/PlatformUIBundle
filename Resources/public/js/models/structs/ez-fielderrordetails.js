/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-fielderrordetails', function (Y) {
    "use strict";

    /**
     * Provides the field error details class
     *
     * @method ez-fielderrordetails
     */

    Y.namespace('eZ');
    /**
     * The Field Error Details class
     *
     * @namespace eZ
     * @class FieldErrorDetails
     * @constructor
     * @extends Base
     */
    Y.eZ.FieldErrorDetails = Y.Base.create('fieldErrorDetails', Y.Base, [], {
        /**
         * Parse the error to set type and message attribute.
         *
         * @method parse
         * @param {Object} error
         */
        parse: function (error) {
            this.set('type', error.type);
            this.set('message', error.message);
        },
    }, {
        ATTRS: {
            /**
             * The field definition id of the field to which the error is related
             *
             * @attribute fieldDefinitionId
             * @default null
             * @type Number
             */
            fieldDefinitionId: {
                value: null
            },
            /**
             * The type of the error
             *
             * @attribute type
             * @default {}
             * @type String
             */
            type: {
                value: null
            },
            /**
             * The message of the error
             *
             * @attribute message
             * @default {}
             * @type String
             */
            message: {
                value: null
            },
        }
    });
});

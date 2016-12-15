/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-draftserversidevalidation', function (Y) {
    "use strict";
    /**
     * Provides the draft server side validation extension
     *
     * @module ez-draftserversidevalidation
     */
    Y.namespace('eZ');

    /**
     * Draft server side validation. It provides the ability to extract the field validation errors from an error response.
     *
     * @namespace eZ
     * @class draftServerSideValidation
     * @constructor
     * @extends Y.Base
     */
    Y.eZ.DraftServerSideValidation = Y.Base.create('draftServerSideValidation', Y.Base, [], {
        /**
         * Parse the errors form the response
         * and call the serverSideErrorCallback with an array of  Y.eZ.FieldErrorDetails
         *
         * @method _parseServerFieldsErrors
         * @param {Response} response
         * @param {Function} [serverSideErrorCallback] called on server side validation
         * @param {Array} serverSideErrorCallback.serverSideFieldsError Array of Y.eZ.FieldErrorDetails
         * @protected
         */
        _parseServerFieldsErrors: function (response, serverSideErrorCallback) {
            var serverSideFieldsError = [],
                error,
                fieldsError;

            if ( !response.document && serverSideErrorCallback) {
                serverSideErrorCallback(serverSideFieldsError);
                return;
            }

            if (serverSideErrorCallback) {
                error = response.document.ErrorMessage;
                fieldsError = error.errorDetails ?  error.errorDetails.fields : [];

                fieldsError.forEach(function (field) {
                    field.errors.forEach(function (error) {
                        var serverSideFieldErrorDetails;

                        serverSideFieldErrorDetails = new Y.eZ.FieldErrorDetails({fieldDefinitionId: field._fieldTypeId});
                        serverSideFieldErrorDetails.parse(error);
                        serverSideFieldsError.push(serverSideFieldErrorDetails);
                    });
                });
                serverSideErrorCallback(serverSideFieldsError);
            }
        },
    });
});

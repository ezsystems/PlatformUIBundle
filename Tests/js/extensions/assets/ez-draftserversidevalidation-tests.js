/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-draftserversidevalidation-tests', function (Y) {
    Y.namespace('eZ.Test.DraftServerSideValidation');

    var Assert = Y.Assert;
    
    Y.eZ.Test.DraftServerSideValidation.CallbackCalledTestCase = {
        "Should call the server side error callback on error": function () {
            var fields = [],
                serverSideErrorCallbackCalled = false,
                i = 0;

            this.view.fire(this.action, {
                formIsValid: true,
                fields: fields,
                serverSideErrorCallback: Y.bind(function(serverSideErrors) {
                    serverSideErrors.forEach(function(serverSideError) {
                        Assert.isInstanceOf(
                            Y.eZ.FieldErrorDetails, serverSideError,
                            "param of the callback should be an instance Y.eZ.FieldErrorDetails"
                        );
                        Assert.areSame(
                            this.errorMessages[i],
                            serverSideError.get('message'),
                            "message attribute should be filled"
                        );
                        Assert.areSame(
                            this.errorTypes[i],
                            serverSideError.get('type'),
                            "message attribute should be filled"
                        );
                        Assert.areSame(
                            this.errorFieldDefinitionIds[i],
                            serverSideError.get('fieldDefinitionId'),
                            "message attribute should be filled"
                        );
                        i++;
                    }, this);
                    serverSideErrorCallbackCalled = true;
                }, this)
            });
            Assert.isTrue(serverSideErrorCallbackCalled, "serverSideErrorCallback should have been called");
        },
    };
}, '', {requires: ['test', 'ez-fielderrordetails']});

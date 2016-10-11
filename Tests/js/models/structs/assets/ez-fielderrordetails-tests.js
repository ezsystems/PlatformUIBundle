/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-fielderrordetails-tests', function (Y) {
    var parseTest,
        Assert = Y.Assert;

    parseTest = new Y.Test.Case({
        name: "eZ Field Error Details test",

        setUp: function () {
            this.struct = new Y.eZ.FieldErrorDetails();
        },

        tearDown: function () {
            this.struct.destroy();
        },

        "Test parse method": function () {
            var type = 'error²',
                message = 'an error occured while displaying the error',
                error = {
                    type: type,
                    message: message
                };
            
            this.struct.parse(error);

            Assert.areSame(type, this.struct.get('type'), 'type attribute should have been setted');
            Assert.areSame(message, this.struct.get('message'), 'type attribute should have been setted');
        },

    });

    Y.Test.Runner.setName("eZ Field Error Details tests");
    Y.Test.Runner.add(parseTest);
}, '', {requires: ['test', 'ez-fielderrordetails']});

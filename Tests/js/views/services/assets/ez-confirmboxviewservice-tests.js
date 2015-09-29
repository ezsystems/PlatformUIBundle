/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-confirmboxviewservice-tests', function (Y) {
    var getViewParametersTest;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Confirm Box View Service getViewParameters test",

        setUp: function () {
            this.service = new Y.eZ.ConfirmBoxViewService();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should return the parameters object": function () {
            this.service.set('parameters', {param: 'param'});

            Y.Assert.areEqual(
                'param',
                this.service.getViewParameters().param,
                "getViewParameters should return the parameters object"
            );
        },
    });

    Y.Test.Runner.setName("eZ Confirm Box View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
}, '', {requires: ['test', 'ez-confirmboxviewservice']});

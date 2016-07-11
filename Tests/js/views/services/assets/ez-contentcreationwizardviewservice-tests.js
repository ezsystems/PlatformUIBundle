/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardviewservice-tests', function (Y) {
    var getViewParametersTest,
        Assert = Y.Assert;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View Service getViewParameters test",

        setUp: function () {
            this.service = new Y.eZ.ContentCreationWizardViewService();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should return the parameters object": function () {
            this.service.set('parameters', {param: 'param'});

            Assert.areEqual(
                'param',
                this.service.getViewParameters().param,
                "getViewParameters should return the parameters object"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Creation Wizard View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
}, '', {requires: ['test', 'ez-contentcreationwizardviewservice']});

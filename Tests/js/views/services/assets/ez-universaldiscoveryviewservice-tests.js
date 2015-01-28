/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryviewservice-tests', function (Y) {
    var getViewParametersTest,
        Assert = Y.Assert;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Universal Discovery View Service getViewParameters test",

        setUp: function () {
            this.service = new Y.eZ.UniversalDiscoveryViewService();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should return the config": function () {
            var config = {some: "config"};

            this.service.set('config', config);
            Assert.isObject(this.service.getViewParameters());
            Assert.areEqual(1, Y.Object.keys(this.service.getViewParameters()).length);
            Assert.areSame(
                config.some, this.service.getViewParameters().some,
                "The view parameters should be the conf"
            );
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
}, '', {requires: ['test', 'view', 'ez-universaldiscoveryviewservice']});

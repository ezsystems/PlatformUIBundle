/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageselectionboxviewservice-tests', function (Y) {
    var getViewParametersTest,
        Mock = Y.Mock, Assert = Y.Assert;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Language Selection Box View Service getViewParameters test",

        setUp: function () {
            this.app = new Mock();
            this.systemLanguageList = {
                'eng-EN': {languageCode: 'eng-EN', name: 'EN'},
                'pol-PL': {languageCode: 'pol-PL', name: 'PL'}
            };

            Mock.expect(this.app, {
                method: 'get',
                args: ['systemLanguageList'],
                returns: this.systemLanguageList
            });

            this.service = new Y.eZ.LanguageSelectionBoxViewService({
                app: this. app
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should return the parameters object": function () {
            var parameters = {
                    'param': 'Aerials'
                };

            this.service.set('parameters', parameters);

            Assert.areEqual(
                this.systemLanguageList,
                this.service.getViewParameters().systemLanguageList,
                "getViewParameters should return systemLanguageList the parameters object"
            );
            Assert.areEqual(
                parameters.param,
                this.service.getViewParameters().param,
                "getViewParameters should return the parameters object"
            );
        }
    });

    Y.Test.Runner.setName("eZ Language Selection Box View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
}, '', {requires: ['test', 'ez-languageselectionboxviewservice']});

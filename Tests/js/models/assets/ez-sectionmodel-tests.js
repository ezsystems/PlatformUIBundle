/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sectionmodel-tests', function (Y) {
    var modelTest, loadResponse;

    loadResponse = {
        "Section": {
            "_media-type": "application/vnd.ez.api.Section+json",
            "_href": "/api/ezp/v2/content/sections/3",
            "sectionId": 3,
            "identifier": "media",
            "name": "Media"
        }
    };

    modelTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ModelTests, {
        name: "eZ Section Model tests",

        init: function () {
            this.capiMock = new Y.Mock();
            this.capiGetService = 'getContentService';
            this.serviceMock = new Y.Mock();
            this.serviceLoad = 'loadSection';
            this.rootProperty = "Section";
            this.parsedAttributeNumber = Y.eZ.Section.ATTRS_REST_MAP.length + 1; // links
        },

        setUp: function () {
            this.model = new Y.eZ.Section();
            this.loadResponse = loadResponse;
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },
    }));

    Y.Test.Runner.setName("eZ Section Model tests");
    Y.Test.Runner.add(modelTest);
}, '', {requires: ['test', 'model-tests', 'ez-sectionmodel']});

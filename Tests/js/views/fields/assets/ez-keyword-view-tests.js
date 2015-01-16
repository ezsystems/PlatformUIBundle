/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-keyword-view-tests', function (Y) {
    var registerTest, viewTest, emptyViewTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Keyword View tests",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezkeyword'};
                this.field = {fieldValue: ['Stephane', 'Charlie', 'Valentine']};
                this.isEmpty = false;
                this.view = new Y.eZ.KeywordView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );
    Y.Test.Runner.setName("eZ Keyword View tests");
    Y.Test.Runner.add(viewTest);

    emptyViewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Keyword View tests",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezkeyword'};
                this.field = {fieldValue: []};
                this.isEmpty = true;
                this.view = new Y.eZ.KeywordView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );
    Y.Test.Runner.add(emptyViewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Keyword View registration test";
    registerTest.viewType = Y.eZ.KeywordView;
    registerTest.viewKey = "ezkeyword";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-keyword-view', 'ez-genericfieldview-tests']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-author-view-tests', function (Y) {
    var registerTest, viewTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Author View tests",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezauthor'};
                this.field = {fieldValue: [{email: "MarieChantal@NS.com", id: 0, name:"MarieChantal" }]};
                this.isEmpty = false;
                this.view = new Y.eZ.AuthorView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Test isEmpty with an empty field": function () {
                this._testIsEmpty(
                    {}, true,
                    "The field should be seen as empty"
                );
            },

            "Test isEmpty with a filled fieldValue": function () {
                this._testIsEmpty(
                    this.field,
                    false,
                    "The field should not be seen as empty"
                );
            },

            "Test isEmpty with an empty fieldValue": function () {
                this._testIsEmpty(
                    {fieldValue: []}, true,
                    "The field should be seen as empty"
                );
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Author View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Author View registration test";
    registerTest.viewType = Y.eZ.AuthorView;
    registerTest.viewKey = "ezauthor";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-author-view', 'ez-genericfieldview-tests']});

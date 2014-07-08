/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-checkbox-view-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Checkbox View test",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezboolean'};
                this.field = {fieldValue: true};
                this.isEmpty = false;
                this.view = new Y.eZ.CheckboxView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Test true value in template": function () {
                this._testValue(true, "Yes", "The value in the template should be 'Yes'");
            },

            "Test false value in template": function () {
                this._testValue(false, "No", "The value in the template should be 'No'");
            },

            "Test isEmpty with false in field value": function () {
                this._testIsEmpty(
                    {fieldValue: false}, false,
                    "The checkbox can not be empty"
                );
            },

            "Test isEmpty with true in field value": function () {
                this._testIsEmpty(
                    {fieldValue: true}, false,
                    "The checkbox can not be empty"
                );
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Checkbox View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Checkbox View registration test";
    registerTest.viewType = Y.eZ.CheckboxView;
    registerTest.viewKey = "ezboolean";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-checkbox-view', 'ez-genericfieldview-tests']});

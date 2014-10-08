/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-date-view-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Date View test",

            setUp: function () {
                this.fieldValue = {
                    timestamp: 374388330,
                };
                this.date = '11/12/1981';
                this.templateVariablesCount = 4;
                this.fieldDefinition = {
                    fieldType: 'ezdate',
                };
                this.field = {
                    fieldValue: this.fieldValue,
                };
                this.isEmpty = false;
                this.view = new Y.eZ.DateView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Should format the date": function () {
                this._testValue(
                    this.fieldValue, this.date,
                    "The value in the template should be a formatted date with the seconds"
                );
            },

            "Test isEmpty with an undefined field": function () {
                this._testIsEmpty(
                    undefined, true,
                    "The field should be seen as empty"
                );
            },

            "Test isEmpty with an empty field": function () {
                this._testIsEmpty(
                    {}, true,
                    "The field should be seen as empty"
                );
            },

            "Test isEmpty with a filled fieldValue": function () {
                this._testIsEmpty(
                    {fieldValue: {timestamp: 1}}, false,
                    "The field should not be seen as empty"
                );
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Date View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Date View registration test";
    registerTest.viewType = Y.eZ.DateView;
    registerTest.viewKey = "ezdate";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-date-view', 'ez-genericfieldview-tests']});

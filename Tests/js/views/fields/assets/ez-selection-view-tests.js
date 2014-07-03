/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-selection-view-tests', function (Y) {
    var registerTest, simpleViewTest, multipleViewTest;

    simpleViewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Selection Simple View tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: 'ezselection', fieldSettings: {options: ["Sun", "Beach", "Mojito", "Bikini"]}};
                this.field = {fieldValue: [1]};
                this.isEmpty = false;
                this.view = new Y.eZ.SelectionView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },

            "Test field with provided fieldValue": function () {
                var fieldValue = 2,
                    fieldValueAssert = function (expected, actual, msg) {
                        Y.Assert.areSame(expected, actual, msg);
                    };

                this._testValue(
                    fieldValue,
                    "Mojito",
                    "The simple selection field value should match the template value",
                    fieldValueAssert
                );
            },

            "Test field with provided empty fieldValue": function () {
                var fieldValue = '',
                    fieldValueAssert = function (expected, actual, msg) {
                        Y.Assert.areSame(expected, actual, msg);
                    };

                this._testValue(
                    fieldValue,
                    undefined,
                    fieldValueAssert
                );
            },


            "Test isEmpty with a non empty field value": function () {
                this._testIsEmpty(
                    {fieldValue: [1]}, false,
                    "The selection field with fieldValue : 1 should be considered non empty"
                );
            },

            "Test empty field value": function () {
                this._testValue(
                    {}, undefined, "The value in the template should be undefined"
                );
            },

            "Test isEmpty with an empty field value": function () {
                this._testIsEmpty(
                    {fieldValue: []}, true,
                    "The selection field with no fieldValue should be considered empty"
                );
            },
        })
    );

    Y.Test.Runner.setName("eZ Selection Simple View tests");
    Y.Test.Runner.add(simpleViewTest);


    multipleViewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Selection Multiple View tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: 'ezselection', fieldSettings: {options: ["Sun", "Beach", "Mojito", "Bikini"], isMultiple: true}};
                this.field = {fieldValue: [1]};
                this.isEmpty = false;
                this.view = new Y.eZ.SelectionView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },

            "Test field with provided multiple fieldValue": function () {
                var fieldValue = [2,1], templateValue = ["Mojito", "Beach"],
                    fieldValueAssert = function (expected, actual, msg) {
                        Y.Assert.areSame(
                            expected.length,
                            actual.length,
                            "The field value array does not have the same length than the templateValue one"
                        );
                        Y.Array.each(expected, function (expectation, index) {
                            Y.Assert.areSame(expectation, actual[index], msg);
                        });
                    };

                this._testValue(
                    fieldValue,
                    templateValue,
                    "The multiple selection field values should match the template values",
                    fieldValueAssert
                );
            },
        })
    );

    Y.Test.Runner.setName("eZ Selection Multiple View tests");
    Y.Test.Runner.add(multipleViewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Selection View registration test";
    registerTest.viewType = Y.eZ.SelectionView;
    registerTest.viewKey = "ezselection";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-selection-view', 'ez-genericfieldview-tests']});

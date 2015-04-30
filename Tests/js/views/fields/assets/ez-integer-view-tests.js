/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-integer-view-tests', function (Y) {
    var registerTest, viewTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Integer View tests",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezinteger'};
                this.field = {fieldValue: 42};
                this.isEmpty = false;
                this.view = new Y.eZ.IntegerView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Test isEmpty with an empty fieldValue": function () {
                this._testIsEmpty(
                    {fieldValue: null}, true,
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

            "Test isEmpty with zero": function () {
                this._testIsEmpty(
                    {fieldValue: 0}, false,
                    "The field should not be seen as empty"
                );
            },

            "Test template override": function (){
                var container = this.view.get('container');
                this.view.render();

                Y.Assert.isObject(
                    container.one("#marcelobielsa"),
                    "The fieldview template should have been used"
                );
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Integer View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Integer View registration test";
    registerTest.viewType = Y.eZ.IntegerView;
    registerTest.viewKey = "ezinteger";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-integer-view', 'ez-genericfieldview-tests']});

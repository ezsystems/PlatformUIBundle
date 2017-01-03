/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-time-view-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Time View test",

            _should: {
                ignore: {
                    // Date.toLocaleTimeString() does not support the options
                    // in phantomjs so this test is failing there
                    "Should format the time without the seconds": Y.UA.phantomjs
                },
            },

            setUp: function () {
                this.fieldValue = 374388330;
                this.dateObject = new Date(this.fieldValue * 1000);

                this.time = this.dateObject.toLocaleTimeString(
                    undefined,
                    {hour: '2-digit', minute: '2-digit', second: '2-digit'}
                );
                this.timeNoSeconds = this.dateObject.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
                this.templateVariablesCount = 4;
                this.fieldDefinition = {
                    identifier: 'some_identifier',
                    fieldType: 'eztime',
                    fieldSettings: {
                        useSeconds: true,
                    },
                };
                this.field = {
                    fieldValue: this.fieldValue,
                };
                this.isEmpty = false;
                this.view = new Y.eZ.TimeView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Should format the time with the seconds": function () {
                this._testValue(
                    this.fieldValue, this.time,
                    "The value in the template should be a formatted time with the seconds"
                );
            },

            "Should format the time without the seconds": function () {
                this.view.get('fieldDefinition').fieldSettings.useSeconds = false;
                this._testValue(
                    this.fieldValue, this.timeNoSeconds,
                    "The value in the template should be a formatted time without the seconds"
                );
            },

            "Test isEmpty with an undefined field": function () {
                this._testIsEmpty(
                    undefined, true,
                    "The field should be seen as empty"
                );
            },

            "Test isEmpty with a null fieldValue": function () {
                this._testIsEmpty(
                    {fieldValue: null}, true,
                    "The field should be seen as empty"
                );
            },

            "Test isEmpty with 0": function () {
                this._testIsEmpty(
                    {fieldValue: 0}, false,
                    "The field should not be seen as empty"
                );
            },

            "Test isEmpty with a filled fieldValue": function () {
                this._testIsEmpty(
                    {fieldValue: 1}, false,
                    "The field should not be seen as empty"
                );
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Time View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Time View registration test";
    registerTest.viewType = Y.eZ.TimeView;
    registerTest.viewKey = "eztime";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-time-view', 'ez-genericfieldview-tests']});

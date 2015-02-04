/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-url-view-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Url View test",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezurl'};
                this.field = {fieldValue: {link: ''}};
                this.isEmpty = true;
                this.view = new Y.eZ.UrlView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Test empty field value": function () {
                this._testValue(
                    {}, undefined, "The value in the template should be undefined"
                );
            },

            "Test empty field value (null)": function () {
                this._testValue(
                    null, undefined, "The value in the template should be undefined"
                );
            },

            "Test empty link in field value": function () {
                this._testValue(
                    {link: ""}, undefined, "The value in the template should be undefined"
                );
            },

            "Test link without anchor text field value": function () {
                var url = "http://ez.no/",
                    fieldValueAssert = function (expected, actual, msg) {
                        Y.Assert.areSame(expected.link, actual.link, msg);
                        Y.Assert.areSame(expected.text, actual.text, msg);
                    };

                this._testValue(
                    {link: url}, {link: url, text: url},
                    "The value in the template should have the link and text properties",
                    fieldValueAssert
                );
            },

            "Test link with anchor text field value": function () {
                var url = "http://ez.no/",
                    text = 'eZ Systems',
                    fieldValueAssert = function (expected, actual, msg) {
                        Y.Assert.areSame(expected.link, actual.link, msg);
                        Y.Assert.areSame(expected.text, actual.text, msg);
                    };

                this._testValue(
                    {link: url, text: text}, {link: url, text: text},
                    "The value in the template should have the link and text properties",
                    fieldValueAssert
                );
            },

            "Test isEmpty with an empty link": function () {
                this._testIsEmpty(
                    {fieldValue: {link: ""}}, true,
                    "The URL {link: ''} should be considered empty"
                );
            },

            "Test isEmpty with a non empty link": function () {
                this._testIsEmpty(
                    {fieldValue: {link: "http://ez.no"}}, false,
                    "The URL {link: 'http://ez.no'} should be considered empty"
                );
            },

            "Test isEmpty with an empty field value": function () {
                this._testIsEmpty(
                    {fieldValue: {}}, true,
                    "The URL {} should be considered empty"
                );
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Url View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Url View registration test";
    registerTest.viewType = Y.eZ.UrlView;
    registerTest.viewKey = "ezurl";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-url-view', 'ez-genericfieldview-tests']});

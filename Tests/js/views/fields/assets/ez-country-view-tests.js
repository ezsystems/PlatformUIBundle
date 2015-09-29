/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-country-view-tests', function (Y) {
    var registerTest, viewTest, viewMultipleTest, emptyViewTest, viewWithoutFieldvalue, viewWithoutConfig;

    viewWithoutConfig = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Country View tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {
                    fieldType: 'ezcountry',
                    fieldSettings: {
                        isMultiple: false
                    }
                };
                this.field = {fieldValue: ["AD"]};
                this.isEmpty = false;
                this.view = new Y.eZ.CountryView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    config: {}
                });
            },
            tearDown: function () {
                this.view.destroy();
            },
        })
    );
    Y.Test.Runner.setName("eZ Country View tests");
    Y.Test.Runner.add(viewWithoutConfig);

    viewWithoutFieldvalue = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Country View tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {
                    fieldType: 'ezcountry',
                    fieldSettings: {
                        isMultiple: false
                    }
                };
                this.field = {};
                this.isEmpty = true;
                this.view = new Y.eZ.CountryView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    config: {
                        countriesInfo: {
                            "AD": {
                                "Alpha2": "AD",
                                "Alpha3": "AND",
                                "IDC": "376",
                                "Name": "Andorra"
                            },
                            SC: {
                                "Alpha2": "SC",
                                "Alpha3": "SUC",
                                "IDC": "377",
                                "Name": "Super Country"
                            },
                        },
                    }
                });
            },
            tearDown: function () {
                this.view.destroy();
            },
        })
    );
    Y.Test.Runner.add(viewWithoutFieldvalue);

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Country View tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {
                    fieldType: 'ezcountry',
                    fieldSettings: {
                        isMultiple: false
                    }
                };
                this.field = {fieldValue: ["AD"]};
                this.isEmpty = false;
                this.view = new Y.eZ.CountryView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    config: {
                        countriesInfo: {
                            "AD": {
                                "Alpha2": "AD",
                                "Alpha3": "AND",
                                "IDC": "376",
                                "Name": "Andorra"
                            },
                            SC: {
                                "Alpha2": "SC",
                                "Alpha3": "SUC",
                                "IDC": "377",
                                "Name": "Super Country"
                            },
                        },
                    }
                });
            },
            tearDown: function () {
                this.view.destroy();
            },
        })
    );
    Y.Test.Runner.add(viewTest);

    viewMultipleTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Country View tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {
                    fieldType: 'ezcountry',
                    fieldSettings: {
                        isMultiple: "true"
                    }
                };
                this.field = {fieldValue: ["AD", "SC"]};
                this.isEmpty = false;
                this.view = new Y.eZ.CountryView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    config: {
                        countriesInfo: {
                            "AD": {
                                "Alpha2": "AD",
                                "Alpha3": "AND",
                                "IDC": "376",
                                "Name": "Andorra"
                            },
                            SC: {
                                "Alpha2": "SC",
                                "Alpha3": "SUC",
                                "IDC": "377",
                                "Name": "Super Country"
                            },
                        },
                    }
                });
            },
            tearDown: function () {
                this.view.destroy();
            },
        })
    );
    Y.Test.Runner.add(viewMultipleTest);

    emptyViewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Country View tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {
                    fieldType: 'ezcountry',
                    fieldSettings: {
                        isMultiple: "true"
                    }
                };
                this.field = {fieldValue: []};
                this.isEmpty = true;
                this.view = new Y.eZ.CountryView({
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

    registerTest.name = "Country View registration test";
    registerTest.viewType = Y.eZ.CountryView;
    registerTest.viewKey = "ezcountry";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-country-view', 'ez-genericfieldview-tests']});

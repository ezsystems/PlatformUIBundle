/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-xmltext-view-tests', function (Y) {
    var registerTest, viewTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ XmlText View tests",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezxmltext'};
                this.field = {fieldValue: {xml: "some ezxml"}};
                this.isEmpty = false;
                this.view = new Y.eZ.XmlTextView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ XmlText View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "XmlText View registration test";
    registerTest.viewType = Y.eZ.XmlTextView;
    registerTest.viewKey = "ezxmltext";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-xmltext-view', 'ez-genericfieldview-tests']});

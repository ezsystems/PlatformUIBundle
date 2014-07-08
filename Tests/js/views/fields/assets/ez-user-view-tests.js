/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-user-view-tests', function (Y) {
    var registerTest, viewTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ User View tests",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezuser'};
                this.field = {fieldValue: {email: "MarieChantal@NS.com", login:"MarieChantal" }};
                this.isEmpty = false;
                this.view = new Y.eZ.UserView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ User View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "User View registration test";
    registerTest.viewType = Y.eZ.UserView;
    registerTest.viewKey = "ezuser";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-user-view', 'ez-genericfieldview-tests']});

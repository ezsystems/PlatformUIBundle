/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-view-tests', function (Y) {
    var registerTest,
        emptyTest, notEmptyTest, invalidTest,
        Assert = Y.Assert,
        EMPTY_XML, INVALD_XML, NOTEMPTY_XML;

    EMPTY_XML = '<?xml version="1.0" encoding="UTF-8"?>';
    EMPTY_XML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit"/>';

    INVALD_XML = "I'm invalid";

    NOTEMPTY_XML = '<?xml version="1.0" encoding="UTF-8"?>';
    NOTEMPTY_XML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit">';
    NOTEMPTY_XML += '<p>I\'m not empty</p></section>';

    emptyTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ RichText View empty field tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: 'ezrichtext'};
                this.field = {id: 42, fieldValue: {xhtml5edit: EMPTY_XML}};
                this.isEmpty = true;
                this.view = new Y.eZ.RichTextView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Should set the parseError variable to false": function () {
                var origTpl = this.view.template;

                this.view.template = function (variables) {
                    Assert.isFalse(
                        variables.parseError,
                        "parseError should be false"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    notEmptyTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ RichText View not empty field tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: 'ezrichtext'};
                this.field = {id: 42, fieldValue: {xhtml5edit: NOTEMPTY_XML}};
                this.isEmpty = false;
                this.view = new Y.eZ.RichTextView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Should set the parseError variable to false": function () {
                var origTpl = this.view.template;

                this.view.template = function (variables) {
                    Assert.isFalse(
                        variables.parseError,
                        "parseError should be false"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    invalidTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ RichText View invalid xml field tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: 'ezrichtext'};
                this.field = {id: 42, fieldValue: {xhtml5edit: INVALD_XML}};
                this.isEmpty = null;
                this.view = new Y.eZ.RichTextView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            "Should set the parseError variable to true": function () {
                var origTpl = this.view.template;

                this.view.template = function (variables) {
                    Assert.isTrue(
                        variables.parseError,
                        "parseError should be true"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ RichText View tests");
    Y.Test.Runner.add(emptyTest);
    Y.Test.Runner.add(notEmptyTest);
    Y.Test.Runner.add(invalidTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "RichText View registration test";
    registerTest.viewType = Y.eZ.RichTextView;
    registerTest.viewKey = "ezrichtext";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-richtext-view', 'ez-genericfieldview-tests']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-editview-tests', function (Y) {
    var renderTest, registerTest, validateTest, getFieldTest,
        editorTest,
        VALID_XHTML, INVALID_XHTML, RESULT_XHTML,
        Assert = Y.Assert, Mock = Y.Mock;

    INVALID_XHTML = "I'm invalid";

    VALID_XHTML = '<?xml version="1.0" encoding="UTF-8"?>';
    VALID_XHTML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit">';
    VALID_XHTML += '<p>I\'m not empty</p></section>';

    RESULT_XHTML = '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit"><p>I\'m not empty</p></section>';

    renderTest = new Y.Test.Case({
        name: "eZ RichText View render test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, expectRequired, xhtml5edit, expectedXhtml) {
            var fieldDefinition = this._getFieldDefinition(required),
                that = this;

            this.field.fieldValue.xhtml5edit = xhtml5edit;
            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(7, Y.Object.keys(variables).length, "The template should receive 7 variables");

                Assert.areSame(
                     that.jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Assert.areSame(
                     that.jsonVersion, variables.version,
                    "The content should be available in the field edit view template"
                );
                Assert.areSame(
                    that.jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );
                Assert.areSame(expectRequired, variables.isRequired);
                Assert.areSame(expectedXhtml, variables.xhtml);

                return '';
            };
            this.view.render();
        },

        "Test variables for not required field": function () {
            this._testAvailableVariables(false, false, VALID_XHTML, RESULT_XHTML);
        },

        "Test variables for required field": function () {
            this._testAvailableVariables(true, true, VALID_XHTML, RESULT_XHTML);
        },

        "Should handle the parsing error": function () {
            this._testAvailableVariables(false, false, INVALID_XHTML, "");
        }
    });

    validateTest = new Y.Test.Case({
        name: "eZ RichText View validate test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.model = new Mock();
            Mock.expect(this.model, {
                method: 'toJSON',
                returns: {},
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                content: this.model,
                version: this.model,
                contentType: this.model,
            });
        },

        tearDown: function () {
            this.view.set('active', false);
            this.view.destroy();
        },

        "Should not detect any validation issue on a non required field": function () {
            var fieldDefinition = this._getFieldDefinition(false);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            this.view.validate();

            Assert.isTrue(
                this.view.isValid(),
                "A non required and empty field should be valid"
            );
        },

        "Should not validate an empty and required field": function () {
            var fieldDefinition = this._getFieldDefinition(true);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            this.view.validate();

            Assert.isFalse(
                this.view.isValid(),
                "A required and empty field should not be valid"
            );
        },

        "Should validate a filled and required field": function () {
            var fieldDefinition = this._getFieldDefinition(true);

            this.field.fieldValue.xhtml5edit = VALID_XHTML;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            this.view.validate();

            Assert.isTrue(
                this.view.isValid(),
                "A required and filled field should not be valid"
            );
        },
    });

    getFieldTest = new Y.Test.Case({
        name: "eZ RichText View getField test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.model = new Mock();
            Mock.expect(this.model, {
                method: 'toJSON',
                returns: {},
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                content: this.model,
                version: this.model,
                contentType: this.model,
            });
        },

        tearDown: function () {
            this.view.set('active', false);
            this.view.destroy();
        },

        "Should return an object": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                field;

            this.field.fieldValue.xhtml5edit = VALID_XHTML;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            field = this.view.getField();

            Assert.isObject(field, "The field should be an object");
            Assert.areNotSame(
                this.field, field,
                "The getField method should be return a different object"
            );
            Assert.isObject(field.fieldValue, "The fieldValue should be an object");
            Assert.areEqual(
                RESULT_XHTML, field.fieldValue.xml,
                "The xml property of the fieldValue should come from the editor"
            );
        },
    });

    editorTest = new Y.Test.Case({
        name: "eZ RichText View editor test",

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.model = new Mock();
            Mock.expect(this.model, {
                method: 'toJSON',
                returns: {},
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: {isRequired: true},
                content: this.model,
                version: this.model,
                contentType: this.model,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.set('active', false);
            this.view.destroy();
        },

        "Should create an instance of AlloyEditor": function () {
            this.view.set('active', true);

            Assert.isInstanceOf(
                Y.eZ.AlloyEditor.Core, this.view.get('editor'),
                "An instance of AlloyEditor should have been created"
            );
        },

        "Should set the toolbar configuration": function () {
            this.view.set('active', true);
            Assert.areSame(
                this.view.get('toolbarsConfig'),
                this.view.get('editor').get('toolbars'),
                "The toolbarsConfig attribute should be used as the toolbars config"
            );
        },

        "Should validate the input on blur": function () {
            var validated = false;

            this.view.after('errorStatusChange', function () {
                validated = true;
            });
            this.view.set('active', true);
            this.view.get('editor').get('nativeEditor').fire('blur');

            Assert.isTrue(validated, "The input should have been validated");
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "RichText Edit View registration test";
    registerTest.viewType = Y.eZ.RichTextEditView;
    registerTest.viewKey = "ezrichtext";

    Y.Test.Runner.setName("eZ RichText Edit View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(validateTest);
    Y.Test.Runner.add(getFieldTest);
    Y.Test.Runner.add(editorTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'editviewregister-tests', 'ez-richtext-editview']});

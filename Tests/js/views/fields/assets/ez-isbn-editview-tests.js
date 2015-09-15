/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-isbn-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest;

    viewTest = new Y.Test.Case({
        name: "eZ ISBN edit View test",

        _getFieldDefinition: function (required, isISBN13) {
            return {
                isRequired: required,
                fieldSettings: {
                    isISBN13: isISBN13
                }
            };
        },

        setUp: function () {
            this.field = {};
            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.contentType = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });

            this.view = new Y.eZ.ISBNEditView({
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

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required),
                that = this;

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(6, Y.Object.keys(variables).length, "The template should receive 6 variables");

                Y.Assert.areSame(
                    that.jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.jsonVersion, variables.version,
                    "The version should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );

                Y.Assert.areSame(expectRequired, variables.isRequired);

                return '';
            };
            this.view.render();
        },

        "Test not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test validate no constraints with ISBN13": function () {
            var fieldDefinition = this._getFieldDefinition(false, true),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );

            input = Y.one('.container input');
            input.set('value', '978-0-8493-9640-3');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
        },

        "Test validate required with ISBN13": function () {
            var fieldDefinition = this._getFieldDefinition(true, true),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', '978-0-8493-9640-3');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );

            input.set('value', '978-0-ABCD-9640-3');
            //not valid because characters must be digits
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "A bad input is invalid (digits)"
            );

            input.set('value', '999-0-8493-9640-3');
            //not valid because isbn13 must begin by 978 or 979
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "A bad input is invalid (must begin by 978 or 979)"
            );

            input.set('value', '978-0-8113-9940-3');
            //not valid because this make a bad checksum, this is not a possible ISBN
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "A bad input is invalid (bad checksum)"
            );

            input.set('value', '978-0-8493-9640-348478');
            //not valid because the length must be 13
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "A bad input is invalid (bad length)"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is invalid"
            );
        },

        "Test validate no constraints with ISBN10": function () {
            var fieldDefinition = this._getFieldDefinition(false, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );

            input = Y.one('.container input');
            input.set('value', '2-266-11156-6');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
        },

        "Test validate required with ISBN10": function () {
            var fieldDefinition = this._getFieldDefinition(true, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', '2-266-11156-6');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );

            input.set('value', '128505234X');
            //test without hyphens and 'X' as last digit
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );


            input.set('value', '2-266-11156-4');
            //not valid because the last digit is the control key and should be 6 in this case
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "A bad input is invalid (bad control key)"
            );

            input.set('value', '2-266-1115');
            //not valid because the length must be 10
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "A bad input is invalid (bad length)"
            );

            input.set('value', '2-266-ABC56-4');
            //not valid because characters should be digits excepts last one that can be an 'X'
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "A bad input is invalid (only digits requiered)"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is invalid"
            );
        },
    });

    Y.Test.Runner.setName("eZ ISBN Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.ISBNEditView,
            newValue: '978-0-8493-9640-3',
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "ISBN Edit View registration test";
    registerTest.viewType = Y.eZ.ISBNEditView;
    registerTest.viewKey = "ezisbn";
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-isbn-editview']});

YUI.add('ez-float-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest,
        container = Y.one('.container'),
        content, contentType, version,
        jsonContent = {}, jsonContentType = {}, jsonVersion = {},
        field = {},
        FLOAT_TEST_PATTERN = "\\-?\\d*\\.?\\d+";

    content = new Y.Mock();
    version = new Y.Mock();
    contentType = new Y.Mock();
    Y.Mock.expect(content, {
        method: 'toJSON',
        returns: jsonContent
    });
    Y.Mock.expect(version, {
        method: 'toJSON',
        returns: jsonVersion
    });
    Y.Mock.expect(contentType, {
        method: 'toJSON',
        returns: jsonContentType
    });

    viewTest = new Y.Test.Case({
        name: "eZ Float View test",

        _getFieldDefinition: function (required, minFloatValue, maxFloatValue) {
            return {
                isRequired: required,
                validatorConfiguration: {
                    FloatValueValidator: {
                        minFloatValue: minFloatValue,
                        maxFloatValue: maxFloatValue
                    }
                }
            };
        },

        setUp: function () {
            this.view = new Y.eZ.FloatEditView({
                container: container,
                field: field,
                version: version,
                content: content,
                contentType: contentType
            });

            this.provider = [
                {value: '1s33', valid: false},
                {value: 's1.33', valid: false},
                {value: '1.33s', valid: false},
                {value: '1.3s3', valid: false},
                {value: '-1s33', valid: false},
                {value: '-s1.33', valid: false},
                {value: '-1.33s', valid: false},
                {value: '-1.3s3', valid: false},

                {value: 's1,33', valid: false},
                {value: '1,33s', valid: false},
                {value: '1,3s3', valid: false},
                {value: '-s1,33', valid: false},
                {value: '-1,33s', valid: false},
                {value: '-1,3s3', valid: false},

                {value: '1.33', valid: true},
                {value: '-1.44', valid: true},
                {value: '1', valid: true},
                {value: '-1', valid: true},

                {value: '1,33', valid: true},
                {value: '-1,44', valid: true}
            ];
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, expectRequired, expectFloatPattern) {
            var fieldDefinition = this._getFieldDefinition(required, -10, 10);

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(9, Y.Object.keys(variables).length, "The template should receive 9 variables");

                Y.Assert.areSame(
                     jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                     jsonVersion, variables.version,
                    "The version should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    field, variables.field,
                    "The field should be available in the field edit view template"
                );

                Y.Assert.areSame(expectRequired, variables.isRequired);
                Y.Assert.areSame(expectFloatPattern, variables.floatPattern);

                return '';
            };
            this.view.render();
        },

        // Should be triggered only after view rendering!
        _runGenericFloatTestCases: function () {
            var input = Y.one('.container input'),
                test = this;

            Y.Array.each(this.provider, function (testData) {
                input.set('value', testData.value);
                test.view.validate();
                if ( testData.valid === true ) {
                    Y.Assert.isTrue(
                        test.view.isValid(),
                        testData.value + ' should be considered as a valid input'
                    );
                } else {
                    Y.Assert.isFalse(
                        test.view.isValid(),
                        testData.value + ' should NOT be considered as a valid input'
                    );
                }
            });
        },

        "Test not required field": function () {
            this._testAvailableVariables(false, false, FLOAT_TEST_PATTERN);
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true, FLOAT_TEST_PATTERN);
        },

        "Test simple float validation cases": function () {
            var fieldDefinition = this._getFieldDefinition(false, false, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            this._runGenericFloatTestCases();
        },

        "Test float validation cases with range and required constraints": function () {
            var fieldDefinition = this._getFieldDefinition(true, -10, 10),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            this._runGenericFloatTestCases();

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An error if float is required but NOT present"
            );

            input.set('value', '11');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Overflowing value is NOT valid"
            );

            input.set('value', '-11');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Underflowing value is NOT valid"
            );
        },

        "Test float validation cases with float min/max constraints": function () {
            var fieldDefinition = this._getFieldDefinition(true, -10.5, 10.5),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            this._runGenericFloatTestCases();

            input.set('value', '10.4');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "Valid float value in range is valid"
            );

            input.set('value', '-10.4');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "Valid float value in range and below zero is valid"
            );

            input.set('value', '10.9');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Overflowing value is NOT valid"
            );

            input.set('value', '-10.9');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Underflowing value is NOT valid"
            );
        }
    });

    Y.Test.Runner.setName("eZ Float Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false, validatorConfiguration: {FloatValueValidator: {}}},
            ViewConstructor: Y.eZ.FloatEditView,
            newValue: 42.2,
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Float Edit View registration test";
    registerTest.viewType = Y.eZ.FloatEditView;
    registerTest.viewKey = "ezfloat";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-float-editview']});

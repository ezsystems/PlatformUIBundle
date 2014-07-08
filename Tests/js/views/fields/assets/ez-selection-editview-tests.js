/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-selection-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest, uiFunctionalTest,
        options = [
            'Mont Myon', 'Signal de Nivigne', 'Mont Verjon', 'Mont July',
            'Mont Grillerin', 'Croix Rousse', 'Vergongeat'
        ];

    viewTest = new Y.Test.Case({
        name: "eZ Selection View test",

        _getFieldDefinition: function (required, multiple, options) {
            return {
                isRequired: required,
                fieldSettings: {
                    isMultiple: multiple,
                    options: options,
                }
            };
        },

        _getField: function (fieldValues) {
            return {
                fieldValue: fieldValues,
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

            this.view = new Y.eZ.SelectionEditView({
                container: '.container',
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _testAvailableVariables: function (required, multiple, options, fieldValues, expectRequired, expectMultiple) {
            var fieldDefinition = this._getFieldDefinition(required, multiple, options),
                field = this._getField(fieldValues),
                that = this;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('field', field);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(8, Y.Object.keys(variables).length, "The template should receive 8 variables");

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
                    field, variables.field,
                    "The field should be available in the field edit view template"
                );

                Y.Assert.areSame(expectRequired, variables.isRequired);
                Y.Assert.areSame(expectMultiple, variables.isMultiple);
                Y.Assert.areSame(that.view.get('values'), variables.selected);

                return '';
            };
            this.view.render();
        },

        "Test not required, unique and empty field": function () {
            this._testAvailableVariables(
                false, false, options, [],
                false, false
            );
        },

        "Test not required, multiple and empty field": function () {
            this._testAvailableVariables(
                false, true, options, [],
                false, true
            );
        },

        "Test required, unique and empty field": function () {
            this._testAvailableVariables(
                true, false, options, [],
                true, false
            );
        },

        "Test required, multiple and empty field": function () {
            this._testAvailableVariables(
                true, true, options, [],
                true, true
            );
        },

        "Test not required, unique and non empty field": function () {
            this._testAvailableVariables(
                false, false, options, [1],
                false, false
            );
        },

        "Test not required, multiple and non empty field": function () {
            this._testAvailableVariables(
                false, true, options, [1, 5],
                false, true
            );
        },

        "Test required, unique and non empty field": function () {
            this._testAvailableVariables(
                true, false, options, [1],
                true, false
            );
        },

        "Test required, multiple and non empty field": function () {
            this._testAvailableVariables(
                true, true, options, [1, 5],
                true, true
            );
        },

        "Test validate an empty not required field": function () {
            var fieldDefinition = this._getFieldDefinition(false, false, options),
                field = this._getField([]);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('field', field);
            this.view.render();
            this.view.validate();

            Y.Assert.isFalse(this.view.get('errorStatus'), "No error should be detected");
        },

        "Test validate an empty required field": function () {
            var fieldDefinition = this._getFieldDefinition(true, false, options),
                field = this._getField([]);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('field', field);
            this.view.render();
            this.view.validate();

            Y.Assert.isTrue(!!this.view.get('errorStatus'), "An error should be detected");
        },

        "Test validate a filled not required field": function () {
            var fieldDefinition = this._getFieldDefinition(false, false, options),
                field = this._getField([1]);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('field', field);
            this.view.render();
            this.view.validate();

            Y.Assert.isFalse(this.view.get('errorStatus'), "No error should be detected");
        },

        "Test validate a filled required field": function () {
            var fieldDefinition = this._getFieldDefinition(true, false, options),
                field = this._getField([1]);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('field', field);
            this.view.render();
            this.view.validate();

            Y.Assert.isFalse(this.view.get('errorStatus'), "No error should be detected");
        },

        "Test values attribute with an empty field": function () {
            var fieldDefinition = this._getFieldDefinition(true, false, options),
                field = this._getField([]);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('field', field);

            Y.Assert.isArray(this.view.get('values'), "Values should be an array");
            Y.Assert.areEqual(
                0, this.view.get('values').length, "Values should be an empty array"
            );
        },

        "Test values attribute with a filled field": function () {
            var fieldDefinition = this._getFieldDefinition(true, false, options),
                fieldValue = [1, 5, 6],
                field = this._getField(fieldValue);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('field', field);

            Y.Assert.isArray(this.view.get('values'), "Values should be an array");
            Y.Assert.areEqual(
                fieldValue.length, this.view.get('values').length,
                "Values should contain as many values as the field value"
            );
            
            Y.Array.each(this.view.get('values'), function (val, i) {
                Y.Assert.areEqual(fieldValue[i], options.indexOf(val));
            }, this);
        },
    });


    uiFunctionalTest = new Y.Test.Case({
        name: "eZ Selection View test for UI behavior",

        _getFieldDefinition: function (required, multiple, options) {
            return {
                isRequired: required,
                fieldSettings: {
                    isMultiple: multiple,
                    options: options,
                }
            };
        },

        _getField: function (fieldValues) {
            return {
                fieldValue: fieldValues,
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

            this.view = new Y.eZ.SelectionEditView({
                container: '.container',
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "selection filter view is rendered but hidden": function () {
            var container = this.view.get('container');

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options));
            this.view.render();
            this.view.set('active', true);

            Y.Assert.areEqual(
                options.length, container.all('.ez-selection-options li').size(),
                "The options should be listed in the selection filter list"
            );
            Y.Assert.isTrue(
                container.hasClass('is-list-hidden'),
                "The selection filter should be hidden"
            );
        },

        "filter is disabled if there are less than 5 possible choices": function () {
            var container = this.view.get('container');

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options.slice(0, 4)));
            this.view.render();
            this.view.set('active', true);

            Y.Assert.isTrue(
                container.one('.ez-selection-filter-input').get('disabled'),
                "The selection filter input should be disabled"
            );
        },

        "tap on the selection ui display the selection filter view": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options));
            this.view.render();
            this.view.set('active', true);

            container.one('.ez-selection-values').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isFalse(
                        container.hasClass('is-list-hidden'),
                        "The selection filter should be visible"
                    );

                    Y.Assert.isFalse(
                        container.hasClass('is-top-list'),
                        "The selection filter should appear below the selection UI"
                    );
                });
            });
            this.wait();
        },

        "tap on the selection ui display the selection filter view above if there's not enough space": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options));
            this.view.render();
            this.view.set('active', true);

            container.setStyle('margin-top', '720px');
            container.one('.ez-selection-values').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isFalse(
                        container.hasClass('is-list-hidden'),
                        "The selection filter should be visible"
                    );

                    Y.Assert.isTrue(
                        container.hasClass('is-top-list'),
                        "The selection filter should appear below the selection UI"
                    );
                });
            });
            this.wait();
        },


        "tap on the selection filter while visible hides it": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options));
            this.view.render();
            this.view.set('active', true);
            this.view.set('showSelectionUI', true);

            container.one('.ez-selection-values').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(
                        container.hasClass('is-list-hidden'),
                        "The selection filter should be hidden"
                    );
                });
            });
            this.wait();
        },

        "click outside of the selection ui hides the selection filter": function () {
            var container = this.view.get('container');

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options));
            this.view.render();
            this.view.set('active', true);
            this.view.set('showSelectionUI', true);

            container.simulate('click');
            Y.Assert.isTrue(
                container.hasClass('is-list-hidden'),
                "The selection filter should be hidden"
            );
        },

        "tap on a selected value removes it from the selection": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options));
            this.view.set('field', this._getField([2]));
            this.view.render();
            this.view.set('active', true);

            container.one('.ez-selection-values .ez-selection-value').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        0, this.view.get('values').length,
                        "The selection should be empty"
                    );

                    Y.Assert.areEqual(
                        0, container.all('.ez-selection-values .ez-selection-value').size(),
                        "The selection should be empty in the DOM"
                    );
                });
            });
            this.wait();
        },

        "tap on one selection filter option should select it": function () {
            var container = this.view.get('container'),
                option,
                that = this;

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options));
            this.view.render();
            this.view.set('active', true);
            this.view.set('showSelectionUI', true);


            option = container.one('.ez-selection-options li');
            option.simulateGesture('tap', function () {
                that.resume(function () {
                    var text = option.getAttribute('data-text');

                    Y.Assert.areEqual(
                        1, this.view.get('values').length,
                        "The selection should contain one element"
                    );
                    Y.Assert.areEqual(
                        text, this.view.get('values')[0],
                        "The option should be selected"
                    );
                    Y.Assert.isObject(
                        container.one('.ez-selection-values .ez-selection-value[data-text="' + text + '"]'),
                        "The selection should be visible in the DOM"
                    );
                });
            });
            this.wait();
        },


        "tap on one selection filter option should change the selection": function () {
            var container = this.view.get('container'),
                option,
                that = this;

            this.view.set('fieldDefinition', this._getFieldDefinition(false, false, options));
            this.view.set('field', this._getField([5]));
            this.view.render();
            this.view.set('active', true);
            this.view.set('showSelectionUI', true);


            option = container.one('.ez-selection-options li');
            option.simulateGesture('tap', function () {
                that.resume(function () {
                    var text = option.getAttribute('data-text');

                    Y.Assert.areEqual(
                        1, this.view.get('values').length,
                        "The selection should contain one element"
                    );
                    Y.Assert.areEqual(
                        text, this.view.get('values')[0],
                        "The option should be selected"
                    );
                    Y.Assert.isObject(
                        container.one('.ez-selection-values .ez-selection-value[data-text="' + text + '"]'),
                        "The selection should be visible in the DOM"
                    );

                    Y.Assert.isTrue(
                        container.hasClass('is-list-hidden'),
                        "The selection filter should become hidden"
                    );
                });
            });
            this.wait();
        },

        "tap on one selection filter option should add it to the selection": function () {
            var container = this.view.get('container'),
                option,
                that = this;

            this.view.set('fieldDefinition', this._getFieldDefinition(false, true, options));
            this.view.set('field', this._getField([5]));
            this.view.render();
            this.view.set('active', true);
            this.view.set('showSelectionUI', true);

            option = container.one('.ez-selection-options li');
            option.simulateGesture('tap', function () {
                that.resume(function () {
                    var text = option.getAttribute('data-text');

                    Y.Assert.areEqual(
                        2, this.view.get('values').length,
                        "The selection should contain a new element"
                    );
                    Y.Assert.areEqual(
                        text, this.view.get('values')[1],
                        "The option should be selected"
                    );
                    Y.Assert.isObject(
                        container.one('.ez-selection-values .ez-selection-value[data-text="' + text + '"]'),
                        "The selection should be visible in the DOM"
                    );
                    Y.Assert.isFalse(
                        container.hasClass('is-list-hidden'),
                        "The selection filter should stay visible"
                    );
                });
            });
            this.wait();
        },

        "tap on an already selection option should unselect it": function () {
            var container = this.view.get('container'),
                option,
                that = this;

            this.view.set('fieldDefinition', this._getFieldDefinition(false, true, options));
            this.view.set('field', this._getField([5, 6]));
            this.view.render();
            this.view.set('active', true);
            this.view.set('showSelectionUI', true);

            option = container.one('.ez-selection-options .ez-selection-filter-item-selected');
            option.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        1, this.view.get('values').length,
                        "The selection should contain one element"
                    );
                    Y.Assert.isFalse(
                        container.hasClass('is-list-hidden'),
                        "The selection filter should stay visible"
                    );
                });
            });
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Selection Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(uiFunctionalTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    options: options,
                    isMultiple: true,
                }
            },
            ViewConstructor: Y.eZ.SelectionEditView,

            _setNewValue: function () {
                Y.Array.each(this.newValue, function (val) {
                    this.view._addSelection(val);
                }, this);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.areEqual(options.indexOf(this.newValue[0]), fieldValue[0], msg);
                Y.Assert.areEqual(options.indexOf(this.newValue[1]), fieldValue[1], msg);
            },

            newValue: ['Vergongeat', 'Croix Rousse']
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Selection Edit View registration test";
    registerTest.viewType = Y.eZ.SelectionEditView;
    registerTest.viewKey = "ezselection";
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'node-style', 'node-event-simulate', 'ez-selection-editview']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-fieldeditview-tests', function (Y) {
    var viewTest, descriptionTest, customViewTest, registryTest;

    viewTest = new Y.Test.Case({
        name: "eZ Field Edit View test",

        setUp: function () {
            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Y.Mock();
            this.contentType = new Y.Mock();
            this.version = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });

            this.fieldDefinition = {descriptions: {"eng-GB": "Test description"}};
            this.field = {descriptions: {}};

            this.view = new Y.eZ.FieldEditView({
                container: '.container',
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template has not been used");
            Y.Mock.verify(this.content);
            Y.Mock.verify(this.contentType);
            Y.Mock.verify(this.version);
        },

        "Test available variable in template": function () {
            var that = this;
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(5, Y.Object.keys(variables).length, "The template should receive 5 variables");

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
                    that.fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );
                return '';
            };
            this.view.render();
        },

        "Test error handling": function () {
            var defaultContent = 'default content',
                container = this.view.get('container');

            this.view.render();
            this.view.set('errorStatus', true);

            Y.Assert.isTrue(
                container.hasClass('is-error'),
                "Should set the is-error class on the container when there's an error"
            );
            Y.Assert.areEqual(
                defaultContent,
                container.one('.ez-editfield-error-message').getContent(),
                "Should keep the error placeholder content"
            );

            this.view.set('errorStatus', false);
            Y.Assert.isFalse(
                container.hasClass('is-error'),
                "Should unset the is-error class on the container when there's no error"
            );
            Y.Assert.areEqual(
                defaultContent,
                container.one('.ez-editfield-error-message').getContent(),
                "Should keep the error placeholder content when getting back to the normal state"
            );

        },

        "Test error message handling": function () {
            var msg = 'Error message',
                container = this.view.get('container'),
                defaultContent = 'default content';

            this.view.render();
            this.view.set('errorStatus', msg);

            Y.Assert.isTrue(
                container.hasClass('is-error'),
                "Should set the is-error class on the container when there's an error"
            );
            Y.Assert.areEqual(
                msg,
                container.one('.ez-editfield-error-message').getContent(),
                "Should set the error message in .ez-editfield-error-message element"
            );

            this.view.set('errorStatus', false);
            Y.Assert.isFalse(
                container.hasClass('is-error'),
                "Should unset the is-error class on the container when there's no error"
            );
            Y.Assert.areEqual(
                defaultContent,
                container.one('.ez-editfield-error-message').getContent(),
                "Should restore the error placeholder content"
            );

        },

        "Test isValid": function () {
            this.view.render();

            this.view.set('errorStatus', false);
            Y.Assert.isTrue(this.view.isValid(), "No error, isValid should return true");

            this.view.set('errorStatus', true);
            Y.Assert.isFalse(this.view.isValid(), "isValid should return false");

            this.view.set('errorStatus', "Error message");
            Y.Assert.isFalse(this.view.isValid(), "isValid should return false");
        },

    });

    descriptionTest = new Y.Test.Case({
        name: "eZ Field Edit View tooltip test",

        setUp: function () {
            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Y.Mock();
            this.contentType = new Y.Mock();
            this.version = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });

            this.fieldDefinition = {descriptions: {"eng-GB": "Test description"}};
            this.field = {descriptions: {}};

            this.view = new Y.eZ.FieldEditView({
                container: '.container',
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should show the description when hover the fieldInput": function () {
            var fieldInput, container = this.view.get('container');

            this.view._isTouch = function () { return false; };
            this.view.render();

            fieldInput = container.one('.ez-editfield-input');
            fieldInput.simulate('mouseover');

            Y.Assert.isTrue(
                container.hasClass('is-showing-description'),
                "The description should be shown"
            );
        },

        "Should hide the description when moving the mouse out of the fieldInput": function () {
            var container = this.view.get('container');

            this["Should show the description when hover the fieldInput"]();
            container.one('.ez-editfield-input').simulate('mouseout');

            Y.Assert.isFalse(
                container.hasClass('is-showing-description'),
                "The description should be hidden"
            );
        },

        "Should hide the description when typing the fieldInput": function () {
            var container = this.view.get('container');

            this["Should show the description when hover the fieldInput"]();
            container.one('.ez-editfield-input').simulate('keypress');

            Y.Assert.isFalse(
                container.hasClass('is-showing-description'),
                "The description should be hidden"
            );
        },

        "Should NOT hide the description when typing incorrect values in the fieldInput": function () {
            var container = this.view.get('container');

            this["Should show the description when hover the fieldInput"]();
            this.view.set('errorStatus', 'WRONG');
            container.one('.ez-editfield-input').simulate('keypress');

            Y.Assert.isTrue(
                container.hasClass('is-showing-description'),
                "The description should be shown"
            );
        },

        "Should show the tooltip when tap on the fieldInput with touch devices and hide it when taping outside": function () {
            var container = this.view.get('container'),
                that = this;

            this.view._isTouch = function () { return true; };
            this.view.render();

            container.one('.ez-editfield-input').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-field-description');

                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should be visible before the tap");

                    container.simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.isFalse(tooltip.hasClass("is-visible"), "Tooltip node should NOT be visible after the tap");
                        });
                    });
                    that.wait();
                });
            });
            this.wait();
        },

        "Test tooltip NOT hiding after tapping on the fieldinput": function () {
            var container = this.view.get('container'),
                that = this;

            this.view._isTouch = function () { return true; };
            this.view.render();

            container.one('.ez-editfield-input').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-field-description');

                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should be visible before the tap");

                    container.one('.ez-editfield-input').simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should NOT be visible after the tap");
                        });
                    });
                    that.wait();
                });
            });
            this.wait();
        },

        "Should NOT show the description when hover the fieldInput if _handleFieldDescriptionVisibility flag is not active": function () {
            var fieldInput, container = this.view.get('container');
            this.view._handleFieldDescriptionVisibility = false;
            this.view._isTouch = function () { return false; };
            this.view.render();

            fieldInput = container.one('.ez-editfield-input');
            fieldInput.simulate('mouseover');

            Y.Assert.isFalse(
                container.hasClass('is-showing-description'),
                "The description should be shown"
            );
        },

        "Should NOT hide the description when moving out of the fieldInput if _handleFieldDescriptionVisibility is not active": function () {
            var container = this.view.get('container');

            this["Should show the description when hover the fieldInput"]();
            this.view._handleFieldDescriptionVisibility = false;
            this.view.render();
            container.one('.ez-editfield-input').simulate('mouseout');

            Y.Assert.isTrue(
                container.hasClass('is-showing-description'),
                "The description should be hidden"
            );
        },

        "Should not show tooltip if description is empty": function () {
            var container = this.view.get('container'), that = this;
            this.view._isTouch = function () { return true; };
            this.view = new Y.eZ.FieldEditView({
                container: '.container',
                fieldDefinition: {},
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType
            });
            this.view.set('errorStatus', false);
            this.view.render();
            this.view.set('errorStatus', false);

            container.one('.ez-editfield-input').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddescription-tooltip');

                    Y.Assert.isNull(tooltip, "Tooltip node should not exist");

                });
            });
            container.one('.ez-editfield-input').simulate('keypress');
            Y.Assert.isFalse(
                container.hasClass('is-showing-description'),
                "The description should be hidden"
            );
            Y.Assert.isNull(container.one('.ez-fielddescription-tooltip'), "Tooltip node should not exist");
            that.wait();
        },
    });

    customViewTest = new Y.Test.Case({
        name: "Custom eZ Field Edit View test",

        setUp: function () {
            var CustomView, that = this;

            this.fieldValue = "field value";
            CustomView = Y.Base.create('customView', Y.eZ.FieldEditView, [], {
                _variables: function () {
                    return {
                        'foo': 'bar',
                        'ez': 'publish'
                    };
                },

                _getFieldValue: function () {
                    return that.fieldValue;
                },
            });

            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.mainLanguageCode = 'eng-GB';
            this.languageCode = 'pol-PL';
            this.content = new Y.Mock();
            this.contentType = new Y.Mock();
            this.version = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.mainLanguageCode
            });
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });

            this.fieldDefinition = {descriptions: {"eng-GB": "Test description"}};
            this.field = {
                fieldValue: this.fieldValue,
                descriptions: {},
            };

            this.view = new CustomView({
                container: '.container',
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                languageCode: this.languageCode
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test available variable in template": function () {
            var that = this;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(7, Y.Object.keys(variables).length, "The template should receive 7 variables");

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
                    that.fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );

                Y.Assert.areEqual(
                    'bar', variables.foo,
                    "The bar variable should be available"
                );
                Y.Assert.areEqual(
                    'publish', variables.ez,
                    "The ez variable should be available"
                );
                return '';
            };
            this.view.render();
        },

        "getField should return a clone of the field": function () {
            var updatedField = this.view.getField();

            Y.Assert.areNotSame(
                this.field, updatedField,
                "getField should 'clone' the field"
            );
            Y.Assert.areEqual(
                this.fieldValue,
                updatedField.fieldValue,
                "The field value should be kept"
            );
        },

        "getField should return undefined if _getFieldValue returns undefined": function () {
            var updatedField;

            this.fieldValue = undefined;
            updatedField = this.view.getField();
            Y.Assert.isUndefined(updatedField, "The field should be undefined");
        },

        "getField should set content's mainLanguageCode as field's languageCode if field is not translatable": function () {
            var updatedField;

            this.view.set('fieldDefinition', {descriptions: {"eng-GB": "Test description"}, isTranslatable: false});
            updatedField = this.view.getField();
            Y.Assert.areSame(
                updatedField.languageCode,
                this.mainLanguageCode,
                "The languageCode should be the same as mainLanguageCode of edited content"
            );
        },

        "getField should set given languageCode as field's languageCode if field is translatable": function () {
            var updatedField;

            this.view.set('fieldDefinition', {descriptions: {"eng-GB": "Test description"}, isTranslatable: true});
            updatedField = this.view.getField();
            Y.Assert.areSame(
                updatedField.languageCode,
                this.languageCode,
                "The languageCode should be the same as languageCode given to the edit view"
            );
        },
    });

    registryTest = new Y.Test.Case({
        name: "eZ Field Edit View registry test",

        "Test register and get": function () {
            var editView = function () { },
                identifier = 'ez-foo-bar-edit-view',
                err = false;

            Y.eZ.FieldEditView.registerFieldEditView(identifier, editView);
            try {
                Y.Assert.areSame(
                    editView,
                    Y.eZ.FieldEditView.getFieldEditView(identifier),
                    "Should return the constructor function of the edit view"
                );
            } catch(e) {
                err = true;
            }

            Y.Assert.isFalse(err, "No error should have been thrown");
        },

        "Test inexistant field edit view": function () {
            var err = false, exception = false;

            try {
                Y.eZ.FieldEditView.getFieldEditView('ez-does-not-exist');
            } catch(e) {
                exception = e;
                err = true;
            }

            Y.Assert.isTrue(err, "An error should have been thrown");
            Y.Assert.isInstanceOf(TypeError, exception, "Shoud throw a TypeError");
        },

        "Test register wrong type": function () {
            var err = false, exception = false;

            Y.eZ.FieldEditView.registerFieldEditView('ez-wrong-type', 'wrongtype');
            try {
                Y.eZ.FieldEditView.getFieldEditView('ez-wrong-type');
            } catch(e) {
                exception = e;
                err = true;
            }

            Y.Assert.isTrue(err, "An error should have been thrown");
            Y.Assert.isInstanceOf(TypeError, exception, "Shoud throw a TypeError");
        }
    });

    Y.Test.Runner.setName("eZ Field Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(descriptionTest);
    Y.Test.Runner.add(customViewTest);
    Y.Test.Runner.add(registryTest);

}, '', {requires: ['test', 'node-event-simulate', 'ez-fieldeditview']});

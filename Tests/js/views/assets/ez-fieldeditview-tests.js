/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-fieldeditview-tests', function (Y) {
    var viewTest, tooltipTest, customViewTest, registryTest;

    function initTooltipPartial() {
        Y.Template.register(
            'fieldinfo-tooltip-ez-partial', Y.one('#ezFieldinfoTooltip').getHTML()
        );
    }

    function destroyTooltipPartial () {
        Y.Handlebars.registerPartial('ez_fieldinfo_tooltip', undefined);
        Y.Template.register('fieldinfo-tooltip-ez-partial', undefined);
    }

    viewTest = new Y.Test.Case({
        name: "eZ Field Edit View test",

        init: initTooltipPartial,
        destroy: destroyTooltipPartial,

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

    tooltipTest = new Y.Test.Case({
        name: "eZ Field Edit View tooltip test",

        init: initTooltipPartial,
        destroy: destroyTooltipPartial,

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

        "Test tooltip appearing after tapping on the info icon and hiding after tapping somewhere outside of the tooltip": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip');

                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should be visible before the tap");
                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should be displayed inside DOM before the tap");

                    container.simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.isFalse(tooltip.hasClass("is-visible"), "Tooltip node should NOT be visible after the tap");
                            Y.Assert.isFalse(tooltip.hasClass("is-displayed"), "Tooltip node should NOT be displayed inside DOM after the tap");
                        });
                    });

                    that.wait();
                });
            });
            this.wait();
        },

        "Test tooltip NOT hiding after tapping on the tooltip itself or the info element": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip'),
                        infoElement = container.one('.ez-editfield-i');

                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should be visible before tapping");
                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should be displayed inside DOM before tapping");

                    tooltip.simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should remain visible");
                            Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should remain displayed inside DOM");

                            infoElement.simulateGesture('tap', {point: [5, 5]}, function () {
                                that.resume(function () {
                                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should remain visible");
                                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should remain displayed inside DOM");
                                });
                            });
                            that.wait();
                        });
                    });
                    that.wait();
                });
            });
            this.wait();
        },

        "Test tooltip hiding after clicking on the tooltip's 'Close' element": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip');

                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should be visible before receiving the event");
                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should be displayed inside DOM before receiving the event");

                    tooltip.one('.ez-fielddefinition-tooltip-close').simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.isFalse(tooltip.hasClass("is-visible"), "Tooltip node should NOT be visible");
                            Y.Assert.isFalse(tooltip.hasClass("is-displayed"), "Tooltip node should NOT be displayed inside DOM");
                        });
                    });
                    that.wait();
                });
            });
            this.wait();
        },

        "Test tooltip keeping it's tail up by default": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip');
                    Y.Assert.isTrue(tooltip.hasClass("ez-tail-up-tooltip"), "Tooltip should be into tail-up state by default");
                    Y.Assert.isFalse(tooltip.hasClass("ez-tail-down-tooltip"), "Tooltip should not be into tail-down state");
                });
            });
            this.wait();
        },

        "Test tooltip changing it's state to tail-down, when there is not enough space for the default one": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.setY(800);

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip');
                    Y.Assert.isTrue(tooltip.hasClass("ez-tail-down-tooltip"), "Tooltip should have changed into tail-down state");
                    Y.Assert.isFalse(tooltip.hasClass("ez-tail-up-tooltip"), "Tooltip should not be into the tail-up state");
                });
            });
            that.wait();
        },

        "Test tooltip changing it's state to tail-up from tail-down successfully": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.setY(800);

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip');
                    Y.Assert.isTrue(tooltip.hasClass("ez-tail-down-tooltip"), "Tooltip should have changed into tail-down state");
                    Y.Assert.isFalse(tooltip.hasClass("ez-tail-up-tooltip"), "Tooltip should not be into the tail-up state");

                    container.setY(0);
                    container.one('.ez-editfield-i').simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.isTrue(tooltip.hasClass("ez-tail-up-tooltip"), "Tooltip should have changed into the tail-up state");
                            Y.Assert.isFalse(tooltip.hasClass("ez-tail-down-tooltip"), "Tooltip should not be into the tail-down state");
                        });
                    });
                    that.wait();
                });
            });
            that.wait();
        }

    });

    customViewTest = new Y.Test.Case({
        name: "Custom eZ Field Edit View test",

        init: initTooltipPartial,
        destroy: destroyTooltipPartial,

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
                contentType: this.contentType
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
    Y.Test.Runner.add(tooltipTest);
    Y.Test.Runner.add(customViewTest);
    Y.Test.Runner.add(registryTest);

}, '', {requires: ['test', 'node-event-simulate', 'ez-fieldeditview']});

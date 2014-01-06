YUI.add('ez-fieldeditview-tests', function (Y) {
    var container, content, contentType,
        jsonContent = {}, jsonContentType = {},
        fieldDefinition = {
            descriptions: {
                "eng-GB": "Test description"
            }
        },
        fieldDefinitionWithBuggyDescription = {
        },
        field = {
            descriptions: {}
        },
        viewTest, customViewTest, registryTest;

    content = new Y.Mock();
    contentType = new Y.Mock();
    Y.Mock.expect(content, {
        method: 'toJSON',
        returns: jsonContent
    });
    Y.Mock.expect(contentType, {
        method: 'toJSON',
        returns: jsonContentType
    });

    viewTest = new Y.Test.Case({
        name: "eZ Field Edit View test",

        setUp: function () {

            Y.one('body').append('<div class="container"></div>');
            container = Y.one('.container');

            this.view = new Y.eZ.FieldEditView({
                container: container,
                fieldDefinition: fieldDefinition,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy({remove: true});
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
            Y.Mock.verify(content);
            Y.Mock.verify(contentType);
        },

        "Test available variable in template": function () {
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(4, Y.Object.keys(variables).length, "The template should receive 4 variables");

                Y.Assert.areSame(
                     jsonContent, variables.content,
                    "The content should be available in the field edit view template"
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
                return '';
            };
            this.view.render();
        },

        "Test error handling": function () {
            var defaultContent = 'default content';

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

        "Test tooltip node creation after tapping on the info icon": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip');
                    Y.Assert.isObject(tooltip, "Tooltip node should have been created");
                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should be visible");
                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should be displayed inside DOM");
                });
            });
            this.wait();
        },

        "Test tooltip hiding after receiving globally broadcasted 'contentEditViewTap' event": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip'),
                        tapEvent = {target: container};

                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should be visible before receiving the event");
                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should be displayed inside DOM before receiving the event");
                    Y.fire('contentEditViewTap', tapEvent);
                    Y.Assert.isFalse(tooltip.hasClass("is-visible"), "Tooltip node should NOT be visible after receiving the event");
                    Y.Assert.isFalse(tooltip.hasClass("is-displayed"), "Tooltip node should NOT be displayed inside DOM after receiving the event");
                });
            });
            this.wait();
        },

        "Test tooltip NOT hiding after receiving 'contentEditViewTap' which targets the tooltip itself or the info element": function () {
            var that = this,
                container = this.view.get('container');

            this.view.render();

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    var tooltip = container.one('.ez-fielddefinition-tooltip'),
                        tapEvent = {target: tooltip.one('.ez-fielddefinition-tooltip-text')};

                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should be visible before receiving the event");
                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should be displayed inside DOM before receiving the event");

                    Y.fire('contentEditViewTap', tapEvent);
                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should remain visible");
                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should remain displayed inside DOM");

                    tapEvent = {target: container.one('.ez-editfield-i')};
                    Y.fire('contentEditViewTap', tapEvent);
                    Y.Assert.isTrue(tooltip.hasClass("is-visible"), "Tooltip node should remain visible");
                    Y.Assert.isTrue(tooltip.hasClass("is-displayed"), "Tooltip node should remain displayed inside DOM");
                });
            });
            this.wait();
        },

        "Test tooltip is handling 'contentEditViewTap' event correctly even if tooltip is not visible": function () {
            var tapEvent = {target: this.view.get('container')};

            this.view.render();
            Y.fire('contentEditViewTap', tapEvent);

            Y.Assert.isTrue(true, "No errors should have been thrown");
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

            console.log('view', this.view);
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
        },


        "Test that tooltip is not created, when no description is received from the field definition": function () {
            var that = this,
                container = this.view.get('container'),
                tooltip;

            this.view.set('fieldDefinition', fieldDefinitionWithBuggyDescription);
            this.view.render();

            container.one('.ez-editfield-i').simulateGesture('tap', function () {
                that.resume(function () {
                    tooltip = container.one('.ez-fielddefinition-tooltip');
                    Y.Assert.isNull(tooltip, "Tooltip node should not have been created");
                });
            });
            this.wait();
        }



    });

    customViewTest = new Y.Test.Case({
        name: "Custom eZ Field Edit View test",

        setUp: function () {
            Y.one('body').append('<div class="container"></div>');
            container = Y.one('.container');

            var CustomView = Y.Base.create('customView', Y.eZ.FieldEditView, [], {
                _variables: function () {
                    return {
                        'foo': 'bar',
                        'ez': 'publish'
                    };
                }
            });
            this.view = new CustomView({
                container: container,
                fieldDefinition: fieldDefinition,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy({remove: true});
        },

        "Test available variable in template": function () {
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(6, Y.Object.keys(variables).length, "The template should receive 6 variables");

                Y.Assert.areSame(
                     jsonContent, variables.content,
                    "The content should be available in the field edit view template"
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
        }
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
    Y.Test.Runner.add(customViewTest);
    Y.Test.Runner.add(registryTest);

}, '0.0.1', {requires: ['test', 'node-event-simulate', 'node-style', 'ez-fieldeditview']});

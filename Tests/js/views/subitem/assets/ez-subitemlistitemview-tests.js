/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistitemview-tests', function (Y) {
    var renderTest, propertiesTest, priorityUpdateTest,
        Assert = Y.Assert, Mock = Y.Mock;

    function createModelMock(name) {
        var jsonName = name + 'JSON';

        this[name] = new Mock();
        this[jsonName] = {};

        Mock.expect(this[name], {
            method: 'toJSON',
            returns: this[jsonName],
        });
        return this[name];
    }

    renderTest = new Y.Test.Case({
        name: "eZ Subitem List View render test",

        _createModelMock: createModelMock,

        setUp: function () {
            this._createModelMock('location');
            this._createModelMock('content');
            this._createModelMock('contentType');
            this.view = new Y.eZ.SubitemListItemView({
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                displayedProperties: [],
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should render the view with the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have been used to render the view");
        },

        "Should pass variables to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    4, Y.Object.size(vars),
                    "The template should receive 4 variables"
                );
                Assert.areSame(
                    this.locationJSON,
                    vars.location,
                    "The jsonified Location should be passed to the template"
                );
                Assert.areSame(
                    this.contentJSON,
                    vars.content,
                    "The jsonified Location should be passed to the template"
                );
                Assert.areSame(
                    this.contentTypeJSON,
                    vars.contentType,
                    "The jsonified Location should be passed to the template"
                );
                Assert.isArray(
                    vars.properties,
                    "The properties should be an array"
                );
                Assert.areEqual(
                    0, vars.properties,
                    "The properties should be empty"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },
    });

    propertiesTest = new Y.Test.Case({
        name: "eZ Subitem List View properties test",

        _createModelMock: createModelMock,

        setUp: function () {
            this._createModelMock('location');
            this._createModelMock('content');
            this._createModelMock('contentType');
            this.view = new Y.eZ.SubitemListItemView({
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                displayedProperties: [],
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testProperty: function (propIdentifier, assert) {
            var origTpl;

            origTpl = this.view.template;
            this.view.set('displayedProperties', [propIdentifier]);
            this.view.template = Y.bind(function (vars) {
                var property = vars.properties[0],
                    customClass = "ez-subitemlistitem-" + propIdentifier.toLowerCase();

                Assert.isObject(
                    property,
                    "The property should be an object"
                );
                Assert.areEqual(
                    propIdentifier, property.identifier,
                    "The identifier should be available in the property object"
                );
                Assert.isTrue(
                    property['class'].indexOf(customClass) != -1,
                    "The `class` entry should contain a class based on the property identifier"
                );
                Assert.isTrue(
                    property['class'].indexOf('ez-subitemlistitem-cell') != -1,
                    "The `class` entry should contain the generic class"
                );
                assert.call(this, property);
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should extract a content attribute": function () {
            var attr = 'contentAttribute',
                attrValue = 42;

            Mock.expect(this.content, {
                method: 'get',
                args: [attr],
                returns: attrValue,
            });
            this.view.get('availableProperties')[attr] = {
                extractor: '_getContentAttribute',
            };

            this._testProperty(attr, function (property) {
                Assert.areEqual(
                    attrValue, property.value,
                    "The property object should contain the value"
                );
            });
        },

        "Should extract a location attribute": function () {
            var attr = 'locationAttribute',
                attrValue = 42;

            Mock.expect(this.location, {
                method: 'get',
                args: [attr],
                returns: attrValue,
            });
            this.view.get('availableProperties')[attr] = {
                extractor: '_getLocationAttribute',
            };

            this._testProperty(attr, function (property) {
                Assert.areEqual(
                    attrValue, property.value,
                    "The property object should contain the value"
                );
            });
        },

        "Should extract the content type name": function () {
            var attr = 'names',
                typeNames = {
                    'eng-GB': 'Potatoe',
                    'fre-FR': 'Pomme de terre',
                    'bressab-BR': 'Quatrouille',
                };

            Mock.expect(this.contentType, {
                method: 'get',
                args: [attr],
                returns: typeNames,
            });
            this.view.get('availableProperties')[attr] = {
                extractor: '_getContentTypeName',
            };

            this._testProperty(attr, function (property) {
                Assert.areEqual(
                    typeNames['eng-GB'], property.value,
                    "The property object should contain the value"
                );
            });
        },

        "Should extract the translations": function () {
            var attr = 'translations',
                version = new Mock(),
                translations = ['fre-FR', 'eng-GB'];

            Mock.expect(this.content, {
                method: 'get',
                args: ['currentVersion'],
                returns: version,
            });
            Mock.expect(version, {
                method: 'getTranslationsList',
                returns: translations,
            });
            this.view.get('availableProperties')[attr] = {
                extractor: '_getTranslations',
            };

            this._testProperty(attr, function (property) {
                Assert.areSame(
                    translations, property.value,
                    "The property object should contain the value"
                );
            });
        },

        "Should allow an inline function as extractor": function () {
            var attr = 'inlineExtractor',
                title = 'Stererophonics - Too many sandwiches',
                view = this.view;

            this.view.get('availableProperties')[attr] = {
                extractor: function (propIdentifier) {
                    Assert.areEqual(
                        attr, propIdentifier,
                        "The extractor should receive the property identifier"
                    );
                    Assert.areSame(
                        view, this,
                        "The extractor should be bound to the view"
                    );
                    return title;
                }
            };

            this._testProperty(attr, function (property) {
                Assert.areEqual(
                    title, property.value,
                    "The property object should contain the value returned by the extractor"
                );
            });
        },

        "Should format a date value": function () {
            var attr = 'formatDate',
                localeDate = 'locale date',
                localeTime = 'locale time',
                date = new Mock(); // PhantomJS 1.9 does not suppoer toLocaleDateString/toLocaleTimeString...

            Mock.expect(date, {
                method: 'toLocaleDateString',
                args: ['en', Mock.Value.Object],
                returns: localeDate,
            });
            Mock.expect(date, {
                method: 'toLocaleTimeString',
                args: ['en', Mock.Value.Object],
                returns: localeTime,
            });

            this.view.get('availableProperties')[attr] = {
                extractor: function (propIdentifier) {
                    return date;
                },
                formatter: '_formatDate',
            };

            this._testProperty(attr, function (property) {
                Assert.areEqual(
                    localeDate + ' ' + localeTime,
                    property.value,
                    "The date should have been formatted"
                );
                Mock.verify(date);
            });
        },

        "Should format the translations list": function () {
            var attr = 'formatTranslations',
                translations = ['fre-FR', 'eng-GB'];

            this.view.get('availableProperties')[attr] = {
                extractor: function (propIdentifier) {
                    return translations;
                },
                formatter: '_formatTranslations',
            };

            this._testProperty(attr, function (property) {
                Assert.areEqual(
                    translations.join(', '), property.value,
                    "The translations array should have been joined"
                );
            });
        },

        "Should allow an inline function as a formatter": function () {
            var attr = 'inlineFormatter',
                title = 'Stererophonics - Maybe tomorrow',
                title2 = 'Stererophonics - I wouldn\'t believe your radio',
                view = this.view;

            this.view.get('availableProperties')[attr] = {
                extractor: function (propIdentifier) {
                    return title;
                },
                formatter: function (property) {
                    Assert.isObject(
                        property,
                        "The formatter should have received the property object"
                    );
                    Assert.areEqual(
                        title, property.value,
                        "The property object should have the value returned by the extractor"
                    );
                    Assert.areSame(
                        view, this,
                        "The formatter should be bound to the view"
                    );
                    return title2;
                },
            };

            this._testProperty(attr, function (property) {
                Assert.areEqual(
                    title2, property.value,
                    "The property object should contain the value returned by the formatter"
                );
            });
        },

        "Should render the property with the template": function () {
            var attr = 'template',
                tplId = 'test-template',
                title = 'Stererophonics - Check my eyelids for holes',
                rendered = 'Played ' + title;

            Y.Template.register(tplId, Y.bind(function (vars) {
                Assert.areSame(
                    this.locationJSON,
                    vars.location,
                    "The location should be available in the template"
                );
                Assert.areSame(
                    this.contentJSON,
                    vars.content,
                    "The content should be available in the template"
                );
                Assert.areSame(
                    this.contentTypeJSON,
                    vars.contentType,
                    "The contentType should be available in the template"
                );
                
                return rendered;
            }, this));
            this.view.get('availableProperties')[attr] = {
                extractor: function (propIdentifier) {
                    return title;
                },
                template: 'test-template',
            };

            this._testProperty(attr, function (property) {
                Assert.areEqual(
                    rendered, property.rendered,
                    "The property object should have the rendered property"
                );
            });
        },
    });


    priorityUpdateTest = new Y.Test.Case({
        name: "eZ Subitem List View priority update test",

        _createModelMock: createModelMock,

        setUp: function () {
            var testTemplateId = 'test-template',
                engine = new Y.Template(Y.Handlebars),
                tplContent = Y.one('#priority-tpl').getContent();

            this._createModelMock('location');
            this._createModelMock('content');
            this._createModelMock('contentType');

            this.priority = 42;
            Mock.expect(this.location, {
                method: 'get',
                args: ['priority'],
                returns: this.priority,
            });

            Y.Template.register(testTemplateId, engine.compile(tplContent));

            this.view = new Y.eZ.SubitemListItemView({
                container: '.container',
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                displayedProperties: ['priority'],
            });
            this.view.get('availableProperties').priority.template = testTemplateId;
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getPriorityCell: function () {
            return this.view.get('container').one('.ez-subitemlistitem-priority');
        },

        _getInput: function () {
            return this._getPriorityCell().one('.ez-subitem-priority-input');
        },

        "Should display the edit icon on mouseover": function () {
            var cell = this._getPriorityCell();

            cell.simulate('mouseover');

            Assert.isTrue(
                cell.hasClass('ez-subitem-hovered-priority-cell'),
                "The edit icon should have been shown"
            );
        },

        "Should not display the edit icon if canEditPriority is false": function () {
            var cell = this._getPriorityCell();

            this.view.set('canEditPriority', false);
            cell.simulate('mouseover');

            Assert.isFalse(
                cell.hasClass('ez-subitem-hovered-priority-cell'),
                "The edit icon should have stayed hidden"
            );
        },

        "Should hide edit icon while moving the mouse out of the input": function () {
            var cell = this._getPriorityCell();

            this["Should display the edit icon on mouseover"]();
            cell.simulate('mouseout');

            Assert.isFalse(
                cell.hasClass('ez-subitem-hovered-priority-cell'),
                "The edit icon should be hidden"
            );
        },

        "Should set editingPriority to true on tap on the cell": function () {
            this._getPriorityCell().simulateGesture('tap', this.next(function () {
               Assert.isTrue(
                   this.view.get('editingPriority'),
                   "The editingPriority attribute should be true"
               );
            }, this));
            this.wait();
        },

        "Should keep editingPriority to false": function () {
            this.view.set('canEditPriority', false);
            this._getPriorityCell().simulateGesture('tap', this.next(function () {
               Assert.isFalse(
                   this.view.get('editingPriority'),
                   "The editingPriority attribute should be false"
               );
            }, this));
            this.wait();
        },


        "Should display priority buttons": function () {
            var cell = this._getPriorityCell(),
                input = this._getInput();

            this.view.set('editingPriority', true);
            Assert.isTrue(
                cell.hasClass("ez-subitem-selected-priority-cell"),
                "Validate and Cancel buttons should be visible"
            );
            Assert.isFalse(
                input.hasAttribute('readonly'),
                "The input should NOT be readonly anymore"
            );
        },

        "Should hide priority buttons": function () {
            var cell = this._getPriorityCell(),
                input = this._getInput();

            this["Should display priority buttons"]();
            this.view.set('editingPriority', false);
            Assert.isFalse(
                cell.hasClass("ez-subitem-selected-priority-cell"),
                "Validate and Cancel buttons should not be visible"
            );
            Assert.isTrue(
                input.hasAttribute('readonly'),
                "The input should be readonly"
            );
        },

        "Should restore the priority cell on cancel": function () {
            var input = this._getInput(),
                cancelButton = this.view.get('container').one('.ez-subitem-priority-cancel');

            this.view.set('editingPriority', true);
            input.set('value', 69);
            cancelButton.simulateGesture('tap', this.next(function () {
                Assert.isFalse(
                    this.view.get('editingPriority'),
                    "The editingPriority should be set back to false"
                );
                Assert.areEqual(
                    this.priority,
                    input.get('value'),
                    "The input value should be set back to it's original value"
                );
            }, this));
            this.wait();
        },

        "Should display an error icon if priority input is invalid": function () {
            var input = this._getInput(),
                cell = this._getPriorityCell();

            this.view.set('editingPriority', true);
            input.set('value', 'BAD PRIORITY');
            input.simulate('blur');
            Assert.isTrue(
                cell.hasClass('ez-subitem-error-priority-cell'),
                "The priority cell should get the error class"
            );
            Assert.isFalse(
                cell.hasClass('ez-subitem-selected-priority-cell'),
                "The selected class should have been removed"
            );
        },

        "Should ignore validation error if not editing": function () {
            // the blur event might be fired even if the input is readonly
            var input = this._getInput(),
                cell = this._getPriorityCell();

            input.set('value', 'BAD PRIORITY');
            input.simulate('blur');
            Assert.isFalse(
                cell.hasClass('ez-subitem-error-priority-cell'),
                "The priority cell should not get the error class"
            );
        },

        "Should hide the error icon if priority input is valid": function () {
            var input = this._getInput(),
                cell = this._getPriorityCell();

            this["Should display an error icon if priority input is invalid"]();
            input.set('value', 50);
            input.simulate('blur');
            Assert.isFalse(
                cell.hasClass('ez-subitem-error-priority-cell'),
                "The priority cell should not have the error class"
            );
            Assert.isTrue(
                cell.hasClass('ez-subitem-selected-priority-cell'),
                "The selected class should have been added"
            );
        },

        "Should fire updatePriority when form is submited": function () {
            var updatePriorityFired = false,
                priority = 1,
                input = this._getInput(),
                form = this.view.get('container').one('form');

            input.set('value', priority);
            this.view.on('updatePriority', function (e) {
                Assert.areSame(
                    this.get('location'),
                    e.location,
                    "The Location should be provided in the event facade"
                );
                Assert.areEqual(
                    priority,
                    e.priority,
                    "The priority should be provided in the event facade"
                );
                updatePriorityFired = true;
            });

            form.simulate('submit');
            Assert.isTrue(
                updatePriorityFired,
                "The updatePriority event should have been fired"
            );
        },

        "Should set editingPriority to false when form is submited": function () {
            var form = this.view.get('container').one('form');

            form.simulate('submit');
            Assert.isFalse(
                this.view.get('editingPriority'),
                "The editingPriority should be false"
            );
        },
    });

    Y.Test.Runner.setName("eZ Subitem List View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(propertiesTest);
    Y.Test.Runner.add(priorityUpdateTest);
}, '', {requires: ['test', 'template', 'handlebars', 'node-event-simulate', 'ez-subitemlistitemview']});

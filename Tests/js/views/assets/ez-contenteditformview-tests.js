/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditformview-tests', function (Y) {
    var viewTest, isValidTest, getFieldsTest, activeFlagTest, haltSubmitTest, incosistencyFieldsTest,
        setVersionTest, setServerSideErrorsTest, translatingTest,
        Assert = Y.Assert, Mock = Y.Mock;

    viewTest = new Y.Test.Case({
        name: "eZ Content Edit Form View test",

        setUp: function () {
            Y.eZ.FieldEditView.registerFieldEditView('test1', Y.Base.create('test1FieldEditView', Y.View, [], {
                initializer: function () {
                    Assert.areSame(
                        viewTest.config,
                        this.get('config'),
                        "The field edit view should receive the config"
                    );
                },

                render: function () {
                    this.get('container').setContent('test1 rendered');
                    this.fire('test1Event');
                    return this;
                }
            }));

            Y.eZ.FieldEditView.registerFieldEditView('test2', Y.Base.create('test2FieldEditView', Y.View, [], {
                initializer: function () {
                    Assert.areSame(
                        viewTest.config,
                        this.get('config'),
                        "The field edit view should receive the config"
                    );
                },

                render: function () {
                    this.get('container').setContent('test2 rendered');
                    return this;
                }
            }));

            this.contentType = new Y.Mock();
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.config = {};

            Y.Mock.expect(this.contentType, {
                method: 'getFieldGroups',
                returns: [{
                    fieldGroupName: "testfieldgroup",
                    fieldDefinitions: []
                }]
            });

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: {
                    'id1': {
                        'identifier': 'id1',
                        'fieldType': 'test1',
                        'fieldGroup': 'testfieldgroup',
                    },
                    'id2': {
                        'identifier': 'id2',
                        'fieldType': 'test2',
                        'fieldGroup': 'testfieldgroup',
                    },
                    'id3': {
                        'identifier': 'id3',
                        'fieldType': 'unsupported',
                        'fieldGroup': 'testfieldgroup',
                    }
                }
            });

            this.languageCode = 'fre-FR';
            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String, this.languageCode],
                run: function (id, languageCode) {
                    return {
                        'identifier': id
                    };
                }
            });

            Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.languageCode
            });

            this.view = new Y.eZ.ContentEditFormView({
                container: '.container',
                contentType: this.contentType,
                content: this.content,
                languageCode: this.languageCode,
                version: this.version,
                config: this.config
            });
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.FieldEditView.registerFieldEditView('test1', undefined);
            Y.eZ.FieldEditView.registerFieldEditView('test2', undefined);
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
            Y.Assert.isTrue(templateCalled, "The template should have used to render the view");

            Y.Assert.isTrue(
                this.view.get('container').getContent().indexOf('test1 rendered') !== -1,
                "Test1FieldEditView should have been rendered"
            );
            Y.Assert.isTrue(
                this.view.get('container').getContent().indexOf('test2 rendered') !== -1,
                "Test2FieldEditView should have been rendered"
            );
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template;
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(1, Y.Object.keys(variables).length, "The template should receive 1 variable");
                Y.Assert.isObject(variables.fieldGroups, "fieldGroup should be available in the template and should be an object");

                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Should add the form view as a bubble target of the field edit view": function () {
            var bubble = false;

            this.view.on('*:test1Event', function () {
                bubble = true;
            });
            this.view.render();

            Y.Assert.isTrue(bubble, "The field edit view event should bubble to the form view");
        },

        "Should collapse and remove collapsing of a fieldset once repeatedly tapped": function () {
            var fieldGroupName, fieldGroupFields, that = this;

            this.view.render();

            fieldGroupName = Y.one('.fieldgroup-name');
            fieldGroupFields = fieldGroupName.get('parentNode').one('.fieldgroup-fields');

            fieldGroupName.simulateGesture('tap', function () {
                that.resume(function () {

                    that.wait(function () {
                        Y.assert(
                            parseInt(fieldGroupFields.getComputedStyle('height'), 10) === 0,
                            "On first tap field group fields should collapse"
                        );

                        Y.Assert.areEqual(
                            "hidden", fieldGroupFields.getStyle('overflow'),
                            "The overflow should be hidden"
                        );

                        fieldGroupName.simulateGesture('tap', function () {
                            that.resume(function () {
                                that.wait(function () {
                                    Y.assert(
                                        parseInt(fieldGroupFields.getComputedStyle('height'), 10) !== 0,
                                        "On second tap field group should get an automatic height"
                                        );
                                }, 500);
                            });
                        });
                        that.wait();
                    }, 500);
                });
            });
            this.wait();
        },
    });

    isValidTest = new Y.Test.Case({
        name: "eZ Content Edit Form View isValid test",

        setUp: function () {
            var that = this;

            this.contentType = new Y.Mock();
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.config = {
                fieldEditViews: {
                    something: 'hello'
                }
            };

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: {
                    'id1': {
                        'identifier': 'id1',
                        'fieldType': 'test1',
                        'fieldGroup': 'testfieldgroup',
                    },
                    'id2': {
                        'identifier': 'id2',
                        'fieldType': 'test2',
                        'fieldGroup': 'testfieldgroup',
                    }
                }
            });
            that.test1ValidateCalled = false;
            that.test2ValidateCalled = false;
            Y.eZ.FieldEditView.registerFieldEditView('test1', Y.Base.create('fieldEdit1', Y.eZ.FieldEditView, [], {
                validate: function () {
                    that.test1ValidateCalled = true;
                },

                isValid: function () {
                    return that.test1Valid;
                }
            }));
            Y.eZ.FieldEditView.registerFieldEditView('test2', Y.Base.create('fieldEdit2', Y.eZ.FieldEditView, [], {
                validate: function () {
                    that.test2ValidateCalled = true;
                },

                isValid: function () {
                    return that.test2Valid;
                }
            }));

            this.languageCode = 'fre-FR';
            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String, this.languageCode],
                run: function (id) {
                    return {
                        'identifier': id
                    };
                }
            });

            Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.languageCode
            });

            this.view = new Y.eZ.ContentEditFormView({
                contentType: this.contentType,
                version: this.version,
                content: this.content,
                languageCode: this.languageCode,
                config: this.config
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.eZ.FieldEditView.registerFieldEditView('test1', undefined);
            Y.eZ.FieldEditView.registerFieldEditView('test2', undefined);
        },

        "Should return the validity of the form": function () {
            this.test1Valid = true;
            this.test2Valid = true;

            Y.Assert.isTrue(this.view.isValid(), "The form validity should be true");
            Y.Assert.isTrue(
                this.test1ValidateCalled && this.test2ValidateCalled,
                "The validate() of all views should have been called"
            );
        },

        "Should return the validity of the form (2)": function () {
            this.test1Valid = true;
            this.test2Valid = false;

            Y.Assert.isFalse(this.view.isValid(), "The form validity should be false");
            Y.Assert.isTrue(
                this.test1ValidateCalled && this.test2ValidateCalled,
                "The validate() of all views should have been called"
            );
        },

        "Should return the validity of the form (3)": function () {
            this.test1Valid = false;
            this.test2Valid = true;

            Y.Assert.isFalse(this.view.isValid(), "The form validity should be false");
            Y.Assert.isTrue(
                this.test1ValidateCalled && this.test2ValidateCalled,
                "The validate() of all views should have been called"
            );
        },

        "Should return the validity of the form (4)": function () {
            this.test1Valid = false;
            this.test2Valid = false;

            Y.Assert.isFalse(this.view.isValid(), "The form validity should be false");
            Y.Assert.isTrue(
                this.test1ValidateCalled && this.test2ValidateCalled,
                "The validate() of all views should have been called"
            );
        },
    });

    getFieldsTest = new Y.Test.Case({
        name: "eZ Content Edit Form View getFields test",

        setUp: function () {
            var that = this;

            this.contentType = new Y.Mock();
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.config = {
                fieldEditViews: {
                    something: 'hello'
                }
            };

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: {
                    'id1': {
                        'identifier': 'id1',
                        'fieldType': 'test1',
                        'fieldGroup': 'testfieldgroup',
                    },
                    'id2': {
                        'identifier': 'id2',
                        'fieldType': 'test2',
                        'fieldGroup': 'testfieldgroup',
                    },
                    'id3': {
                        'identifier': 'id3',
                        'fieldType': 'test3',
                        'fieldGroup': 'testfieldgroup',
                    }
                }
            });
            Y.eZ.FieldEditView.registerFieldEditView('test1', Y.Base.create('fieldEdit1', Y.eZ.FieldEditView, [], {
                getField: function () {
                    return that.field1;
                }
            }));
            Y.eZ.FieldEditView.registerFieldEditView('test2', Y.Base.create('fieldEdit2', Y.eZ.FieldEditView, [], {
                getField: function () {
                    return that.field2;
                }
            }));
            Y.eZ.FieldEditView.registerFieldEditView('test3', Y.Base.create('fieldEdit3', Y.eZ.FieldEditView, [], {
                getField: function () {
                    return undefined;
                }
            }));

            this.languageCode = 'fre-FR';
            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String, this.languageCode],
                run: function (id) {
                    return {
                        'identifier': id
                    };
                }
            });

            Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.languageCode
            });

            this.view = new Y.eZ.ContentEditFormView({
                contentType: this.contentType,
                version: this.version,
                content: this.content,
                languageCode: this.languageCode,
                config: this.config
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.eZ.FieldEditView.registerFieldEditView('test1', undefined);
            Y.eZ.FieldEditView.registerFieldEditView('test2', undefined);
            Y.eZ.FieldEditView.registerFieldEditView('test3', undefined);
        },

        "Should return the array of field handled by the form": function () {
            var fields;

            this.field1 = {};
            this.field2 = {};

            fields = this.view.getFields();

            Y.Assert.areEqual(
                2, fields.length,
                "getFields should return 2 fields"
            );
            Y.Assert.areSame(
                this.field1,
                fields[0],
                "getFields should return the fields handled by the form"
            );
            Y.Assert.areSame(
                this.field2,
                fields[1],
                "getFields should return the fields handled by the form"
            );
        },
    });

    activeFlagTest = new Y.Test.Case({
        name: "eZ Content Edit Form View active flag tests",

        setUp: function () {
            var that = this;

            this.contentType = new Y.Mock();
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.config = {
                fieldEditViews: {
                    something: 'hello'
                }
            };

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: {
                    'id1': {
                        'identifier': 'id1',
                        'fieldType': 'test1',
                        'fieldGroup': 'testfieldgroup',
                    },
                    'id2': {
                        'identifier': 'id2',
                        'fieldType': 'test2',
                        'fieldGroup': 'testfieldgroup',
                    }
                }
            });

            this.languageCode = 'fre-FR';
            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String, this.languageCode],
                run: function (id) {
                    return {
                        'identifier': id
                    };
                }
            });

            Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.languageCode
            });

            Y.eZ.FieldEditView.registerFieldEditView('test1', Y.Base.create('fieldEdit1', Y.eZ.FieldEditView, [], {
                initializer: function () {
                    this.after('activeChange', function (e) {
                        that.test1Active = e.newVal;
                    });
                }
            }));
            Y.eZ.FieldEditView.registerFieldEditView('test2', Y.Base.create('fieldEdit2', Y.eZ.FieldEditView, [], {
                initializer: function () {
                    this.after('activeChange', function (e) {
                        that.test2Active = e.newVal;
                    });
                }
            }));

            this.view = new Y.eZ.ContentEditFormView({
                contentType: this.contentType,
                version: this.version,
                content: this.content,
                languageCode: this.languageCode,
                config: this.config
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.eZ.FieldEditView.registerFieldEditView('test1', undefined);
            Y.eZ.FieldEditView.registerFieldEditView('test2', undefined);
        },

        "Should forward the active flag to the field edit views": function () {
            this.view.set('active', true);

            Y.Assert.isTrue(
                this.test1Active,
                "The field should be flagged as active"
            );
            Y.Assert.isTrue(
                this.test2Active,
                "The field should be flagged as active"
            );
        }
    });

    haltSubmitTest = new Y.Test.Case({
        name: "eZ Content Edit Form View prevent submit tests",

        setUp: function () {
            this.contentType = new Y.Mock();
            this.content = new Y.Mock();
            this.version = new Y.Mock();

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: {},
            });
            Y.Mock.expect(this.contentType, {
                method: 'getFieldGroups',
                returns: [],
            });

            this.view = new Y.eZ.ContentEditFormView({
                container: '.container',
                contentType: this.contentType,
                content: this.content,
                version: this.version,
            });

        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should prevent the form from being submitted": function () {
            var form;

            this.view.render();
            form = this.view.get('container').one('form');
            this.view.get('container').after('submit', function (e) {
                Y.fail("The form submission should have been halted");
            });
            form.simulate('submit');
        },
    });

    incosistencyFieldsTest = new Y.Test.Case({
        name: "eZ Raw Content View incosistency fields test",

        setUp: function () {
            var fields = {};

            this.content = new Y.Mock();
            this.contentType = new Y.Mock();
            this.version = new Y.Mock();
            this.fieldType = 'test1';
            this.languageCode = 'fre-FR';
            this.fieldDefinitions = [{
                fieldGroup: 'content',
                fieldType: this.fieldType,
                languageCode: this.languageCode,
                identifier: 'id1',
            }];
            this.fieldGroups = [{fieldGroupName: 'content'}, {fieldGroupName: 'meta'}];

            Y.Mock.expect(this.content, {
                method: 'getField',
                args: [Y.Mock.Value.String, this.languageCode],
                run: function (id) {
                    return fields[id];
                }
            });

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: this.fieldDefinitions
            });

            this.languageCode = 'fre-FR';
            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String, this.languageCode],
                run: function (id) {
                    return fields[id];
                }
            });

            Y.eZ.FieldEditView.registerFieldEditView(this.fieldType, Y.Base.create('somethingView', Y.eZ.FieldEditView, [], {
                initializer: function () {
                    Y.fail("The field edit view for test1 field type should not be initialized");
                }
            }));
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.FieldEditView.registerFieldEditView(this.fieldType , undefined);
        },

        "Should not initialize the field view": function () {
            this.view = new Y.eZ.ContentEditFormView({
                content: this.content,
                contentType: this.contentType,
                version: this.version,
                languageCode: this.languageCode,
                config: {}
            });
        }
    });

    setVersionTest = new Y.Test.Case({
        name: "eZ Content Edit Form View set version test",

        setUp: function () {
            this.contentType = new Y.Mock();
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.fieldType = 'test1';
            this.fieldDefinitionIdentifier = 'id1';
            this.config = {
                fieldEditViews: {
                    something: 'hello'
                }
            };

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: {
                    'id1': {
                        'identifier': this.fieldDefinitionIdentifier,
                        'fieldType': this.fieldType,
                        'fieldGroup': 'testfieldgroup',
                    },
                }
            });
            Y.eZ.FieldEditView.registerFieldEditView(this.fieldType, Y.Base.create('fieldEdit1', Y.eZ.FieldEditView, [], {
                getField: function () {
                    return this.get('field');
                }
            }, {
                ATTRS: {
                    field: {}
                }
            }));

            this.languageCode = 'fre-FR';
            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [this.fieldDefinitionIdentifier, this.languageCode],
                run: Y.bind(function (id) {
                    return {
                        'identifier': id,
                        'fieldDefinitionIdentifier': this.fieldDefinitionIdentifier,
                        'value': 'some value'
                    };
                }, this),
            });

            Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.languageCode
            });

            this.view = new Y.eZ.ContentEditFormView({
                contentType: this.contentType,
                version: this.version,
                content: this.content,
                languageCode: this.languageCode,
                config: this.config
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.eZ.FieldEditView.registerFieldEditView(this.fieldType, undefined);
        },

        "Should set version and fields on fieldEditViews": function () {
            var newVersion = new Y.Mock(),
                newValue = 'another value',
                fields;

            Y.Mock.expect(newVersion, {
                method: 'getField',
                args: [this.fieldDefinitionIdentifier, this.languageCode],
                run: function (id) {
                    return {
                        'identifier': id,
                        'value': newValue
                    };
                }
            });

            this.view.set('version', newVersion);

            fields = this.view.getFields();

            Assert.areEqual(
                fields[0].value,
                newValue,
                "The field should be updated with version's field value"
            );
        },
    });

    setServerSideErrorsTest = new Y.Test.Case({
        name: "eZ Content Edit Form View server side errors test",

        setUp: function () {
            var that = this;

            this.appendServerSideErrorCalled = false;
            this.contentType = new Y.Mock();
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.config = {
                fieldEditViews: {
                    something: 'hello'
                }
            };

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: {
                    'id1': {
                        'identifier': 'id1',
                        'fieldType': 'test1',
                        'fieldGroup': 'testfieldgroup',
                        'id': 'id1',
                    },
                }
            });
            Y.eZ.FieldEditView.registerFieldEditView('test1', Y.Base.create('fieldEdit1', Y.eZ.FieldEditView, [], {
                appendServerSideError: function () {
                    that.appendServerSideErrorCalled = true;
                }
            }, {
                ATTRS: {
                    field: {
                        fieldDefinitionIdentifier: 'test1'
                    },
                    fieldDefinition: {
                        id: 'id1'
                    }
                }
            }));

            this.languageCode = 'fre-FR';
            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String, this.languageCode],
                run: function (id) {
                    return {
                        'identifier': id,
                        'value': 'some value'
                    };
                }
            });

            Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.languageCode
            });

            this.view = new Y.eZ.ContentEditFormView({
                contentType: this.contentType,
                version: this.version,
                content: this.content,
                languageCode: this.languageCode,
                config: this.config
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.eZ.FieldEditView.registerFieldEditView('test1', undefined);
        },

        "Should call fieldEditView's appendServerSideError method": function () {
            var serverSideError = new Y.Base(),
                serverSideErrors = [serverSideError];

            serverSideError.set('fieldDefinitionId', 'id1');
            this.view.setServerSideErrors(serverSideErrors);

            Assert.isTrue(this.appendServerSideErrorCalled, "Should append server side errors on field edit views");
        },
    });


    translatingTest = new Y.Test.Case({
        name: "eZ Content Edit Form View translating test",

        setUp: function () {
            this.contentType = new Y.Mock();
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.config = {
                fieldEditViews: {
                    something: 'hello'
                }
            };

            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: {
                    'id1': {
                        'identifier': 'id1',
                        'fieldType': 'test1',
                        'fieldGroup': 'testfieldgroup',
                        'id': 'id1',
                    },
                }
            });
            Y.eZ.FieldEditView.registerFieldEditView('test1', Y.Base.create('fieldEdit1', Y.eZ.FieldEditView, [], {
                getField: function () {
                    return this.get('translating');
                }

            }, {
                ATTRS: {
                    field: {
                        fieldDefinitionIdentifier: 'test1'
                    },
                    fieldDefinition: {
                        id: 'id1'
                    }
                }
            }));
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.eZ.FieldEditView.registerFieldEditView('test1', undefined);
        },

        _testTranslating: function (contentLanguageCode, fieldLanguageCode, assertCallback) {
            var fields;

            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String, fieldLanguageCode],
                run: function (id) {
                    return {
                        'identifier': id,
                        'value': 'some value'
                    };
                }
            });

            Mock.expect(this.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: contentLanguageCode
            });

            this.view = new Y.eZ.ContentEditFormView({
                contentType: this.contentType,
                version: this.version,
                content: this.content,
                languageCode: fieldLanguageCode,
                config: this.config
            });

            fields = this.view.getFields();

            assertCallback(fields[0]);
        },

        "Should not set translating when editing the main language": function () {
            this._testTranslating("fre-FR", "fre-FR", function (translating) {
                Assert.isFalse(
                    translating,
                    "Translating should be set to false"
                );
            });
        },

        "Should not set translating when editing a draft": function () {
            this._testTranslating("", "fre-FR", function (translating) {
                Assert.isFalse(
                    translating,
                    "Translating should be set to false"
                );
            });
        },

        "Should set translating if editing another language": function () {
            this._testTranslating("eng-GB", "fre-FR", function (translating) {
                Assert.isTrue(
                    translating,
                    "Translating should be set to true"
                );
            });
        },
    });

    Y.Test.Runner.setName("eZ Content Edit Form View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(isValidTest);
    Y.Test.Runner.add(getFieldsTest);
    Y.Test.Runner.add(activeFlagTest);
    Y.Test.Runner.add(haltSubmitTest);
    Y.Test.Runner.add(incosistencyFieldsTest);
    Y.Test.Runner.add(setVersionTest);
    Y.Test.Runner.add(setServerSideErrorsTest);
    Y.Test.Runner.add(translatingTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-contenteditformview']});

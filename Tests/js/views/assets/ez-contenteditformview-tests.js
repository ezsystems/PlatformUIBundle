YUI.add('ez-contenteditformview-tests', function (Y) {
    var viewTest, isValidTest, getFieldsTest,
        container = Y.one('.container'),
        contentType, content, version,
        Test1FieldEditView, Test2FieldEditView;

    contentType = new Y.Mock();
    content = new Y.Mock();
    version = new Y.Mock();
    Y.Mock.expect(contentType, {
        method: 'getFieldGroups',
        returns: [{
            fieldGroupName: "testfieldgroup",
            fieldDefinitions: []
        }]
    });

    Y.Mock.expect(contentType, {
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

    Y.Mock.expect(version, {
        method: 'getField',
        args: [Y.Mock.Value.String],
        run: function (id) {
            return {
                'identifier': id
            };
        }
    });

    Test1FieldEditView = Y.Base.create('test1FieldEditView', Y.View, [], {
        render: function () {
            this.get('container').setContent('test1 rendered');
            return this;
        }
    });

    Test2FieldEditView = Y.Base.create('test2FieldEditView', Y.View, [], {
        render: function () {
            this.get('container').setContent('test2 rendered');
            return this;
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView('test1', Test1FieldEditView);
    Y.eZ.FieldEditView.registerFieldEditView('test2', Test2FieldEditView);

    viewTest = new Y.Test.Case({
        name: "eZ Content Edit Form View test",

        setUp: function () {
            this.view = new Y.eZ.ContentEditFormView({
                container: container,
                contentType: contentType,
                content: content,
                version: version
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
            Y.Assert.isTrue(templateCalled, "The template should have used to render the view");

            Y.Assert.isTrue(
                container.getContent().indexOf('test1 rendered') !== -1,
                "Test1FieldEditView should have been rendered"
            );
            Y.Assert.isTrue(
                container.getContent().indexOf('test2 rendered') !== -1,
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
        }

    });

    isValidTest = new Y.Test.Case({
        name: "eZ Content Edit Form View isValid test",

        setUp: function () {
            var that = this;

            this.contentType = new Y.Mock();
            this.version = new Y.Mock();

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
            Y.eZ.FieldEditView.registerFieldEditView('test1', Y.Base.create('fieldEdit1', Y.eZ.FieldEditView, [], {
                validate: function () { },

                isValid: function () {
                    return that.test1Valid;
                }
            }));
            Y.eZ.FieldEditView.registerFieldEditView('test2', Y.Base.create('fieldEdit2', Y.eZ.FieldEditView, [], {
                validate: function () { },

                isValid: function () {
                    return that.test2Valid;
                }
            }));

            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String],
                run: function (id) {
                    return {
                        'identifier': id
                    };
                }
            });

            this.view = new Y.eZ.ContentEditFormView({
                contentType: this.contentType,
                version: this.version
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
        },

        "Should return the validity of the form (2)": function () {
            this.test1Valid = true;
            this.test2Valid = false;

            Y.Assert.isFalse(this.view.isValid(), "The form validity should be false");
        },

        "Should return the validity of the form (3)": function () {
            this.test1Valid = false;
            this.test2Valid = true;

            Y.Assert.isFalse(this.view.isValid(), "The form validity should be false");
        },

        "Should return the validity of the form (4)": function () {
            this.test1Valid = false;
            this.test2Valid = false;

            Y.Assert.isFalse(this.view.isValid(), "The form validity should be false");
        },
    });

    getFieldsTest = new Y.Test.Case({
        name: "eZ Content Edit Form View getFields test",

        setUp: function () {
            var that = this;

            this.contentType = new Y.Mock();
            this.version = new Y.Mock();

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

            Y.Mock.expect(this.version, {
                method: 'getField',
                args: [Y.Mock.Value.String],
                run: function (id) {
                    return {
                        'identifier': id
                    };
                }
            });

            this.view = new Y.eZ.ContentEditFormView({
                contentType: this.contentType,
                version: this.version
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.eZ.FieldEditView.registerFieldEditView('test1', undefined);
            Y.eZ.FieldEditView.registerFieldEditView('test2', undefined);
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

    Y.Test.Runner.setName("eZ Content Edit Form View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(isValidTest);
    Y.Test.Runner.add(getFieldsTest);

}, '0.0.1', {requires: ['test', 'node-event-simulate', 'ez-contenteditformview']});

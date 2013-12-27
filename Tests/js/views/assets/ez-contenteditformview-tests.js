YUI.add('ez-contenteditformview-tests', function (Y) {
    var viewTest,
        container = Y.one('.container'),
        contentType, content,
        Test1FieldEditView, Test2FieldEditView;

    contentType = new Y.Mock();
    content = new Y.Mock();
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

    Y.Mock.expect(content, {
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
                content: content
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
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");

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

    Y.Test.Runner.setName("eZ Content Edit Form View tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'node-event-simulate', 'ez-contenteditformview']});

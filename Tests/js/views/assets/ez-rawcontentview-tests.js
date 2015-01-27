/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-rawcontentview-tests', function (Y) {
    var viewTest, destroyTest, eventTest,
        _getContentTypeMock = function (fieldDefinitions, fieldGroups) {
            var mock = new Y.Test.Mock();

            Y.Mock.expect(mock, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: fieldDefinitions,
            });
            Y.Mock.expect(mock, {
                method: 'getFieldGroups',
                returns: fieldGroups,
            });
            return mock;
        };

    viewTest = new Y.Test.Case({
        name: "eZ Raw Content View test",

        setUp: function () {
            this.contentJson = {};
            this.fieldDefinitions = [{
                fieldGroup: 'content',
                fieldType: 'something',
                identifier: 'id1',
            }, {
                fieldGroup: 'meta',
                fieldType: 'somethingelse',
                identifier: 'id2',
            }];
            this.fieldGroups = [{fieldGroupName: 'content'}, {fieldGroupName: 'meta'}];
            this.fields = {'id1': {fieldValue: 'value1'}, 'id2': {fieldValue: 'value2'}};

            this.content = this._getContentMock();
            this.contentType = this._getContentTypeMock();
            this.config = {
                fieldViews: {
                    something: 'hello'
                }
            };
            this.view = new Y.eZ.RawContentView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                config: this.config
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _getContentMock: function () {
            var mock = new Y.Test.Mock(), that = this;
            
            Y.Mock.expect(mock, {
                method: 'toJSON',
                returns: this.contentJson
            });
            Y.Mock.expect(mock, {
                method: 'getField',
                args: [Y.Mock.Value.String],
                run: function (id) {
                    return that.fields[id];
                }
            });
            return mock;
        },

        _getContentTypeMock: function () {
            return _getContentTypeMock(this.fieldDefinitions, this.fieldGroups);
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
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(2, Y.Object.keys(variables).length, "The template should receive 2 variables");
                Y.Assert.areSame(
                    that.fieldGroups, variables.fieldGroups,
                    "fieldGroup should be available in the template"
                );
                Y.Assert.areSame(
                    that.contentJson, variables.content,
                    "The content should available in the template"
                );
                
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Test sub views rendered": function () {
            var container = this.view.get('container');

            this.view.render();

            Y.Assert.areEqual(
                container.all('.ez-view-fieldview').size(), this.fieldDefinitions.length,
                "Each field should be rendered"
            );

            container.all('.ez-fieldgroup').each(function (group) {
                Y.Assert.areEqual(
                    group.all('.ez-view-fieldview').size(), 1,
                    "Each group should contain one field view"
                );
            });
        },

        "Should collapse/uncollapse the raw content view": function () {
            var container = this.view.get('container'),
                groups = container.one('.ez-fieldgroups'),
                title = container.one('.ez-raw-content-title'),
                initialHeight = parseInt(groups.getComputedStyle('height'), 10),
                that = this;

            title.simulateGesture('tap', function () {
                that.resume(function () {
                    this.wait(function () {
                        Y.Assert.isTrue(
                            container.hasClass('is-raw-content-view-collapsed'),
                            "The container should get the collapsed class"
                        );
                        Y.Assert.areEqual(
                            0, parseInt(groups.getComputedStyle('height'), 10),
                            "The heights of the field groups element should be 0"
                        );
                        title.simulateGesture('tap', function () {
                            that.resume(function () {
                                this.wait(function () {
                                    Y.Assert.isFalse(
                                        container.hasClass('is-raw-content-view-collapsed'),
                                        "The container should not get the collapsed class"
                                    );
                                    Y.Assert.areEqual(
                                        initialHeight, parseInt(groups.getComputedStyle('height'), 10),
                                        "The heights of the field groups element should not be 0"
                                    );
                                }, 500);
                            });
                        });
                        this.wait();
                    }, 500);
                });
            });
            this.wait();
        },

        "Should collapse/uncollapse the field groups": function () {
            var container = this.view.get('container'),
                fieldGroups = container.all('.ez-fieldgroup'),
                that = this;

            fieldGroups.each(function (group) {
                var name = group.previous('a'),
                    initialHeight = parseInt(group.getComputedStyle('height'), 10);

                name.simulateGesture('tap', function () {
                    that.resume(function () {
                        this.wait(function () {
                            Y.Assert.isTrue(
                                name.hasClass('is-field-group-collapsed'),
                                "The group name should have the collapsed class"
                            );
                            Y.Assert.isTrue(
                                group.hasClass('is-field-group-collapsed'),
                                "The group element should have the collapsed class"
                            );
                            Y.Assert.isTrue(
                                parseInt(group.getComputedStyle('height'), 10) < initialHeight,
                                "The height of the group should be lower than its initial height"
                            );

                            name.simulateGesture('tap', function () {
                                that.resume(function () {
                                    this.wait(function () {
                                        Y.Assert.isFalse(
                                            name.hasClass('is-field-group-collapsed'),
                                            "The group name should have the collapsed class"
                                        );
                                        Y.Assert.isFalse(
                                            group.hasClass('is-field-group-collapsed'),
                                            "The group element should have the collapsed class"
                                        );
                                        Y.Assert.areEqual(
                                            parseInt(group.getComputedStyle('height'), 10), initialHeight,
                                            "The height of the group should be restored to its initial value"
                                        );
                                        Y.Assert.areEqual(
                                            "", group.getAttribute('style'),
                                            "The style attribute should be empty"
                                        );
                                    }, 500);
                                });
                            });
                            this.wait();
                        }, 500);
                    });
                });
                that.wait();
            });
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Raw Content View test",

        setUp: function () {
            var that = this;

            this.contentJson = {};
            this.fieldDefinitions = [{
                fieldGroup: 'content',
                fieldType: 'something',
                identifier: 'id1',
            }, {
                fieldGroup: 'meta',
                fieldType: 'somethingelse',
                identifier: 'id2',
            }];
            this.fieldGroups = [{fieldGroupName: 'content'}, {fieldGroupName: 'meta'}];
            this.fields = {'id1': {fieldValue: 'value1'}, 'id2': {fieldValue: 'value2'}};

            this.content = this._getContentMock();
            this.contentType = this._getContentTypeMock();
            that = this;

            this.config = {
                fieldViews: {
                    something: 'hello'
                }
            };
            this.view = new Y.eZ.RawContentView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                config: this.config
            });
            this.eventFacade = {Something: 'something'};
            this.activeChangeCalled = 0;
            this.activeChangeNewVal = null;

            Y.Array.each(this.fieldDefinitions, function (def) {
                Y.eZ.FieldView.registerFieldView(
                    def.fieldType ,
                    Y.Base.create(def.fieldType + 'TestView', Y.View, [], {
                        render: function () {
                            this.fire('fireSomething', that.eventFacade);
                            return this;
                        },
                        initializer: function () {
                            this.after('activeChange', function (e) {
                                that.config[def.fieldType] = this.get('config');
                                that.activeChangeCalled++;
                                that.activeChangeNewVal = e.newVal;
                            });
                        }
                    },{
                        ATTRS : {
                            config: {},
                        }
                    })
                );
            });
        },

        tearDown: function () {
            this.activeChangeCalled = 0;
            this.activeChangeNewVal = null;
            this.view.destroy();
            Y.Array.each(this.fieldDefinitions, function (def) {
                Y.eZ.FieldView.registerFieldView(
                    def.fieldType , undefined
                );
            });
        },

        _initializer :function () {},

        _getContentMock: function () {
            var mock = new Y.Test.Mock(), that = this;

            Y.Mock.expect(mock, {
                method: 'toJSON',
                returns: this.contentJson
            });
            Y.Mock.expect(mock, {
                method: 'getField',
                args: [Y.Mock.Value.String],
                run: function (id) {
                    return that.fields[id];
                }
            });
            return mock;
        },

        _getContentTypeMock: function () {
            return _getContentTypeMock(this.fieldDefinitions, this.fieldGroups);
        },

        "Should give the config to the fieldView": function () {
            var that = this;

            this.view = new Y.eZ.RawContentView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                config: {
                    fieldViews: {
                        something: 'hello'
                    }
                },
            });

            this.view.set('active', true);

            Y.Array.each(this.fieldDefinitions, function (def) {
                if (that.view.get('config').fieldViews[def.fieldType]){
                    Y.Assert.areSame(
                        that.config[def.fieldType],
                        that.view.get('config').fieldViews[def.fieldType],
                        "The config should be passed to the fieldView if fieldType match"
                    );
                } else {
                    Y.Assert.isUndefined(that.config[def.fieldType], 'The fieldView should NOT have config if fieldType do Not match');
                }
            });
        },

        "Should catch the fieldView's events": function () {
            var eventCount = 0, that = this;

            this.view = new Y.eZ.RawContentView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                config: {
                    fieldViews: {
                        something: 'hello'
                    }
                },
            });
            this.view.on('*:fireSomething', function(e) {
                eventCount++;
                Y.Assert.areSame(
                    that.eventFacade.Something,
                    e.Something,
                    "The event fired in the fieldView should be available"
                );
            });

            this.view.render();

            Y.Assert.areSame(
                this.fieldDefinitions.length,
                eventCount,
                "Each fieldDefinition should fire an event"
            );
        },

        "Should forward the active flag to the field sub views": function () {

            this.view = new Y.eZ.RawContentView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                config: {
                    fieldViews: {
                        ezthing: 'hello'
                    }
                },
            });

            this.view.set('active', true);

            Y.Assert.isTrue(
                this.activeChangeNewVal,
                "The field view should be activated"
            );

            Y.Assert.areEqual(
                this.fieldDefinitions.length,
                this.activeChangeCalled,
                "Each field view should have been activated"
            );
        },
    });

    destroyTest = new Y.Test.Case({
        name: "eZ Raw Content View destroy test",

        setUp: function () {
            this.fieldDefinitions = [{
                fieldGroup: 'content',
                fieldType: 'something',
                identifier: 'id1',
            }, {
                fieldGroup: 'meta',
                fieldType: 'somethingelse',
                identifier: 'id2',
            }];
            this.fieldGroups = [{fieldGroupName: 'content'}, {fieldGroupName: 'meta'}];

        },

        "Should destroy the field views": function () {
            var somethingDestroyed = false,
                somethingElseDestroyed = false,
                content = new Y.Mock();

            Y.eZ.FieldView.registerFieldView('something', Y.Base.create('somethingView', Y.eZ.FieldView, [], {
                destructor: function () {
                    somethingDestroyed = true;
                }
            }));
            Y.eZ.FieldView.registerFieldView('somethingelse', Y.Base.create('somethingElseView', Y.eZ.FieldView, [], {
                destructor: function () {
                    somethingElseDestroyed = true;
                }
            }));

            Y.Mock.expect(content, {
                method: 'getField',
                args: [Y.Mock.Value.String]
            });

            this.view = new Y.eZ.RawContentView({
                content: content,
                contentType: _getContentTypeMock(this.fieldDefinitions, this.fieldGroups),
                config: {
                    fieldViews: {
                        ezthing: 'hello'
                    }
                },
            });
            this.view.destroy();

            Y.Assert.isTrue(somethingDestroyed);
            Y.Assert.isTrue(somethingElseDestroyed);

            Y.eZ.FieldView.registerFieldView('something', undefined);
            Y.eZ.FieldView.registerFieldView('somethingelse', undefined);
        },
    });

    Y.Test.Runner.setName("eZ Raw Content View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(destroyTest);

}, '', {requires: ['test', 'node-event-simulate', 'ez-rawcontentview']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-rawcontentview-tests', function (Y) {
    var viewTest, destroyTest, eventTest, fieldViewParametersTest, inconsistencyFieldsTest,
        languageSwitcherViewTest, switchLanguageTest,
        Assert = Y.Assert, Mock = Y.Mock,
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
        },
        _getContentMock = function (contentJson) {
            var content = new Mock();

            Mock.expect(content, {
                method: 'toJSON',
                returns: contentJson
            });
            Mock.expect(content, {
                method: 'getField',
                args: [Mock.Value.String, this.languageCode],
                run: Y.bind(function (id) {
                    return this.fields[id];
                }, this),
            });
            return content;
        };


    viewTest = new Y.Test.Case({
        name: "eZ Raw Content View test",

        setUp: function () {
            this.contentJson = {};
            this.languageCode = "eng-GB";
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

            this.location = {};
            this.content = this._getContentMock();
            this.contentType = this._getContentTypeMock();
            this.config = {};
            this.view = new Y.eZ.RawContentView({
                container: '.container',
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                languageCode: this.languageCode,
                config: this.config,
                languageSwitcherView: new Y.View(),
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _getContentMock: function () {
            return _getContentMock.call(this, this.contentJson);
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
                groups, title, initialHeight,
                that = this;

            this.view.render();
            groups = container.one('.ez-fieldgroups');
            title = container.one('.ez-raw-content-title');
            initialHeight = parseInt(groups.getComputedStyle('height'), 10);

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
                fieldGroups,
                that = this;

            this.view.render();
            fieldGroups = container.all('.ez-fieldgroup');
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

    languageSwitcherViewTest = new Y.Test.Case({
        name: 'eZ Raw Content View languageSwitcherView test',

        setUp: function () {
            Y.eZ.LanguageSwitcherView = Y.View;
            this.view = new Y.eZ.RawContentView({
                content: {},
                location: {},
                languageCode: 'fre-FR',
                languageSwitchMode: 'whatever',
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.LanguageSwitcherView;
        },

        "Should instantiate LanguageSwitcherView with proper parameters": function () {
            var switcher = this.view.get('languageSwitcherView');

            Y.Assert.areSame(
                this.view.get('content'),
                switcher.get('content'),
                'The content should have been set on languageSwitcherView'
            );
            Y.Assert.areSame(
                this.view.get('location'),
                switcher.get('location'),
                'The location should have been set on languageSwitcherView'
            );
            Y.Assert.areSame(
                this.view.get('languageCode'),
                switcher.get('languageCode'),
                'The location should have been set on languageSwitcherView'
            );
            Assert.areEqual(
                this.view.get('languageSwitchMode'),
                switcher.get('switchMode'),
                "The language switcher should have received the language switch mode"
            );
        },

        "Should set the raw content view as a bubble target of the language switcher": function () {
            var bubble = false,
                event = 'whatever';

            this.view.on('*:' + event, function () {
                bubble = true;
            });
            this.view.get('languageSwitcherView').fire(event);

            Assert.isTrue(
                bubble,
                "The raw content view should be a bubble target of the language switcher"
            );
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Raw Content View events test",

        setUp: function () {
            var that = this;

            this.contentJson = {};
            this.languageCode = "eng-GB";
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

            this.location = {};
            this.content = this._getContentMock();
            this.contentType = this._getContentTypeMock();
            that = this;

            this.config = {
                fieldViews: {
                    something: 'hello'
                }
            };
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

            this.languageSwitcherView = new Y.View();
            this.view = new Y.eZ.RawContentView({
                container: '.container',
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                languageCode: this.languageCode,
                config: this.config,
                languageSwitcherView: this.languageSwitcherView,
            });
            this.languageSwitcherView.addTarget(this.view);
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

        _getContentMock: function () {
            return _getContentMock.call(this, this.contentJson);
        },

        _getContentTypeMock: function () {
            return _getContentTypeMock(this.fieldDefinitions, this.fieldGroups);
        },

        "Should catch the fieldView's events": function () {
            var eventCount = 0, that = this;

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
            this.fields = {'id1': {fieldValue: 'value1'}, 'id2': {fieldValue: 'value2'}};
        },

        destroy: function () {
            this.view.destroy();
        },

        "Should destroy the field views": function () {
            var somethingDestroyed = false,
                somethingElseDestroyed = false,
                content = _getContentMock.call(this, {});

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

            this.view = new Y.eZ.RawContentView({
                content: content,
                contentType: _getContentTypeMock(this.fieldDefinitions, this.fieldGroups),
                config: {
                    fieldViews: {
                        ezthing: 'hello'
                    }
                },
                languageSwitcherView: new Y.View(),
            });
            this.view.destroy();

            Y.Assert.isTrue(somethingDestroyed);
            Y.Assert.isTrue(somethingElseDestroyed);

            Y.eZ.FieldView.registerFieldView('something', undefined);
            Y.eZ.FieldView.registerFieldView('somethingelse', undefined);
        },
    });

    fieldViewParametersTest= new Y.Test.Case({
        name: "eZ Raw Content View field view parameters test",

        setUp: function () {
            var content;

            this.fields = {'id1': {fieldValue: 'value1'}};
            content = _getContentMock.call(this, {});

            this.fieldDefinitions = [{
                fieldGroup: 'content',
                fieldType: 'something',
                identifier: 'id1',
            }];
            this.fieldGroups = [{fieldGroupName: 'content'}];

            this.config = {};

            Y.eZ.FieldView.registerFieldView('something', Y.Base.create('somethingView', Y.eZ.FieldView, [], {
                initializer: function () {
                    fieldViewParametersTest.fieldViewConfig = this.get('config');
                    fieldViewParametersTest.fieldViewContent = this.get('content');
                    fieldViewParametersTest.fieldViewContentType = this.get('contentType');
                },
            }));

            this.view = new Y.eZ.RawContentView({
                content: content,
                contentType: _getContentTypeMock(this.fieldDefinitions, this.fieldGroups),
                config: this.config,
                languageSwitcherView: new Y.View(),
            });
        },

        tearDown: function () {
            Y.eZ.FieldView.registerFieldView('something', undefined);
            this.view.destroy();
        },

        "Should pass the config to the field view": function () {
            Assert.areSame(
                this.config,
                this.fieldViewConfig,
                "The field view should receive the configration from the raw content view"
            );
        },

        "Should pass the content to the field view": function () {
            Assert.areSame(
                this.view.get('content'),
                this.fieldViewContent,
                "The field view should receive the content from the raw content view"
            );
        },

        "Should pass the contentType to the field view": function () {
            Assert.areSame(
                this.view.get('contentType'),
                this.fieldViewContentType,
                "The field view should receive the contentType from the raw contentType view"
            );
        },
    });

    inconsistencyFieldsTest = new Y.Test.Case({
        name: "eZ Raw Content View inconsistency fields test",

        setUp: function () {
            this.fields = {};
            this.fieldType = 'something';
            this.fieldDefinitions = [{
                fieldGroup: 'content',
                fieldType: this.fieldType,
                identifier: 'id1',
            }];
            this.fieldGroups = [{fieldGroupName: 'content'}, {fieldGroupName: 'meta'}];

            this.content = _getContentMock.call(this, {});

            Y.eZ.FieldView.registerFieldView(this.fieldType, Y.Base.create('somethingView', Y.eZ.FieldView, [], {
                initializer: function () {
                    Y.fail("The field view for something field type should not be initialized");
                }
            }));
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.FieldView.registerFieldView(this.fieldType , undefined);
        },

        "Should not initialize the field view": function () {
            this.view = new Y.eZ.RawContentView({
                content: this.content,
                contentType: _getContentTypeMock(this.fieldDefinitions, this.fieldGroups),
                config: {},
                languageSwitcherView: new Y.View(),
            });
        }
    });

    switchLanguageTest = new Y.Test.Case({
        name: "eZ Raw Content View switchLanguage event test",

        setUp: function () {
            var that = this;

            this.languageCode = "eng-GB";
            this.newLanguageCode = 'fre-FR';
            this.fieldDefinitions = [{
                fieldGroup: 'content',
                fieldType: 'something',
                identifier: 'id1',
            }];
            this.fieldGroups = [{fieldGroupName: 'content'}];
            this.fields = {};
            this.fields[this.languageCode] = {'id1': {fieldValue: 'value1'}};
            this.fields[this.newLanguageCode] = {'id1': {fieldValue: 'value1'}};

            this.location = {};
            this.content = new Mock();
            Mock.expect(this.content, {
                method: 'getField',
                args: [Mock.Value.String, Mock.Value.String],
                run: Y.bind(function (id, lang) {
                    return this.fields[lang][id];
                }, this),
            });
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: {},
            });

            this.contentType = this._getContentTypeMock();

            this.fieldViewField = {};
            Y.Array.each(this.fieldDefinitions, function (def) {
                Y.eZ.FieldView.registerFieldView(
                    def.fieldType ,
                    Y.Base.create(def.fieldType + 'TestView', Y.View, [], {
                        initializer: function () {
                            that.fieldView = this;
                        },
                        render: function () {
                            that.fieldViewRendered = true;
                            return this;
                        },
                    })
                );
            });

            this.languageSwitcherView = new Y.View();
            this.view = new Y.eZ.RawContentView({
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                languageCode: this.languageCode,
                languageSwitcherView: this.languageSwitcherView,
            });
            this.languageSwitcherView.addTarget(this.view);
        },

        tearDown: function () {
            this.view.destroy();
            Y.Array.each(this.fieldDefinitions, function (def) {
                Y.eZ.FieldView.registerFieldView(
                    def.fieldType , undefined
                );
            });
        },

        _getContentMock: function () {
            return _getContentMock.call(this, {});
        },

        _getContentTypeMock: function () {
            return _getContentTypeMock(this.fieldDefinitions, this.fieldGroups);
        },

        _switchLanguage: function () {
            this.languageSwitcherView.fire('switchLanguage', {
                languageCode: this.newLanguageCode,
            });
        },

        "Should set the language code on switchLanguage event": function () {
            this._switchLanguage();
            Assert.areEqual(
                this.newLanguageCode,
                this.view.get('languageCode'),
                "The language code attribute should have been updated"
            );
        },

        "Should instantiate a new field view": function () {
            var origFieldView = this.fieldView;

            this._switchLanguage();
            Assert.areNotSame(
                origFieldView, this.fieldView,
                "A new field view should have been created"
            );
            Assert.areSame(
                this.fields[this.newLanguageCode].id1,
                this.fieldView.get('field'),
                "The field in the new language should be passed to the field view"
            );
        },

        "Should rerender the view and field views": function () {
            var stamp = 'not rendered yet';

            this.view.get('container').setContent('stamp');
            this._switchLanguage();

            Assert.areNotEqual(
                stamp, this.view.get('container').getContent('stamp'),
                "The view should have been rendered"
            );
            Assert.isTrue(
                this.fieldViewRendered,
                "The field view should have been rendered"
            );
        },

        "Should set the active flag on the field views": function () {
            this.view.set('active', true);
            this._switchLanguage();

            Assert.isTrue(
                this.fieldView.get('active'),
                "The active flag should set on the field view"
            );
        },
    });

    Y.Test.Runner.setName("eZ Raw Content View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(languageSwitcherViewTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(destroyTest);
    Y.Test.Runner.add(fieldViewParametersTest);
    Y.Test.Runner.add(inconsistencyFieldsTest);
    Y.Test.Runner.add(switchLanguageTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-rawcontentview']});

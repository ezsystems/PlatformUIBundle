/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-richtext-editview-tests', function (Y) {
    var renderTest, registerTest, validateTest, getFieldTest,
        editorTest, rerenderEditorTest, focusModeTest, editorFocusHandlingTest, appendToolbarConfigTest,
        eventForwardTest, defaultEditorProcessorsTest, defaultProcessorsTest,
        VALID_XHTML, INVALID_XHTML, RESULT_XHTML, EMPTY_XHTML, RESULT_EMPTY_XHTML,
        Assert = Y.Assert, Mock = Y.Mock,
        destroyTearDown = function () {
            // setTimeout is needed otherwise, the editor is destroyed while
            // some initialization is still going on (despite listening to
            // 'instanceReady' event in the tests...) and without it, we got
            // "Uncaught TypeError: Cannot read property 'checkFeature' of
            // undefined" in the console.
            setTimeout(Y.bind(function () {
                this.view.destroy();
            }, this), 0);
        };

    INVALID_XHTML = "I'm invalid";

    VALID_XHTML = '<?xml version="1.0" encoding="UTF-8"?>';
    VALID_XHTML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit">';
    VALID_XHTML += '<p>I\'m not empty</p></section>';

    EMPTY_XHTML = '<?xml version="1.0" encoding="UTF-8"?>';
    EMPTY_XHTML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit"/>';

    RESULT_EMPTY_XHTML = '<p></p>';

    RESULT_XHTML = '<p>I\'m not empty</p>';

    CKEDITOR.plugins.add('ezaddcontent', {});
    CKEDITOR.plugins.add('ezremoveblock', {});
    CKEDITOR.plugins.add('ezembed', {});
    CKEDITOR.plugins.add('ezfocusblock', {});
    CKEDITOR.plugins.add('yui3', {});

    renderTest = new Y.Test.Case({
        name: "eZ RichText View render test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                editorContentProcessors: [],
                processors: [],
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, expectRequired, xhtml5edit, expectedXhtml) {
            var fieldDefinition = this._getFieldDefinition(required),
                origTpl = this.view.template,
                that = this;

            this.field.fieldValue.xhtml5edit = xhtml5edit;
            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(8, Y.Object.keys(variables).length, "The template should receive 8 variables");

                Assert.areSame(
                     that.jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Assert.areSame(
                     that.jsonVersion, variables.version,
                    "The content should be available in the field edit view template"
                );
                Assert.areSame(
                    that.jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );
                Assert.areEqual(
                    "ez-richtext-editable", variables.editableClass,
                    "The editable class should be available in the template"
                );
                Assert.areSame(expectRequired, variables.isRequired);
                Assert.areSame(expectedXhtml, variables.xhtml);

                return origTpl.call(this, variables);
            };
            this.view.render();
        },

        "Test variables for not required field": function () {
            this._testAvailableVariables(false, false, VALID_XHTML, RESULT_XHTML);
        },

        "Test variables for required field": function () {
            this._testAvailableVariables(true, true, VALID_XHTML, RESULT_XHTML);
        },

        "Should handle the parsing error": function () {
            this._testAvailableVariables(false, false, INVALID_XHTML, "");
        },

        "Should add a paragraph in empty document": function () {
            this._testAvailableVariables(false, false, EMPTY_XHTML, RESULT_EMPTY_XHTML);
        },
    });

    validateTest = new Y.Test.Case({
        name: "eZ RichText View validate test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.model = new Mock();
            this.editor = new Mock();
            this.nativeEditor = new Mock();
            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: this.nativeEditor,
            });
            Mock.expect(this.model, {
                method: 'toJSON',
                returns: {},
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                content: this.model,
                version: this.model,
                contentType: this.model,
                config: {
                    rootInfo: {
                        ckeditorPluginPath: '../../..',
                    }
                },
                editorContentProcessors: [],
                processors: [],
            });
            this.view._set('editor', this.editor);
        },

        tearDown: function () {
            this.view.destroy();
        },

        _getProcessorMock: function (callCount, expectedData, returnValue) {
            var processor = new Mock();

            Mock.expect(processor, {
                method: 'process',
                callCount: callCount,
                args: [expectedData],
                returns: returnValue,
            });

            return processor;
        },

        _configureNativeEditor: function (callCount, returnValue) {
            Mock.expect(this.nativeEditor, {
                method: 'getData',
                callCount: callCount,
                returns: returnValue
            });
        },

        "Should not detect any validation issue on a non required field": function () {
            var fieldDefinition = this._getFieldDefinition(false),
                processor = this._getProcessorMock(0);

            this._configureNativeEditor(0);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('editorContentProcessors', [processor]);
            this.view.validate();

            Assert.isTrue(
                this.view.isValid(),
                "A non required and empty field should be valid"
            );
            Mock.verify(processor);
        },

        "Should not validate a buggy and required field": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                processor = this._getProcessorMock(1, INVALID_XHTML, INVALID_XHTML);

            this._configureNativeEditor(1, INVALID_XHTML);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('editorContentProcessors', [processor]);
            this.view.validate();

            Assert.isFalse(
                this.view.isValid(),
                "A required and empty field should not be valid"
            );
        },

        "Should not validate an empty and required field": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                processor = this._getProcessorMock(1, EMPTY_XHTML, EMPTY_XHTML);

            this._configureNativeEditor(1, EMPTY_XHTML);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('editorContentProcessors', [processor]);
            this.view.validate();

            Assert.isFalse(
                this.view.isValid(),
                "A required and empty field should not be valid"
            );
        },

        "Should validate a filled and required field": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                processor = this._getProcessorMock(1, VALID_XHTML, VALID_XHTML);

            this._configureNativeEditor(1, VALID_XHTML);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('editorContentProcessors', [processor]);
            this.view.validate();

            Assert.isTrue(
                this.view.isValid(),
                "A required and filled field should not be valid"
            );
        },
    });

    getFieldTest = new Y.Test.Case({
        name: "eZ RichText View getField test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.model = new Mock();
            Mock.expect(this.model, {
                method: 'toJSON',
                returns: {},
            });
            Y.Mock.expect(this.model, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'eng-GB'
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                content: this.model,
                version: this.model,
                contentType: this.model,
                config: {
                    rootInfo: {
                        ckeditorPluginPath: '../../..',
                    }
                },
                editorContentProcessors: [],
                processors: [],
            });
        },

        tearDown: destroyTearDown,

        "Should return an object": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                field;

            this.field.fieldValue.xhtml5edit = "";
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    field = this.view.getField();

                    Assert.isObject(field, "The field should be an object");
                    Assert.areNotSame(
                        this.field, field,
                        "The getField method should be return a different object"
                    );
                    Assert.isObject(field.fieldValue, "The fieldValue should be an object");
                    Assert.isString(field.fieldValue.xml, "The field should have a `xml` entry");
                    Assert.isString(field.fieldValue.xhtml5edit, "The field should have a `xhtml5edit` entry");
                }, this));
            }, this));
            this.view.set('active', true);
            this.wait();
        },

        _getProcessorMock: function () {
            var processor = new Mock();

            Mock.expect(processor, {
                method: 'process',
                args: [Mock.Value.Any],
            });

            return processor;
        },

        "Should use the editorContentProcessors": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                p1 = this._getProcessorMock(),
                p2 = this._getProcessorMock();

            this.view.set('editorContentProcessors', [p1, p2]);

            this.field.fieldValue.xhtml5edit = "";
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            this.view.getField();

            Mock.verify(p1);
            Mock.verify(p2);
        },
    });

    editorTest = new Y.Test.Case({
        name: "eZ RichText View editor test",

        setUp: function () {
            this.config = {
                rootInfo: {
                    ckeditorPluginPath: '../../..',
                },
                imageVariations: {
                    small: {},
                    large: {},
                },
            };
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.model = new Mock();
            Mock.expect(this.model, {
                method: 'toJSON',
                returns: {},
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: {isRequired: true},
                content: this.model,
                version: this.model,
                contentType: this.model,
                config: this.config,
                editorContentProcessors: [],
                processors: [],
            });
            this.view.render();
        },

        tearDown: destroyTearDown,

        _testRegisterPlugin: function (plugin) {
            Assert.isObject(
                CKEDITOR.plugins.externals[plugin],
                "The '" + plugin + "' plugin should be registered"
            );
            Assert.areEqual(
                CKEDITOR.plugins.externals[plugin].dir,
                this.view.get('ckeditorPluginPath') + '/' + plugin + '/'
            );
        },

        "Should register the 'widget' CKEditor plugin": function () {
            this._testRegisterPlugin('widget');
        },

        "Should register the 'lineutils' CKEditor plugin": function () {
            this._testRegisterPlugin('lineutils');
        },

        "Should create an instance of AlloyEditor": function () {
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    Assert.isInstanceOf(
                        Y.eZ.AlloyEditor.Core, this.view.get('editor'),
                        "An instance of AlloyEditor should have been created"
                    );
                }, this));
            }, this));

            this.view.set('active', true);
            this.wait();
        },

        "Should set the toolbar configuration": function () {
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    Assert.areSame(
                        this.view.get('toolbarsConfig'),
                        this.view.get('editor').get('toolbars'),
                        "The toolbarsConfig attribute should be used as the toolbars config"
                    );
                }, this));
            }, this));

            this.view.set('active', true);
            this.wait();
        },

        _validationTestOnEvent: function (evtName) {
            var validated = false;

            this.view.after('errorStatusChange', function () {
                validated = true;
            });
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    this.view.get('editor').get('nativeEditor').fire(evtName);

                    Assert.isTrue(validated, "The input should have been validated");
                }, this));
            }, this));

            this.view.set('active', true);
            this.wait();
        },

        "Should validate the input on blur": function () {
            this._validationTestOnEvent('blur');
        },

        "Should validate the input on focus": function () {
            this._validationTestOnEvent('focus');
        },

        "Should validate the input on change": function () {
            this._validationTestOnEvent('change');
        },

        _testExtraPlugins: function (plugin) {
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    Assert.isTrue(
                        this.view.get('editor').get('extraPlugins').indexOf(plugin) !== -1,
                        "The '" + plugin + "' plugin should be loaded"
                    );
                }, this));
            }, this));

            this.view.set('active', true);
            this.wait();
        },

        "Should add the ezaddcontent plugin": function () {
            this._testExtraPlugins('ezaddcontent');
        },

        "Should add the ezremoveblock plugin": function () {
            this._testExtraPlugins('ezremoveblock');
        },

        "Should add the yui3 plugin": function () {
            this._testExtraPlugins('yui3');
        },

        "Should add the widget plugin": function () {
            this._testExtraPlugins('widget');
        },

        "Should add the ezembed plugin": function () {
            this._testExtraPlugins('ezembed');
        },

        "Should add the ezfocusblock plugin": function () {
            this._testExtraPlugins('ezfocusblock');
        },

        "Should pass the `eZ` configuration": function () {
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    var eZConfig = this.view.get('editor').get('nativeEditor').config.eZ;
                    Assert.isObject(
                         eZConfig,
                        "The editor should have received the eZ configuration"
                    );
                    Assert.areEqual(
                        eZConfig.editableRegion,
                        '.ez-richtext-editable',
                        "The eZ configuration should contain the selector for the editable region"
                    );
                }, this));
            }, this));

            this.view.set('active', true);
            this.wait();
        },

        "Should pass the image variation configuration in `eZ` configuration": function () {
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    var eZConfig = this.view.get('editor').get('nativeEditor').config.eZ;

                    Assert.isObject(
                         eZConfig,
                        "The editor should have received the eZ configuration"
                    );
                    Assert.isArray(
                        eZConfig.imageVariations,
                        "The eZ configuration should contain the image variations"
                    );
                    Assert.areEqual(
                        Object.keys(this.config.imageVariations).length, eZConfig.imageVariations.length,
                        "The eZ Configuration should contain " + Object.keys(this.config).length + " variations"
                    );
                    Assert.areEqual(
                        "large", eZConfig.imageVariations[0].identifier,
                        "The image variation should be sorted by name"
                    );
                    Assert.areEqual(
                        "large", eZConfig.imageVariations[0].name,
                        "The image variation should be sorted by name"
                    );
                    Assert.areEqual(
                        "small", eZConfig.imageVariations[1].identifier,
                        "The image variation should be sorted by name"
                    );
                    Assert.areEqual(
                        "small", eZConfig.imageVariations[1].name,
                        "The image variation should be sorted by name"
                    );
                }, this));
            }, this));

            this.view.set('active', true);
            this.wait();
        },

        "Should pass an empty image variation configuration in `eZ` configuration": function () {
            var eZConfig;

            this.config.imageVariations = undefined;
            this.view.set('active', true);

            eZConfig = this.view.get('editor').get('nativeEditor').config.eZ;
            Assert.isObject(
                 eZConfig,
                "The editor should have received the eZ configuration"
            );
            Assert.isArray(
                eZConfig.imageVariations,
                "The eZ configuration should contain the image variations"
            );
            Assert.areEqual(
                0, eZConfig.imageVariations.length,
                "The eZ Configuration should contain 0 variation"
            );
        },
    });

    rerenderEditorTest = new Y.Test.Case({
        name: "eZ RichText View rerender test",

        setUp: editorTest.setUp,

        tearDown: destroyTearDown,

        _getEditorMock: function () {
            var editorMock = new Mock();

            Mock.expect(editorMock, {
                method: 'destroy',
            });
            return editorMock;
        },

        _reRender: function (editorMock) {
            this.view.set('active', true);
            this.view._set('editor', editorMock);
            this.view.render();
        },

        "Should destroy the editor": function () {
            var editorMock = this._getEditorMock();

            this._reRender(editorMock);
            Mock.verify(editorMock);
        },

        "Shoulde create a new instance of AlloyEditor": function () {
            var editorMock = this._getEditorMock();

            this._reRender(editorMock);
            Assert.isInstanceOf(
                Y.eZ.AlloyEditor.Core, this.view.get('editor'),
                "An instance of AlloyEditor should have been created"
            );
        },

        "Should set the toolbar configuration": function () {
            var editorMock = this._getEditorMock();

            this._reRender(editorMock);
            Assert.areSame(
                this.view.get('toolbarsConfig'),
                this.view.get('editor').get('toolbars'),
                "The toolbarsConfig attribute should be used as the toolbars config"
            );
        },

        _validationTestOnEvent: function (evtName) {
            var editorMock = this._getEditorMock(),
                validated = false;

            this._reRender(editorMock);

            this.view.after('errorStatusChange', function () {
                validated = true;
            });
            this.view.get('editor').get('nativeEditor').fire(evtName);

            Assert.isTrue(validated, "The input should have been validated");
        },

        "Should validate the input on blur": function () {
            this._validationTestOnEvent('blur');
        },

        "Should validate the input on focus": function () {
            this._validationTestOnEvent('focus');
        },

        "Should validate the input on change": function () {
            this._validationTestOnEvent('change');
        },

        _testExtraPlugins: function (plugin) {
            var editorMock = this._getEditorMock();

            this._reRender(editorMock);
            Assert.isTrue(
                this.view.get('editor').get('extraPlugins').indexOf(plugin) !== -1,
                "The '" + plugin + "' plugin should be loaded"
            );
        },

        "Should add the ezaddcontent plugin": function () {
            this._testExtraPlugins('ezaddcontent');
        },

        "Should add the ezremoveblock plugin": function () {
            this._testExtraPlugins('ezremoveblock');
        },

        "Should add the widget plugin": function () {
            this._testExtraPlugins('widget');
        },

        "Should add the ezembed plugin": function () {
            this._testExtraPlugins('ezembed');
        },

        "Should add the ezfocusblock plugin": function () {
            this._testExtraPlugins('ezfocusblock');
        },

        "Should pass the `eZ` configuration": function () {
            var editorMock = this._getEditorMock(),
                eZConfig;

            this._reRender(editorMock);
            eZConfig = this.view.get('editor').get('nativeEditor').config.eZ;
            Assert.isObject(
                eZConfig,
                "The editor should have received the eZ configuration"
            );
            Assert.areEqual(
                eZConfig.editableRegion,
                '.ez-richtext-editable',
                "The eZ configuration should contain the selector for the editable region"
            );
        },

        "Should pass the image variation configuration in `eZ` configuration": function () {
            var editorMock = this._getEditorMock(),
                eZConfig;

            this._reRender(editorMock);
            eZConfig = this.view.get('editor').get('nativeEditor').config.eZ;

            Assert.isObject(
                eZConfig,
                "The editor should have received the eZ configuration"
            );
            Assert.isArray(
                eZConfig.imageVariations,
                "The eZ configuration should contain the image variations"
            );
            Assert.areEqual(
                Object.keys(this.config.imageVariations).length, eZConfig.imageVariations.length,
                "The eZ Configuration should contain " + Object.keys(this.config).length + " variations"
            );
            Assert.areEqual(
                "large", eZConfig.imageVariations[0].identifier,
                "The image variation should be sorted by name"
            );
            Assert.areEqual(
                "large", eZConfig.imageVariations[0].name,
                "The image variation should be sorted by name"
            );
            Assert.areEqual(
                "small", eZConfig.imageVariations[1].identifier,
                "The image variation should be sorted by name"
            );
            Assert.areEqual(
                "small", eZConfig.imageVariations[1].name,
                "The image variation should be sorted by name"
            );
        },

        "Should pass an empty image variation configuration in `eZ` configuration": function () {
            var editorMock = this._getEditorMock(),
                eZConfig;

            this.config.imageVariations = undefined;
            this._reRender(editorMock);
            eZConfig = this.view.get('editor').get('nativeEditor').config.eZ;

            Assert.isObject(
                 eZConfig,
                "The editor should have received the eZ configuration"
            );
            Assert.isArray(
                eZConfig.imageVariations,
                "The eZ configuration should contain the image variations"
            );
            Assert.areEqual(
                0, eZConfig.imageVariations.length,
                "The eZ Configuration should contain 0 variation"
            );
        },
    });

    focusModeTest = new Y.Test.Case({
        name: "eZ RichText View focus mode test",

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
            });
            Mock.expect(this.version, {
                method: 'toJSON',
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: {isRequired: false},
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                editorContentProcessors: [],
                processors: [],
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should be false by default": function () {
            Assert.isFalse(
                this.view.get('focusMode'),
                "The focus mode should be disabled"
            );
        },

        "Should enable the focus mode on tap on the focus button": function () {
            var that = this,
                button = this.view.get('container').one('.ez-richtext-switch-focus');

            this.view.get('container').once('tap', function (e) {
                that.resume(function () {
                    Assert.isTrue(
                        !!e.prevented,
                        "The tap event should be prevented"
                    );
                    Assert.isTrue(
                        this.view.get('focusMode'),
                        "The focus mode should be enabled"
                    );
                });
            });

            button.simulateGesture('tap');
            this.wait();
        },

        "Should disable the focus mode on tap on the save and return button": function () {
            var that = this,
                button = this.view.get('container').one('.ez-richtext-save-and-return');

            this.view._set('focusMode', true);
            this.view.get('container').once('tap', function (e) {
                that.resume(function () {
                    Assert.isTrue(
                        !!e.prevented,
                        "The tap event should be prevented"
                    );
                    Assert.isFalse(
                        this.view.get('focusMode'),
                        "The focus mode should be disabled"
                    );
                });
            });

            button.simulateGesture('tap');
            this.wait();
        },

        "Should add the focused class": function () {
            this.view._set('focusMode', true);
            Assert.isTrue(
                this.view.get('container').hasClass('is-focused'),
                "The view container should get the focused class"
            );
        },

        "Should remove the focused class": function () {
            this["Should add the focused class"]();
            this.view._set('focusMode', false);
            Assert.isFalse(
                this.view.get('container').hasClass('is-focused'),
                "The view container should not get the focused class"
            );
        },

    });

    editorFocusHandlingTest = new Y.Test.Case({
        name: "eZ RichText View editor focus handling test",

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
            });
            Mock.expect(this.version, {
                method: 'toJSON',
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: {isRequired: false},
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                config: {
                    rootInfo: {
                        ckeditorPluginPath: '../../..',
                    }
                },
                editorContentProcessors: [],
                processors: [],
            });
            this.view.render();
        },

        tearDown: destroyTearDown,

        _testClassOnEvent: function (evtName, assertFunc) {
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    this.view.get('editor').get('nativeEditor').fire(evtName);

                    assertFunc.apply(this);
                }, this));
            }, this));

            this.view.set('active', true);
            this.wait();
        },

        "Should add the editor focused class": function () {
            this._testClassOnEvent('focus', function () {
                Assert.isTrue(
                    this.view.get('container').hasClass('is-editor-focused'),
                    "The editor focused class should be added to the container"
                );
            });
        },

        "Should remove the editor focused class": function () {
            this["Should add the editor focused class"]();
            this._testClassOnEvent('blur', function () {
                Assert.isFalse(
                    this.view.get('container').hasClass('is-editor-focused'),
                    "The editor focused class should be removed from the container"
                );
            });
        },
    });

    eventForwardTest = new Y.Test.Case({
        name: "eZ RichText View eventForward test",

        setUp: function () {
            this.field = {id: 42, fieldValue: {xhtml5edit: ""}};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
            });
            Mock.expect(this.version, {
                method: 'toJSON',
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
            });

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: {isRequired: false},
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                config: {
                    rootInfo: {
                        ckeditorPluginPath: '../../..',
                    }
                },
                editorContentProcessors: [],
                processors: [],
            });
            this.view.render();
        },

        tearDown: destroyTearDown,

        _testForwardEvent: function (evtName) {
            var eventInfo = {title: "I Am the Highway"},
                eventFired = false;

            this.view.once(evtName, function (e) {
                eventFired = true;
                Assert.areEqual(
                    eventInfo.title,
                    e.title,
                    "The event should provide the eventInfo"
                );
            });
            this.view.onceAfter('activeChange', Y.bind(function () {
                this.view.get('editor').get('nativeEditor').on('instanceReady', this.next(function () {
                    this.view.get('editor').get('nativeEditor').fire(evtName, eventInfo);
                    Assert.isTrue(
                        eventFired,
                        "The " + evtName + " event should have been fired"
                    );
                }, this));
            }, this));

            this.view.set('active', true);
            this.wait();
        },

        "Should forward the contentDiscover event": function () {
            this._testForwardEvent('contentDiscover');
        },

        "Should forward the loadImageVariation event": function () {
            this._testForwardEvent('loadImageVariation');
        },

        "Should forward the contentSearch event": function () {
            this._testForwardEvent('contentSearch');
        },

        "Should forward the instanceReady event": function () {
            var eventFired = false;

            this.view.once('instanceReady', function () {
                eventFired = true;
            });
            this.view.set('active', true);
            this.view.get('editor').get('nativeEditor').fire('instanceReady');

            Assert.isTrue(
                eventFired, "The instanceReady event should have been fired by the view"
            );
        },

        "Should forward the updatedEmbed event": function () {
            this._testForwardEvent('updatedEmbed');
        },
    });

    appendToolbarConfigTest = new Y.Test.Case({
        name: "eZ RichText View ezaddcontent toolbar config test",

        setUp: function () {
            this.view = new Y.eZ.RichTextEditView({editorContentProcessors: [], processors: []});
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testButton: function (identifier) {
            var config = this.view.get('toolbarsConfig').ezadd;

            Assert.isTrue(
                config.buttons.indexOf(identifier) !== -1,
                "The '" + identifier + "' should be configured"
            );
        },

        "Should configure the ezheading button": function () {
            this._testButton('ezheading');
        },

        "Should configure the ezembed button": function () {
            this._testButton('ezembed');
        },

        "Should configure the ezparagraph button": function () {
            this._testButton('ezparagraph');
        },

        "Should configure the ezimage button": function () {
            this._testButton('ezimage');
        },
    });

    defaultEditorProcessorsTest = new Y.Test.Case({
        name: "eZ RichText View default editorContentProcessors test",

        setUp: function () {
            Y.eZ.EditorContentProcessorRemoveIds = function () {};
            Y.eZ.EditorContentProcessorXHTML5Edit = function () {};
            Y.eZ.EditorContentProcessorEmptyEmbed = function () {};
            this.view = new Y.eZ.RichTextEditView({processors: []});
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.EditorContentProcessorRemoveIds;
            delete Y.eZ.EditorContentProcessorXHTML5Edit;
            delete Y.eZ.EditorContentProcessorEmptyEmbed;
        },

        "Should have some default editorContentProcessors": function () {
            var processors = this.view.get('editorContentProcessors');

            Assert.isArray(processors, "The processors should be in an array");
            Assert.areEqual(
                3, processors.length,
                "The view should have 3 processors by default"
            );
            Y.Array.each(processors, function (processor) {
                if (
                    !(processor instanceof Y.eZ.EditorContentProcessorRemoveIds)
                    &&
                    !(processor instanceof Y.eZ.EditorContentProcessorXHTML5Edit)
                    &&
                    !(processor instanceof Y.eZ.EditorContentProcessorEmptyEmbed)
                ) {
                    Y.fail(
                        "The processor should be an instance of EditorContentProcessorRemoveIds"
                        + "or EditorContentProcessorXHTML5Edit or EditorContentProcessorEmptyEmbed"
                    );
               }
            });
        },
    });

    defaultProcessorsTest = new Y.Test.Case({
        name: "eZ RichText View default processors test",

        setUp: function () {
            Y.eZ.RichTextResolveEmbed = function () {};
            Y.eZ.RichTextResolveImage = function () {};
            this.view = new Y.eZ.RichTextEditView({editorContentProcessors: []});
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.RichTextResolveEmbed;
            delete Y.eZ.RichTextResolveImage;
        },

        "Should have 2 processors": function () {
            var processors = this.view.get('processors');

            Assert.areEqual(
                2, processors.length,
                "2 processor should be configured by default"
            );
            Assert.isInstanceOf(
                Y.eZ.RichTextResolveImage, processors[0].processor,
                "The processor should be an instance of Y.eZ.RichTextResolveImage"
            );
            Assert.isInstanceOf(
                Y.eZ.RichTextResolveEmbed, processors[1].processor,
                "The processor should be an instance of Y.eZ.RichTextResolveEmbed"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "RichText Edit View registration test";
    registerTest.viewType = Y.eZ.RichTextEditView;
    registerTest.viewKey = "ezrichtext";

    Y.Test.Runner.setName("eZ RichText Edit View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(validateTest);
    Y.Test.Runner.add(getFieldTest);
    Y.Test.Runner.add(editorTest);
    Y.Test.Runner.add(rerenderEditorTest);
    Y.Test.Runner.add(focusModeTest);
    Y.Test.Runner.add(appendToolbarConfigTest);
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(editorFocusHandlingTest);
    Y.Test.Runner.add(eventForwardTest);
    Y.Test.Runner.add(defaultEditorProcessorsTest);
    Y.Test.Runner.add(defaultProcessorsTest);
}, '', {
    requires: [
        'test',
        'base',
        'view',
        'event-tap',
        'node-event-simulate',
        'fake-toolbarconfig',
        'editviewregister-tests',
        'ez-richtext-editview'
    ]
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-richtext-editview-tests', function (Y) {
    var renderTest, registerTest, validateTest, getFieldTest,
        editorTest, focusModeTest, editorFocusHandlingTest,
        actionBarTest, destructorTest, appendToolbarConfigTest,
        eventForwardTest,
        VALID_XHTML, INVALID_XHTML, RESULT_XHTML, EMPTY_XHTML, FIELDVALUE_RESULT,
        Assert = Y.Assert, Mock = Y.Mock;

    INVALID_XHTML = "I'm invalid";

    VALID_XHTML = '<?xml version="1.0" encoding="UTF-8"?>';
    VALID_XHTML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit">';
    VALID_XHTML += '<p>I\'m not empty</p></section>';

    EMPTY_XHTML = '<?xml version="1.0" encoding="UTF-8"?>';
    EMPTY_XHTML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit"/>';

    RESULT_XHTML = '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit" contenteditable="true" class="ez-richtext-editable">';
    RESULT_XHTML += '<p>I\'m not empty</p></section>';

    FIELDVALUE_RESULT = '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit">';
    FIELDVALUE_RESULT += '<p>I\'m not empty</p></section>';

    CKEDITOR.plugins.add('ezaddcontent', {});
    CKEDITOR.plugins.add('ezremoveblock', {});
    CKEDITOR.plugins.add('ezembed', {});
    CKEDITOR.plugins.add('ezfocusblock', {});

    renderTest = new Y.Test.Case({
        name: "eZ RichText View render test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            var Bar, that = this;

            this.barRendered = false;
            Bar = Y.Base.create('testBarView', Y.View, [], {
                render: function () {
                    that.barRendered = true;
                    return this;
                },
            });

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
                actionBar: new Bar(),
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should render the actionBar": function () {
            var barContainer;

            this.view.set('fieldDefinition', this._getFieldDefinition(false));
            this.view.render();

            Assert.isTrue(
                this.barRendered,
                "The action bar should have been rendered"
            );
            barContainer = this.view.get('container').one('.ez-focusmodeactionbar-container');
            Assert.isTrue(
                barContainer.contains(this.view.get('actionBar').get('container')),
                "The action bar should be added to the bar container"
            );
        },

        _testAvailableVariables: function (required, expectRequired, xhtml5edit, expectedXhtml) {
            var fieldDefinition = this._getFieldDefinition(required),
                origTpl = this.view.template,
                that = this;

            this.field.fieldValue.xhtml5edit = xhtml5edit;
            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(7, Y.Object.keys(variables).length, "The template should receive 7 variables");

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
        }
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
                actionBar: new Y.View(),
                config: {
                    rootInfo: {
                        ckeditorPluginPath: '../../..',
                    }
                },
            });
        },

        tearDown: function () {
            this.view.set('active', false);
            this.view.destroy();
        },

        "Should not detect any validation issue on a non required field": function () {
            var fieldDefinition = this._getFieldDefinition(false);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            this.view.validate();

            Assert.isTrue(
                this.view.isValid(),
                "A non required and empty field should be valid"
            );
        },

        "Should not validate a buggy and required field": function () {
            var fieldDefinition = this._getFieldDefinition(true);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            this.view.validate();

            Assert.isFalse(
                this.view.isValid(),
                "A required and empty field should not be valid"
            );
        },

        "Should not validate an empty and required field": function () {
            var fieldDefinition = this._getFieldDefinition(true);

            this.field.fieldValue.xhtml5edit = EMPTY_XHTML;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            this.view.validate();

            Assert.isFalse(
                this.view.isValid(),
                "A required and empty field should not be valid"
            );
        },

        "Should validate a filled and required field": function () {
            var fieldDefinition = this._getFieldDefinition(true);

            this.field.fieldValue.xhtml5edit = VALID_XHTML;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
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

            this.view = new Y.eZ.RichTextEditView({
                container: '.container',
                field: this.field,
                content: this.model,
                version: this.model,
                contentType: this.model,
                actionBar: new Y.View(),
                config: {
                    rootInfo: {
                        ckeditorPluginPath: '../../..',
                    }
                },
            });
        },

        tearDown: function () {
            this.view.set('active', false);
            this.view.destroy();
        },

        "Should return an object": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                field;

            this.field.fieldValue.xhtml5edit = VALID_XHTML;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
            field = this.view.getField();

            Assert.isObject(field, "The field should be an object");
            Assert.areNotSame(
                this.field, field,
                "The getField method should be return a different object"
            );
            Assert.isObject(field.fieldValue, "The fieldValue should be an object");
            Assert.areEqual(
                FIELDVALUE_RESULT, field.fieldValue.xml,
                "The xml property of the fieldValue should come from the editor"
            );
        },
    });

    editorTest = new Y.Test.Case({
        name: "eZ RichText View editor test",

        setUp: function () {
            this.config = {
                rootInfo: {
                    ckeditorPluginPath: '../../..',
                }
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
                actionBar: new Y.View(),
                config: this.config,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.set('active', false);
            this.view.destroy();
        },

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
            this.view.set('active', true);

            Assert.isInstanceOf(
                Y.eZ.AlloyEditor.Core, this.view.get('editor'),
                "An instance of AlloyEditor should have been created"
            );
        },

        "Should set the toolbar configuration": function () {
            this.view.set('active', true);
            Assert.areSame(
                this.view.get('toolbarsConfig'),
                this.view.get('editor').get('toolbars'),
                "The toolbarsConfig attribute should be used as the toolbars config"
            );
        },

        "Should validate the input on blur": function () {
            var validated = false;

            this.view.after('errorStatusChange', function () {
                validated = true;
            });
            this.view.set('active', true);
            this.view.get('editor').get('nativeEditor').fire('blur');

            Assert.isTrue(validated, "The input should have been validated");
        },

        "Should validate the input on focus": function () {
            var validated = false;

            this.view.after('errorStatusChange', function () {
                validated = true;
            });
            this.view.set('active', true);
            this.view.get('editor').get('nativeEditor').fire('focus');

            Assert.isTrue(validated, "The input should have been validated");
        },

        "Should validate the input on change": function () {
            var validated = false;

            this.view.after('errorStatusChange', function () {
                validated = true;
            });
            this.view.set('active', true);
            this.view.get('editor').get('nativeEditor').fire('change');

            Assert.isTrue(validated, "The input should have been validated");
        },

        _testExtraPlugins: function (plugin) {
            this.view.set('active', true);

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
            var eZConfig;

            this.view.set('active', true);

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
    });

    actionBarTest  = new Y.Test.Case({
        name: "eZ RichText View action bar test",

        setUp: function () {
            this.content = new Mock();

            this.view = new Y.eZ.RichTextEditView({
                content: this.content,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should pass the content to the action bar": function () {
            Assert.areSame(
                this.view.get('content'),
                this.view.get('actionBar').get('content'),
                "The action bar should get the content"
            );
        },

        "Should set the view as a bubble target of the action bar": function () {
            var bubbled = false,
                evt = 'test';

            this.view.on('*:' + evt, function () {
                bubbled = true;
            });
            this.view.get('actionBar').fire(evt);

            Assert.isTrue(bubbled, "The event should bubble to the view");
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
                actionBar: new Y.View(),
            });
            this.view.get('actionBar').addTarget(this.view);
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

        "Should disbale the focus mode on saveReturnAction event": function () {
            this.view._set('focusMode', true);

            this.view.get('actionBar').fire('saveReturnAction');
            Assert.isFalse(
                this.view.get('focusMode'),
                "The focus mode should be disabled"
            );
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

    destructorTest = new Y.Test.Case({
        name: "eZ RichText View destructor test",

        setUp: function () {
            this.view = new Y.eZ.RichTextEditView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should destroy the action bar": function () {
            this.view.destroy();
            Assert.isTrue(
                this.view.get('actionBar').get('destroyed'),
                "The action bar should have been destroyed"
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
                actionBar: new Y.View(),
                config: {
                    rootInfo: {
                        ckeditorPluginPath: '../../..',
                    }
                },
            });
            this.view.get('actionBar').addTarget(this.view);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should add the editor focused class": function () {
            this.view.render();
            this.view.set('active', true);
            this.view.get('editor').get('nativeEditor').fire('focus');
            Assert.isTrue(
                this.view.get('container').hasClass('is-editor-focused'),
                "The editor focused class should be added to the container"
            );
        },

        "Should remove the editor focused class": function () {
            this["Should add the editor focused class"]();
            this.view.get('editor').get('nativeEditor').fire('blur');
            Assert.isFalse(
                this.view.get('container').hasClass('is-editor-focused'),
                "The editor focused class should be removed from the container"
            );
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
                actionBar: new Y.View(),
                config: {
                    rootInfo: {
                        ckeditorPluginPath: '../../..',
                    }
                },
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should forward the contentDiscover event": function () {
            var eventInfo = {title: "I Am the Highway"},
                contentDiscoverFired = false;

            this.view.once('contentDiscover', function (e) {
                contentDiscoverFired = true;
                Assert.areEqual(
                    eventInfo.title,
                    e.title,
                    "The event should provide the eventInfo"
                );
            });
            this.view.set('active', true);
            this.view.get('editor').get('nativeEditor').fire('contentDiscover', eventInfo);
            Assert.isTrue(
                contentDiscoverFired,
                "The contentDiscover event should have been fired"
            );
        },
    });

    appendToolbarConfigTest = new Y.Test.Case({
        name: "eZ RichText View ezaddcontent toolbar config test",

        setUp: function () {
            this.view = new Y.eZ.RichTextEditView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testButton: function (identifier) {
            var config = this.view.get('toolbarsConfig').add;

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
    Y.Test.Runner.add(focusModeTest);
    Y.Test.Runner.add(actionBarTest);
    Y.Test.Runner.add(destructorTest);
    Y.Test.Runner.add(appendToolbarConfigTest);
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(editorFocusHandlingTest);
    Y.Test.Runner.add(eventForwardTest);
}, '', {requires: ['test', 'base', 'view', 'node-event-simulate', 'fake-toolbarconfig', 'editviewregister-tests', 'ez-richtext-editview']});

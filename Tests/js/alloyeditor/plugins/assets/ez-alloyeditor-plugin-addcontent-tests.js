/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-addcontent-tests', function (Y) {
    var definePluginTest, commandTest, appendElementTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor addcontent plugin define test",

        setUp: function () {
            this.editor = new Mock();
            Mock.expect(this.editor, {
                method: 'addCommand',
                args: ['eZAddContent', Mock.Value.Object],
            });
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the addcontent plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezaddcontent');

            Assert.isObject(
                plugin,
                "The ezaddcontent should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezaddcontent",
                "The plugin name should be ezaddcontent"
            );
        },

        "Should define the eZAddContent command": function () {
            var plugin = CKEDITOR.plugins.get('ezaddcontent');

            plugin.init(this.editor);
            Mock.verify(this.editor);
        },

        "Should define the `eZ` property on the editor": function () {
            var plugin = CKEDITOR.plugins.get('ezaddcontent');

            plugin.init(this.editor);
            Assert.isObject(
                this.editor.eZ,
                "The `eZ` property should have been defined"
            );
        },
    });

    commandTest = new Y.Test.Case({
        name: "eZ AlloyEditor addcontent plugin command test",

        "async:init": function () {
            var startTest = this.callback();

            this.container = Y.one('.container');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezaddcontent',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
            this.container.setHTML(this.containerContent);
        },

        "Should add the content to the editable region": function () {
            var tagDefinition = {
                    tagName: 'h1',
                    content: 'The Memory Remains',
                    attributes: {'class': 'added'},
                },
                tagDefinition2 = {
                    tagName: 'h1',
                    attributes: {'class': 'added2'},
                },
                res, node,

            nativeEditor = this.editor.get('nativeEditor');

            res = nativeEditor.execCommand('eZAddContent', tagDefinition);
            Assert.isTrue(res, "The command should have been executed");

            node = Y.one('.added');
            Assert.areEqual(
                tagDefinition.tagName, node.get('tagName').toLowerCase(),
                "A h1 should have been created"
            );
            Assert.areEqual(
                tagDefinition.content, node.get('text'),
                "A h1 should have been created with the content"
            );

            res = nativeEditor.execCommand('eZAddContent', tagDefinition2);
            Assert.isTrue(res, "The command should have been executed");

            node = Y.one('.added2');
            Assert.areEqual(
                tagDefinition2.tagName, node.get('tagName').toLowerCase(),
                "A h1 should have been created"
            );
            Assert.areEqual(
                "<br>", node.getHTML(),
                "The element should have a <br> as unique child"
            );
        },

        "Should add the content after the selected element": function () {
            var tagDefinition = {
                    tagName: 'h1',
                    content: 'A thousand trees',
                    attributes: {'class': 'added3'},
                },
                nativeEditor = this.editor.get('nativeEditor'),
                selectedElement = nativeEditor.element.findOne('.listening'),
                res, newElement;

            nativeEditor.getSelection().fake(selectedElement);

            res = nativeEditor.execCommand('eZAddContent', tagDefinition);
            Assert.isTrue(res, "The command should have been executed");

            newElement = nativeEditor.element.findOne('.added3');
            Assert.areSame(
                selectedElement.$, newElement.getPrevious().$,
                "The tag should have been added after the selected element"
            );
        },

        "Should fire the corresponding `editorInteraction` event": function () {
            var tagDefinition = {
                    tagName: 'h1',
                    content: 'Hey, Johnny Park!',
                    attributes: {'class': 'added-event'},
                },
                editorInteractionFired = false,
                nativeEditor = this.editor.get('nativeEditor');

            this.editor.get('nativeEditor').once('editorInteraction', function (e) {
                editorInteractionFired = true;
                Assert.areEqual(
                    'eZAddContentDone', e.data.nativeEvent.name,
                    "The nativeEvent name should eZAddContentDone"
                );
                Assert.areSame(
                    nativeEditor, e.data.nativeEvent.editor,
                    "The nativeEvent should provide the editor"
                );
                Assert.areSame(
                    Y.one('.added-event').getDOMNode(), e.data.nativeEvent.target,
                    "The nativeEvent should have the added node as target"
                );
            });

            nativeEditor.execCommand('eZAddContent', tagDefinition);
            Assert.isTrue(editorInteractionFired, 'The editorInteraction event should have been fired');
        },

        "Should fire the corresponding `editorInteraction` event on the focus element": function () {
            var tagDefinition = {
                    tagName: 'ul',
                    content: '<li></li>',
                    attributes: {'class': 'added-event-custom-focus'},
                    focusElement: 'li',
                },
                editorInteractionFired = false,
                nativeEditor = this.editor.get('nativeEditor');

            this.editor.get('nativeEditor').once('editorInteraction', function (e) {
                editorInteractionFired = true;
                Assert.areNotSame(
                    Y.one('.added-event-custom-focus').getDOMNode(), e.data.nativeEvent.target,
                    "The nativeEvent should not have the added node as target"
                );
                Assert.areSame(
                    Y.one('.added-event-custom-focus ' + tagDefinition.focusElement).getDOMNode(),
                    e.data.nativeEvent.target,
                    "The nativeEvent should have the focusElement as target"
                );
            });

            nativeEditor.execCommand('eZAddContent', tagDefinition);
            Assert.isTrue(editorInteractionFired, 'The editorInteraction event should have been fired');
        },

        "Should add the content to the editable region with the expected HTML content": function () {
            var tagDefinition = {
                    tagName: 'p',
                    content: '<b>The Memory Remains</b>',
                    attributes: {'class': 'added-html'},
                },
                res, node,

            nativeEditor = this.editor.get('nativeEditor');

            res = nativeEditor.execCommand('eZAddContent', tagDefinition);
            Assert.isTrue(res, "The command should have been executed");

            node = Y.one('.added-html');
            Assert.areEqual(
                tagDefinition.tagName, node.get('tagName').toLowerCase(),
                "A p should have been created"
            );
            Assert.areEqual(
                "The Memory Remains", node.one('b').getContent(),
                "The p should contain a <b> element"
            );
        },
    });

    appendElementTest = new Y.Test.Case({
        name: "eZ AlloyEditor addcontent appendElement test",

        "async:init": function () {
            var startTest = this.callback();

            this.editor = AlloyEditor.editable(
                Y.one('.container-appendelement').getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezaddcontent',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
            this.container.setHTML(this.containerContent);
        },

        _createElement: function () {
            return CKEDITOR.dom.element.createFromHtml('<p class="added">Added</p>');
        },

        "Should add the content in the beginning of the document": function () {
            var element = this._createElement(),
                editor = this.editor.get('nativeEditor');

            editor.eZ.appendElement(element);

            Assert.areSame(
                editor.element.getChild(0).$,
                element.$,
                "The element should have been added at the beginning"
            );
        },

        "Should add the content after the selected element": function () {
            var element = this._createElement(),
                editor = this.editor.get('nativeEditor'),
                ref = editor.element.findOne('.listening');

            editor.getSelection().fake(ref);
            editor.eZ.appendElement(element);

            Assert.areSame(
                ref.$,
                element.getPrevious().$,
                "The element should have been added after the selected element"
            );
        },

        "Should add the content after the first block in the path": function () {
            var element = this._createElement(),
                editor = this.editor.get('nativeEditor'),
                ref = editor.element.findOne('li'),
                list = editor.element.findOne('ul');

            editor.getSelection().fake(ref);
            editor.eZ.appendElement(element);

            Assert.areSame(
                list.$,
                element.getPrevious().$,
                "The element should have been added after the list"
            );

        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor addcontent plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(commandTest);
    Y.Test.Runner.add(appendElementTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-addcontent']});

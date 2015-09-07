/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-appendcontent-tests', function (Y) {
    var definePluginTest, commandTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor appendcontent plugin define test",

        setUp: function () {
            this.editor = new Mock();
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the appendcontent plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezappendcontent');

            Assert.isObject(
                plugin,
                "The ezappendcontent should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezappendcontent",
                "The plugin name should be ezappendcontent"
            );
        },

        "Should define the eZAppendContent command": function () {
            var plugin = CKEDITOR.plugins.get('ezappendcontent');

            Mock.expect(this.editor, {
                method: 'addCommand',
                args: ['eZAppendContent', Mock.Value.Object],
            });
            plugin.init(this.editor);
            Mock.verify(this.editor);
        },
    });

    commandTest = new Y.Test.Case({
        name: "eZ AlloyEditor appendcontent plugin command test",

        "async:init": function () {
            var startTest = this.callback();

            this.editor = AlloyEditor.editable(
                Y.one('.container').getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezappendcontent',
                    eZ: {
                        editableRegion: '.editable',
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        "Should append the content to the editable region": function () {
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

            res = nativeEditor.execCommand('eZAppendContent', tagDefinition);
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

            res = nativeEditor.execCommand('eZAppendContent', tagDefinition2);
            Assert.isTrue(res, "The command should have been executed");

            node = Y.one('.added2');
            Assert.areEqual(
                tagDefinition2.tagName, node.get('tagName').toLowerCase(),
                "A h1 should have been created"
            );
        },

        "Should fire the corresponding `editorInteraction` event": function () {
            var tagDefinition = {
                    tagName: 'h1',
                    content: 'Hey, Johnny Park!',
                    attributes: {'class': 'added-event'},
                },
                nativeEditor = this.editor.get('nativeEditor');

            this.editor.get('nativeEditor').on('editorInteraction', function (e) {
                Assert.areEqual(
                    'eZAppendContentDone', e.data.nativeEvent.name,
                    "The nativeEvent name should eZAppendContentDone"
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

            nativeEditor.execCommand('eZAppendContent', tagDefinition);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor appendcontent plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(commandTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-appendcontent']});

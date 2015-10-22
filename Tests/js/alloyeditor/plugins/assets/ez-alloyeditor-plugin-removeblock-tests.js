/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-removeblock-tests', function (Y) {
    var definePluginTest, removeTest, focusTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor removeblock plugin define test",

        setUp: function () {
            this.editor = new Mock();
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the removeblock plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezremoveblock');

            Assert.isObject(
                plugin,
                "The ezremoveblock should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezremoveblock",
                "The plugin name should be ezremoveblock"
            );
        },

        "Should define the eZRemoveBlock command": function () {
            var plugin = CKEDITOR.plugins.get('ezremoveblock');

            Mock.expect(this.editor, {
                method: 'addCommand',
                args: ['eZRemoveBlock', Mock.Value.Object],
            });
            plugin.init(this.editor);
            Mock.verify(this.editor);
        },
    });

    removeTest = new Y.Test.Case({
        name: "eZ AlloyEditor eZRemoveBlock command test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezremoveblock,widget,ezembed',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
            this.container.set('innerHTML', '');
        },

        _removeElement: function (html, id) {
            var editor = this.editor.get('nativeEditor'),
                selection = editor.getSelection();

            editor.setData(html);
            selection.selectElement(editor.element.findOne(id));
            editor.execCommand('eZRemoveBlock');
        },

        _removeWidget: function (html, id) {
            var editor = this.editor.get('nativeEditor');

            editor.setData(html);
            editor.widgets.getByElement(editor.element.findOne(id)).focus();
            editor.execCommand('eZRemoveBlock');
        },

        "Should remove the current block element": function () {
            this._removeElement(
                '<p id="remove-me">Remove me</p>',
                '#remove-me'
            );
            Assert.isNull(
                Y.one('#remove-me'),
                "The selected element should have been removed"
            );
        },

        "Should remove the widget element": function () {
            this._removeWidget(
                '<div data-ezelement="ezembed" id="remove-me">Remove me</div>',
                '#remove-me'
            );
            Assert.isNull(
                Y.one('#remove-me'),
                "The widget should have been removed"
            );
        },
    });

    focusTest= new Y.Test.Case({
        name: "eZ AlloyEditor eZRemoveBlock command focus change test test",

        "async:init": function () {
            var startTest = this.callback();

            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezremoveblock',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
            this.container.set('innerHTML', '');
        },

        _removeElement: function (html, id) {
            var editor = this.editor.get('nativeEditor'),
                selection = editor.getSelection();

            editor.setData(html);
            selection.selectElement(editor.element.findOne(id));
            editor.execCommand('eZRemoveBlock');
        },

        "Should give the focus to the next sibling element": function () {
            var editor = this.editor.get('nativeEditor'),
                editorInteractionFired = false;

            editor.once('editorInteraction', function (evt) {
                var natEvt = evt.data.nativeEvent,
                    remaining = Y.one('#remaining').getDOMNode();

                editorInteractionFired = true;
                Assert.areSame(
                    editor, natEvt.editor,
                    "The editor should be provided in the native event"
                );
                Assert.areSame(
                    remaining, natEvt.target,
                    "The target should be the newly focused element"
                );
                Assert.areEqual(
                    remaining, editor.getSelection().getStartElement().$,
                    "The next sibling element should have been selected"
                );
            });
            this._removeElement(
                '<p id="remove-me">Remove me</p><p id="remaining">Next remaining</p>',
                '#remove-me'
            );
            Assert.isTrue(
                editorInteractionFired,
                "The `editorInteraction` event should have been fired"
            );
        },

        "Should give the focus to the previous sibling": function () {
            var editor = this.editor.get('nativeEditor'),
                editorInteractionFired = false;

            editor.once('editorInteraction', function (evt) {
                var natEvt = evt.data.nativeEvent,
                    remaining = Y.one('#remaining').getDOMNode();

                editorInteractionFired = true;
                Assert.areSame(
                    editor, natEvt.editor,
                    "The editor should be provided in the native event"
                );
                Assert.areSame(
                    remaining, natEvt.target,
                    "The target should be the newly focused element"
                );
                Assert.areEqual(
                    remaining, editor.getSelection().getStartElement().$,
                    "The next sibling element should have been selected"
                );
            });
            this._removeElement(
                '<p id="remaining">Next remaining</p><p id="remove-me">Remove me</p>',
                '#remove-me'
            );
            Assert.isTrue(
                editorInteractionFired,
                "The `editorInteraction` event should have been fired"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor removeblock plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(removeTest);
    Y.Test.Runner.add(focusTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-removeblock', 'ez-alloyeditor-plugin-embed']});

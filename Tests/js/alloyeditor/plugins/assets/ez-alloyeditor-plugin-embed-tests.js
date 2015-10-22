/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-embed-tests', function (Y) {
    var definePluginTest, embedWidgetTest, focusTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed plugin define test",

        setUp: function () {
            this.editor = {};
            this.editor.widgets = new Mock();
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the embed plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezembed');

            Assert.isObject(
                plugin,
                "The ezembed should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezembed",
                "The plugin name should be ezembed"
            );
        },

        "Should define the ezembed widget": function () {
            var plugin = CKEDITOR.plugins.get('ezembed');

            Mock.expect(this.editor.widgets, {
                method: 'add',
                args: ['ezembed', Mock.Value.Object],
            });
            plugin.init(this.editor);
            Mock.verify(this.editor.widgets);
        },
    });

    embedWidgetTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',widget,ezembed',
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

        "Should recognize embed element as a widget": function () {
            var container = this.container;

            Assert.isTrue(
                CKEDITOR.plugins.widget.isDomWidgetElement(
                    new CKEDITOR.dom.node(container.one('#embed').getDOMNode())
                )
            );
        },

        "Should fire editorInteraction on focus": function () {
            var container = this.container,
                editorInteractionFired = false,
                nativeEditor = this.editor.get('nativeEditor'),
                widget, embedDOM;

            embedDOM = container.one('#embed').getDOMNode();

            widget = nativeEditor.widgets.getByElement(
                new CKEDITOR.dom.node(embedDOM)
            );

            nativeEditor.on('editorInteraction', function (evt) {
                editorInteractionFired = true;

                Assert.areSame(
                    embedDOM, evt.data.nativeEvent.target,
                    "The embed dom node should be the event target"
                );
                Assert.isObject(
                    evt.data.selectionData,
                    "selectionData should be an object"
                );
                Assert.areEqual(
                    0, Y.Object.size(evt.data.selectionData),
                    "selectionData should be empty"
                );
            });

            widget.fire('focus');
            Assert.isTrue(
                editorInteractionFired,
                "The editorInteraction event should have been fired"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor embed plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(embedWidgetTest);
    Y.Test.Runner.add(focusTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-alloyeditor-plugin-embed']});

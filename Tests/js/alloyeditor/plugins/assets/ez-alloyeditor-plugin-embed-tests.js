/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-embed-tests', function (Y) {
    var definePluginTest, embedWidgetTest,
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
    
        init: function () {
            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
        },

        setUp: function () {
            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',widget,ezembed',
                }
            );
        },

        "Should recognize ezembed element as a widget": function () {
            var container = this.container;

            this.editor.get('nativeEditor').on('instanceReady', this.next(function () {
                Assert.isTrue(
                    CKEDITOR.plugins.widget.isDomWidgetElement(
                        new CKEDITOR.dom.node(container.one('ezembed').getDOMNode())
                    )
                );
            }));
            this.wait();
        },

    });

    Y.Test.Runner.setName("eZ AlloyEditor embed plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(embedWidgetTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-embed']});

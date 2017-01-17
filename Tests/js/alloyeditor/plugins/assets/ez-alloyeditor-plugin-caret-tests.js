/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-caret-tests', function (Y) {
    var definePluginTest, moveCaretToElementTest, findCaretElementTest,
        Assert = Y.Assert;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor caret plugin define test",

        setUp: function () {
            this.editor = {};
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the caret plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezcaret');

            Assert.isObject(
                plugin,
                "The ezcaret plugin should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezcaret",
                "The plugin name should be ezcaret"
            );
        },

        "Should define the `eZ` property on the editor": function () {
            var plugin = CKEDITOR.plugins.get('ezcaret');

            plugin.init(this.editor);
            Assert.isObject(
                this.editor.eZ,
                "The `eZ` property should have been defined"
            );
        },

        "Should handle pre-existing `eZ` namespace": function () {
            var plugin = CKEDITOR.plugins.get('ezcaret'),
                eZ = {};

            this.editor.eZ = eZ;
            plugin.init(this.editor);
            Assert.areSame(
                eZ, this.editor.eZ,
                "The `eZ` property should have been kept"
            );
        },
    });

    moveCaretToElementTest = new Y.Test.Case({
        name: "eZ AlloyEditor caret plugin moveCaretToElement test",

        "async:init": function () {
            var startTest = this.callback();

            this.container = Y.one('.container');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezcaret',
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

        "Should move the caret the given element": function () {
            var editor = this.editor.get('nativeEditor'),
                paragraph = editor.element.findOne('p'),
                path;

            editor.eZ.moveCaretToElement(editor, paragraph);
            path = editor.elementPath();

            Assert.areSame(
                paragraph.$,
                path.block.$,
                "The caret should have been moved to the paragraph"
            );
        },
    });

    findCaretElementTest = new Y.Test.Case({
        name: "eZ AlloyEditor caret plugin findCaretElement test",

        "async:init": function () {
            var startTest = this.callback();

            this.container = Y.one('.container');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezcaret',
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

        "Should return the element itself": function () {
            var editor = this.editor.get('nativeEditor'),
                paragraph = editor.element.findOne('p'),
                caretElement;

            caretElement = editor.eZ.findCaretElement(paragraph);

            Assert.areSame(
                paragraph.$,
                caretElement.$,
                "The element itself should have been returned"
            );
        },

        "Should return the first list item element": function () {
            var editor = this.editor.get('nativeEditor'),
                list = editor.element.findOne('ul'),
                caretElement;

            caretElement = editor.eZ.findCaretElement(list);

            Assert.areSame(
                list.getChild(0).$,
                caretElement.$,
                "The first list item element should have been returned"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor caret plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(moveCaretToElementTest);
    Y.Test.Runner.add(findCaretElementTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-caret']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-focusblock-tests', function (Y) {
    var definePluginTest, selectionChangeTest, blurTest, getDataTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor focusblock plugin define test",

        setUp: function () {
            this.editor = new Mock();
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the focusblock plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezfocusblock');

            Assert.isObject(
                plugin,
                "The ezfocusblock should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezfocusblock",
                "The plugin name should be ezfocusblock"
            );
        },
    });

    selectionChangeTest = new Y.Test.Case({
        name: "eZ AlloyEditor focusblock plugin selectionChange test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container-selectionchange');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezfocusblock,widget,ezembed',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        _moveCaretToElement: function (editor, element) {
            var range = editor.createRange();

            range.moveToPosition(element, CKEDITOR.POSITION_AFTER_START);
            editor.getSelection().selectRanges([range]);
        },

        "Should add the focus block class": function () {
            var editor = this.editor.get('nativeEditor');

            this._moveCaretToElement(editor, editor.element.findOne('blockquote'));

            Assert.isTrue(
                this.container.one('blockquote').hasClass('is-block-focused'),
                "The blockquote should have the focus class"
            );
        },

        "Should handle the case where there's no focus block": function () {
            var editor = this.editor.get('nativeEditor');

            this["Should add the focus block class"]();
            editor.widgets.getByElement(editor.element.findOne('#embed')).focus();

            Assert.areEqual(
                0, this.container.all('.is-block-focused').size(),
                "No element should have the focused class"
            );
        },

        "Should move the focus block class to selected element": function () {
            var editor = this.editor.get('nativeEditor');

            this["Should add the focus block class"]();
            this._moveCaretToElement(editor, editor.element.findOne('p'));

            Assert.isFalse(
                this.container.one('blockquote').hasClass('is-block-focused'),
                "The blockquote should NOT have the focus class"
            );
            Assert.isTrue(
                this.container.one('p').hasClass('is-block-focused'),
                "The p should have the focus class"
            );
        },
    });

    blurTest = new Y.Test.Case({
        name: "eZ AlloyEditor focusblock plugin blur test",

        "async:init": function () {
            var startTest = this.callback();

            this.container = Y.one('.container-blur');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezfocusblock',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        "Should remove the focus block class": function () {
            var editor = this.editor.get('nativeEditor');

            this.container.one('blockquote').addClass('is-block-focused');
            editor.fire('blur');
            Assert.isFalse(
                this.container.one('blockquote').hasClass('is-block-focused'),
                "The blockquote should NOT have the focus class"
            );
            Assert.isFalse(
                this.container.one('p').hasClass('is-block-focused'),
                "The p should NOT have the focus class"
            );
        },

        "Should handle no focus block case": function () {
            this.editor.get('nativeEditor').fire('blur');
            Assert.isFalse(
                this.container.one('blockquote').hasClass('is-block-focused'),
                "The blockquote should NOT have the focus class"
            );
            Assert.isFalse(
                this.container.one('p').hasClass('is-block-focused'),
                "The p should NOT have the focus class"
            );
        },
    });

    getDataTest = new Y.Test.Case({
        name: "eZ AlloyEditor focusblock plugin getData event test",

        "async:init": function () {
            var startTest = this.callback();

            this.editor = AlloyEditor.editable(
                Y.one('.container-getdata').getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezfocusblock',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        _moveCaretToElement: function (editor, element) {
            var range = editor.createRange();

            range.moveToPosition(element, CKEDITOR.POSITION_AFTER_START);
            editor.getSelection().selectRanges([range]);
        },

        "Should remove the focus block class": function () {
            var content, editor = this.editor.get('nativeEditor');

            this._moveCaretToElement(editor, editor.element.findOne('#additional-classes'));

            content = Y.Node.create(editor.getData());
            Assert.areEqual(
                0, content.all('.is-focused-block').size(),
                "The is-focused-block class should be removed"
            );
            Assert.isTrue(
                content.one('#additional-classes').hasClass('additional'),
                "The others classes should be kept"
            );
        },

        "Should remove the empty class attribute": function () {
            // test of the workaround to https://jira.ez.no/browse/EZP-25028
            var content, editor = this.editor.get('nativeEditor');

            this._moveCaretToElement(editor, editor.element.findOne('#only-focusedblock'));

            content = Y.Node.create(editor.getData());
            Assert.areEqual(
                0, content.all('[class=""]').size(),
                "The empty class attribute should be removed"
            );
        },

        "Should handle an invalid DOM structure": function () {
            this.editor.get('nativeEditor').fire('getData', {data: {dataValue: '<invalid></xml>'}});
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor focusblock plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(selectionChangeTest);
    Y.Test.Runner.add(blurTest);
    Y.Test.Runner.add(getDataTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-embed', 'ez-alloyeditor-plugin-focusblock']});

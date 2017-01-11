/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-moveelement-tests', function (Y) {
    var definePluginTest, moveTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor moveelement plugin define test",

        setUp: function () {
            this.editor = new Mock();
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the moveelement plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezmoveelement');

            Assert.isObject(
                plugin,
                "The ezmoveelement should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezmoveelement",
                "The plugin name should be ezmoveelement"
            );
        },

        "Should define the eZMoveUp and eZMoveDown commands": function () {
            var plugin = CKEDITOR.plugins.get('ezmoveelement');

            Mock.expect(this.editor, {
                method: 'addCommand',
                callCount: 2,
                args: [Mock.Value.String, Mock.Value.Object],
                run: function (command, def) {
                    Assert.isTrue(
                        command === 'eZMoveUp' || command === 'eZMoveDown',
                        "The eZMoveUp and eZMoveDown commands should be defined"
                    );
                },
            });
            plugin.init(this.editor);
            Mock.verify(this.editor);
        },
    });

    moveTest = new Y.Test.Case({
        name: "eZ AlloyEditor move commands test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezmoveelement,widget,ezembed',
                }
            );
            this.native = this.editor.get('nativeEditor');
            this.native.on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        _getEmbed: function () {
            return this.native.widgets.getByElement(
                this.native.element.findOne('#embed')
            );
        },

        "Should move up the paragraph": function () {
            var paragraph = this.native.element.findOne('#move'),
                previous = paragraph.getPrevious();

            this.native.eZ.moveCaretToElement(this.native, paragraph);
            this.native.execCommand('eZMoveUp');

            Assert.areSame(
                previous.$,
                paragraph.getNext().$,
                "The paragraph should have been moved before the previous element"
            );
        },

        "Should move up the embed": function () {
            var embed = this._getEmbed(),
                previous = embed.wrapper.getPrevious();

            embed.focus();
            this.native.execCommand('eZMoveUp');

            Assert.areSame(
                previous.$,
                embed.wrapper.getNext().$,
                "The embed should have been moved before the previous element"
            );
        },

        "Should move down the paragraph": function () {
            var paragraph = this.native.element.findOne('#move'),
                next = paragraph.getNext();

            this.native.eZ.moveCaretToElement(this.native, paragraph);
            this.native.execCommand('eZMoveDown');

            Assert.areSame(
                next.$,
                paragraph.getPrevious().$,
                "The paragraph should have been moved after the next element"
            );
        },

        "Should move down the embed": function () {
            var embed = this._getEmbed(),
                next = embed.wrapper.getNext();

            embed.focus();
            this.native.execCommand('eZMoveDown');

            Assert.areSame(
                next.$,
                embed.wrapper.getPrevious().$,
                "The embed should have been moved after the next element"
            );
        },

        "Should handle the case where the first element should be moved up": function () {
            var paragraph = this.native.element.findOne('#first'),
                next = paragraph.getNext();

            this.native.eZ.moveCaretToElement(this.native, paragraph);
            this.native.execCommand('eZMoveUp');

            Assert.isNull(
                paragraph.getPrevious(),
                "The paragraph should still be the first element"
            );
            Assert.areSame(
                next.$,
                paragraph.getNext().$,
                "The paragraph should not have been moved"
            );
        },

        "Should handle the case where the last element should be moved down": function () {
            var paragraph = this.native.element.findOne('#last'),
                previous = paragraph.getPrevious();

            this.native.eZ.moveCaretToElement(this.native, paragraph);
            this.native.execCommand('eZMoveDown');

            Assert.isNull(
                paragraph.getNext(),
                "The paragraph should still be the last element"
            );
            Assert.areSame(
                previous.$,
                paragraph.getPrevious().$,
                "The paragraph should not have been moved"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor moveelement plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(moveTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-moveelement', 'ez-alloyeditor-plugin-embed']});

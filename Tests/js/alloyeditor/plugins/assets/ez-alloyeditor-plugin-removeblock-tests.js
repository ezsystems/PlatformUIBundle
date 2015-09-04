/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-removeblock-tests', function (Y) {
    var definePluginTest, commandTest,
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

    commandTest = new Y.Test.Case({
        name: "eZ AlloyEditor removeblock plugin command test",

        setUp: function () {
            var editor = {
                    addCommand: Y.bind(function (name, command) {
                        this.command = command;
                    }, this)
                };
            CKEDITOR.plugins.get('ezremoveblock').init(editor);
        },

        "Should remove the current block element": function () {
            var editor = new Mock(),
                block = new Mock();

            Mock.expect(editor, {
                method: 'elementPath',
                returns: {
                    block: block
                }
            });
            Mock.expect(block, {
                method: 'remove',
            });

            this.command.exec(editor);
            Mock.verify(block);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor removeblock plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(commandTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-removeblock']});

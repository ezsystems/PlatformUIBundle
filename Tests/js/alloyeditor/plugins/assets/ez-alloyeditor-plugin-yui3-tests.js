/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-yui3-tests', function (Y) {
    var definePluginTest, beforeCommandTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor yui3 plugin define test",

        setUp: function () {
            this.editor = new Mock();
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the yui3 plugin": function () {
            var plugin = CKEDITOR.plugins.get('yui3');

            Assert.isObject(
                plugin,
                "The yui3 should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "yui3",
                "The plugin name should be yui3"
            );
        },
    });

    beforeCommandTest = new Y.Test.Case({
        name: "eZ AlloyEditor yui3 plugin beforeCommandExec test",

        "async:init": function () {
            var startTest = this.callback();

            this.editor = AlloyEditor.editable(
                Y.one('.container').getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',yui3',
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

        "Should clean up the ids": function () {
            this.editor.get('nativeEditor').execCommand('bold');

            Assert.isNull(
                Y.one('#whatever'),
                "The id should have been removed"
            );
            Assert.isNull(
                Y.one('#whatever2'),
                "The id should have been removed"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor yui3 plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(beforeCommandTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-yui3']});

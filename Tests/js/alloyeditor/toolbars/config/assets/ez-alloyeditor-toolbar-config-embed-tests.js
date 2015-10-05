/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-embed-tests', function (Y) {
    var defineTest, testTest,
        Embed = Y.eZ.AlloyEditorToolbarConfig.Embed,
        BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase,
        Assert = Y.Assert, Mock = Y.Mock;

    defineTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ToolbarConfigDefineTest, {
        name: 'eZ AlloyEditor embed config toolbar define test',
        toolbarConfig: Embed,
        toolbarConfigName: "embed",
        methods: {
            getArrowBoxClasses: BlockBase.getArrowBoxClasses,
            setPosition: BlockBase.setPosition,
        },

        _should: {
            ignore: {
                "Should have the correct `test` method": true,
            },
        },
    }));

    testTest = new Y.Test.Case({
        name: 'eZ AlloyEditor embed config toolbar test method test',

        setUp: function () {
            this.editor = new Mock();
            this.nativeEditor = {
                widgets: new Mock(),
            };
            this.widget = null;
            Mock.expect(this.nativeEditor.widgets, {
                method: 'getByElement',
                args: [Mock.Value.Object],
                run: Y.bind(function (target) {
                    Assert.areSame(
                        this.target,
                        target.$,
                        "The nativeEvent target should be used to retrieve the widget"
                    );
                    return this.widget;
                }, this),
            });

            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: this.nativeEditor
            });
            this.target = Y.one('.target').getDOMNode();
        },

        tearDown: function () {
            delete this.editor;
            delete this.nativeEditor;
            delete this.widget;
        },

        "Should check against a widget": function () {
            Assert.isFalse(
                Embed.test({
                    editor: this.editor,
                    data: {
                        nativeEvent: {
                            target: this.target,
                        }
                    }
                }),
                "test should return false without widget"
            );
        },

        "Should check the widget name": function () {
            this.widget = {name: "whatever"};
            Assert.isFalse(
                Embed.test({
                    editor: this.editor,
                    data: {
                        nativeEvent: {
                            target: this.target,
                        }
                    }
                }),
                "test should return false on another widget than ezembed"
            );
        },

        "Should recognize the ezembed widget": function () {
            this.widget = {name: "ezembed"};
            Assert.isTrue(
                Embed.test({
                    editor: this.editor,
                    data: {
                        nativeEvent: {
                            target: this.target,
                        }
                    }
                }),
                "test should return true on an ezembed widget"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor embed config toolbar tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(testTest);
}, '', {
    requires: [
        'test', 'toolbar-config-define-tests', 'node',
        'ez-alloyeditor-toolbar-config-embed',
        'ez-alloyeditor-toolbar-config-block-base',
    ]
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-image-tests', function (Y) {
    var defineTest, testTest,
        Image = Y.eZ.AlloyEditorToolbarConfig.Image,
        BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase,
        Assert = Y.Assert, Mock = Y.Mock;

    defineTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ToolbarConfigDefineTest, {
        name: 'eZ AlloyEditor image config toolbar define test',
        toolbarConfig: Image,
        toolbarConfigName: "image",
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
        name: 'eZ AlloyEditor image config toolbar test method test',

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
                Image.test({
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
                Image.test({
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

        "Should use the widget isImage method": function () {
            this.widget = new Mock();
            Mock.expect(this.widget, {
                method: 'isImage',
                returns: true,
            });
            this.widget.name = 'ezembed';
            Assert.isTrue(
                Image.test({
                    editor: this.editor,
                    data: {
                        nativeEvent: {
                            target: this.target,
                        }
                    }
                }),
                "test should return true on an ezembed widget containing an image"
            );
            Mock.verify(this.widget);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor image config toolbar tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(testTest);
}, '', {
    requires: [
        'test', 'toolbar-config-define-tests', 'node',
        'ez-alloyeditor-toolbar-config-image',
        'ez-alloyeditor-toolbar-config-block-base',
    ]
});

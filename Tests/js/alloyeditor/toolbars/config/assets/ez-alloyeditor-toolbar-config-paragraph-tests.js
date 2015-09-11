/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-paragraph-tests', function (Y) {
    var defineTest, testTest,
        Paragraph = Y.eZ.AlloyEditorToolbarConfig.Paragraph,
        BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase,
        Assert = Y.Assert, Mock = Y.Mock;

    defineTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ToolbarConfigDefineTest, {
        name: 'eZ AlloyEditor paragraph config toolbar define test',
        toolbarConfig: Paragraph,
        toolbarConfigName: "paragraph",
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
        name: 'eZ AlloyEditor paragraph config toolbar test method test',

        setUp: function () {
            this.editor = new Mock();
            this.nativeEditor = new Mock();
            this.path = new Mock();

            this.emptySelection = undefined;
            this.insideParagraph = undefined;

            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: this.nativeEditor
            });
            Mock.expect(this.nativeEditor, {
                method: 'isSelectionEmpty',
                run: Y.bind(function () {
                    return this.emptySelection;
                }, this)
            });
            Mock.expect(this.nativeEditor, {
                method: 'elementPath',
                returns: this.path,
            });
            Mock.expect(this.path, {
                method: 'contains',
                args: [Mock.Value.String],
                run: Y.bind(function (config) {
                    Assert.areEqual(
                        'p', config,
                        "The config should be 'p'"
                    );

                    return this.insideParagraph;
                }, this)
            });
        },

        tearDown: function () {
            delete this.editor;
            delete this.nativeEditor;
            delete this.path;
        },

        "Non empty selection": function () {
            this.emptySelection = false;
            Assert.isFalse(
                Paragraph.test({editor: this.editor}),
                "The toolbar should be hidden"
            );
        },

        "Empty selection outside a paragraph": function () {
            this.emptySelection = true;
            this.insideParagraph = false;
            Assert.isFalse(
                Paragraph.test({editor: this.editor}),
                "The toolbar should be hidden"
            );
        },

        "Empty selection inside a paragraph": function () {
            this.emptySelection = true;
            this.insideParagraph = true;
            Assert.isTrue(
                Paragraph.test({editor: this.editor}),
                "The toolbar should be visible"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor paragraph config toolbar tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(testTest);
}, '', {
    requires: [
        'test', 'toolbar-config-define-tests', 'node',
        'ez-alloyeditor-toolbar-config-paragraph',
        'ez-alloyeditor-toolbar-config-block-base',
    ]
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-heading-tests', function (Y) {
    var defineTest, testTest,
        Heading = Y.eZ.AlloyEditorToolbarConfig.Heading,
        BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase,
        Assert = Y.Assert, Mock = Y.Mock;

    defineTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ToolbarConfigDefineTest, {
        name: 'eZ AlloyEditor heading config toolbar define test',
        toolbarConfig: Heading,
        toolbarConfigName: "heading",
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
        name: 'eZ AlloyEditor heading config toolbar test method test',

        setUp: function () {
            this.editor = new Mock();
            this.nativeEditor = new Mock();
            this.path = new Mock();

            this.emptySelection = undefined;
            this.insideHeading = undefined;

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
                args: [Mock.Value.Object],
                run: Y.bind(function (config) {
                    Assert.isArray(config, "contains should receive an array");
                    Assert.areEqual(
                        6, config.length,
                        "The config should list the heading tags"
                    );
                    Assert.areEqual(
                        "h1,h2,h3,h4,h5,h6", config.toString(),
                        "The config should list the heading tags"
                    );

                    return this.insideHeading;
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
                Heading.test({editor: this.editor}),
                "The toolbar should be hidden"
            );
        },

        "Empty selection outside a heading": function () {
            this.emptySelection = true;
            this.insideHeading = false;
            Assert.isFalse(
                Heading.test({editor: this.editor}),
                "The toolbar should be hidden"
            );
        },

        "Empty selection inside a heading": function () {
            this.emptySelection = true;
            this.insideHeading = true;
            Assert.isTrue(
                Heading.test({editor: this.editor}),
                "The toolbar should be visible"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor heading config toolbar tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(testTest);
}, '', {
    requires: [
        'test', 'toolbar-config-define-tests', 'node',
        'ez-alloyeditor-toolbar-config-heading',
        'ez-alloyeditor-toolbar-config-block-base',
    ]
});

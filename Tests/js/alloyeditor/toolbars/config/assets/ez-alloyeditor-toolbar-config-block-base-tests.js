/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-toolbar-config-block-base-tests', function (Y) {
    var arrowBoxClassesTest, setPositionTest,
        BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase,
        AlloyEditor = Y.eZ.AlloyEditor,
        Assert = Y.Assert, Mock = Y.Mock;

    arrowBoxClassesTest = new Y.Test.Case({
        name: 'eZ AlloyEditor block-base config toolbar getArrowBoxClasses method test',

        "Should position the arrow in the bottom": function () {
            Assert.areEqual(
                "ae-arrow-box ae-arrow-box-bottom ez-ae-arrow-box-left",
                BlockBase.getArrowBoxClasses(),
                "The arrow should be position at the bottom with the CSS classes"
            );
        },
    });

    setPositionTest = new Y.Test.Case({
        name: 'eZ AlloyEditor block-base config toolbar setPosition method test',

        setUp: function () {
            var toolbar = Y.one('.toolbar'),
                block = Y.one('.block'),
                nativeEditor = new Mock();

            this.outlineWidth = 20;
            this.outlineOffset = 42;
            block.setStyles({
                'outline': this.outlineWidth + 'px solid red',
                'outlineOffset': this.outlineOffset + 'px',
                'marginTop': '2000px',
                "marginLeft": '90px',
            });
            Y.config.win.scrollTo(0, 1500);
            this.blockNode = block.getDOMNode();
            this.toolbarNode = toolbar.getDOMNode();

            this.blockElement = new CKEDITOR.dom.element(block.getDOMNode());
            this.eventTarget = block.getDOMNode();
            Mock.expect(nativeEditor, {
                method: 'elementPath',
                run: Y.bind(function () {
                    return {block: this.blockElement};
                }, this),
            });
            this.editor = new Mock();
            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: nativeEditor,
            });

            this.toolbar = new Mock();
            this.toolbar.props = {gutter: {left: 0, top: 0}};
            Mock.expect(this.toolbar, {
                method: 'getWidgetXYPoint',
                args: [
                    Mock.Value.Any,
                    Mock.Value.Any,
                    CKEDITOR.SELECTION_BOTTOM_TO_TOP
                ],
                run: AlloyEditor.WidgetPosition.getWidgetXYPoint,
            });

            this.origFindDOMNode = AlloyEditor.React.findDOMNode;
            AlloyEditor.React.findDOMNode = Y.bind(function (arg) {
                Assert.areSame(
                    arg, this.toolbar,
                    "findDOMNode should receive the toolbar"
                );
                return this.toolbarNode;
            }, this);
        },

        tearDown: function () {
            AlloyEditor.React.findDOMNode = this.origFindDOMNode;
            delete this.toolbar;
            delete this.editor;
            Y.one(this.toolbarNode).removeAttribute('style').removeClass('ae-toolbar-transition');
            Y.one(this.blockNode).removeAttribute('style');
        },

        "Should move the toolbar to the expected coordinates": function () {
            BlockBase.setPosition.call(this.toolbar, {editor: this.editor});

            Assert.areEqual(
                Y.one(this.blockNode).getComputedStyle('top'), Y.one(this.toolbarNode).getComputedStyle('bottom'),
                "The toolbar bottom position should be its block top position"
            );
            Assert.areEqual(
                Y.one(this.blockNode).get('region').left - this.outlineWidth - this.outlineOffset  + 'px', this.toolbarNode.style.left,
                "The toolbar should be aligned with its block on the left taking the outline into account"
            );
        },

        "Should move the toolbar to the expected coordinates based on the event target": function () {
            this.blockElement = null;
            BlockBase.setPosition.call(this.toolbar, {
                editor: this.editor,
                editorEvent: {
                    data: {
                        nativeEvent: {
                            target: this.eventTarget,
                        }
                    }
                }
            });

            Assert.areEqual(
                Y.one(this.blockNode).getComputedStyle('top'), Y.one(this.toolbarNode).getComputedStyle('bottom'),
                "The toolbar bottom position should be its block top position"
            );
            Assert.areEqual(
                Y.one(this.blockNode).get('region').left - this.outlineWidth - this.outlineOffset  + 'px', this.toolbarNode.style.left,
                "The toolbar should be aligned with its block on the left taking the outline into account"
            );
        },


        "Should add the transition class": function () {
            BlockBase.setPosition.call(this.toolbar, {editor: this.editor});

            Assert.isTrue(
                Y.one(this.toolbarNode).hasClass('ae-toolbar-transition'),
                "The toolbar container should get the transition class"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor block-base config toolbar tests");
    Y.Test.Runner.add(arrowBoxClassesTest);
    Y.Test.Runner.add(setPositionTest);
}, '', {requires: ['test', 'node', 'node-screen', 'ez-alloyeditor-toolbar-config-block-base']});

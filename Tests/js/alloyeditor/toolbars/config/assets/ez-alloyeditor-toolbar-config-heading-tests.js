/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-toolbar-config-heading-tests', function (Y) {
    var defineTest, testTest, arrowBoxClassesTest, setPositionTest,
        Heading = Y.eZ.AlloyEditorToolbarConfig.Heading,
        AlloyEditor = Y.eZ.AlloyEditor,
        Assert = Y.Assert, Mock = Y.Mock;

    defineTest = new Y.Test.Case({
        name: 'eZ AlloyEditor heading config toolbar define test',

        "Should define the toolbar configuration": function () {
            Assert.isObject(
                Heading,
                "The heading toolbar configuration should be defined"
            );
        },

        "Should have 'heading' as name": function () {
            Assert.areEqual(
                Heading.name, "heading",
                "The name of the toolbar configuration should be 'heading'"
            );
        },
    });

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
    });

    arrowBoxClassesTest = new Y.Test.Case({
        name: 'eZ AlloyEditor heading config toolbar getArrowBoxClasses method test',

        "Should position the arrow in the bottom": function () {
            Assert.areEqual(
                "ae-arrow-box ae-arrow-box-bottom",
                Heading.getArrowBoxClasses(),
                "The arrow should be position at the bottom with the CSS classes"
            );
        },
    });

    setPositionTest = new Y.Test.Case({
        name: 'eZ AlloyEditor heading config toolbar setPosition method test',

        setUp: function () {
            this.toolbarNode = Y.one('.toolbar').getDOMNode();
            this.origFindDOMNode = AlloyEditor.React.findDOMNode;
            this.toolbar = new Mock();
            this.region = {
                left: 42,
                top: -42,
            };
            this.xy = [12, 11];

            Mock.expect(this.toolbar, {
                method: 'getWidgetXYPoint',
                args: [this.region.left, this.region.top, CKEDITOR.SELECTION_BOTTOM_TO_TOP],
                returns: this.xy
            });
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
            Y.one(this.toolbarNode).removeAttribute('style').removeClass('ae-toolbar-transition');
        },

        "Should move the toolbar to the expected coordinates": function () {
            Heading.setPosition.call(this.toolbar, {selectionData: {region: this.region}});

            Assert.areEqual(
                this.xy[0] + 'px', this.toolbarNode.style.left,
                "The toolbar should have been moved (left)"
            );
            Assert.areEqual(
                this.xy[1] + 'px', this.toolbarNode.style.top,
                "The toolbar should have been moved (top)"
            );
        },

        "Should add the transition class": function () {
            Heading.setPosition.call(this.toolbar, {selectionData: {region: this.region}});

            Assert.isTrue(
                Y.one(this.toolbarNode).hasClass('ae-toolbar-transition'),
                "The toolbar container should get the transition class"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor heading config toolbar tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(testTest);
    Y.Test.Runner.add(arrowBoxClassesTest);
    Y.Test.Runner.add(setPositionTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-toolbar-config-heading']});

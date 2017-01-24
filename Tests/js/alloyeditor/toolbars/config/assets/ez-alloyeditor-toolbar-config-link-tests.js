/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-link-tests', function (Y) {
    /* global CKEDITOR */
    var defineTest,
        getArrowBoxClassesTest, setPositionTest,
        Link = Y.eZ.AlloyEditorToolbarConfig.Link,
        ReactDOM = Y.eZ.ReactDOM,
        Assert = Y.Assert, Mock = Y.Mock;

    defineTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ToolbarConfigDefineTest, {
        name: 'eZ AlloyEditor link config toolbar define test',
        toolbarConfig: Link,
        toolbarConfigName: "link",
        methods: {
            test: Y.eZ.AlloyEditor.SelectionTest.link
        },

        _should: {
            ignore: {
                "Should have the correct `setPosition` method": true,
                "Should have the correct `getArrowBoxClasses` method": true,
            },
        },
    }));

    getArrowBoxClassesTest = new Y.Test.Case({
        name: 'eZ AlloyEditor link config toolbar getArrowBoxClasses test',

        "Should return the arrow classes": function () {
            Assert.areEqual(
                'ae-arrow-box ae-arrow-box-bottom',
                Link.getArrowBoxClasses(),
                "The getArrowBoxClasses should return the arrow classes"
            );
        },
    });

    setPositionTest = new Y.Test.Case({
        name: 'eZ AlloyEditor link config toolbar setPosition test',

        setUp: function () {
            this.toolbar = new Mock();
            this.toolbarNode = document.querySelector('.toolbar');
            this.origFindDOMNode = ReactDOM.findDOMNode;
            ReactDOM.findDOMNode = Y.bind(function (toolbar) {
                Assert.areSame(
                    this.toolbar,
                    toolbar
                );
                return this.toolbarNode;
            }, this);
            this.regionLeft = 22;
            this.regionTop = 23;
            this.xy = [42, 43];
            Mock.expect(this.toolbar, {
                method: 'getWidgetXYPoint',
                args: [this.regionLeft, this.regionTop, CKEDITOR.SELECTION_BOTTOM_TO_TOP],
                returns: this.xy,
            });
        },

        "Should set the position of the toolbar": function () {
            Link.setPosition.call(this.toolbar, {
                selectionData: {
                    region: {
                        left: this.regionLeft,
                        top: this.regionTop,
                    }
                }
            });
            Assert.areEqual(
                this.xy[0] + 'px',
                this.toolbarNode.style.left,
                "The toolbar should be position horizontally"
            );
            Assert.areEqual(
                this.xy[1] + 'px',
                this.toolbarNode.style.top,
                "The toolbar should be position vertically"
            );
            Assert.isTrue(
                this.toolbarNode.classList.contains('ae-toolbar-transition'),
                "The ae toolbar transition class should have been added"
            );
            Mock.verify(this.toolbar);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor link config toolbar tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(getArrowBoxClassesTest);
    Y.Test.Runner.add(setPositionTest);
}, '', {requires: ['test', 'toolbar-config-define-tests', 'node', 'ez-alloyeditor-toolbar-config-link']});

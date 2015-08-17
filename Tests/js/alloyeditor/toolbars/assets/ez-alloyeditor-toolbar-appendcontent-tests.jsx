/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-toolbar-appendcontent-tests', function (Y) {
    var renderTest, styleTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor appendcontent toolbar render test",

        setUp: function () {
            var nativeEditor = {
                    element: new CKEDITOR.dom.element(Y.one('.editor').getDOMNode()),
                };
            this.container = Y.one('.container').getDOMNode();
            this.editor = new Mock();
            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: nativeEditor,
            });
        },

        tearDown: function () {
            React.unmountComponentAtNode(this.container);
            delete this.editor;
        },

        "Should render a visible toolbar": function () {
            var toolbar,
                editorEvent = {}, listMock = new Mock(),
                config = {buttons: [], addContentButtonClass: "hurry-up-and-wait"};

            Mock.expect(listMock, {
                method: 'contains',
                args: [config.addContentButtonClass],
                returns: true,
            });

            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} />,
                this.container
            );

            editorEvent.data = {
                nativeEvent: {
                    target: {
                        classList: listMock,
                    },
                },
            };
            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} editorEvent={editorEvent} />,
                this.container
            );

            Assert.isNotNull(
                React.findDOMNode(toolbar),
                "The toolbar should be rendered"
            );
            Mock.verify(listMock);
        },

        "Should not render an invisible toolbar": function () {
            var toolbar,
                config = {buttons: []};

            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} />,
                this.container
            );

            Assert.isNull(
                React.findDOMNode(toolbar),
                "The toolbar should not be rendered"
            );
        },

        "Should set visible to false": function () {
            var toolbar,
                editorEvent = {}, listMock = new Mock(),
                config = {buttons: [], addContentButtonClass: "hurry-up-and-wait"};

            Mock.expect(listMock, {
                method: 'contains',
                args: [config.addContentButtonClass],
                returns: false,
            });

            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} />,
                this.container
            );

            editorEvent.data = {
                nativeEvent: {
                    target: {
                        classList: listMock,
                    },
                },
            };
            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} editorEvent={editorEvent} />,
                this.container
            );

            Assert.isFalse(
                toolbar.state.visible,
                "The toolbar should be invisible"
            );
            Mock.verify(listMock);
        },

        "Should keep the visibility": function () {
            var toolbar,
                config = {buttons: [], addContentButtonClass: "hurry-up-and-wait"};

            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} />,
                this.container
            );

            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} />,
                this.container
            );

            Assert.isFalse(
                toolbar.state.visible,
                "The toolbar should be invisible"
            );
        },
    });

    styleTest = new Y.Test.Case({
        name: "eZ AlloyEditor appendcontent toolbar style test",

        setUp: function () {
            var nativeEditor = {
                    element: new CKEDITOR.dom.element(Y.one('.editor').getDOMNode()),
                };
            this.container = Y.one('.container').getDOMNode();
            this.editor = new Mock();
            this.staticToolbarNode = Y.one('.ez-ae-static-toolbar');
            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: nativeEditor,
            });
        },

        tearDown: function () {
            React.unmountComponentAtNode(this.container);
            delete this.editor;
        },

        "Should position the toolbar on top of the static toolbar": function () {
            var toolbar, toolbarNode,
                editorEvent = {}, listMock = new Mock(),
                config = {buttons: []};

            Mock.expect(listMock, {
                method: 'contains',
                args: [Mock.Value.Any],
                returns: true,
            });

            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} />,
                this.container
            );

            editorEvent.data = {
                nativeEvent: {
                    target: {
                        classList: listMock,
                    },
                },
            };
            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} editorEvent={editorEvent} />,
                this.container
            );


            toolbarNode = Y.one(React.findDOMNode(toolbar));
            Assert.areSame(
                this.staticToolbarNode.getY(),
                toolbarNode.get('region').bottom
            );
        },

        "Should position the toolbar in the middle of the editor": function () {
            var toolbar, toolbarNode,
                editorEvent = {}, listMock = new Mock(),
                config = {buttons: []};

            Mock.expect(listMock, {
                method: 'contains',
                args: [Mock.Value.Any],
                returns: true,
            });

            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} />,
                this.container
            );
            editorEvent.data = {
                nativeEvent: {
                    target: {
                        classList: listMock,
                    },
                },
            };
            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} editorEvent={editorEvent} />,
                this.container
            );

            toolbarNode = Y.one(React.findDOMNode(toolbar));
            Assert.areSame(
                this.staticToolbarNode.getX() +
                this.staticToolbarNode.get('offsetWidth')/2 -
                toolbarNode.get('offsetWidth')/2,
                toolbarNode.get('region').left
            );
        },

        "Should set the opacity to 1": function () {
            var toolbar, toolbarNode,
                editorEvent = {}, listMock = new Mock(),
                config = {buttons: []};

            Mock.expect(listMock, {
                method: 'contains',
                args: [Mock.Value.Any],
                returns: true,
            });

            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} />,
                this.container
            );
            editorEvent.data = {
                nativeEvent: {
                    target: {
                        classList: listMock,
                    },
                },
            };
            toolbar = React.render(
                <AlloyEditor.ToolbarAppendContent editor={this.editor} config={config} editorEvent={editorEvent} />,
                this.container
            );

            toolbarNode = Y.one(React.findDOMNode(toolbar));
            Assert.areEqual(1, toolbarNode.getStyle('opacity'));
        },

    });

    Y.Test.Runner.setName("eZ AlloyEditor appendcontent toolbar tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(styleTest);
}, '', {requires: ['test', 'node', 'node-screen', 'ez-alloyeditor-toolbar-appendcontent']});

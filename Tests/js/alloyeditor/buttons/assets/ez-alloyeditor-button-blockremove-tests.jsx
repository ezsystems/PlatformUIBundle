/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-blockremove-tests', function (Y) {
    var defineTest, renderTest, clickTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    defineTest = new Y.Test.Case({
        name: "eZ AlloyEditor blockremove button define test",

        "Should register the blockremove button": function () {
            Assert.areSame(
                Y.eZ.AlloyEditorButton.ButtonBlockRemove,
                AlloyEditor.Buttons.ezblockremove,
                "The blockremove button should be registered"
            );
        },
    });
 
    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor blockremove button render test",

        setUp: function () {
            this.container = Y.one('.container').getDOMNode();
            this.editor = {};
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container);
            delete this.editor;
        },

        "Should render a button": function () {
            var button,
                label = "J'accuse";

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonBlockRemove editor={this.editor} label={label} />,
                this.container
            );

            Assert.isNotNull(
                ReactDOM.findDOMNode(button),
                "The button should be rendered"
            );
            Assert.areEqual(
                "BUTTON", ReactDOM.findDOMNode(button).tagName,
                "The component should generate a button"
            );
            Assert.areEqual(
                label, ReactDOM.findDOMNode(button).title,
                "The label should be set as the title on the button"
            );
        },
    });

    clickTest= new Y.Test.Case({
        name: "eZ AlloyEditor blockremove button click test",

        setUp: function () {
            this.container = Y.one('.container');
            this.editor = new Mock();
            this.nativeEditor = new Mock();
            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: this.nativeEditor,
            });
            Mock.expect(this.nativeEditor, {
                method: 'execCommand',
                args: ['eZRemoveBlock', Mock.Value.Any],
            });
            Mock.expect(this.nativeEditor, {
                method: 'selectionChange',
                args: [true],
            });
            Mock.expect(this.nativeEditor, {
                method: 'fire',
                args: ['actionPerformed', Mock.Value.Object],
            });
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container.getDOMNode());
            delete this.editor;
            delete this.nativeEditor;
        },

        "Should execute the eZRemoveBlock command": function () {
            var button;

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonBlockRemove editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');
            Mock.verify(this.nativeEditor);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor blockremove button tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(clickTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-blockremove']});

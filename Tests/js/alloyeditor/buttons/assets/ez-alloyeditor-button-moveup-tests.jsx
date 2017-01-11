/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-moveup-tests', function (Y) {
    var defineTest, renderTest, commandTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    defineTest = new Y.Test.Case({
        name: "eZ AlloyEditor moveup button define test",

        "Should register the moveup button": function () {
            Assert.areSame(
                Y.eZ.AlloyEditorButton.ButtonMoveUp,
                AlloyEditor.Buttons.ezmoveup,
                "The moveup button should be registered"
            );
        },
    });

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor moveup button render test",

        setUp: function () {
            this.container = Y.one('.container').getDOMNode();
            this.editor = {};
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container);
            delete this.editor;
        },

        "Should render a button": function () {
            var button;

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonMoveUp editor={this.editor} />,
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
                'move.up domain=onlineeditor', ReactDOM.findDOMNode(button).title,
                "The label should be set as the title on the button"
            );
        },
    });

    commandTest = new Y.Test.Case({
        name: "eZ AlloyEditor moveup command test",

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
                args: ['eZMoveUp'],
            });
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container.getDOMNode());
            delete this.editor;
            delete this.nativeEditor;
        },

        "Should execute the eZMoveUp command on click": function () {
            var button;

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonMoveUp editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');
            Mock.verify(this.nativeEditor);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor moveup button tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(commandTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-moveup']});

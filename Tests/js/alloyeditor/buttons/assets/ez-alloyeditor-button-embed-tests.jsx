/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-embed-tests', function (Y) {
    var renderTest, clickTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed button render test",

        setUp: function () {
            this.container = Y.one('.container').getDOMNode();
            this.editor = {};
        },

        tearDown: function () {
            React.unmountComponentAtNode(this.container);
            delete this.editor;
        },

        "Should render a button": function () {
            var button;

            button = React.render(
                <AlloyEditor.ButtonEmbed editor={this.editor} />,
                this.container
            );

            Assert.isNotNull(
                React.findDOMNode(button),
                "The button should be rendered"
            );
            Assert.areEqual(
                "BUTTON", React.findDOMNode(button).tagName,
                "The component should generate a button"
            );
        },
    });

    clickTest= new Y.Test.Case({
        name: "eZ AlloyEditor embed button click test",

        setUp: function () {
            var nat = new Mock(),
                selection = new Mock(),
                ezembed = {};

            this.container = Y.one('.container');
            this.editor = new Mock();
            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: nat,
            });
            Mock.expect(nat, {
                method: 'execCommand',
                args: ['eZAddContent', Mock.Value.Object],
                run: function (command, data) {
                    Assert.areEqual(
                        data.tagName, 'ezembed',
                        "A ezembed element should have been generated"
                    );
                }
            });
            Mock.expect(nat, {
                method: 'selectionChange',
                args: [true],
            });
            Mock.expect(nat, {
                method: 'fire',
                args: ['actionPerformed', Mock.Value.Object],
            });
            nat.widgets = new Mock();
            Mock.expect(nat, {
                method: 'getSelection',
                returns: selection,
            });
            Mock.expect(selection, {
                method: 'getStartElement',
                returns: ezembed
            });
            Mock.expect(nat.widgets, {
                method: 'initOn',
                args: [ezembed, 'ezembed'],
            });
            this.widgets = nat.widgets;
        },

        tearDown: function () {
            React.unmountComponentAtNode(this.container.getDOMNode());
            delete this.editor;
        },

        "Should execute the eZAddContent command": function () {
            var button;

            button = React.render(
                <AlloyEditor.ButtonEmbed editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');
        },

        "Should initialize the widget on the ezembed element": function () {
            this["Should execute the eZAddContent command"]();

            Mock.verify(this.widgets);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor embed button tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(clickTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-embed']});

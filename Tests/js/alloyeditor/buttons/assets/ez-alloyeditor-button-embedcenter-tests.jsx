/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-embedcenter-tests', function (Y) {
    var registerTest, renderTest, clickTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock,
        setupMockForRender = function () {
            this.editor = new Mock();
            this.nativeEditor = new Mock();
            this.selection = new Mock();
            this.wrapper = {};
            this.nativeEditor.widgets = new Mock();
            this.widget = new Mock();

            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: this.nativeEditor
            });
            Mock.expect(this.nativeEditor, {
                method: 'getSelection',
                returns: this.selection,
            });
            Mock.expect(this.selection, {
                method: 'getStartElement',
                returns: this.wrapper
            });
            Mock.expect(this.nativeEditor.widgets, {
                method: 'getByElement',
                args: [this.wrapper],
                returns: this.widget,
            });

            Mock.expect(this.widget, {
                method: 'isAligned',
                args: ['center'],
                returns: false,
            });
        };

    registerTest = new Y.Test.Case({
        name: "eZ AlloyEditor embedcenter button register test",

        "Should register the button in AlloyEditor.Buttons": function () {
            Assert.areSame(
                Y.eZ.AlloyEditorButton.ButtonEmbedCenter,
                AlloyEditor.Buttons.ezembedcenter,
                "The button should be registered in AlloyEditor.Buttons"
            );
        },
    });

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor embedcenter button render test",

        setUp: function () {
            this.container = Y.one('.container').getDOMNode();
            setupMockForRender.call(this);
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container);
        },

        "Should render a button": function () {
            var button;

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonEmbedCenter editor={this.editor} />,
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
            Assert.isTrue(
                Y.one(ReactDOM.findDOMNode(button)).one('span').hasClass('ez-font-icon'),
                "The button should have the ez-font-icon class"
            );
            Assert.isTrue(
                Y.one(ReactDOM.findDOMNode(button)).one('span').hasClass('ez-ae-icon-align-embedcenter'),
                "The button should have the icon align center class"
            );
        },

        "Should render the button in a normal state": function () {
            var button,
                node;

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonEmbedCenter editor={this.editor} />,
                this.container
            );
            node = Y.one(ReactDOM.findDOMNode(button));

            Assert.isFalse(
                node.hasClass('ae-button-pressed'),
                "The button should not be in the pressed (active) state"
            );
        },

        "Should render the button in the active state": function () {
            var button,
                node;

            Mock.expect(this.widget, {
                method: 'isAligned',
                args: ['center'],
                returns: true,
            });
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonEmbedCenter editor={this.editor} />,
                this.container
            );
            node = Y.one(ReactDOM.findDOMNode(button));

            Assert.isTrue(
                node.hasClass('ae-button-pressed'),
                "The button should be in the pressed (active) state"
            );
        },
    });

    clickTest= new Y.Test.Case({
        name: "eZ AlloyEditor embedcenter button click test",

        setUp: function () {
            this.container = Y.one('.container').getDOMNode();
            setupMockForRender.call(this);
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container);
        },

        "Should center the embed element": function () { 
            var button;

            Mock.expect(this.widget, {
                method: 'isAligned',
                args: ['center'],
                callCount: 2,
                returns: false,
            });
            Mock.expect(this.widget, {
                method: 'setAlignment',
                args: ['center'],
            });

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonEmbedCenter editor={this.editor} />,
                this.container
            );
            Mock.expect(this.nativeEditor, {
                method: 'fire',
                args: ['actionPerformed', button],
            });
            Y.one(ReactDOM.findDOMNode(button)).simulate('click');
            Mock.verify(this.widget);
        },

        "Should 'uncenter' the embed element": function () { 
            var button;

            Mock.expect(this.widget, {
                method: 'isAligned',
                args: ['center'],
                callCount: 2,
                returns: true,
            });
            Mock.expect(this.widget, {
                method: 'unsetAlignment',
            });

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonEmbedCenter editor={this.editor} />,
                this.container
            );
            Mock.expect(this.nativeEditor, {
                method: 'fire',
                args: ['actionPerformed', button],
            });
            Y.one(ReactDOM.findDOMNode(button)).simulate('click');
            Mock.verify(this.widget);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor embedcenter button tests");
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(clickTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-embedcenter']});

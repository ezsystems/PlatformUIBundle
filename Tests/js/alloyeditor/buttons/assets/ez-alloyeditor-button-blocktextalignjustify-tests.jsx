/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-blocktextalignjustify-tests', function (Y) {
    var registerTest, renderTest, clickTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    registerTest = new Y.Test.Case({
        name: "eZ AlloyEditor blocktextalignjustify button register test",

        "Should register the button in AlloyEditor.Buttons": function () {
            Assert.areSame(
                Y.eZ.AlloyEditorButton.ButtonBlockTextAlignJustify,
                AlloyEditor.Buttons.ezblocktextalignjustify,
                "The button should be registered in AlloyEditor.Buttons"
            );
        },
    });

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor blocktextalignjustify button render test",

        setUp: function () {
            this.container = Y.one('.container').getDOMNode();
            this.editor = new Mock();
            this.nativeEditor = new Mock();
            this.path = {block: new Mock()};
            this.blockAlign = 'whatever';

            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: this.nativeEditor
            });
            Mock.expect(this.nativeEditor, {
                method: 'elementPath',
                returns: this.path,
            });
            Mock.expect(this.path.block, {
                method: 'getStyle',
                args: ['textAlign'],
                run: Y.bind(function () {
                    return this.blockAlign;
                }, this),
            });
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container);
            delete this.editor;
            delete this.nativeEditor;
            delete this.path;
        },

        "Should render a button": function () {
            var button;

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonBlockTextAlignJustify editor={this.editor} />,
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
                Y.one(ReactDOM.findDOMNode(button)).one('span').hasClass('ae-icon-align-justified'),
                "The button should have the icon align justify class"
            );
        },

        "Should render the button in a normal state": function () {
            var button,
                node;

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonBlockTextAlignJustify editor={this.editor} />,
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

            this.blockAlign = 'justify';
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonBlockTextAlignJustify editor={this.editor} />,
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
        name: "eZ AlloyEditor blocktextalignjustify button click test",

        setUp: function () {
            this.container = Y.one('.container').getDOMNode();
            this.editor = new Mock();
            this.nativeEditor = new Mock();
            this.path = {block: new Mock()};
            this.blockAlign = 'whatever';

            Mock.expect(this.editor, {
                method: 'get',
                args: ['nativeEditor'],
                returns: this.nativeEditor
            });
            Mock.expect(this.nativeEditor, {
                method: 'elementPath',
                returns: this.path,
            });
            Mock.expect(this.path.block, {
                method: 'getStyle',
                args: ['textAlign'],
                callCount: 2,
                run: Y.bind(function () {
                    return this.blockAlign;
                }, this),
            });

            Mock.expect(this.nativeEditor, {
                method: 'fire',
                args: ['actionPerformed', Mock.Value.Object],
            });
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container);
            delete this.editor;
            delete this.nativeEditor;
            delete this.path;
        },

        "Should set text-align to justify": function () { 
            var button;

            Mock.expect(this.path.block, {
                method: 'setStyle',
                args: ['text-align', 'justify'],
            });
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonBlockTextAlignJustify editor={this.editor} />,
                this.container
            );
            Y.one(ReactDOM.findDOMNode(button)).simulate('click');

            Mock.verify(this.path.block);
        },

        "Should remove text-align style": function () { 
            var button;

            this.blockAlign = 'justify';
            Mock.expect(this.path.block, {
                method: 'removeStyle',
                args: ['text-align'],
            });
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonBlockTextAlignJustify editor={this.editor} />,
                this.container
            );
            Y.one(ReactDOM.findDOMNode(button)).simulate('click');

            Mock.verify(this.path.block);
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor blocktextalignjustify button tests");
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(clickTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-blocktextalignjustify']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-table-tests', function (Y) {
    var renderTest, clickTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor table button render test",

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
                <AlloyEditor.EzButtonTable editor={this.editor} />,
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
        },

        "Should render a toolbar on renderExclusive": function () {
            var node;

            node = ReactDOM.render(
                <AlloyEditor.EzButtonTable
                    editor={this.editor}
                    renderExclusive={true}
                    cancelExclusive={function () {}} />,
                this.container
            );

            Assert.isNotNull(
                ReactDOM.findDOMNode(node),
                "The toolbar should be rendered"
            );

            Assert.areEqual(
                "DIV", ReactDOM.findDOMNode(node).tagName,
                "The component should generate a div for the toolbar"
            );
        },
    });

    clickTest= new Y.Test.Case({
        name: "eZ AlloyEditor table button click test",

        "async:init": function () {
            var startTest = this.callback();

            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                Y.one('.editorContainer').getDOMNode()
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container.getDOMNode());
        },

        "Should generate table context menu on click": function () {
            var button,
                exclusive = false;
                requestExclusive = function () {
                    exclusive = true;
                };

            button = ReactDOM.render(
                <AlloyEditor.EzButtonTable editor={this.editor} requestExclusive={requestExclusive} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');
            Assert.isTrue(
                exclusive,
                "The button should have requested the exclusive state"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor table button tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(clickTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-table']});

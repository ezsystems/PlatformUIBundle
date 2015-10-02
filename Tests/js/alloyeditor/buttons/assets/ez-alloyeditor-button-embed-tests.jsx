/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
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

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                Y.one('.editorContainer').getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezembed',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        tearDown: function () {
            React.unmountComponentAtNode(this.container.getDOMNode());
        },

        "Should fire the contentDiscover event": function () {
            var button,
                contentDiscoverFired = false;

            this.editor.get('nativeEditor').on('contentDiscover', function (evt) {
                contentDiscoverFired = true;

                Assert.isObject(
                    evt.data.config,
                    "The event should provide a config for the UDW"
                );
                Assert.isFalse(
                    evt.data.config.multiple,
                    "The UDW should be configured with multiple false"
                );
                Assert.isFunction(
                    evt.data.config.contentDiscoveredHandler,
                    "The UDW should be configured with a contentDiscoveredHandler"
                );
            });
            button = React.render(
                <AlloyEditor.ButtonEmbed editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');

            Assert.isTrue(
                contentDiscoverFired,
                "The contentDiscover event should have been fired"
            );
        },

        "Should add the embed after choosing the content": function () {
            var button, content = new Mock(),
                contentName = 'I Am the Highway',
                contentId = 42;

            Mock.expect(content, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'contentId' ) {
                        return contentId;
                    } else if ( attr === 'name' ) {
                        return contentName;
                    }
                    Assert.fail("Unexpected call to get for attribute " + attr);
                }
            });

            this.editor.get('nativeEditor').on('contentDiscover', function (evt) {
                var wrapper, widget;

                evt.data.config.contentDiscoveredHandler.call(this, {
                    selection: {
                        content: content,
                    },
                });

                wrapper = this.element.findOne('.cke_widget_element');
                widget = this.widgets.getByElement(wrapper);

                Assert.areEqual(
                    'ezembed', widget.name,
                    "An ezembed widget should have been added"
                );
                Assert.areEqual(
                    'ezcontent://' + contentId,
                    widget.element.data('href'),
                    "The data-href should be build with the contentId"
                );
                Assert.areEqual(
                    contentName,
                    widget.element.getText(),
                    "The ezembed should be filled with the content name"
                );
            });
            button = React.render(
                <AlloyEditor.ButtonEmbed editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor embed button tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(clickTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-embed', 'ez-alloyeditor-plugin-embed']});

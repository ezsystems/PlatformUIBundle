/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-button-embedhref-tests', function (Y) {
    var renderTest, clickTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor embedhref button render test",

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
                label = 'Choose another one';

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonEmbedHref editor={this.editor} label={label} />,
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
        name: "eZ AlloyEditor embedhref button click test",

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
            ReactDOM.unmountComponentAtNode(this.container.getDOMNode());
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
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonEmbedHref editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');

            Assert.isTrue(
                contentDiscoverFired,
                "The contentDiscover event should have been fired"
            );
        },

        "Should update the embed": function () {
            var button, contentInfo = new Mock(),
                updatedEmbed = false,
                contentId = 42,
                selection = {
                    contentInfo: contentInfo,
                };

            Mock.expect(contentInfo, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'contentId' ) {
                        return contentId;
                    }
                    Assert.fail("Unexpected call to get for attribute " + attr);
                }
            });

            this.editor.get('nativeEditor').on('updatedEmbed', function (e) {
                updatedEmbed = true;

                Assert.areSame(
                    selection,
                    e.data.embedStruct,
                    "The updatedEmbed event parameters should contain the selection"
                );
            });
            this.editor.get('nativeEditor').on('contentDiscover', function (evt) {
                var wrapper = this.element.findOne('.cke_widget_element'),
                    widget = this.widgets.getByElement(wrapper);

                widget.focus();
                evt.data.config.contentDiscoveredHandler.call(this, {
                    selection: selection,
                });

                Assert.areEqual(
                    'ezcontent://' + contentId,
                    widget.element.data('href'),
                    "The data-href should be build with the contentId"
                );
                Assert.areEqual(
                    "",
                    widget.element.getText(),
                    "The embed should be emptied"
                );
                Assert.areSame(
                    widget, this.widgets.focused,
                    "The ezembed widget should have the focus"
                );
            });
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonEmbedHref editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');
            Assert.isTrue(
                updatedEmbed, "The updatedEmbed event should have been fired"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor embedhref button tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(clickTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-embedhref', 'ez-alloyeditor-plugin-embed']});

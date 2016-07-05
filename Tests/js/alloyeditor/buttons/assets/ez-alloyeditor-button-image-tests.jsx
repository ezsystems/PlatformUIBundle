/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-button-image-tests', function (Y) {
    var renderTest, clickTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor image button render test",

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
                <AlloyEditor.ButtonImage editor={this.editor} />,
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
    });

    clickTest = new Y.Test.Case({
        name: "eZ AlloyEditor image button click test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.editorContainer = Y.one('.editorContainer');
            this.editor = AlloyEditor.editable(
                this.editorContainer.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezembed',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        setUp: function () {
            this.listeners = [];
        },

        destroy: function () {
            this.editor.destroy();
            this.editorContainer.setHTML('');
        },

        tearDown: function () {
            Y.Array.each(this.listeners, function(listener) {
                listener.removeListener();
            });
            ReactDOM.unmountComponentAtNode(this.container.getDOMNode());
        },

        "Should fire the contentDiscover event": function () {
            var button,
                contentDiscoverFired = false;

            this.listeners.push(this.editor.get('nativeEditor').on('contentDiscover', function (evt) {
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
                Assert.isTrue(
                    evt.data.config.loadContent,
                    "The loadContent flag should be true"
                );
                Assert.isFunction(
                    evt.data.config.isSelectable,
                    "A isSelectable function should be provided"
                );
            }));
            button = ReactDOM.render(
                <AlloyEditor.ButtonImage editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');

            Assert.isTrue(
                contentDiscoverFired,
                "The contentDiscover event should have been fired"
            );
        },

        _configureContentType: function (contentType, hasImage, imageFieldIdentifier) {
            Mock.expect(contentType, {
                method: 'hasFieldType',
                args: ['ezimage'],
                returns: hasImage,
            });
            Mock.expect(contentType, {
                method: 'getFieldDefinitionIdentifiers',
                args: ['ezimage'],
                returns: [imageFieldIdentifier],
            });

        },

        _configureContent: function (content, fields) {
            Mock.expect(content, {
                method: 'get',
                args: ['fields'],
                returns: fields,
            });
        },

        _getIsSelectableFunction: function () {
            var button,
                isSelectable;

            this.editor.get('nativeEditor').on('contentDiscover', function (evt) {
                isSelectable = evt.data.config.isSelectable;
            });
            button = ReactDOM.render(
                <AlloyEditor.ButtonImage editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');
            return isSelectable;
        },

        "Should not allow a content without an Image field": function () {
            var isSelectable = this._getIsSelectableFunction(),
                contentType = new Mock(),
                content = new Mock();

            Mock.expect(contentType, {
                method: 'hasFieldType',
                args: ['ezimage'],
                returns: false,
            });
            this._configureContentType(contentType, false);

            Assert.isFalse(
                isSelectable({contentType: contentType, content: content}),
                "The content should not be selectable"
            );
        },

        "Should not allow a content with an empty Image field": function () {
            var isSelectable = this._getIsSelectableFunction(),
                fieldIdentifier = 'image',
                fields = {},
                contentType = new Mock(),
                content = new Mock();

            fields[fieldIdentifier] = {fieldValue: null};

            this._configureContentType(contentType, true, fieldIdentifier);
            this._configureContent(content, fields);

            Assert.isFalse(
                isSelectable({contentType: contentType, content: content}),
                "The content should not be selectable"
            );
        },

        "Should allow a content with a filled Image field": function () {
            var isSelectable = this._getIsSelectableFunction(),
                fieldIdentifier = 'image',
                fields = {},
                contentType = new Mock(),
                content = new Mock();

            fields[fieldIdentifier] = {fieldValue: {id: 42}};

            this._configureContentType(contentType, true, fieldIdentifier);
            this._configureContent(content, fields);
            Assert.isTrue(
                isSelectable({contentType: contentType, content: content}),
                "The content should be selectable"
            );
        },

        _getContentDiscoveredHandler: function () {
            var button,
                handler;

            this.listeners.push(this.editor.get('nativeEditor').on('contentDiscover', function (evt) {
                handler = evt.data.config.contentDiscoveredHandler;
            }));
            button = ReactDOM.render(
                <AlloyEditor.ButtonImage editor={this.editor} />,
                this.container.getDOMNode()
            );

            this.container.one('button').simulate('click');
            return handler;
        },

        _getWidget: function () {
            return this.editor.get('nativeEditor').widgets.getByElement(
                new CKEDITOR.dom.element(this.editorContainer.one('[data-ezelement="ezembed"]').getDOMNode())
            );
        },

        "Should initialize the widget": function () {
            var handler = this._getContentDiscoveredHandler(),
                fieldIdentifier = 'image',
                fields = {},
                contentId = '/content/id',
                contentType = new Mock(),
                contentInfo = new Mock(),
                content = new Mock(),
                widget;

            fields[fieldIdentifier] = {fieldValue: {id: 42}};

            this._configureContentType(contentType, true, fieldIdentifier);
            this._configureContent(content, fields);
            Mock.expect(contentInfo, {
                method: 'get',
                args: ['contentId'],
                returns: contentId,
            });

            handler({selection: {contentType: contentType, content: content, contentInfo: contentInfo}});

            widget = this._getWidget();

            Assert.isNotNull(widget, "A widget should have been added");
            Assert.areEqual(
                'ezembed', widget.name,
                "An ezembed widget should have been added"
            );
            Assert.areEqual(
                'medium', widget.element.findOne('[data-ezvalue-key="size"]').getText(),
                "The ezembed widget should be configured with the medium variation"
            );
            Assert.isTrue(widget.isImage(), "The widget should be an image embed");
        },

        "Should fire the updatedEmbed event": function () {
            var handler = this._getContentDiscoveredHandler(),
                fieldIdentifier = 'image',
                fields = {},
                contentId = '/content/id',
                contentType = new Mock(),
                contentInfo = new Mock(),
                content = new Mock(),
                eventFired = false,
                selection = {
                    contentType: contentType,
                    content: content,
                    contentInfo: contentInfo
                };

            fields[fieldIdentifier] = {fieldValue: {id: 42}};

            this._configureContentType(contentType, true, fieldIdentifier);
            this._configureContent(content, fields);
            Mock.expect(contentInfo, {
                method: 'get',
                args: ['contentId'],
                returns: contentId,
            });

            this.listeners.push(this.editor.get('nativeEditor').on('updatedEmbed', function (e) {
                eventFired = true;
                Assert.areSame(
                    selection,
                    e.data.embedStruct,
                    "The updatedEmbed event parameters should contain the selection"
                );
            }));

            handler({selection: selection});
            Assert.isTrue(eventFired, "The updatedEmbed event should have been fired");
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor image button tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(clickTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-image', 'ez-alloyeditor-plugin-embed']});

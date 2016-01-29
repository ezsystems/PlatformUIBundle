/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-button-imagevariation-tests', function (Y) {
    var renderTest, changeTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor imagevariation render test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.variations = [{
                identifier: 'large',
                name: 'Large',
            }, {
                identifier: 'small',
                name: 'Small',
            }];
            this.container = Y.one('.container').getDOMNode();
            this.editorContainer = Y.one('.editorContainer');
            this.editorContainerContent = this.editorContainer.getHTML();
            this.editor = AlloyEditor.editable(
                this.editorContainer.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezembed',
                    eZ: {
                        imageVariations: this.variations,
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', Y.bind(function () {
                var editor = this.editor.get('nativeEditor');

                this.widget = editor.widgets.getByElement(
                    editor.element.findOne('#image')
                );
                this.widget.focus();

                startTest();
            }, this));
        },

        tearDown: function () {
            React.unmountComponentAtNode(this.container);
            this.editorContainer.setContent(this.editorContainerContent);
        },

        "Should render a select": function () {
            var select;

            select = React.render(
                <Y.eZ.AlloyEditorButton.ButtonImageVariation editor={this.editor} />,
                this.container
            );

            Assert.isNotNull(
                React.findDOMNode(select),
                "The select should be rendered"
            );
            Assert.areEqual(
                "SELECT", React.findDOMNode(select).tagName,
                "The component should generate a select"
            );
        },

        "Should render an option per variations": function () {
            var select, node;

            select = React.render(
                <Y.eZ.AlloyEditorButton.ButtonImageVariation editor={this.editor} />,
                this.container
            );
            node = Y.one(React.findDOMNode(select));

            Assert.areEqual(
                this.variations.length,
                node.all('option').size(),
                "One option per variation should be rendered"
            );

            node.all('option').each(function (option, i) {
                Assert.areEqual(
                    this.variations[i].name,
                    option.getContent(),
                    "The option should be filled with the variation name"
                );
                Assert.areEqual(
                    this.variations[i].identifier,
                    option.getAttribute('value'),
                    "The option value should be filled with the variation identifier"
                );
            }, this);
        },

        "Should set the default value of the select based on the used image variation": function () {
            var select, node;

            select = React.render(
                <Y.eZ.AlloyEditorButton.ButtonImageVariation editor={this.editor} />,
                this.container
            );
            node = Y.one(React.findDOMNode(select));
            Assert.areEqual(
                'small', node.get('value'),
                "'small' should be selected"
            );
        },
    });

    changeTest = new Y.Test.Case({
        name: "eZ AlloyEditor imagevariation change variation test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.imageFieldDefinitionIdentifier = 'image';
            this.imageField = {};
            this.variations = [{
                identifier: 'large',
                name: 'Large',
            }, {
                identifier: 'small',
                name: 'Small',
            }];
            this.container = Y.one('.container').getDOMNode();
            this.editorContainer = Y.one('.editorContainerChange');
            this.editorContainerContent = this.editorContainer.getHTML();
            this.editor = AlloyEditor.editable(
                this.editorContainer.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezembed',
                    eZ: {
                        imageVariations: this.variations,
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', Y.bind(function () {
                var editor = this.editor.get('nativeEditor');

                this.widget = editor.widgets.getByElement(
                    editor.element.findOne('#image-change')
                );
                this.widget.focus();

                startTest();
            }, this));
        },

        tearDown: function () {
            React.unmountComponentAtNode(this.container);
        },

        "Should load embedded the content and its content type": function () {
            var select,
                contentSearch = false;

            this.editor.get('nativeEditor').on('contentSearch', function (e) {
                var data = e.data;

                contentSearch = true;
                Assert.isTrue(
                    data.loadContentType,
                    "The loadContentType flag should be set"
                );
                Assert.areEqual(
                    "42", data.search.criteria.ContentIdCriterion,
                    "The search should try load the embedded content"
                );
                Assert.areEqual(
                    0, data.search.offset,
                    "The search should try load the embedded content"
                );
                Assert.areEqual(
                    1, data.search.limit,
                    "The search should try load the embedded content"
                );
            });
            select = Y.one(React.findDOMNode(
                React.render(
                    <Y.eZ.AlloyEditorButton.ButtonImageVariation editor={this.editor} />,
                    this.container
                )
            ));
            select.set('value', 'small');
            select.simulate('change');

            Assert.isTrue(contentSearch, "The contentSearch should have been fired");
        },

        _getContentTypeMock: function () {
            var type = new Mock();

            Mock.expect(type, {
                method: 'getFieldDefinitionIdentifiers',
                args: ['ezimage'],
                returns: [this.imageFieldDefinitionIdentifier],
            });

            return type;
        },

        _getContentMock: function () {
            var content = new Mock(),
                fields = {};

            fields[this.imageFieldDefinitionIdentifier] = this.imageField;

            Mock.expect(content, {
                method: 'get',
                args: ['fields'],
                returns: fields,
            });
            return content;
        },

        "Should update the image in the editor": function () {
            var select, variation = 'small',
                loadImageVariation = false,
                struct = {content: this._getContentMock(), contentType: this._getContentTypeMock()};

            this.editor.get('nativeEditor').on('contentSearch', function (e) {
                e.data.callback(false, [struct]);
            });
            this.editor.get('nativeEditor').on('loadImageVariation', Y.bind(function (e) {
                loadImageVariation = true;

                Assert.areEqual(
                    variation, e.data.variation,
                    "The choosen variation should be loaded"
                );
                Assert.areSame(
                    this.imageField, e.data.field,
                    "The field should be provided"
                );
                e.data.callback(false, {uri: 'http://www.reactiongifs.com/r/fyeah.gif'});
            }, this));
            select = Y.one(React.findDOMNode(
                React.render(
                    <Y.eZ.AlloyEditorButton.ButtonImageVariation editor={this.editor} />,
                    this.container
                )
            ));
            select.set('value', variation);
            select.simulate('change');

            Assert.isTrue(loadImageVariation, "The image variation should have been loaded");
            Assert.areEqual(
                variation, this.widget.getConfig('size'),
                "The widget config should have been updated"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor imagevariation button tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(changeTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-button-imagevariation', 'ez-alloyeditor-plugin-embed']});

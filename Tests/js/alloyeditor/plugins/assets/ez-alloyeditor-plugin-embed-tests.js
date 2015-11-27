/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-embed-tests', function (Y) {
    var definePluginTest, embedWidgetTest, focusTest,
        setHrefTest, setWidgetContentTest, setConfigTest, imageTypeTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed plugin define test",

        setUp: function () {
            this.editor = {};
            this.editor.widgets = new Mock();
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the embed plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezembed');

            Assert.isObject(
                plugin,
                "The ezembed should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezembed",
                "The plugin name should be ezembed"
            );
        },

        "Should define the ezembed widget": function () {
            var plugin = CKEDITOR.plugins.get('ezembed');

            Mock.expect(this.editor.widgets, {
                method: 'add',
                args: ['ezembed', Mock.Value.Object],
            });
            plugin.init(this.editor);
            Mock.verify(this.editor.widgets);
        },
    });

    embedWidgetTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',widget,ezembed',
                    eZ: {
                        editableRegion: '.editable',
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        "Should recognize embed element as a widget": function () {
            var container = this.container;

            Assert.isTrue(
                CKEDITOR.plugins.widget.isDomWidgetElement(
                    new CKEDITOR.dom.node(container.one('#embed').getDOMNode())
                )
            );
        },

        "Should fire editorInteraction on focus": function () {
            var container = this.container,
                editorInteractionFired = false,
                nativeEditor = this.editor.get('nativeEditor'),
                widget, embedDOM;

            embedDOM = container.one('#embed').getDOMNode();

            widget = nativeEditor.widgets.getByElement(
                new CKEDITOR.dom.node(embedDOM)
            );

            nativeEditor.on('editorInteraction', function (evt) {
                editorInteractionFired = true;

                Assert.areSame(
                    embedDOM, evt.data.nativeEvent.target,
                    "The embed dom node should be the event target"
                );
                Assert.isObject(
                    evt.data.selectionData,
                    "selectionData should be an object"
                );
                Assert.areEqual(
                    0, Y.Object.size(evt.data.selectionData),
                    "selectionData should be empty"
                );
            });

            widget.fire('focus');
            Assert.isTrue(
                editorInteractionFired,
                "The editorInteraction event should have been fired"
            );
        },
    });

    setHrefTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget setHref test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',widget,ezembed',
                    eZ: {
                        editableRegion: '.editable',
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        "Should set the data-href attribute": function () {
            var embed = this.container.one('#embed'),
                href = 'ezcontent://42',
                widget = this.editor.get('nativeEditor').widgets.getByElement(
                    new CKEDITOR.dom.node(embed.getDOMNode())
                ),
                ret;

            ret = widget.setHref(href);
            Assert.areEqual(
                href, embed.getData('href'),
                "The data-href attribute should have been updated"
            );
            Assert.areSame(
                widget, ret,
                "The widget should be returned"
            );
        },
    });

    setWidgetContentTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget setWidgetContent test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',widget,ezembed',
                    eZ: {
                        editableRegion: '.editable',
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
            this.container.setHTML(this.containerContent);
        },

        "Should remove and set the text content": function () {
            var embed = this.container.one('#embed'),
                content = 'Foo Fighters',
                widget = this.editor.get('nativeEditor').widgets.getByElement(
                    new CKEDITOR.dom.node(embed.getDOMNode())
                ),
                ret;

            ret = widget.setWidgetContent(content);
            Assert.areEqual(
                content, embed.getContent(),
                "The text content should have been updated"
            );
            Assert.areSame(
                widget, ret,
                "The widget should be returned"
            );
        },

        "Should preserve the `ezelements` and set text content": function () {
            var embed = this.container.one('#rich-embed'),
                content = 'Foo Fighters',
                widget = this.editor.get('nativeEditor').widgets.getByElement(
                    new CKEDITOR.dom.node(embed.getDOMNode())
                );

            widget.setWidgetContent(content);
            Assert.areEqual(
                content, embed.get('text').replace(embed.one('[data-ezelement="ezvalue"]').getContent(), ''),
                "The text content should have been updated"
            );

            Assert.isNotNull(
                embed.one('[data-ezelement]'),
                "The ezelement should have been kept"
            );
        },

        "Should preserve the `ezelements` and append the element": function () {
            var embed = this.container.one('#rich-embed'),
                content = new CKEDITOR.dom.element('span'),
                contentId = 'newly-added-content',
                widget = this.editor.get('nativeEditor').widgets.getByElement(
                    new CKEDITOR.dom.node(embed.getDOMNode())
                );

            content.setAttribute('id', contentId);
            widget.setWidgetContent(content);

            Assert.isNotNull(
                embed.one('#' + contentId),
                "The content should have been added to the widget"
            );
            Assert.isNotNull(
                embed.one('[data-ezelement]'),
                "The ezelement should have been kept"
            );
            Assert.areEqual(
                2, embed.get('children').size(),
                "The content of the embed should have been updated"
            );
        },
    });

    setConfigTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget setConfig test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',widget,ezembed',
                    eZ: {
                        editableRegion: '.editable',
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
            this.container.setHTML(this.containerContent);
        },

        _testConfig: function (embedSelector, key, value) {
            var embed = this.container.one(embedSelector),
                widget = this.editor.get('nativeEditor').widgets.getByElement(
                    new CKEDITOR.dom.node(embed.getDOMNode())
                ),
                ret, valueElement, configElement;

            ret = widget.setConfig(key, value);

            configElement = embed.one('[data-ezelement="ezconfig"]');
            Assert.isNotNull(configElement, "The config element should be available in the widget DOM");

            valueElement = configElement.one('[data-ezvalue-key="' + key + '"]');
            Assert.isNotNull(valueElement, "The value element should be available under the config element");
            Assert.areEqual(
                value, valueElement.get('text'),
                "The text content of the value element should be the config value"
            );
            Assert.areSame(
                widget, ret,
                "The widget should be returned"
            );
        },

        "Should set the config value element": function () {
            this._testConfig('#rich-embed', 'volume', '23%');
        },

        "Should update the config element": function () {
            this._testConfig('#rich-embed', 'size', 'huge');
        },

        "Should create the config element": function () {
            this._testConfig('#embed', 'volume', '23%');
        },
    });

    imageTypeTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget setImageType / isImage test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',widget,ezembed',
                    eZ: {
                        editableRegion: '.editable',
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
            this.container.setHTML(this.containerContent);
        },

        _getWidget: function (embedSelector) {
            return this.editor.get('nativeEditor').widgets.getByElement(
                new CKEDITOR.dom.node(this.container.one(embedSelector).getDOMNode())
            );
        },

        "Should detect image embed": function () {
            var widget = this._getWidget('#image-embed');

            Assert.isTrue(
                widget.isImage(), "The widget should be detected as an image"
            );
        },

        "Should set the widget as an image": function () {
            var widget = this._getWidget('#embed');

            Assert.isFalse(
                widget.isImage(), "The widget should not be detected as an image"
            );
            widget.setImageType();
            Assert.isTrue(
                widget.isImage(), "The widget should be detected as an image"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor embed plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(embedWidgetTest);
    Y.Test.Runner.add(focusTest);
    Y.Test.Runner.add(setHrefTest);
    Y.Test.Runner.add(setWidgetContentTest);
    Y.Test.Runner.add(setConfigTest);
    Y.Test.Runner.add(imageTypeTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-alloyeditor-plugin-embed']});

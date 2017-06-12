/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-embed-tests', function (Y) {
    var definePluginTest, embedWidgetTest, focusTest,
        setHrefTest, setWidgetContentTest, setConfigTest, imageTypeTest,
        getHrefTest, getConfigTest, initTest, alignMethodsTest, insertEditTest,
        moveTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed plugin define test",

        setUp: function () {
            this.editor = {};
            this.editor.widgets = new Mock();
            this.elementPath = new Mock();
        },

        tearDown: function () {
            delete this.editor;
            delete this.elementPath;
        },

        _initWithMock: function() {
            var plugin = CKEDITOR.plugins.get('ezembed');

            Mock.expect(this.editor.widgets, {
                method: 'add',
                args: ['ezembed', Mock.Value.Object],
            });
            plugin.init(this.editor);
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
            this._initWithMock();
            Mock.verify(this.editor.widgets);
        },

        "Should define the ezembed.canBeAdded function": function () {
            this._initWithMock();

            Assert.isObject(this.editor.ezembed, "this.editor.ezembed should be an object");
            Assert.isFunction(this.editor.ezembed.canBeAdded, "this.editor.ezembed.canBeAdded should be a Function");
        },


        "ezembed.canBeAdded() should return true when there is no table": function () {
            this._initWithMock();

            Mock.expect(this.editor, {
                method: 'elementPath',
                returns: this.elementPath,
            });

            Mock.expect(this.elementPath, {
                method: 'contains',
                args: ['table', true],
                returns: null,
            });

            Assert.isTrue(this.editor.ezembed.canBeAdded(), "Should be able to add ezembed with *no* table in path");
        },


        "ezembed.canBeAdded() should return false when there is a table": function () {
            this._initWithMock();

            Mock.expect(this.editor, {
                method: 'elementPath',
                returns: this.elementPath,
            });

            Mock.expect(this.elementPath, {
                method: 'contains',
                args: ['table', true],
                returns: [],
            });

            Assert.isFalse(this.editor.ezembed.canBeAdded(), "Should be able to add ezembed with *a* table in path");
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
            this.container.removeAttribute('style');
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
                widget, embedDOM, wrapper;

            embedDOM = container.one('#embed').getDOMNode();
            wrapper = container.one('#embed').get('parentNode');

            widget = nativeEditor.widgets.getByElement(
                new CKEDITOR.dom.node(embedDOM)
            );

            nativeEditor.on('editorInteraction', function (evt) {
                var nativeEvent = evt.data.nativeEvent,
                    selectionData = evt.data.selectionData,
                    region = selectionData.region;

                editorInteractionFired = true;

                Assert.areSame(
                    embedDOM, nativeEvent.target,
                    "The embed dom node should be the event target"
                );
                Assert.areEqual(
                    wrapper.get('region').left, nativeEvent.pageX,
                    "The pageX property should be the left position of the widget wrapper"
                );
                Assert.areEqual(
                    wrapper.get('region').bottom, nativeEvent.pageY,
                    "The pageY property should be the bottom position of the widget wrapper"
                );
                Assert.isObject(
                    selectionData,
                    "selectionData should be an object"
                );
                Assert.areSame(
                    widget.element, selectionData.element,
                    "The widget element should be referenced in the selectionData"
                );
                Assert.areEqual(
                    CKEDITOR.SELECTION_TOP_TO_BOTTOM, region.direction,
                    "The direction should be set to 'top to bottom'"
                );
                Assert.areEqual(
                    wrapper.get('region').top, region.top,
                    "region top property should hold the wrapper top position"
                );
                Assert.areEqual(
                    wrapper.get('region').left, region.left,
                    "region left property should hold the wrapper top position"
                );
                Assert.areEqual(
                    wrapper.get('region').bottom, region.bottom,
                    "region bottom property should hold the wrapper bottom position"
                );
                Assert.areEqual(
                    wrapper.get('region').right, region.right,
                    "region right property should hold the wrapper top position"
                );

                Assert.areSame(
                    nativeEditor.widgets.focused, widget,
                    "The widget should have the focus"
                );
            });

            widget.fire('focus');
            Assert.isTrue(
                editorInteractionFired,
                "The editorInteraction event should have been fired"
            );
        },

        // regression test for EZP-27114
        // region object was incorrectly computed as a result, the toolbar was
        // mispositioned when getting the focus.
        "Should take scroll into account when computing region for editorInteraction event": function () {
            this.container.setStyle('margin-top', '2000px');
            this.container.setStyle('margin-left', '2000px');
            this.container.scrollIntoView();

            this["Should fire editorInteraction on focus"]();
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

    getHrefTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget getHref test",

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

        "Should return the href": function () {
            var embed = this.container.one('#embed'),
                href = 'ezcontent://43',
                widget = this.editor.get('nativeEditor').widgets.getByElement(
                    new CKEDITOR.dom.node(embed.getDOMNode())
                );

            widget.setHref(href);
            Assert.areEqual(
                href, widget.getHref(),
                "The href should have been updated"
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
                content, embed.get('text'),
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

    getConfigTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget getConfig test",

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

        "Should return the config": function () {
            var embed = this.container.one('#rich-embed'),
                widget = this.editor.get('nativeEditor').widgets.getByElement(
                    new CKEDITOR.dom.node(embed.getDOMNode())
                ),
                key = 'whatever',
                value = 'whatever value';

            widget.setConfig(key, value);

            Assert.areEqual(
                value, widget.getConfig(key),
                "The new config value should have been returned"
            );
        },

        "Should return undefined for an unknown config": function () {
            var embed = this.container.one('#rich-embed'),
                widget = this.editor.get('nativeEditor').widgets.getByElement(
                    new CKEDITOR.dom.node(embed.getDOMNode())
                ),
                key = 'unknown config';

            Assert.isUndefined(
                widget.getConfig(key),
                "undefined should have been returned"
            );
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

    initTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget init test",

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

        "Should set the data-ezalign attribute on the wrapper": function () {
            var widget = this._getWidget('#aligned-embed');

            Assert.areEqual(
                'center', widget.wrapper.data('ezalign'),
                "The data-ezalign should have been added"
            );
        },

        "Should not set the data-ezalign attribute on the wrapper": function () {
            var widget = this._getWidget('#embed');

            Assert.isNull(
                widget.wrapper.data('ezalign'),
                "The data-ezalign should not have been added"
            );
        },

        "Should empty the widget": function () {
            Assert.areEqual(
                "", this.container.one('#embed').get('text'),
                "The content of the widget should be removed"
            );
        },

        "Should create the config element": function () {
            Assert.isNotNull(
                this.container.one('#embed').get('[data-ezelement="ezconfig"]'),
                "The config element should be initialized"
            );
        },

        // Regression tests for EZP-26027
        _testCancelEditEvents: function (event, eventParams) {
            var widget = this._getWidget('#embed'),
                wrapperNode = Y.one(widget.wrapper.$),
                initialContent = this.container.getHTML();

            wrapperNode.simulate('dblclick');
            Assert.areEqual(
                initialContent,
                this.container.getHTML(),
                "The content of the editor should remain intact"
            );

        },

        "Should not add a new embed on doubleclick": function () {
            this._testCancelEditEvents('dblclick');
        },

        "Should not add a new embed on enter": function () {
            this._testCancelEditEvents('keypress', {charCode: 13});
        },
    });

    alignMethodsTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed widget align methods test",

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

        "isAligned should detect the correct alignment": function () {
            var widget = this._getWidget('#aligned-embed');

            Assert.isTrue(
                widget.isAligned('center'),
                "The embed should be seen as embed"
            );
            Assert.isFalse(
                widget.isAligned('right'),
               "The embed should be detected as aligned on the right"
            );
        },

        "setAlignment should align the embed": function () {
            var widget = this._getWidget('#embed');

            widget.setAlignment('right');
            Assert.isTrue(
                widget.isAligned('right'),
                "The widget should be aligned on the right"
            );
            Assert.areEqual(
                'right', widget.element.data('ezalign'),
                "The 'data-ezalign' attribute should have been added"
            );
        },

        _assertEditorInteraction: function (widget, facade, evtName) {
            Assert.areSame(
                widget.element.$, facade.nativeEvent.target,
                "The native event should have the widget element as target"
            );
            Assert.areEqual(
                evtName, facade.nativeEvent.name,
                "The native event name should be " + evtName
            );

        },

        "setAlignment should fire the `editorInteraction` event": function () {
            var widget = this._getWidget('#embed'),
                editorInteractionFired = false;

            this.editor.get('nativeEditor').once('editorInteraction', Y.bind(function (e) {
                editorInteractionFired = true;
                this._assertEditorInteraction(widget, e.data, 'widgetsetAlignmentright');
            }, this));
            widget.setAlignment('right');

            Assert.isTrue(
                editorInteractionFired,
                "The `editorInteraction` event should have been fired"
            );
        },

        "setAlignment should handle a previously added alignment": function () {
            var widget = this._getWidget('#aligned-embed');

            widget.setAlignment('right');
            Assert.isFalse(
                widget.isAligned('center'),
                "The widget should not be aligned on the center"
            );
            Assert.isTrue(
                widget.isAligned('right'),
                "The widget should be aligned on the right"
            );
            Assert.areEqual(
                'right', widget.element.data('ezalign'),
                "The 'data-ezalign' attribute should have been added"
            );
        },

        "unsetAlignment should unset the alignment": function () {
            var widget = this._getWidget('#aligned-embed');

            widget.unsetAlignment();
            Assert.isFalse(
                widget.isAligned('right'),
                "The widget should not be aligned anymore"
            );
            Assert.isNull(
                widget.wrapper.data('ezalign'),
                "The 'data-ezalign' attribute should have been removed from the wrapper"
            );
            Assert.isNull(
                widget.element.data('ezalign'),
                "The 'data-ezalign' attribute should have been removed from the element"
            );
        },

        "unsetAlignment should fire the `editorInteraction` event": function () {
            var widget = this._getWidget('#aligned-embed'),
                editorInteractionFired = false;

            this.editor.get('nativeEditor').once('editorInteraction', Y.bind(function (e) {
                editorInteractionFired = true;
                this._assertEditorInteraction(widget, e.data, 'widgetunsetAlignment');
            }, this));
            widget.unsetAlignment();

            Assert.isTrue(
                editorInteractionFired,
                "The `editorInteraction` event should have been fired"
            );
        },
    });

    insertEditTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed insert test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container-insertedit');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',widget,ezembed',
                    eZ: {
                        editableRegion: '.editable',
                    },
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', Y.bind(function () {
                var ed = this.editor.get('nativeEditor'),
                    append = ed.eZ.appendElement,
                    test = this;

                ed.eZ.appendElement = function () {
                    test.appendElementCalled = true;
                    append.apply(this, arguments);
                };
                startTest();
            }, this));
        },

        tearDown: function () {
            this.appendElementCalled = false;
        },

        _getWidget: function (embedSelector) {
            return this.editor.get('nativeEditor').widgets.getByElement(
                new CKEDITOR.dom.node(this.container.one(embedSelector).getDOMNode())
            );
        },

        destroy: function () {
            this.editor.destroy();
            this.container.setHTML(this.containerContent);
        },

        _assertIsNewEmbed: function (wrapper) {
            var ed = this.editor.get('nativeEditor'),
                widget = ed.widgets.getByElement(wrapper);

            Assert.isNull(
                wrapper.getId(),
                "A new wrapper should have been added"
            );
            Assert.areEqual(
                'div', wrapper.getName(),
                "The wrapper should be a div element"
            );
            Assert.areEqual(
                'ezembed', wrapper.findOne('div').getAttribute('data-ezelement'),
                "The wrapper should contain an element representing an embed"
            );
            Assert.areEqual(
                "ezembed", widget.name,
                "The widget should represent an embed"
            );
            Assert.isTrue(
                widget.isReady(),
                "The widget should be ready"
            );
            Assert.areSame(
                ed.getSelection().getSelectedElement().$, widget.wrapper.$,
                "The new widget should have the focus"
            );
        },

        "Should insert the widget after the focused one": function () {
            var existing = this._getWidget('[data-ezelement="ezembed"]');

            existing.focus();
            this.editor.get('nativeEditor').execCommand('ezembed');
            this._assertIsNewEmbed(existing.wrapper.getNext());
            Assert.isTrue(
                this.appendElementCalled,
                "editor.eZ.appendElement should have been used to add the embed"
            );
        },
    });

    moveTest = new Y.Test.Case({
        name: "eZ AlloyEditor embed moveAfter / moveBefore test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.container = Y.one('.container-move');
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

        _getWidget: function () {
			var nativeEditor = this.editor.get('nativeEditor');

            return nativeEditor.widgets.getByElement(
				nativeEditor.element.findOne('#moving')
			);
        },

        "Should move the widget before the element": function () {
            var ref = this.editor.get('nativeEditor').element.findOne('#before'),
                widget = this._getWidget();

            widget.moveBefore(ref);

            Assert.areSame(
                ref.$,
                widget.wrapper.getNext().$,
                "The widget should have been moved before the element"
            );
        },

        "Should move the widget after the element": function () {
            var ref = this.editor.get('nativeEditor').element.findOne('#after'),
                widget = this._getWidget();

            widget.moveAfter(ref);

            Assert.areSame(
                ref.$,
                widget.wrapper.getPrevious().$,
                "The widget should have been moved after the element"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor embed plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(embedWidgetTest);
    Y.Test.Runner.add(focusTest);
    Y.Test.Runner.add(setHrefTest);
    Y.Test.Runner.add(getHrefTest);
    Y.Test.Runner.add(setWidgetContentTest);
    Y.Test.Runner.add(setConfigTest);
    Y.Test.Runner.add(getConfigTest);
    Y.Test.Runner.add(imageTypeTest);
    Y.Test.Runner.add(initTest);
    Y.Test.Runner.add(alignMethodsTest);
    Y.Test.Runner.add(insertEditTest);
    Y.Test.Runner.add(moveTest);
}, '', {requires: ['test', 'node-event-simulate', 'node-style', 'ez-alloyeditor-plugin-embed']});

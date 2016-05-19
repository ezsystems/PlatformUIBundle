/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-ezadd-tests', function (Y) {
    var defineTest, renderTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert;

    defineTest = new Y.Test.Case({
        name: "eZ AlloyEditor ezadd toolbar define test",

        "Should register the ezadd toolbar": function () {
            Assert.isFunction(
                AlloyEditor.Toolbars.ezadd,
                "The ezadd toolbar should be registered"
            );
        },
    });

    renderTest = new Y.Test.Case({
        name: "eZ AlloyEditor ezadd toolbar render test",

        "async:init": function () {
            var startTest = this.callback();

            this.container = Y.one('.container-editor');
            this.containerContent = this.container.getHTML();
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
					toolbars: {ezadd: {}},
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
            this.container.setHTML(this.containerContent);
        },

        setUp: function () {
            this.containerAdd = Y.one('.container-add').getDOMNode();
            this.containerEzAdd = Y.one('.container-ezadd').getDOMNode();
            AlloyEditor.Strings = {};
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.containerAdd);
            ReactDOM.unmountComponentAtNode(this.containerEzAdd);
            delete AlloyEditor.Strings;
        },

		_getEvent: function (editable) {
			return {
				data: {
					nativeEvent: {
						target: {
							isContentEditable: editable,
						}
					}
				}
			};
		},

        "Should render a toolbar for non editable element": function () {
            var toolbar,
                config = {},
				selectionData = {region: {}},
                event = this._getEvent(false);

            toolbar = ReactDOM.render(
                <Y.eZ.AlloyEditor.Toolbars.ezadd
					editor={this.editor}
					config={config}
					editorEvent={event}
					selectionData={selectionData}
					requestExclusive={function () {}}
					renderExclusive={false} />,
                this.containerEzAdd
            );

            Assert.isNotNull(
                ReactDOM.findDOMNode(toolbar),
                "The toolbar should be rendered"
            );
        },

		_getHTMLCode: function (domNode) {
			domNode.removeAttribute('data-reactid');
			Array.prototype.forEach.call(domNode.querySelectorAll('[data-reactid]'), function (n) {
				n.removeAttribute('data-reactid');
			});
			return domNode.innerHTML;
		},

        "Should behave like the add toolbar on editable element": function () {
            var toolbar,
                addToolbar,
                config = {},
				selectionData = {region: {}},
                event = this._getEvent(true);

            toolbar = ReactDOM.render(
                <Y.eZ.AlloyEditor.Toolbars.ezadd
					editor={this.editor}
					config={config}
					editorEvent={event}
					selectionData={selectionData}
					requestExclusive={function () {}}
					renderExclusive={false} />,
                this.containerEzAdd
            );
            addToolbar = ReactDOM.render(
                <Y.eZ.AlloyEditor.Toolbars.add
					editor={this.editor}
					config={config}
					editorEvent={event}
					selectionData={selectionData}
					requestExclusive={function () {}}
					renderExclusive={false} />,
                this.containerAdd
            );
            Assert.isInstanceOf(
                Y.eZ.AlloyEditor.Toolbars.add, toolbar,
                "The ezadd toolbar should extend the default add toolbar"
            );

            Assert.isNotNull(
                ReactDOM.findDOMNode(toolbar),
                "The toolbar should be rendered"
            );
            Assert.areEqual(
                this._getHTMLCode(ReactDOM.findDOMNode(addToolbar)),
                this._getHTMLCode(ReactDOM.findDOMNode(toolbar)),
                "The ezadd toolbar should be rendered the way as the add toolbar"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor ezadd toolbar tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(renderTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-alloyeditor-toolbar-ezadd']});

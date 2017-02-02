/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-linkedit-tests', function (Y) {
    /* global CKEDITOR */
    var defineTest, editLinkTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM,
        React = Y.eZ.React,
        Assert = Y.Assert;

    defineTest = new Y.Test.Case({
        name: "eZ AlloyEditor linkEdit button define test",

        "Should override the linkEdit button": function () {
            Assert.areSame(
                Y.eZ.AlloyEditorButton.ButtonLinkEdit,
                AlloyEditor.Buttons.linkEdit,
                "The linkEdit button should be overridden"
            );
        },
    });

    editLinkTest = new Y.Test.Case({
        name: "eZ AlloyEditor linkEdit button edit link test",

        "async:init": function () {
            var startTest = this.callback();

            CKEDITOR.plugins.addExternal('lineutils', '../../../lineutils/');
            CKEDITOR.plugins.addExternal('widget', '../../../widget/');
            this.editorContainer = Y.one('.editor-container').getDOMNode();
            this.editor = AlloyEditor.editable(
                this.editorContainer, {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezcaret',
                }
            );
            this.native = this.editor.get('nativeEditor');
            this.native.on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
        },

        setUp: function () {
            this.container = Y.one('.container').getDOMNode();
        },

        tearDown: function () {
            ReactDOM.unmountComponentAtNode(this.container);
        },

        _getHrefElement: function () {
            return this.container.querySelector('.ez-ae-link-href-input');
        },

        _getHrefValue: function () {
            return this._getHrefElement().value;
        },

        _getTitleElement: function () {
            return this.container.querySelector('.ez-ae-link-title-input');
        },

        _getTitleValue: function () {
            return this._getTitleElement().value;
        },

        _getCheckedTarget: function () {
            return this.container.querySelector('input[name="target"]:checked').value;
        },

        "Should fill the properties based on the selected link": function () {
            var button, buttonDOM,
                link = this.native.element.findOne('#allattr');

            this.native.getSelection().selectElement(link);
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} />,
                this.container
            );

            buttonDOM = ReactDOM.findDOMNode(button);
            Assert.isNotNull(
                buttonDOM,
                "The button should be rendered"
            );
            Assert.isTrue(
                buttonDOM.classList.contains('is-linked'),
                "The button container should have the is-linked class"
            );

            Assert.areEqual(
                link.$.href, this._getHrefValue(),
                "The href input should be filled with the link href"
            );
            Assert.areEqual(
                link.$.title, this._getTitleValue(),
                "The title input should be filled with the link title"
            );
            Assert.areEqual(
                link.$.target, this._getCheckedTarget(),
                "The link target should be checked"
            );
        },

        "Should handle missing target on the selected link": function () {
            var button, buttonDOM,
                link = this.native.element.findOne('#onlyhref');

            this.native.getSelection().selectElement(link);
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} />,
                this.container
            );

            buttonDOM = ReactDOM.findDOMNode(button);
            Assert.isNotNull(
                buttonDOM,
                "The button should be rendered"
            );
            Assert.isTrue(
                buttonDOM.classList.contains('is-linked'),
                "The button container should have the is-linked class"
            );

            Assert.areEqual(
                link.$.href, this._getHrefValue(),
                "The href input should be filled with the link href"
            );
            Assert.areEqual(
                "", this._getCheckedTarget(),
                "The default link target should be checked"
            );
        },

        "Should display the button to create a link": function () {
            var button, buttonDOM,
                span = this.native.element.findOne('.no-link span');

            this.native.getSelection().selectElement(span);
            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={function () {}} />,
                this.container
            );

            buttonDOM = ReactDOM.findDOMNode(button);
            Assert.isNotNull(
                buttonDOM,
                "The button should be rendered"
            );
            Assert.isFalse(
                buttonDOM.classList.contains('is-linked'),
                "The button container should not have the is-linked class"
            );

            Assert.areEqual(
                "", this._getHrefValue(),
                "The href input should be empty"
            );
            Assert.areEqual(
                "", this._getTitleValue(),
                "The title input should be empty"
            );
            Assert.areEqual(
                "", this._getCheckedTarget(),
                "The defaut target should be checked"
            );
        },

        _changeInput: function (input, value) {
            var evt = document.createEvent('CustomEvent');

            evt.initCustomEvent('input', true, false, {});
            input.value = value;
            input.dispatchEvent(evt);
        },

        "Should clear the href input": function () {
            var button,
                span = this.native.element.findOne('.create-link span');

            this.native.getSelection().selectElement(span);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={function () {}} />,
                this.container
            );

            this._changeInput(this._getHrefElement(), 'https://fr.wikipedia.org/wiki/Albert_Einstein');

            Y.one(this.container.querySelector('.ez-ae-edit-link-clear')).simulate('click');

            Assert.areEqual(
                "", this._getHrefValue(),
                "The href input should be empty"
            );
        },

        _createLink: function (paragraphClass, triggerFn) {
            var button,
                span = this.native.element.findOne('.' + paragraphClass + ' span'),
                link,
                cancelled = false,
                cancel = function () {
                    cancelled = true;
                };

            this.native.getSelection().selectElement(span);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={cancel} />,
                this.container
            );
            link = this.editorContainer.querySelector('.' + paragraphClass + ' a');

            Assert.isTrue(
                link.hasAttribute('data-ez-temporary-link'),
                "The link should be temporary before validation"
            );

            this._changeInput(this._getHrefElement(), 'https://fr.wikipedia.org/wiki/Albert_Einstein');
            this._changeInput(this._getTitleElement(), 'Albert');
            this.container.querySelector('#ez-ae-link-target-blank').checked = true;
            Y.one(this.container.querySelector('#ez-ae-link-target-blank')).simulate('click');

            triggerFn.call(this);

            Assert.isFalse(
                link.hasAttribute('data-ez-temporary-link'),
                "The link should not be temporary"
            );
            Assert.areEqual(
                this._getTitleValue(), link.title,
                "The link should get the title"
            );
            Assert.areEqual(
                this._getHrefValue(), link.href,
                "The link should get the href value"
            );
            Assert.areEqual(
                '_blank', link.target,
                "The link target should be '_blank'"
            );
            Assert.isTrue(
                cancelled,
                "The cancelExclusive callback should have been called"
            );
        },

        "Should create a link": function () {
            this._createLink('create-link', function () {
                Y.one(this.container.querySelector('.ez-ae-save-link')).simulate('click');
            });
        },

        "Should create a link by using enter": function () {
            this._createLink('create-link-keyboard', function () {
                var input = this._getHrefElement();

                input.focus();
                Y.one(input).simulate('keydown', {keyCode: 13});
            });
        },

        "Should handle empty href when using enter": function () {
            var button,
                span = this.native.element.findOne('.no-link span'),
                cancelled = false,
                cancel = function () {
                    cancelled = true;
                },
                href;

            this.native.getSelection().selectElement(span);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={cancel} />,
                this.container
            );

            href = this._getHrefElement();
            this._changeInput(href, '');
            this._changeInput(this._getTitleElement(), 'Albert');

            href.focus();
            Y.one(href).simulate('keydown', {keyCode: 13});

            Assert.areEqual(
                "true",
                this.native.element.findOne('.no-link a').getAttribute('data-ez-temporary-link'),
                "The link should still be temporary"
            );
        },

        "Should move the selection when escaping": function () {
            var button,
                span = this.native.element.findOne('.create-link span'),
                href;

            this.native.getSelection().selectElement(span);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} />,
                this.container
            );

            href = this._getHrefElement();
            this._changeInput(href, 'https://fr.wikipedia.org/wiki/Albert_Einstein');
            this._changeInput(this._getTitleElement(), 'Albert');

            href.focus();
            Y.one(href).simulate('keydown', {keyCode: 27});

            Assert.isNull(
                this.native.getSelection().getSelectedElement(),
                "The selection should have changed"
            );
        },

        "Should update the link": function () {
            var button,
                link = this.native.element.findOne('.update-link a'),
                cancelled = false,
                cancel = function () {
                    cancelled = true;
                };

            this.native.getSelection().selectElement(link);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={cancel} />,
                this.container
            );

            this._changeInput(this._getHrefElement(), 'https://fr.wikipedia.org/wiki/Albert_Einstein');
            this._changeInput(this._getTitleElement(), 'Albert');

            Y.one(this.container.querySelector('.ez-ae-save-link')).simulate('click');

            Assert.areEqual(
                this._getTitleValue(), link.$.title,
                "The link title should have been updated"
            );
            Assert.areEqual(
                this._getHrefValue(), link.$.href,
                "The link href should have been updated"
            );
            Assert.isTrue(
                cancelled,
                "The cancelExclusive callback should have been called"
            );
        },

        "Should remove the link": function () {
            var button,
                link = this.native.element.findOne('.remove-link a'),
                cancelled = false,
                cancel = function () {
                    cancelled = true;
                };

            this.native.getSelection().selectElement(link);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={cancel} />,
                this.container
            );

            this._changeInput(this._getHrefElement(), 'https://fr.wikipedia.org/wiki/Albert_Einstein');
            this._changeInput(this._getTitleElement(), 'Albert');

            Y.one(this.container.querySelector('.ez-ae-remove-link')).simulate('click');

            Assert.isNull(
                this.native.element.findOne('.remove-link a'),
                "The link should have been removed"
            );
            Assert.isTrue(
                cancelled,
                "The cancelExclusive callback should have been called"
            );
        },

        "Should run the universal discovery widget": function () {
            var button,
                span = this.native.element.findOne('.udw-link span'),
                cancel = function () {},
                discovering = false;

            this.native.getSelection().selectElement(span);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={cancel} />,
                this.container
            );

            this.native.on('contentDiscover', function (e) {
                discovering = true;

                Assert.isFalse(
                    e.data.config.multiple,
                    "The UDW should be configued with multiple set to false"
                );
                Assert.areEqual(
                    "select.a.content.to.link.to domain=onlineeditor",
                    e.data.config.title,
                    "The title should be set"
                );
            });

            Y.one(this.container.querySelector('.ez-ae-button-discover')).simulate('click');

            Assert.isTrue(
                discovering,
                "The UDW should have been launched"
            );
            ReactDOM.unmountComponentAtNode(this.container);

            Assert.areEqual(
                "true",
                this.native.element.findOne('.udw-link a').getAttribute('data-ez-temporary-link'),
                "The temporary link should be kept after unmouting the component"
            );
        },

        "Should update the link after picking a Content item with the UDW": function () {
            var button,
                span = this.native.element.findOne('.udw-contentdiscovered-link span'),
                link,
                cancel = function () {},
                location = new Y.Base(),
                locationId = 42,
                selection = this.native.getSelection();

            location.set('locationId', locationId);

            this.native.getSelection().selectElement(span);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={cancel} />,
                this.container
            );

            this.native.on('contentDiscover', function (e) {
                e.data.config.contentDiscoveredHandler.call(this, {
                    selection: {
                        location: location,
                    },
                });
            });

            Y.one(this.container.querySelector('.ez-ae-button-discover')).simulate('click');

            link = this.native.element.findOne('.udw-contentdiscovered-link a');
            Assert.areEqual(
                "ezlocation://" + locationId,
                link.getAttribute('href'),
                "The link should have been updated"
            );
            Assert.areSame(
                link.$, selection.getStartElement().$,
                "The link should be focused"
            );
        },

        "Should give the focus to the link after cancelling the UDW": function () {
            var button,
                span = this.native.element.findOne('.udw-contentdiscovered-link span'),
                link,
                cancel = function () {},
                selection = this.native.getSelection();

            this.native.getSelection().selectElement(span);

            button = ReactDOM.render(
                <Y.eZ.AlloyEditorButton.ButtonLinkEdit editor={this.editor} cancelExclusive={cancel} />,
                this.container
            );

            this.native.on('contentDiscover', function (e) {
                e.data.config.cancelDiscoverHandler.call(this);
            });

            Y.one(this.container.querySelector('.ez-ae-button-discover')).simulate('click');

            link = this.native.element.findOne('.udw-contentdiscovered-link a');
            Assert.areSame(
                link.$, selection.getStartElement().$,
                "The link should be focused"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor linkedit button tests");
    Y.Test.Runner.add(defineTest);
    Y.Test.Runner.add(editLinkTest);
}, '', {requires: ['test', 'base', 'node', 'node-event-simulate', 'ez-alloyeditor-button-linkedit']});

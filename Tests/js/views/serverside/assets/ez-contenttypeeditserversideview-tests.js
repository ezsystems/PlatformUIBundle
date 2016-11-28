/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypeeditserversideview-tests', function (Y) {
    var relationPickRootTest, selectionFieldDefinitionTest,
        containerTemplateTest,
        Assert = Y.Assert, Mock = Y.Mock;

    relationPickRootTest = new Y.Test.Case({
        name: "eZ Content Type Edit Server Side pick default root for relations tests",

        init: function () {
            this.content = Y.one('.container').getHTML();
        },

        setUp: function () {
            this.view = new Y.eZ.ContentTypeEditServerSideView({
                container: '.container',
            });
            this.view.render();
            this.view.set('active', true);
            this.view.set('html', this.content);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the contentDiscover event": function () {
            var container = this.view.get('container'),
                button = container.one('.ez-relation-pick-root-button'),
                that = this;

            container.once('tap', function (e) {
                Assert.isTrue(!!e.prevented, "The tap event should have been prevented");
            });
            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    Assert.areEqual(
                        button.getAttribute('data-universaldiscovery-title'),
                        e.config.title,
                        "The event facade should contain a custom title"
                    );
                    Assert.isFalse(
                        e.config.multiple,
                        "The universal discovery should be configured in single location selection mode"
                    );
                });
            });
            button.simulateGesture('tap');
            this.wait();
        },

        "Should set selected locationId in input": function () {
            var container = this.view.get('container'),
                button = container.one('.ez-relation-pick-root-button'),
                that = this,
                locationMock = new Mock(),
                contentInfoMock = new Mock(),
                fakeEventFacade = {selection: {location: locationMock, contentInfo: contentInfoMock}};

            Mock.expect(locationMock, {
                method: 'get',
                args: ['locationId'],
                returns: 57
            });
            Mock.expect(contentInfoMock, {
                method: 'get',
                args: ['name'],
                returns: 'jerzy-engel'
            });

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {

                    e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
                    Assert.isNotNull(
                        button.getAttribute('data-relation-root-input-selector'),
                        "Button should have the input selector being set"
                    );
                    Assert.isNotNull(
                        container.one(button.getAttribute('data-relation-root-input-selector')),
                        "Input with passed selector in button's attribute should exist"
                    );
                    Assert.areEqual(
                        container.one(button.getAttribute('data-relation-root-input-selector')).get('value'),
                        locationMock.get('locationId'),
                        "locationId in input should be the same as locationId of selected location"
                    );
                    Assert.isNotNull(
                        button.getAttribute('data-relation-selected-root-name-selector'),
                        "Button should have the content's name container selector being set"
                    );
                    Assert.isNotNull(
                        container.one(button.getAttribute('data-relation-selected-root-name-selector')),
                        "Node for displaying name with passed selector in button's attribute should exist"
                    );
                    Assert.areEqual(
                        container.one(button.getAttribute('data-relation-selected-root-name-selector')).getContent(),
                        contentInfoMock.get('name'),
                        "Name of selected content should be set"
                    );
                });
            });
            button.simulateGesture('tap');
            this.wait();
        }
    });

    containerTemplateTest = new Y.Test.Case({
        name: "eZ Content Type Edit Server Side container tests",

        setUp: function () {
            this.view = new Y.eZ.ContentTypeEditServerSideView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should have the server side view class": function () {
            Assert.isTrue(
                this.view.get('container').hasClass('ez-view-serversideview'),
                "The container should have the server side view class"
            );
        },

        "Should have the content type edit server side view class": function () {
            Assert.isTrue(
                this.view.get('container').hasClass('ez-view-contenttypeeditserversideview'),
                "The container should have the content type edit server side view class"
            );
        },
    });

    selectionFieldDefinitionTest = new Y.Test.Case({
        name: "eZ Content Type Edit Server Side selection field definition handling tests",

        init: function () {
            this.content = Y.one('.container-selection').getHTML();
        },

        setUp: function () {
            this.view = new Y.eZ.ContentTypeEditServerSideView({
                container: '.container-selection',
            });
            this.view.render();
            this.view.set('active', true);
            this.view.set('html', this.content);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.one('.container-selection').setHTML(this.content);
        },

        _countValues: function () {
            return this.view.get('container').all('.ezselection-settings-option-value').size();
        },

        _assertNewInput: function (optionsCount) {
            var newInput = this.view.get('container').all('.ezselection-settings-option-value input[type=text]').item(optionsCount);

            Assert.areEqual(
                optionsCount + 1,
                this._countValues(),
                "A new option should have been added"
            );
            Assert.areEqual(
                'Prototype', newInput.get('value'),
                "The new option should be based on the prototype"
            );
            Assert.areEqual(
                'name' + (optionsCount + 1), newInput.get('name'),
                "The `__number__` placeholder  should have been replaced"
            );
        },

        "Should add a new input when tapping the add button": function () {
            var container = this.view.get('container'),
                optionsCount = this._countValues();

            container.one('.ezselection-settings-option-add').simulateGesture('tap', this.next(function() {
                this._assertNewInput(optionsCount);
            }, this));
            this.wait();
        },

        "Should add a new input when using space": function () {
            var container = this.view.get('container'),
                optionsCount = this._countValues();

            container.one('.ezselection-settings-option-add').simulate('keydown', {keyCode: 32});
            this._assertNewInput(optionsCount);
        },

        "Should add a new input when using enter": function () {
            var container = this.view.get('container'),
                optionsCount = this._countValues();

            container.one('.ezselection-settings-option-add').simulate('keydown', {keyCode: 13});
            this._assertNewInput(optionsCount);
        },

        "Should ignore other key input on the add button": function () {
            var container = this.view.get('container'),
                optionsCount = this._countValues();

            container.one('.ezselection-settings-option-add').simulate('keydown', {keyCode: 65});
            Assert.areEqual(
                optionsCount, this._countValues(),
                "The number of option should remain the same"
            );
        },

        _assertRemoved: function (optionsCount, removeCount) {
            var button = this.view.get('container').one('.ezselection-settings-option-remove');
            Assert.areEqual(
                optionsCount - removeCount,
                this._countValues(),
                "The checked value should have been removed"
            );
            Assert.isTrue(
                button.get('disabled'),
                "The button should be disabled"
            );
        },

        _checkOptionToRemove: function () {
            var toRemove = this.view.get('container').all('.value-to-remove'),
                removeCount = toRemove.size();

            toRemove.each(function (input) {
                input.set('checked', true);
            });

            return removeCount;
        },

        "Should remove the selected options when tapping the remove button": function () {
            var removeCount = this._checkOptionToRemove(),
                optionsCount = this._countValues(),
                container = this.view.get('container');

            container.one('.ezselection-settings-option-remove').simulateGesture('tap', this.next(function () {
                this._assertRemoved(optionsCount, removeCount);
            }, this));
            this.wait();
        },

        "Should remove the selected options when using space": function () {
            var removeCount = this._checkOptionToRemove(),
                optionsCount = this._countValues(),
                container = this.view.get('container');

            container.one('.ezselection-settings-option-remove').simulate('keydown', {keyCode: 32});
            this._assertRemoved(optionsCount, removeCount);
        },

        "Should remove the selected options when using enter": function () {
            var removeCount = this._checkOptionToRemove(),
                optionsCount = this._countValues(),
                container = this.view.get('container');

            container.one('.ezselection-settings-option-remove').simulate('keydown', {keyCode: 13});
            this._assertRemoved(optionsCount, removeCount);
        },

        "Should ignore other key input on the remove button": function () {
            var optionsCount = this._countValues(),
                container = this.view.get('container');

            this._checkOptionToRemove();

            container.one('.ezselection-settings-option-remove').simulate('keydown', {keyCode: 65});
            Assert.areEqual(
                optionsCount, this._countValues(),
                "The number of option should remain the same"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Type Edit Server Side View tests");
    Y.Test.Runner.add(relationPickRootTest);
    Y.Test.Runner.add(containerTemplateTest);
    Y.Test.Runner.add(selectionFieldDefinitionTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-contenttypeeditserversideview']});

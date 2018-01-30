/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-actionbarview-tests', function (Y) {
    var Assert = Y.Assert,
        Mock = Y.Mock,
        viewTest,
        userViewTest,
        containerTest,
        rootLocationTest;

    viewTest = new Y.Test.Case({
        name: "eZ Action Bar View test",

        setUp: function () {
            this.locationMock = new Mock();
            this.content = {};
            this.contentTypeMock = new Mock();

            Y.eZ.CreateContentActionView = Y.Base.create('createContentActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {}, {
                contentTypeGroups: {},
                contentTypeSelectorView: {},
                contentType: {}
            });
            Y.eZ.TranslateActionView = Y.Base.create('translateActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {}, {
                location: {},
                content: {}
            });
            Y.eZ.MoveContentActionView = Y.Base.create('moveContentActionView', Y.eZ.ButtonActionView, [], {}, {
                location: {}
            });

            Mock.expect(this.contentTypeMock, {
                method: 'hasFieldType',
                args: ['ezuser'],
                returns: false
            });

            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer'],
                returns: false,
            });

            Mock.expect(this.locationMock, {
                method: 'isRootLocation'
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['childCount'],
                returns: 0
            });

            this.view = new Y.eZ.ActionBarView({
                location: this.locationMock,
                content: this.content,
                contentType: this.contentTypeMock,
                config: { copySubtree: {} }
            });
        },

        tearDown: function () {
            delete Y.eZ.CreateContentActionView;
            delete Y.eZ.TranslateActionView;
            delete Y.eZ.MoveContentActionView;
            this.view.destroy();
        },

        _isActionCreated: function (actionId, testedAttributes) {
            var actionFound;

            actionFound = Y.Array.find(this.view.get('actionsList'), function (actionView) {
                return actionView.get('actionId') === actionId;
            });

            if (!!actionFound) {
                Y.Object.each(testedAttributes, function (attrValue, attrName) {
                    Assert.areSame(
                        attrValue,
                        actionFound.get(attrName),
                        'The ' + attrName + ' should have been set to ' + actionId + 'ActionView'
                    );
                });
            }

            Assert.isTrue(
                !!actionFound,
                'The ActionBarView should contain ' + actionId + ' action'
            );
        },

        _isNotActionCreated: function (actionId, testedAttributes) {
            var actionFound;

            actionFound = Y.Array.find(this.view.get('actionsList'), function (actionView) {
                return actionView.get('actionId') === actionId;
            });

            Assert.isFalse(
                !!actionFound,
                'The ActionBarView should not contain ' + actionId + ' action'
            );
        },

        "Should instantiate edit buttonActionView": function () {
            this._isActionCreated('edit', {
                content: this.view.get('content')
            });
        },

        "Should instantiate createContentActionView": function () {
            this._isActionCreated('createContent', {
                contentType: this.view.get('contentType')
            });
        },

        "Should instantiate translateActionView": function () {
            this._isActionCreated('translate', {
                content: this.view.get('content'),
                location: this.view.get('location')
            });
        },

        "Should instantiate moveContentActionView": function () {
            this._isActionCreated('move', {
                location: this.view.get('location')
            });
        },

        "Should instantiate sendToTrashActionView": function () {
            this._isActionCreated('sendToTrash', {});
        },

        "Should not instantiate deleteActionView": function () {
            this._isNotActionCreated('deleteContent', {});
        },

        "Should not instantiate copySubtreeView": function () {
            this._isNotActionCreated('copySubtree', {});
        }
    });

    userViewTest = new Y.Test.Case({
        name: "eZ Action Bar View For Users test ",

        setUp: function () {
            this.locationMock = new Mock();
            this.content = {};
            this.contentTypeMock = new Mock();

            Y.eZ.CreateContentActionView = Y.Base.create('createContentActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {}, {
                contentTypeGroups: {},
                contentTypeSelectorView: {},
                contentType: {}
            });
            Y.eZ.TranslateActionView = Y.Base.create('translateActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {}, {
                location: {},
                content: {}
            });
            Y.eZ.MoveContentActionView = Y.Base.create('moveContentActionView', Y.eZ.ButtonActionView, [], {}, {
                location: {}
            });

            Mock.expect(this.locationMock, {
                method: 'isRootLocation'
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['childCount'],
                returns: 0
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['childCount'],
                returns: 0
            });

            Mock.expect(this.contentTypeMock, {
                method: 'hasFieldType',
                args: ['ezuser'],
                returns: true
            });

            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer'],
                returns: false,
            });

            this.view = new Y.eZ.ActionBarView({
                location: this.locationMock,
                content: this.content,
                contentType: this.contentTypeMock,
                config: { copySubtree: {} }
            });
        },

        tearDown: function () {
            delete Y.eZ.CreateContentActionView;
            delete Y.eZ.TranslateActionView;
            delete Y.eZ.MoveContentActionView;
            this.view.destroy();
        },

        _isActionCreated: function (actionId, testedAttributes) {
            var actionFound;

            actionFound = Y.Array.find(this.view.get('actionsList'), function (actionView) {
                return actionView.get('actionId') === actionId;
            });

            if (!!actionFound) {
                Y.Object.each(testedAttributes, function (attrValue, attrName) {
                    Assert.areSame(
                        attrValue,
                        actionFound.get(attrName),
                        'The ' + attrName + ' should have been set to ' + actionId + 'ActionView'
                    );
                });
            }

            Assert.isTrue(
                !!actionFound,
                'The ActionBarView should contain ' + actionId + ' action'
            );
        },

        _isNotActionCreated: function (actionId, testedAttributes) {
            var actionFound;

            actionFound = Y.Array.find(this.view.get('actionsList'), function (actionView) {
                return actionView.get('actionId') === actionId;
            });

            Assert.isFalse(
                !!actionFound,
                'The ActionBarView should not contain ' + actionId + ' action'
            );
        },

        "Should instantiate edit buttonActionView": function () {
            this._isActionCreated('edit', {
                content: this.view.get('content')
            });
        },

        "Should instantiate createContentActionView": function () {
            this._isActionCreated('createContent', {
                contentType: this.view.get('contentType')
            });
        },

        "Should instantiate translateActionView": function () {
            this._isActionCreated('translate', {
                content: this.view.get('content'),
                location: this.view.get('location')
            });
        },

        "Should instantiate moveContentActionView": function () {
            this._isActionCreated('move', {
                location: this.view.get('location')
            });
        },

        "Should not instantiate sendToTrashActionView": function () {
            this._isNotActionCreated('sendToTrash', {});
        },

        "Should instantiate deleteActionView": function () {
            this._isActionCreated('deleteContent', {});
        },
    });

    containerTest = new Y.Test.Case({
        name: "eZ Action Bar View container location test",

        setUp: viewTest.setUp,

        tearDown: viewTest.tearDown,

        _isActionCreated: function (actionId, testedAttributes) {
            var actionFound;

            actionFound = Y.Array.find(this.view.get('actionsList'), function (actionView) {
                return actionView.get('actionId') === actionId;
            });

            if (!!actionFound) {
                Y.Object.each(testedAttributes, function (attrValue, attrName) {
                    Assert.areSame(
                        attrValue,
                        actionFound.get(attrName),
                        'The ' + attrName + ' should have been set to ' + actionId + 'ActionView'
                    );
                });
            }

            Assert.isTrue(
                !!actionFound,
                'The ActionBarView should contain ' + actionId + ' action'
            );
        },

        _isNotActionCreated: function (actionId, testedAttributes) {
            var actionFound;

            actionFound = Y.Array.find(this.view.get('actionsList'), function (actionView) {
                return actionView.get('actionId') === actionId;
            });

            Assert.isFalse(
                !!actionFound,
                'The ActionBarView should not contain ' + actionId + ' action'
            );
        },

        "Should instantiate copySubtreeView if location is none-empty container": function () {
            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer'],
                returns: true
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['childCount'],
                returns: 2
            });

            this.view = new Y.eZ.ActionBarView({
                location: this.locationMock,
                content: this.content,
                contentType: this.contentTypeMock,
                config: { copySubtree: {} }
            });

            this._isActionCreated('copySubtree', {});
        },

        "Should not instantiate copySubtreeView if location is empty container": function () {
            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer'],
                returns: true
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['childCount'],
                returns: 0
            });

            this.view = new Y.eZ.ActionBarView({
                location: this.locationMock,
                content: this.content,
                contentType: this.contentTypeMock,
                config: { copySubtree: {} }
            });

            this._isNotActionCreated('copySubtree', {});
        },

        "Should not instantiate copySubtreeView if location is root": function() {
            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer'],
                returns: true
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['childCount'],
                returns: 10
            });

            Mock.expect(this.locationMock, {
                method: 'isRootLocation',
                returns: true
            });

            this.view = new Y.eZ.ActionBarView({
                location: this.locationMock,
                content: this.content,
                contentType: this.contentTypeMock,
                config: { copySubtree: {} }
            });

            this._isNotActionCreated('copySubtree', {});
        },
    });

    rootLocationTest = new Y.Test.Case({
        name: "eZ Action Bar View root location test",

        setUp: viewTest.setUp,

        tearDown: viewTest.tearDown,

        _isActionDisabled: function (actionId, expected) {
            var actionFound;

            actionFound = Y.Array.find(this.view.get('actionsList'), function (actionView) {
                return actionView.get('actionId') === actionId;
            });

            Assert.areSame(
                expected,
                !!actionFound.get('disabled'),
                'The disabled atribute for ' + actionId + ' should be set to ' + expected
            );
        },

        "Should disable sendToTrashActionView if root location": function() {
            Mock.expect(this.locationMock, {
                method: 'isRootLocation',
                returns: true
            });

            this.view = new Y.eZ.ActionBarView({
                location: this.locationMock,
                content: this.content,
                contentType: this.contentTypeMock,
                config: { copySubtree: {} }
            });

            this._isActionDisabled('sendToTrash', true);
        },

        "Should not disable sendToTrashActionView if it is not root location": function() {
            Mock.expect(this.locationMock, {
                method: 'isRootLocation',
                returns: false
            });

            this.view = new Y.eZ.ActionBarView({
                location: this.locationMock,
                content: this.content,
                contentType: this.contentTypeMock,
                config: { copySubtree: {} }
            });

            this._isActionDisabled('sendToTrash', false);
        }
    });

    Y.Test.Runner.setName("eZ Action Bar View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(userViewTest);
    Y.Test.Runner.add(containerTest);
    Y.Test.Runner.add(rootLocationTest);
}, '', {requires: ['test', 'ez-actionbarview']});

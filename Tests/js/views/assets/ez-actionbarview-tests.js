/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-actionbarview-tests', function (Y) {
    var Assert = Y.Assert,
        viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Action Bar View test",

        setUp: function () {
            this.location = {};
            this.content = {};
            this.contentType = {};

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

            this.view = new Y.eZ.ActionBarView({
                location: this.location,
                content: this.content,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            delete Y.eZ.CreateContentActionView;
            delete Y.eZ.TranslateActionView;
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
    });

    Y.Test.Runner.setName("eZ Action Bar View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-actionbarview']});

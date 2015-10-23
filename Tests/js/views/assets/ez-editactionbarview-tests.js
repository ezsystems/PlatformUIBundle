/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editactionbarview-tests', function (Y) {
    var actionListChangeTest, actionListTest,
        Assert = Y.Assert, Mock = Y.Mock;

    actionListChangeTest = new Y.Test.Case({
        name: "eZ Edit Action Bar View actionList Change test",

        setUp: function () {
            this.view = new Y.eZ.EditActionBarView({
                actionsList: [],
                version: {},
                languageCode: 'fre-FR',
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set the version and the languageCode to new action list": function () {
            var newActionList = [new Y.View(), new Y.View()];

            this.view.set('actionsList', newActionList);

            Y.Array.each(newActionList, function (view) {
                Assert.areSame(
                    this.view.get('version'), view.get('version'),
                    "The version should set on the action list view"
                );
                Assert.areSame(
                    this.view.get('languageCode'), view.get('languageCode'),
                    "The languageCode should set on the action list view"
                );
            }, this);
        }
    });

    actionListTest = new Y.Test.Case({
        name: "eZ Edit Action Bar View actionList test",

        setUp: function () {
            this.contentType = new Mock();
            Y.eZ.ButtonActionView = Y.View;
            Y.eZ.PreviewActionView = Y.View;
        },

        tearDown: function () {
            this.view.destroy();

            delete Y.eZ.ButtonActionView;
            delete Y.eZ.PreviewActionView;
        },

        "Should include the Save button action view": function () {
            Mock.expect(this.contentType, {
                method: 'hasFieldType',
                args: ['ezuser'],
                returns: false,
            });
            this.view = new Y.eZ.EditActionBarView({
                contentType: this.contentType,
            });

            Assert.isObject(
                this.view.getAction('save'),
                "The Save button should be added"
            );
        },

        "Should include the Preview buttons action view": function () {
            Mock.expect(this.contentType, {
                method: 'hasFieldType',
                args: ['ezuser'],
                returns: false,
            });
            this.view = new Y.eZ.EditActionBarView({
                contentType: this.contentType,
            });

            Assert.isObject(
                this.view.getAction('preview'),
                "The Preview buttons should be added"
            );
        },

        "Should not include the Save button action": function () {
            Mock.expect(this.contentType, {
                method: 'hasFieldType',
                args: ['ezuser'],
                returns: true,
            });
            this.view = new Y.eZ.EditActionBarView({
                contentType: this.contentType,
            });

            Assert.isNull(
                this.view.getAction('save'),
                "The Save button should not be added"
            );
        },

        "Should not include the Preview buttons action": function () {
            Mock.expect(this.contentType, {
                method: 'hasFieldType',
                args: ['ezuser'],
                returns: true,
            });
            this.view = new Y.eZ.EditActionBarView({
                contentType: this.contentType,
            });

            Assert.isNull(
                this.view.getAction('preview'),
                "The Preview buttons should not be added"
            );
        },
    });

    Y.Test.Runner.setName("eZ Edit Action Bar View tests");
    Y.Test.Runner.add(actionListChangeTest);
    Y.Test.Runner.add(actionListTest);
}, '', {requires: ['test', 'ez-editactionbarview']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockmydraftsview-tests', function (Y) {
    'use strict';

    var AsynchronousViewTests = Y.eZ.Test.DashblockBlockAsynchronousViewTests,
        renderTest,
        loadUserDraftsEvent,
        rowOptionTest,
        CLASS_LOADING = 'is-loading',
        Assert = Y.Assert, Model = Y.Model, Mock = Y.Mock;

    renderTest = new Y.Test.Case(Y.merge(AsynchronousViewTests.RenderTest, {
        name: 'eZ Dashboard My Drafts Block View render test',

        setUp: function () {
            this.view = new Y.eZ.DashboardBlockMyDraftsView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        _getModelMock: function (toJSON) {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'toJSON',
                returns: toJSON,
            });

            return mock;
        },

        'Should render with items': function () {
            var view = this.view,
                origTpl = view.template,
                versionJSON = {},
                contentTypeJSON = {},
                contentInfoJSON = {},
                list;

            list = [{
                version: this._getModelMock(versionJSON),
                contentType: this._getModelMock(contentTypeJSON),
                contentInfo: this._getModelMock(contentInfoJSON),
            }];

            view.template = function (params) {
                Assert.isArray(
                    params.items, 'The `items` variable should be an array'
                );
                Assert.areSame(
                    list.length, params.items.length,
                    '`items` should contain as many item as the `items` attribute'
                );
                Assert.areSame(
                    versionJSON, params.items[0].version,
                    'The Version model should have been converted'
                );
                Assert.areSame(
                    contentTypeJSON, params.items[0].contentType,
                    'The ContentType model should have been converted'
                );
                Assert.areSame(
                    contentInfoJSON, params.items[0].contentInfo,
                    'The ContentInfo model should have been converted'
                );
                Assert.isFalse(
                    params.loadingError,
                    'The `loadingError` should be false'
                );

                return origTpl.apply(this, arguments);
            };

            view.set('items', list);

            Assert.isFalse(
                view.get('container').hasClass(CLASS_LOADING),
                'The loading class should have been removed'
            );
        },

    }));

    loadUserDraftsEvent = new Y.Test.Case({
        name: 'eZ Dashboard My Drafts Block View loadUserDrafts event test',

        setUp: function () {
            this.view = new Y.eZ.DashboardBlockMyDraftsView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should fire the loadUserDrafts event': function () {
            var view = this.view,
                isEventFired = false;

            view.on('loadUserDrafts', function (e) {
                isEventFired = true;

                Assert.areEqual(
                    "items", e.attributeName,
                    "The result should be set in the `items` attribute"
                );
                Assert.areEqual(
                    10, e.limit,
                    "The limit should be set to 10"
                );
            });

            view.set('active', true);

            Assert.isTrue(
                isEventFired,
                'The loadUserDrafts event should be fired'
            );
        }
    });

    rowOptionTest = new Y.Test.Case(Y.merge(AsynchronousViewTests.RowOptionTest, {
        name: 'eZ Dashboard My Drafts Block View row option test',

        setUp: function () {
            this.view = new Y.eZ.DashboardBlockMyDraftsView({
                container: '.container',
            });
            this.item = {
                version: new Model(),
                contentType: new Model(),
                contentInfo: new Model(),
            };
            this.view.set('items', [this.item]);
        },

        tearDown: function () {
            this.view.destroy();
            this.item.version.destroy();
            this.item.contentType.destroy();
            this.item.contentInfo.destroy();
        },
    }));

    Y.Test.Runner.setName('eZ Dashboard My Drafts Block View tests');
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(loadUserDraftsEvent);
    Y.Test.Runner.add(rowOptionTest);
}, '', {
    requires: [
        'test', 'base', 'view', 'model', 'node-event-simulate',
        'ez-dashboardblockasynchronousview-tests',
        'ez-dashboardblockmydraftsview'
    ]
});

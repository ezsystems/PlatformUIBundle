/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockallcontentview-tests', function (Y) {
    'use strict';

    var AsynchronousViewTests = Y.eZ.Test.DashblockBlockAsynchronousViewTests,
        renderTest,
        searchEventTest,
        rowOptionTest,
        CLASS_LOADING = 'is-loading',
        Assert = Y.Assert, Model = Y.Model, Mock = Y.Mock;

    renderTest = new Y.Test.Case(Y.merge(AsynchronousViewTests.RenderTest, {
        name: 'eZ Dashboard All Content Block View render test',

        setUp: function () {
            this.rootLocation = new Model();
            this.view = new Y.eZ.DashboardBlockAllContentView({rootLocation: this.rootLocation});
        },

        tearDown: function () {
            this.view.destroy();
        },

        _getModelMock: function (toJSON, baseModel) {
            var mock = new Mock(baseModel);

            Mock.expect(mock, {
                method: 'toJSON',
                returns: toJSON,
            });

            return mock;
        },

        'Should render with items': function () {
            var view = this.view,
                origTpl = view.template,
                contentTypeJSON = {},
                contentInfoJSON = {},
                locationJSON = {contentInfo: contentInfoJSON},
                list;

            list = [{
                contentType: this._getModelMock(contentTypeJSON),
                location: this._getModelMock(
                    locationJSON,
                    new Model({contentInfo: this._getModelMock(contentInfoJSON)})
                )
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
                    contentTypeJSON, params.items[0].contentType,
                    'The ContentType model should have been converted'
                );
                Assert.areSame(
                    locationJSON, params.items[0].location,
                    'The Location model should have been converted'
                );
                Assert.areSame(
                    contentInfoJSON, params.items[0].contentInfo,
                    'The ContentInfo model should have been provided and converted'
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

    searchEventTest = new Y.Test.Case({
        name: 'eZ Dashboard All Content Block View search event test',

        setUp: function () {
            this.rootLocation = new Model({
                locationId: '/api/v2/1/2',
                pathString: '/1/2',
            });
            this.view = new Y.eZ.DashboardBlockAllContentView({
                rootLocation: this.rootLocation
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should search for location when view gets active': function () {
            var view = this.view,
                isEventFired = false;

            view.on('locationSearch', function (event) {
                isEventFired = true;

                Assert.areSame(
                    'all-content-' + view.get('rootLocation').get('locationId'),
                    event.viewName,
                    'The viewName should be build with the Location ID'
                );
                Assert.isTrue(
                    event.loadContentType,
                    'The loadContentType flag should be set'
                );
                Assert.areSame(
                    'items', event.resultAttribute,
                    'The search result should be set in the items attribute'
                );
                Assert.areSame(
                    view.get('rootLocation').get('pathString'),
                    event.search.criteria.SubtreeCriterion,
                    'Should pass a correct search `SubtreeCriterion` criterion value'
                );
                Assert.areEqual(
                    "descending",
                    event.search.sortClauses.DateModified,
                    "The content should be ordered by modified date descending"
                );
                Assert.areSame(10, event.search.limit, 'Should pass a correct search results limit value');
            });

            view.set('active', true);

            Assert.isTrue(
                isEventFired,
                'The locationSearch event should be fired'
            );
        }
    });

    rowOptionTest = new Y.Test.Case(Y.merge(AsynchronousViewTests.RowOptionTest, {
        name: 'eZ Dashboard All Content Block View row option test',

        setUp: function () {
            this.rootLocation = new Model();
            this.view = new Y.eZ.DashboardBlockAllContentView({
                container: '.container',
                rootLocation: this.rootLocation
            });
            this.item = {
                content: new Model(),
                contentType: new Model(),
                location: new Model({
                    contentInfo: new Model()
                })
            };
            this.view.set('items', [this.item]);
        },

        tearDown: function () {
            this.view.destroy();
            this.item.content.destroy();
            this.item.contentType.destroy();
            this.item.location.get('contentInfo').destroy();
            this.item.location.destroy();
        },
    }));

    Y.Test.Runner.setName('eZ Dashboard All Content Block View tests');
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(searchEventTest);
    Y.Test.Runner.add(rowOptionTest);
}, '', {
    requires: [
        'test', 'base', 'view', 'model', 'node-event-simulate',
        'ez-dashboardblockasynchronousview-tests',
        'ez-dashboardblockallcontentview'
    ]
});

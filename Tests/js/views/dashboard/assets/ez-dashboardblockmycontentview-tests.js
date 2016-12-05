/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockmycontentview-tests', function (Y) {
    'use strict';

    var AsynchronousViewTests = Y.eZ.Test.DashblockBlockAsynchronousViewTests,
        renderTest,
        searchEventTest,
        rowOptionTest,
        editContentEventTest,
        CLASS_LOADING = 'is-loading',
        Assert = Y.Assert, Model = Y.Model, Mock = Y.Mock;

    renderTest = new Y.Test.Case(Y.merge(AsynchronousViewTests.RenderTest, {
        name: 'eZ Dashboard My Content Block View render test',

        setUp: function () {
            this.currentUser = new Model();
            this.view = new Y.eZ.DashboardBlockMyContentView({currentUser: this.currentUser});
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
        name: 'eZ Dashboard My Content Block View search event test',

        setUp: function () {
            this.currentUser = new Model({
                userId: '69',
            });
            this.view = new Y.eZ.DashboardBlockMyContentView({
                currentUser: this.currentUser
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should search for location when view gets active': function () {
            var view = this.view,
                isEventFired = false,
                userMetaDataCriterionTarget = "modifier";

            view.on('locationSearch', function (event) {
                isEventFired = true;

                Assert.areSame(
                    'my-content-' + view.get('currentUser').get('userId'),
                    event.viewName,
                    'The viewName should be build with the User ID'
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
                    view.get('currentUser').get('userId'),
                    event.search.filter.UserMetadataCriterion.Value,
                    'Should pass a correct search `UserMetaData` criterion value'
                );
                Assert.areSame(
                    userMetaDataCriterionTarget,
                    event.search.filter.UserMetadataCriterion.Target,
                    'Should pass a correct search `UserMetaData` criterion value'
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
        name: 'eZ Dashboard My Content Block View row option test',

        setUp: function () {
            this.currentUser = new Model();
            this.view = new Y.eZ.DashboardBlockMyContentView({
                container: '.container',
                currentUser: this.currentUser
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

    editContentEventTest = new Y.Test.Case(Y.merge(AsynchronousViewTests.EditContentEventTest, {
        name: 'eZ Dashboard All Content Block View edit content event test',

        _createView: function () {
            this.view = new Y.eZ.DashboardBlockMyContentView({
                container: '.container',
            });
        },
    }));

    Y.Test.Runner.setName('eZ Dashboard My Content Block View tests');
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(searchEventTest);
    Y.Test.Runner.add(rowOptionTest);
    Y.Test.Runner.add(editContentEventTest);
}, '', {
    requires: [
        'test', 'base', 'view', 'model', 'node-event-simulate',
        'ez-dashboardblockasynchronousview-tests',
        'ez-dashboardblockmycontentview'
    ]
});

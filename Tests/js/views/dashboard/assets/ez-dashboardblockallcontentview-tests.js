/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockallcontentview-tests', function (Y) {
    'use strict';

    var renderTest,
        searchEventTest,
        uiEventsTest,
        CLASS_LOADING = 'is-loading',
        CLASS_ROW_SELECTED = 'is-row-selected',
        SELECTOR_ROW = '.ez-allcontent-block-row',
        SELECTOR_OUTSIDE = '.outside',
        PATH_STRING = 'imagine-dragons',
        ROOT_LOCATION_ID = '23',
        VIEW_CONFIG = {container: '.container'};

    renderTest = new Y.Test.Case({
        name: 'eZ Dashboard All Content Block View render test',

        setUp: function () {
            this.rootLocation = new Y.Model({
                locationId: ROOT_LOCATION_ID,
                pathString: PATH_STRING
            });
            this.view = new Y.eZ.DashboardBlockAllContentView(Y.merge(VIEW_CONFIG, {rootLocation: this.rootLocation}));
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should render view in the loading state': function () {
            var view = this.view,
                templateCalled = false,
                origTpl = view.template,
                container = view.get('container');

            view.template = function (params) {
                templateCalled = true;

                Y.Assert.isArray(params.items, 'The `items` variable should be an array');
                Y.Assert.areSame(0, params.items.length, 'Should not provide any items data');
                Y.Assert.isFalse(params.loadingError, 'The `loadingError` should not be enabled');

                return origTpl.apply(this, arguments);
            };

            view.render();

            Y.Assert.isTrue(templateCalled, 'The template should have been used to render view');
            Y.Assert.isTrue(container.hasClass(CLASS_LOADING), 'Should add the loading state CSS class to the view container');
        },

        'Should render view with rows': function () {
            var view = this.view,
                contentMock = new Y.Mock(),
                contentTypeMock = new Y.Mock(),
                locationMock = new Y.Mock(),
                contentInfoMock = new Y.Mock(),
                origTpl = view.template,
                templateCalled = false,
                resultJSON = {},
                locationJSON = {contentInfo: resultJSON},
                list;

            Y.Mock.expect(contentMock, {
                method: 'toJSON',
                returns: resultJSON
            });

            Y.Mock.expect(contentTypeMock, {
                method: 'toJSON',
                returns: resultJSON
            });

            Y.Mock.expect(contentInfoMock, {
                method: 'toJSON',
                returns: resultJSON
            });

            Y.Mock.expect(locationMock, {
                method: 'toJSON',
                returns: locationJSON
            });

            Y.Mock.expect(locationMock, {
                method: 'get',
                args: ['contentInfo'],
                returns: contentInfoMock
            });

            list = [{
                content: contentMock,
                contentType: contentTypeMock,
                location: locationMock
            }];

            view.template = function (params) {
                templateCalled = true;

                Y.Assert.isArray(params.items, 'The `items` variable should be an array');
                Y.Assert.areSame(list.length, params.items.length, 'Should provide data of 1 item');
                Y.Assert.areSame(resultJSON, params.items[0].content, 'Should provide content data of 1 item');
                Y.Assert.areSame(resultJSON, params.items[0].contentType, 'Should provide content type data of 1 item');
                Y.Assert.areSame(locationJSON, params.items[0].location, 'Should provide location data of 1 item');
                Y.Assert.areSame(resultJSON, params.items[0].location.contentInfo, 'Should provide content info data of 1 item');
                Y.Assert.isFalse(params.loadingError, 'The `loadingError` should not be enabled');

                return origTpl.apply(this, arguments);
            };

            view.set('items', list);

            Y.Assert.isTrue(templateCalled, 'The template should have been used to render view');
            Y.Assert.isFalse(view.get('container').hasClass(CLASS_LOADING), 'Should add the loading state CSS class to the view container');

            Y.Mock.verify(contentMock);
            Y.Mock.verify(contentInfoMock);
            Y.Mock.verify(contentTypeMock);
            Y.Mock.verify(locationMock);
        },
    });

    searchEventTest = new Y.Test.Case({
        name: 'eZ Dashboard All Content Block View search event test',

        setUp: function () {
            this.rootLocation = new Y.Model({
                locationId: ROOT_LOCATION_ID,
                pathString: PATH_STRING
            });
            this.view = new Y.eZ.DashboardBlockAllContentView(Y.merge(VIEW_CONFIG, {rootLocation: this.rootLocation}));
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should search for location when view gets active': function () {
            var view = this.view,
                eventName = 'locationSearch',
                isEventFired = false;

            view.on(eventName, function (event) {
                isEventFired = true;

                Y.Assert.areSame('all-content-' + ROOT_LOCATION_ID, event.viewName, 'Should provide a correct REST view name');
                Y.Assert.isTrue(event.loadContentType, 'Should try to load content types of each location found');
                Y.Assert.isTrue(event.loadContent, 'Should try to load content of each location found');
                Y.Assert.areSame('items', event.resultAttribute, 'Should provide a correct view attribute name to store fetched data');
                Y.Assert.areSame(
                    PATH_STRING,
                    event.search.criteria.SubtreeCriterion,
                    'Should pass a correct search `SubtreeCriterion` criterion value'
                );
                Y.Assert.areSame(10, event.search.limit, 'Should pass a correct search results limit value');
            });

            view.set('active', true);

            Y.Assert.isTrue(isEventFired, 'Should fire the `' + eventName + '` event');
        }
    });

    uiEventsTest = new Y.Test.Case({
        name: 'eZ Dashboard All Content Block View UI events test',

        setUp: function () {
            this.rootLocation = new Y.Model({
                locationId: ROOT_LOCATION_ID,
                pathString: PATH_STRING
            });
            this.view = new Y.eZ.DashboardBlockAllContentView(Y.merge(VIEW_CONFIG, {rootLocation: this.rootLocation}));
        },

        tearDown: function () {
            this.view.destroy();
        },

        _setupRowMocks: function () {
            var languageCode = 'eng-GB',
                locationId = '25',
                contentTypeNames = {},
                list;

            contentTypeNames[languageCode] = 'Content Type name';
            list = [{
                content: new Y.Model({
                    mainLanguageCode: languageCode,
                    name: 'Content title',
                    id: 'content-id',
                    currentVersion: {
                        versionNo: 25,
                        modificationDate: '2016-05-05T13:18:14.000Z'
                    },
                    resources: {MainLocation: 'main-location'}
                }),
                contentType: new Y.Model({names: contentTypeNames}),
                location: new Y.Model({
                    id: locationId,
                    contentInfo: new Y.Model()
                })
            }];

            this.view.on('locationSearch', function (event) {
                event.target.set(event.resultAttribute, list);
            });
        },

        'Should display row options after clicking on a row': function () {
            var view = this.view,
                row;

            this._setupRowMocks();

            view.set('active', true);

            row = view.get('container').one(SELECTOR_ROW);

            row.one('td').simulateGesture('tap', Y.bind(function () {
                this.resume(function () {
                    Y.Assert.isTrue(row.hasClass(CLASS_ROW_SELECTED), 'The row should be selected');
                });
            }, this));

            this.wait();
        },

        'Should hide row options after clicking outside of a row': function () {
            var view = this.view,
                row;

            this._setupRowMocks();

            view.set('active', true);

            row = view.get('container').one(SELECTOR_ROW);

            row.one('td').simulateGesture('tap', Y.bind(function () {
                this.resume(Y.bind(function () {
                    Y.one(SELECTOR_OUTSIDE).simulateGesture('tap', Y.bind(function () {
                        this.resume(function () {
                            Y.Assert.isFalse(row.hasClass(CLASS_ROW_SELECTED), 'The row should not be selected');
                        });
                    }, this));
                    this.wait();
                }, this));
            }, this));

            this.wait();
        },
    });

    Y.Test.Runner.setName('eZ Dashboard All Content Block View tests');
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(searchEventTest);
    Y.Test.Runner.add(uiEventsTest);
}, '', {requires: [
    'test',
    'base',
    'view',
    'model',
    'node-event-simulate',
    'ez-dashboardblockallcontentview'
]});

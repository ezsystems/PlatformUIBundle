/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockallcontentview-tests', function (Y) {
    'use strict';

    var renderTest,
        getDataTest,
        uiEventsTest,
        CLASS_LOADING = 'is-loading',
        CLASS_ROW_SELECTED = 'is-row-selected',
        SELECTOR_CONTENT = '.ez-allcontent-block-content',
        SELECTOR_ROW = '.ez-allcontent-block-row',
        SELECTOR_OUTSIDE = '.outside',
        PATH_STRING = 'imagine-dragons',
        VIEW_CONFIG = {container: '.container'};

    renderTest = new Y.Test.Case({
        name: 'eZ Dashboard All Content Block View render test',

        setUp: function () {
            this.rootLocation = new Y.Model({pathString: PATH_STRING});
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

            view.template = function () {
                templateCalled = true;

                return origTpl.apply(this, arguments);
            };

            view.render();

            Y.Assert.isTrue(templateCalled, 'The template should have been used to render view');
            Y.Assert.areSame(0, container.one(SELECTOR_CONTENT).all('tr').size(), 'Should not render any row');
            Y.Assert.isTrue(container.hasClass(CLASS_LOADING), 'Should add the loading state CSS class to the view container');
        }
    });

    getDataTest = new Y.Test.Case({
        name: 'eZ Dashboard All Content Block View get data test',

        setUp: function () {
            this.rootLocation = new Y.Model({pathString: PATH_STRING});
            this.view = new Y.eZ.DashboardBlockAllContentView(Y.merge(VIEW_CONFIG, {rootLocation: this.rootLocation}));
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should get data when view get active': function () {
            var view = this.view,
                isEventFired = false;

            view.on('contentSearch', function (event) {
                isEventFired = true;

                Y.Assert.areSame('all-content', event.viewName, 'Should provide a correct REST view name');
                Y.Assert.isTrue(event.loadContentType, 'Should try to load content types');
                Y.Assert.areSame(
                    PATH_STRING,
                    event.search.criteria.SubtreeCriterion,
                    'Should pass a correct search `SubtreeCriterion` criterion value'
                );
                Y.Assert.areSame(10, event.search.limit, 'Should pass a correct search results limit value');
                Y.Assert.isFunction(event.callback, 'The `callback` param should be a function');
            });

            view.set('active', true);

            Y.Assert.isTrue(isEventFired, 'Should fire the `contentSearch` event');
        }
    });

    uiEventsTest = new Y.Test.Case({
        name: 'eZ Dashboard All Content Block View UI events test',

        setUp: function () {
            this.rootLocation = new Y.Model({pathString: PATH_STRING});
            this.view = new Y.eZ.DashboardBlockAllContentView(Y.merge(VIEW_CONFIG, {rootLocation: this.rootLocation}));
        },

        tearDown: function () {
            this.view.destroy({remove: true});
        },

        _getRowsMock: function () {
            var languageCode = 'eng-GB',
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
                contentType: new Y.Model({names: contentTypeNames})
            }];

            this.view.on('contentSearch', function (event) {
                event.callback(false, list);
            });
        },

        'Should display row options after clicking on a row': function () {
            var view = this.view,
                row;

            this._getRowsMock();

            view.render();
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

            this._getRowsMock();

            view.render();
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
    Y.Test.Runner.add(getDataTest);
    Y.Test.Runner.add(uiEventsTest);
}, '', {requires: [
    'test',
    'base',
    'view',
    'model',
    'node-event-simulate',
    'ez-dashboardblockallcontentview'
]});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockasynchronousview-tests', function (Y) {
    'use strict';

    Y.namespace('eZ.Test.DashblockBlockAsynchronousViewTests');

    var NS = Y.eZ.Test.DashblockBlockAsynchronousViewTests,
        CLASS_LOADING = 'is-loading',
        CLASS_ROW_SELECTED = 'is-row-selected',
        SELECTOR_ROW = '.ez-block-row',
        SELECTOR_OUTSIDE = '.outside',
        Assert = Y.Assert, Mock = Y.Mock;

    NS.ErrorHandlingTest = {
        "Should unset `loading` on loading error": function () {
            this.view._set('loading', true);
            this.view.set('loadingError', true);

            Assert.isFalse(
                this.view.get('loading'),
                "`loading` should have been set back to false"
            );
        },

        "Should rerender the view on loading error": function () {
            var templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function (params) {
                templateCalled = true;

                return origTpl.apply(this, arguments);
            };

            this.view.set('loadingError', true);

            Assert.isTrue(
                templateCalled, "The view should have been rendered"
            );
        },

        "Should set items to its default value when retrying loading": function () {
            var view = this.view;

            view.set('items', []);
            view.set('loadingError', true);

            view.after('itemsChange', this.next(function () {
                Assert.areSame(
                    Y.eZ.DashboardBlockAsynchronousView.ATTRS.items.value,
                    view.get('items'),
                    "`items` should have been restored to its default value"
                );
            }, this));
            view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap');
            this.wait();
        },

        "Should set `loading` when retrying loading": function () {
            var view = this.view;

            view.set('items', []);
            view.set('loading', false);
            view.set('loadingError', true);

            view.after('loadingChange', this.next(function () {
                Assert.isTrue(
                    view.get('loading'),
                    "`loading` should be set to true"
                );
            }, this));

            view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap');
            this.wait();
        },
    };

    NS.RenderTest = {
        'Should render the view with a template': function () {
            var view = this.view,
                templateCalled = false,
                origTpl = view.template;

            view.template = function (params) {
                templateCalled = true;

                Assert.isArray(
                    params.items,
                    'The `items` variable should be an array'
                );
                Assert.areEqual(
                    0, params.items.length,
                    '`items` should be empty'
                );
                Assert.isFalse(
                    params.loadingError,
                    '`loadingError` should be false'
                );
                Assert.isTrue(
                    params.loading,
                    '`loading` should true'
                );

                return origTpl.apply(this, arguments);
            };

            view.render();

            Assert.isTrue(
                templateCalled,
                'The template should have been used to render view'
            );

        },

        'Should render view in loading state': function () {
            this.view.render();

            Assert.isTrue(
                this.view.get('container').hasClass(CLASS_LOADING),
                'The view should be rendered in loading state'
            );
        },

        'Should remove the loading state when getting `items`': function () {
            var view = this.view,
                templateCalled = false,
                origTpl = this.view.template;

            this['Should render view in loading state']();

            view.template = function (params) {
                templateCalled = true;

                Assert.isFalse(
                    params.loading,
                    '`loading` should false'
                );

                return origTpl.apply(this, arguments);
            };


            this.view.set('items', []);

            Assert.isFalse(
                this.view.get('container').hasClass(CLASS_LOADING),
                'The view should be rerendered in non loading state'
            );
            Assert.isTrue(
                templateCalled,
                'The template should have been used to render view'
            );
        }, 
    };

    NS.RowOptionTest = {
        'Should display row options after clicking on a row': function () {
            var view = this.view,
                row;

            row = view.get('container').one(SELECTOR_ROW);

            row.one('td').simulateGesture('tap', this.next(function () {
                Assert.isTrue(
                    row.hasClass(CLASS_ROW_SELECTED),
                    'The row should be selected'
                );
            }, this));

            this.wait();
        },

        'Should hide row options after clicking outside of a row': function () {
            var view = this.view,
                row;

            row = view.get('container').one(SELECTOR_ROW);

            row.one('td').simulateGesture('tap', this.next(function () {
                Y.one(SELECTOR_OUTSIDE).simulateGesture('tap', this.next(function () {
                    Assert.isFalse(
                        row.hasClass(CLASS_ROW_SELECTED),
                        'The row should not be selected'
                    );
                }, this));
                this.wait();
            }, this));

            this.wait();
        },
    };

    NS.EditContentEventTest = {
        setUp: function () {
            this._createView();
            this.languageCode = 'fre-FR';
            Y.eZ.Content = Y.Model;
        },

        tearDown: function () {
            this.view.destroy();
        },

        _addToJsonToMock: function (mock) {
            Mock.expect(mock, {
                method: 'toJSON',
                args: [],
                returns: {},
            });
        },

        _createItemMock: function (contentId) {
            var locationMock = new Mock(),
                contentInfoMock = new Mock(),
                contentTypeMock = new Mock();

            Mock.expect(contentInfoMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'id' ) {
                        return contentId;
                    } else if ( attr === 'mainLanguageCode' ) {
                        return this.languageCode;
                    }
                    Y.fail('Unexpected call to get("' + attr + '")');
                }, this),
            });

            Mock.expect(locationMock, {
                method: 'get',
                args: ['contentInfo'],
                returns: contentInfoMock,
            });

            this._addToJsonToMock(locationMock);
            this._addToJsonToMock(contentInfoMock);
            this._addToJsonToMock(contentTypeMock);

            return {
                location: locationMock,
                contentType: contentTypeMock
            };
        },

        'Should fire `editContentRequest`': function () {
            var editButton,
                eventFired = false,
                itemMock = this._createItemMock('42');

            this.view.set('items', [itemMock]);

            editButton = this.view.get('container').one('.ez-edit-content-button');

            this.view.on('editContentRequest', Y.bind(function (e) {
                eventFired = true;

                Assert.areSame(
                    this.languageCode,
                    e.languageCode,
                    "The languageCode provided by the event should be the same."
                );
                Assert.areSame(
                    itemMock.contentType,
                    e.contentType,
                    "The contentType provided by the event should be the same."
                );
            }, this));

            editButton.simulateGesture('tap', Y.bind(function () {
                this.resume(function (e) {
                    Assert.isTrue(
                        eventFired,
                        "The `editContentRequest` event should have been fired"
                    );
                });
            }, this));
            this.wait();
        },

        'Should not fire `editContentRequest` if item is not found': function () {
            var editButton,
                eventFired = false,
                itemMock = this._createItemMock('avishai-cohen');

            this.view.set('items', [itemMock]);

            editButton = this.view.get('container').one('.ez-edit-content-button');

            this.view.on('editContentRequest', Y.bind(function (e) {
                eventFired = true;
            }, this));

            editButton.simulateGesture('tap', Y.bind(function () {
                this.resume(function (e) {
                    Assert.isFalse(
                        eventFired,
                        "The `editContentRequest` event should not be fired"
                    );
                });
            }, this));
            this.wait();
        },
    };

}, '', {
    requires: [
        'test', 'base', 'view', 'model', 'node-event-simulate',
        'ez-dashboardblockasynchronousview'
    ]
});

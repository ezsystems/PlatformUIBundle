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
        Assert = Y.Assert;

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
}, '', {
    requires: [
        'test', 'base', 'view', 'model', 'node-event-simulate',
        'ez-dashboardblockasynchronousview'
    ]
});

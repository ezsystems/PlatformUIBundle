/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-asynchronoussubitemview-tests', function (Y) {
    Y.namespace('eZ.Test.AsynchronousSubitemView');

    var Assert = Y.Assert,
        getSubItemStructs = function (count) {
            var structs = [];

            for(var i = 0; i != count; ++i) {
                structs.push({
                    content: new Y.Model(),
                    location: new Y.Model(),
                    contentType: new Y.Model(),
                });
            }
            return structs;
        };

    Y.eZ.Test.AsynchronousSubitemView.LoadSubitemsTest = {
        _assertLocationSearchParams: function (evt) {
            Assert.areEqual(
                "items",
                evt.resultAttribute,
                "The result of the loading should be placed in the items attribute"
            );
            Assert.isTrue(
                evt.loadContentType,
                "The content type should be loaded"
            );
            Assert.isTrue(
                evt.loadContent,
                "The content should be loaded"
            );
            Assert.areEqual(
                evt.search.criteria.ParentLocationIdCriterion,
                this.location.get('locationId'),
                "The subitems of the location should be loaded"
            );
            Assert.areEqual(
                evt.search.offset,
                this.view.get('offset'),
                "The search event should contain the offset"
            );
            Assert.areEqual(
                evt.search.limit,
                this.view.get('limit'),
                "The search event should contain the limit"
            );
            Assert.areSame(
                this.view.get('location'),
                evt.search.sortLocation,
                "The current Location should be used to sort the subitems"
            );
        },

        "Should fire the search event when becoming active": function () {
            var locationSearch = false;

            this.view.on('locationSearch', Y.bind(function (e) {
                this._assertLocationSearchParams(e);
                locationSearch = true;
            }, this));

            this.view.set('active', true);
            Assert.isTrue(
                locationSearch,
                "The locationSearch event should have been fired"
            );
        },

        "Should fire the search event when changing offset": function () {
            var locationSearch = false;

            this.view.on('locationSearch', Y.bind(function (e) {
                this._assertLocationSearchParams(e);
                locationSearch = true;
            }, this));

            this.view.set('offset', this.view.get('limit'));
            Assert.isTrue(
                locationSearch,
                "The locationSearch event should have been fired"
            );
            Assert.isFalse(
                this.view.get('loadingError'),
                "The loading error flag should be set to false"
            );
        },

        "Should not fire the search event when becoming active if subitems are loaded": function () {
            var locationSearch = false;

            this.view.set('offset', 0);
            this.view.on('locationSearch', Y.bind(function (e) {
                locationSearch = true;
            }, this));

            this.view.set('active', true);
            Assert.isFalse(
                locationSearch,
                "The locationSearch event should not have been fired"
            );
        },

        "Should not fire the search event when offset becomes a below zero value": function () {
            var locationSearch = false;

            this.view.set('active', true);
            this.view.set('offset', -1 * this.view.get('limit'));
            this.view.on('locationSearch', Y.bind(function (e) {
                locationSearch = true;
            }, this));

            Assert.isFalse(
                locationSearch,
                "The locationSearch event should not have been fired"
            );
        },

        "Should not fire the search event if the Location has no child": function () {
            var offset = this.view.get('offset');

            this.location.set('childCount', 0);
            this.view.set('active', true);
            this.view.on('locationSearch', Y.bind(function (e) {
                Assert.fail("The locationSearch should have been fired");
            }, this));


            Assert.areEqual(
                offset, this.view.get('offset'),
                "The offset should remain unchanged"
            );
        },
    };

    Y.eZ.Test.AsynchronousSubitemView.ErrorHandlingTestCase = {
        _assertErrorNotification: function (config) {
            Assert.isString(
                config.text,
                "The notification should be configured to display an error message"
            );
            Assert.isString(
                config.identifier,
                "The notification should be configured to display an error message"
            );
            Assert.areEqual(
                "error", config.state,
                "The notification state should be 'error'"
            );
            Assert.areEqual(
                0, config.timeout,
                "The notification timeout should be 0"
            );
        },

        _getSubItemStructs: getSubItemStructs,

        "Should handle loading error": function () {
            var notified = false;

            this.view.set('items', this._getSubItemStructs(this.view.get('limit')));
            this.view.set('offset', this.view.get('limit'));

            this.view.on('notify', Y.bind(function (e) {
                notified = true;
                this._assertErrorNotification(e.notification);
            }, this));
            this.view.set('loadingError', true);

            Assert.isTrue(notified, "A notification error should have been fired");

            Assert.isTrue(
                this.view.get('container').one('.ez-loadmorepagination-more').get('disabled'),
                "The load more button should be disabled"
            );
        },
    };

    Y.eZ.Test.AsynchronousSubitemView.RefreshTestCase = {
        _noRefreshTest: function (attr) {
            var initialItems = this.view.get('items');

            this.view.on('locationSearch', function (e) {
                Assert.fail('The locationSearch event should have been fired');
            });

            this.location.set(attr, 'whatever');

            Assert.areSame(
                initialItems,
                this.view.get('items'),
                "The items attribute should be kept untouched"
            );
            Assert.isFalse(
                this.view.get('loading'),
                "The loading attribute should still be false"
            );
        },

        "Should ignore the sortField change when the view is not active": function () {
            this._noRefreshTest('sortField');
        },

        "Should ignore the sortOrder change when the view is not active": function () {
            this._noRefreshTest('sortOrder');
        },

        _resetView: function (attr) {
            var initialItemCount = 10;

            this.view.set('items', this._getSubItemStructs(initialItemCount));
            this.view.set('active', false);
            this.view.set('offset', initialItemCount);

            this.view.on('locationSearch', function (e) {
                Assert.fail('The locationSearch event should have been fired');
            });
            this.location.set(attr, 'whatever');

            Assert.areSame(
                0,
                this.view.get('items').length,
                "The items attribute should have been emptied"
            );
            Assert.isTrue(
                this.view.get('offset') < 0,
                "The offset should have been reset"
            );
        },

        "Should reset the view state when Location sortField is changed": function () {
            this._resetView('sortField');
        },

        "Should reset the view state when Location sortOrder is changed": function () {
            this._resetView('sortOrder');
        },

        _noReloadItems: function (attr) {
            var initialOffset = this.view.get('offset');

            this.location.set('childCount', 0);
            this.view.set('active', true);

            this.view.on('locationSearch', function (e) {
                Assert.fail('The locationSearch event should have been fired');
            });
            this.location.set(attr, 'whatever');
            Assert.areEqual(
                initialOffset,
                this.view.get('offset'),
                "The offset should remain unchanged"
            );
        },

        "Should ignore Location sortField change if no subitems": function () {
            this._noReloadItems('sortField');
        },

        "Should ignore Location sortOrder change if no subitems": function () {
            this._noReloadItems('sortOrder');
        },

        _reloadItems: function (attr) {
            var initialItems = this.view.get('items'),
                locationSearchFired = false;

            this.view.set('active', true);
            this.view.set('offset', this.view.get('limit') * 2);
            this.view.on('locationSearch', Y.bind(function (evt) {
                locationSearchFired = true;

                Assert.areEqual(
                    "items",
                    evt.resultAttribute,
                    "The result of the loading should be placed in the items attribute"
                );
                Assert.isTrue(
                    evt.loadContentType,
                    "The content type should be loaded"
                );
                Assert.isTrue(
                    evt.loadContent,
                    "The content should be loaded"
                );
                Assert.areEqual(
                    evt.search.criteria.ParentLocationIdCriterion,
                    this.location.get('locationId'),
                    "The subitems of the location should be loaded"
                );
                Assert.areEqual(
                    0,
                    evt.search.offset,
                    "The search event should contain 0 as the offset"
                );
                Assert.areEqual(
                    this.view.get('offset') + this.view.get('limit'),
                    evt.search.limit,
                    "The search event should contain the view offset + view limit as the limit"
                );
                Assert.areSame(
                    this.view.get('location'),
                    evt.search.sortLocation,
                    "The current Location should be used to sort the subitems"
                );
            }, this));

            this.location.set(attr, 'whatever');

            Assert.areNotSame(
                initialItems,
                this.view.get('items'),
                "The items attribute should have been updated"
            );
            Assert.isArray(
                this.view.get('items'),
                "The items attribute should be an array"
            );
            Assert.areEqual(
                0, this.view.get('items').length,
                "The items attribute should be empty"
            );
            Assert.isTrue(
                this.view.get('loading'),
                "The loading attribute should still be true"
            );
            Assert.isTrue(
                locationSearchFired,
                "The locationSearch event should have been fired"
            );
        },

        _getSubItemStructs: getSubItemStructs,

        "Should reload the items when Location sortOrder is changed": function () {
            this._reloadItems('sortOrder');
        },

        "Should reload the items when Location sortField is changed": function () {
            this._reloadItems('sortField');
        },

        _destroyAfterUpdate: function (attr) {
            var initialItemCount = 10,
                destroyed = 0;

            this.view.set('items', this._getSubItemStructs(initialItemCount));
            this.view.after('itemView:destroy', function (e) {
                destroyed++;
            });
            this._reloadItems('sortField');
            this.view.set('items', this._getSubItemStructs(this.view.get('offset') + this.view.get('limit')));

            Assert.areEqual(
                initialItemCount,
                destroyed,
                "The item views should have been destroyed"
            );
        },

        "Should destroys the items view when receiving the items after sortField change": function () {
            this._destroyAfterUpdate('sortField');
        },

        "Should destroys the items view when receiving the items after sortOrder change": function () {
            this._destroyAfterUpdate('sortOrder');
        },
    };
});

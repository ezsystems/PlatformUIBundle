/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-asynchronoussubitemview-tests', function (Y) {
    Y.namespace('eZ.Test.AsynchronousSubitemView');

    var Assert = Y.Assert;

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

        _getSubItemStructs: function (count) {
            return (new Array(count)).map(function () {
                return {
                    content: new Y.Model(),
                    location: new Y.Model(),
                    contentType: new Y.Model(),
                };
            });
        },

        "Should handle error on the initial loading": function () {
            var notified = false;

            this.view.set('active', true);

            this.view.on('notify', Y.bind(function (e) {
                notified = true;
                this._assertErrorNotification(e.notification);
            }, this));
            this.view.set('loadingError', true);

            Assert.isTrue(notified, "A notification error should have been fired");
            Assert.areEqual(
                -1 * this.view.get('limit'), this.view.get('offset'),
                "The offset value should be reset to the previous value"
            );
        },

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
            Assert.areEqual(
                0, this.view.get('offset'),
                "The offset value should be reset to the previous value"
            );
        },
    };
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-loadmorepagination-tests', function (Y) {
    Y.namespace('eZ.Test.LoadMorePagination');

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

    Y.eZ.Test.LoadMorePagination.ItemSetterTestCase = {
        init: function () {
            this.attr = 'items';
        },

        "Should set the value": function () {
            var initialValue = [];

            this.view.set(this.attr, initialValue);

            Assert.areSame(
                initialValue, this.view.get(this.attr),
                "The inital value should be set untouched"
            );
        },

        "Should concatenate the arrays": function () {
            var initialValue = [],
                subitem = {location: new Y.Model(), content: new Y.Model(), contentType: new Y.Model()},
                secondValue = [subitem];

            this.view.set(this.attr, initialValue);
            this.view.set(this.attr, secondValue);

            Assert.isArray(
                this.view.get(this.attr),
                "A new array should have been created"
            );
            Assert.areNotSame(
                initialValue, this.view.get(this.attr),
                "A new array should have been created"
            );
            Assert.areNotSame(
                secondValue, this.view.get(this.attr),
                "A new array should have been created"
            );
            Assert.isTrue(
                this.view.get(this.attr).indexOf(subitem) !== -1,
                "The subitems attribute should contain the contain of the second value"
            );
        },

        "Should not concatenate the arrays": function () {
            var initialValue = [1], overrideValue = [2];

            this.view.set(this.attr, []);
            this.view.set(this.attr, overrideValue, {reset: true});

            Assert.areNotSame(
                initialValue, this.view.get(this.attr),
                "A new array should have been set"
            );
            Assert.areSame(
                1, this.view.get(this.attr).length,
                "The value should have been set without concatenating"
            );
            Assert.areSame(
                overrideValue[0], this.view.get(this.attr)[0],
                "The value should have been set without concatenating"
            );
        },
    };

    Y.eZ.Test.LoadMorePagination.ItemViewTestCase = {
        _getSubItemStruct: function (baseId) {
            return {
                content: new Y.Model({id: 'content-' + baseId}),
                location: new Y.Model({id: 'location-' + baseId}),
                contentType: new Y.Model({id: 'contentType-' + baseId}),
            };
        },

        "Should append a list item per subitem": function () {
            var subitems = [
                    this._getSubItemStruct(1),
                    this._getSubItemStruct(2),
                ],
                container = this.view.get('container'),
                listItems,
                i = 0;

            this.view.set('items', subitems);
            listItems = container.all('.ez-loadmorepagination-content div');

            Assert.areEqual(
                subitems.length,
                listItems.size(),
                "There should be one listmore item per subitem"
            );
            listItems.each(function (listContainer) {
                var listView = this.ItemView.getByNode(listContainer);

                Assert.areSame(
                    subitems[i].content,
                    listView.get('content'),
                    "The list item view should have received the content"
                );
                Assert.areSame(
                    subitems[i].location,
                    listView.get('location'),
                    "The list item view should have received the location"
                );
                Assert.areSame(
                    subitems[i].contentType,
                    listView.get('contentType'),
                    "The list item view should have received the contentType"
                );
                Assert.areSame(
                    this.view.get('config'),
                    listView.get('config'),
                    "The list item view should have received the configuration"
                );
                
                i++;
            }, this);
        },

        "Should set the listmore item view as active": function () {
            var subitems = [
                    this._getSubItemStruct(1),
                    this._getSubItemStruct(2),
                ],
                container = this.view.get('container'),
                listItems;

            this.view.set('items', subitems);
            listItems = container.all('.ez-subitemlistmore-content div');

            listItems.each(function (listContainer) {
                Assert.isTrue(
                    this.ItemView.getByNode(listContainer).get('active'),
                    "The list item view should be active"
                );
            }, this);
        },

        "Should add the listmore view as a bubble target of the listmore item": function () {
            var subitems = [
                    this._getSubItemStruct(1),
                    this._getSubItemStruct(2),
                ],
                container = this.view.get('container'),
                listItems;

            this.view.set('items', subitems);
            listItems = container.all('.ez-subitemlistmore-content div');

            listItems.each(function (listContainer) {
                Assert.isTrue(
                    this.ItemView.getByNode(listContainer).getTargets().indexOf(this.view) != -1,
                    "The listmore view should be a bubble target of the item view"
                );
            }, this);
        },
    };

    Y.eZ.Test.LoadMorePagination.LoadingStateTestCase = {
        "Should be in loading state": function () {
            this.view.set('offset', this.view.get('limit'));

            Assert.isTrue(
                this.view.get('container').hasClass('is-page-loading'),
                "The view should be in loading mode"
            );
        },

        "Should be in 'normal' state": function () {
            this.view.set('offset', this.view.get('limit'));
            this.view.set('items', []);

            Assert.isFalse(
                this.view.get('container').hasClass('is-page-loading'),
                "The view should be in loading mode"
            );
        },

    };

    Y.eZ.Test.LoadMorePagination.PaginationUpdateTestCase = {
        "Should disable the load more button when offset is changing": function () {
            var container = this.view.get('container');

            container.one('.ez-loadmorepagination-more').set('disabled', false);
            this.view.set('offset', this.view.get('limit'));

            Assert.isTrue(
                container.one('.ez-loadmorepagination-more').get('disabled'),
                "The load more button should be disabled while loading content"
            );
        },

        "Should enable the load more button if there's more content to load": function () {
            var container = this.view.get('container'),
                offset = this.location.get('childCount') - 1;

            container.one('.ez-loadmorepagination-more').set('disabled', false);
            this.view.set('offset', offset);
            this.view.set('items', this._getSubItemStructs(offset));

            Assert.isFalse(
                container.one('.ez-loadmorepagination-more').get('disabled'),
                "The load more button should be enabled"
            );
        },

        "Should keep the load more button disabled": function () {
            var container = this.view.get('container'),
                offset = this.location.get('childCount') + 1;

            container.one('.ez-loadmorepagination-more').set('disabled', false);
            this.view.set('offset', offset);
            this.view.set('items', this._getSubItemStructs(offset));

            Assert.isTrue(
                container.one('.ez-loadmorepagination-more').get('disabled'),
                "The load more button should be disabled"
            );
        },

        _getSubItemStructs: getSubItemStructs,

        "Should update the displayed content count": function () {
            var container = this.view.get('container');

            this.view.set('offset', this.view.get('limit'));
            this.view.set('items', this._getSubItemStructs(this.view.get('limit')));
            Assert.areEqual(
                this.view.get('items').length,
                container.one('.ez-loadmorepagination-display-count').getContent(),
                "The displayed content count should have been updated"
            );
        },

        _updateMoreCountTest: function (offset, expectedMoreCount) {
            var container = this.view.get('container');

            this.view.set('offset', offset);
            this.view.set('items', this._getSubItemStructs(offset));

            Assert.areEqual(
                expectedMoreCount,
                container.one('.ez-loadmorepagination-more-count').getContent(),
                "The more content count should have been updated"
            );
        },

        "Should update the more count": function () {
            this._updateMoreCountTest(this.view.get('limit'), this.view.get('limit'));
        },

        "Should update the more count with the remaining content to load": function () {
            var offset = this.view.get('limit') * 2;

            this._updateMoreCountTest(
                offset,
                this.location.get('childCount') - offset
            );
        },

        "Should update the more count with the limit when there's no more content to load": function () {
            this._updateMoreCountTest(
                this.location.get('childCount'),
                this.view.get('limit')
            );
        },
    };

    Y.eZ.Test.LoadMorePagination.LoadMoreTestCase = {
        "Should ignore tap when disabled": function () {
            var offset = this.view.get('offset'),
                button = this.view.get('container').one('.ez-loadmorepagination-more');

            button.set('disabled', true);
            button.simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    offset, this.view.get('offset'),
                    "offset should remain unchanged"
                );
            }, this));
            this.wait();
        },

        "Should update the offset": function () {
            var offset = this.view.get('offset'),
                button = this.view.get('container').one('.ez-loadmorepagination-more');

            button.set('disabled', false);
            button.simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    offset + this.view.get('limit'), this.view.get('offset'),
                    "offset should remain unchanged"
                );
            }, this));
            this.wait();
        },

    };
}, '', {requires: ['test', 'model', 'view-node-map']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchlistview-tests', function (Y) {
    var viewTest, viewNoResultTest, enableLoadMoreTest, listItemTest,
        itemSetterTest, paginationUpdateTest, loadMoreTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Search list view tests",

        setUp: function () {

            this.itemViewConstructor = Y.Base.create('itemView', Y.View, [Y.View.NodeMap]);
            this.items = [this._getSubItemStruct(1), this._getSubItemStruct(2), this._getSubItemStruct(3)];
            this.searchResultCount = 3;
            this.limit = 10;
            this.offset = 2;

            this.view = new Y.eZ.SearchListView({
                items: this.items,
                searchResultCount: this.searchResultCount,
                limit: this.limit,
                offset: this.offset,
                itemViewConstructor: this.itemViewConstructor,
                displayedProperties: ['name', 'lastModificationDate'],
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getSubItemStruct: function (baseId) {
            return {
                content: new Y.Model({id: 'content-' + baseId, name: 'name-' + baseId, lastModificationDate: 'date-' + baseId}),
                location: new Y.Model({id: 'location-' + baseId}),
                contentType: new Y.Model({id: 'contentType-' + baseId}),
            };
        },

        "Should set the loadmorepagination class on the container": function () {
            this.view.render();

            Assert.isTrue(
                this.view.get('container').hasClass('ez-loadmorepagination'),
                "The view container should get the loadmorepagination"
            );
        },

        "Should render the view": function () {
            var templateCalled = false,
                origTpl,
                container = this.view.get('container');

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(
                templateCalled,
                "The template should have used to render the view"
            );


            Assert.areNotEqual(
                "", container.getHTML(),
                "View container should contain the result of the view"
            );
        },

        _assertColumns: function (columns) {
            Assert.isArray(columns, "columns should be an array");
            Assert.areEqual(
                columns.length, this.view.get('displayedProperties').length,
                "There should be a column per displayed property"
            );
            columns.forEach(function (col) {
                Assert.isTrue(
                    this.view.get('displayedProperties').indexOf(col.identifier) !== -1,
                    "The column identifier should be in the displayedProperties attribute"
                );
                Assert.areEqual(
                    this.view.get('propertyNames')[col.identifier],
                    col.name,
                    "The name should come from the propertyNames attribute"
                );
            }, this);
        },

        "Test available variables in the template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(4, Y.Object.keys(variables).length, "The template should receive 4 variables");
                Y.Assert.areSame(
                    that.searchResultCount, variables.searchResultCount,
                    "searchResultCount should be available in the template"
                );
                Y.Assert.areSame(
                    that.items.length, variables.displayCount,
                    "The displayCount should available in the template"
                );
                Y.Assert.areSame(
                    Math.min(that.limit, that.searchResultCount - that.items.length),
                    variables.remainingCount,
                    "The remainingCount should available in the template"
                );
                that._assertColumns(variables.columns);
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });
    itemSetterTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.ItemSetterTestCase, {
        name: "eZ Subitem ListMore View subitems setter test",

        setUp: function () {

            Y.eZ.SubitemListItemView = Y.Base.create('itemView', Y.View, [Y.View.NodeMap], {});
            this.ItemView = Y.eZ.SubitemListItemView;

            this.view = new Y.eZ.SearchListView({
                container: '.container'
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemListItemView ;
        },
    }));
    listItemTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.ItemViewTestCase, {
        name: "eZ Search list View list items test",

        setUp: function () {

            Y.eZ.SubitemListItemView = Y.Base.create('itemView', Y.View, [Y.View.NodeMap], {});
            this.ItemView = Y.eZ.SubitemListItemView;

            this.searchResultCount = 3;
            this.limit = 10;
            this.offset = 2;

            this.view = new Y.eZ.SearchListView({
                items: [],
                searchResultCount: this.searchResultCount,
                limit: this.limit,
                offset: this.offset,

            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemListItemView;
        },
    }));

    paginationUpdateTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.PaginationUpdateTestCase, {
        name: "eZ Subitem ListMore View pagination update test",

        setUp: function () {
            this.searchResultCount = 5;
            this.limit = 2;
            this.offset = 3;
            Y.eZ.SubitemListItemView = Y.Base.create('itemView', Y.View, [Y.View.NodeMap], {});
            this.ItemView = Y.eZ.SubitemListItemView;
            this.view = new Y.eZ.SearchListView({
                items: [],
                container: '.container',
                searchResultCount: this.searchResultCount,
                limit: this.limit,
                offset: this.offset,
            });
            this.view.set('searchResultCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        _getItemCount: function () {
            return this.searchResultCount;
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemListItemView;
        },
    }));

    loadMoreTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.LoadMoreTestCase, {
        name: "eZ Subitem ListMore load more test",

        setUp: function () {
            this.searchResultCount = 5;
            this.limit = 2;
            this.offset = 3;
            Y.eZ.SubitemListItemView = Y.Base.create('itemView', Y.View, [Y.View.NodeMap], {});
            this.ItemView = Y.eZ.SubitemListItemView;
            this.view = new Y.eZ.SearchListView({
                container: '.container',
                searchResultCount: this.searchResultCount,
                limit: this.limit,
                offset: this.offset,

            });
            this.view.set('searchResultCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        _getItemCount: function () {
            return this.searchResultCount;
        },
        tearDown: function () {
            this.view.destroy();
        },
    }));

    viewNoResultTest = new Y.Test.Case({
        name: "eZ Search list view no result tests",

        setUp: function () {
            this.view = new Y.eZ.SearchListView({
                items: [],
                searchResultCount: 0,
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should not render list when no items": function () {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Y.Assert.areSame(
                    0, variables.searchResultCount,
                    "There should be no result"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();

        },
    });

    enableLoadMoreTest = new Y.Test.Case({
        name: "eZ Search list enable load more button tests",

        setUp: function () {

            this.itemViewConstructor = Y.View;
            this.items = [this._getSubItemStruct(1), this._getSubItemStruct(2), this._getSubItemStruct(3)];
            this.searchResultCount = 3;
            this.limit = 2;
            this.offset = 2;

            this.view = new Y.eZ.SearchListView({
                items: this.items,
                searchResultCount: this.searchResultCount,
                limit: this.limit,
                offset: this.offset,
                itemViewConstructor: this.itemViewConstructor,
                displayedProperties: ['name', 'lastModificationDate'],
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getSubItemStruct: function (baseId) {
            return {
                content: new Y.Model({id: 'content-' + baseId, name: 'name-' + baseId, lastModificationDate: 'date-' + baseId}),
                location: new Y.Model({id: 'location-' + baseId}),
                contentType: new Y.Model({id: 'contentType-' + baseId}),
            };
        },

        "Should NOT allow to loadMore button": function () {
            var container = this.view.get('container');

            this.view.render();

            Assert.isTrue(
                container.one('.ez-loadmorepagination-more').get('disabled'),
                "The load more button should be disabled"
            );
        },

        "Should allow to loadMore button": function () {
            var container = this.view.get('container');

            this.view.set('searchResultCount', 5);
            this.view.render();

            Assert.isFalse(
                container.one('.ez-loadmorepagination-more').get('disabled'),
                "The load more button should be enabled"
            );
        },
    });

    Y.Test.Runner.setName("eZ Search list view tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(viewNoResultTest);
    Y.Test.Runner.add(enableLoadMoreTest);
    Y.Test.Runner.add(itemSetterTest);
    Y.Test.Runner.add(listItemTest);
    Y.Test.Runner.add(paginationUpdateTest);
    Y.Test.Runner.add(loadMoreTest);

}, '', {requires: ['test', 'base', 'ez-searchlistview', 'node-event-simulate', 'model', 'view-node-map', 'view', 'ez-loadmorepagination-tests']});

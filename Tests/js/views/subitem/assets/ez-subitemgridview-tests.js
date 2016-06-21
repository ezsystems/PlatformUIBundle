/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemgridview-tests', function (Y) {
    var renderTest, itemSetterTest, subitemsSetterTest, loadSubitemsTest, gridItemTest,
        loadingStateTest, paginationUpdateTest, loadMoreTest, errorHandlingTest,
        gridItemsDoNotDuplicateTest, refreshTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Subitem Grid View render test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set the loadmorepagination class on the container": function () {
            this.view.render();

            Assert.isTrue(
                this.view.get('container').hasClass('ez-loadmorepagination'),
                "The view container should get the loadmorepagination"
            );
        },

        "Should render the view with the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Should pass the paging information to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    3, Y.Object.size(vars),
                    "The template should receive 3 variables"
                );
                Assert.areEqual(
                    this.location.get('childCount'),
                    vars.subitemCount,
                    "The template should receive the subitem counts"
                );
                Assert.areEqual(
                    this.view.get('limit'),
                    vars.limit,
                    "The template should receive the configured limit"
                );
                Assert.areEqual(
                    this.location.get('childCount'),
                    vars.displayCount,
                    "The template should receive the number of displayed elements"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should handle the case where there's more subitems than the limit": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    this.view.get('limit'),
                    vars.displayCount,
                    "The template should receive the number of displayed elements"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.location.set('childCount', this.view.get('limit') + 1);
            this.view.render();
        },

        "Should not render the view when the subitems are loaded": function () {
            this.view.render();
            this.view.set('items', []);
            this.view.get('container').append('<p class="test-stamp">Stamp</p>');
            this.view.render();

            Assert.isObject(
                this.view.get('container').one('.test-stamp'),
                "The view should not have been rerendered"
            );
        },
    });

    itemSetterTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.ItemSetterTestCase, {
        name: "eZ Subitem Grid View items setter test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            Y.eZ.SubitemGridItemView = Y.View;
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemGridItemView;
        },
    }));

    subitemsSetterTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.ItemSetterTestCase, {
        name: "eZ Subitem Grid View subitems setter test (BC)",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            Y.eZ.SubitemGridItemView = Y.View;
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.view.render();
            this.attr = 'subitems';
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemGridItemView;
        },
    }));


    loadSubitemsTest = new Y.Test.Case(Y.merge(Y.eZ.Test.AsynchronousSubitemView.LoadSubitemsTest, {
        name: "eZ Subitem Grid View load subitems test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
                loadingError: true,
            });
            this.location.set('childCount', this.view.get('limit') + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },
    }));

    gridItemTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.ItemViewTestCase, {
        name: "eZ Subitem Grid View grid items test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            Y.eZ.SubitemGridItemView = Y.Base.create('gridItemView', Y.View, [Y.View.NodeMap], {});
            this.ItemView = Y.eZ.SubitemGridItemView;
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemGridItemView;
        },
    }));

    loadingStateTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.LoadingStateTestCase, {
        name: "eZ Subitem Grid View loading state test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.location.set('childCount', this.view.get('limit') + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },
    }));

    paginationUpdateTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.PaginationUpdateTestCase, {
        name: "eZ Subitem Grid View pagination update test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            Y.eZ.SubitemGridItemView = Y.View;
            this.view = new Y.eZ.SubitemGridView({
                container: '.container',
                location: this.location,
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemGridItemView;
        },
    }));

    loadMoreTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.LoadSubitemsTest, {
        name: "eZ Subitem Grid View pagination load more test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
                container: '.container',
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },
    }));

    errorHandlingTest = new Y.Test.Case(Y.merge(Y.eZ.Test.AsynchronousSubitemView.ErrorHandlingTestCase, {
        name: "eZ Subitem Grid View error handling test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            Y.eZ.SubitemGridItemView = Y.View;
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            delete Y.eZ.SubitemGridItemView;
            this.view.destroy();
        },
    }));

    //Regression test for EZP-25671
    gridItemsDoNotDuplicateTest = new Y.Test.Case({
        name: "eZ Subitem Grid View grid items do not duplicates test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,
            });
            Y.eZ.SubitemGridItemView = Y.View;
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            delete Y.eZ.SubitemGridItemView;
            this.view.destroy();
        },

        _getSubItemStruct: function (baseId) {
            return {
                content: new Y.Model({id: 'content-' + baseId}),
                location: new Y.Model({id: 'location-' + baseId}),
                contentType: new Y.Model({id: 'contentType-' + baseId}),
            };
        },

        "Should NOT duplicates item": function () {
            var subitems = [
                    this._getSubItemStruct(1),
                    this._getSubItemStruct(2),
                    this._getSubItemStruct(3),
                    this._getSubItemStruct(4),
                    this._getSubItemStruct(5),
                    this._getSubItemStruct(6),
                    this._getSubItemStruct(7),
                    this._getSubItemStruct(8),
                    this._getSubItemStruct(9),
                    this._getSubItemStruct(10)
                ],
                container = this.view.get('container'),
                gridItems;

            this.view.set('items', subitems);
            gridItems = container.all('.ez-loadmorepagination-content div');
            Assert.areEqual(
                subitems.length,
                gridItems.size(),
                "There should be one grid item per subitem"
            );

            this.view.set('items', [this._getSubItemStruct(11)]);

            gridItems = container.all('.ez-loadmorepagination-content div');

            Assert.areEqual(
                this.view.get('items').length,
                gridItems.size(),
                "There should be one grid item per subitem"
            );
        },
    });

    refreshTest = new Y.Test.Case(Y.merge(Y.eZ.Test.AsynchronousSubitemView.RefreshTestCase, {
        name: "eZ Subitem Grid View refresh test",

        setUp: function () {
            Y.eZ.SubitemGridItemView = Y.Base.create('itemView', Y.View, [], {});
            this.location = new Y.Model({
                locationId: 42,
                sortOrder: 'ASC',
                sortField: 'SECTION',
            });
            this.view = new Y.eZ.SubitemGridView({
                container: '.container',
                location: this.location,
                items: [],
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            delete Y.eZ.SubitemGridItemView;
            this.view.destroy();
        },
    }));

    Y.Test.Runner.setName("eZ Subitem Grid View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(itemSetterTest);
    Y.Test.Runner.add(subitemsSetterTest);
    Y.Test.Runner.add(loadSubitemsTest);
    Y.Test.Runner.add(gridItemTest);
    Y.Test.Runner.add(loadingStateTest);
    Y.Test.Runner.add(paginationUpdateTest);
    Y.Test.Runner.add(loadMoreTest);
    Y.Test.Runner.add(errorHandlingTest);
    Y.Test.Runner.add(gridItemsDoNotDuplicateTest);
    Y.Test.Runner.add(refreshTest);
}, '', {
    requires: [
        'test', 'base', 'view', 'view-node-map', 'model', 'node-event-simulate',
        'ez-loadmorepagination-tests', 'ez-asynchronoussubitemview-tests',
        'ez-subitemgridview'
    ]
});

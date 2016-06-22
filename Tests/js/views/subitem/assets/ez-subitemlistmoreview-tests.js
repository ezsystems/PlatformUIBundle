/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistmoreview-tests', function (Y) {
    var renderTest, itemSetterTest, loadSubitemsTest, listItemTest,
        loadingStateTest, paginationUpdateTest, loadMoreTest, errorHandlingTest,
        lockPriorityEditTest, refreshTest, updatePriorityTest,
        Assert = Y.Assert, Mock = Y.Mock;

   function _configureSubitemsMock(priority) {
        var i = 0;

        this.subitems = [];
        this.subitemsJSON = [];
        for (i = 0; i != this.childCount; i++) {
            this.subitems.push({
                location: new Mock(new Y.Model({
                    locationId: 41 + i,
                    priority: priority
                })),
                content: {},
                contentType: {},
            });
            this.subitemsJSON.push({location: {}});

            Mock.expect(this.subitems[i].location, {
                method: 'toJSON',
                returns: this.subitemsJSON[i].location,
            });
        }
    }

    renderTest = new Y.Test.Case({
        name: "eZ Subitem ListMore View render test",

        setUp: function () {
            this.location = new Mock(new Y.Model());
            this.locationJSON = {};

            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            this.view = new Y.eZ.SubitemListMoreView({
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

        "Should pass some variables to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    2, Y.Object.size(vars),
                    "The template should receive 2 variables"
                );
                Assert.areSame(
                    this.locationJSON, vars.location,
                    "The template should receive the jsonified Location"
                );
                this._assertColumns(vars.columns);
                return origTpl.apply(this.view, arguments);
            }, this);
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
        name: "eZ Subitem ListMore View subitems setter test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            Y.eZ.SubitemListItemView = Y.View;
            this.view = new Y.eZ.SubitemListMoreView({
                location: this.location,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemListItemView;
        },
    }));

    loadSubitemsTest = new Y.Test.Case(Y.merge(Y.eZ.Test.AsynchronousSubitemView.LoadSubitemsTest, {
        name: "eZ Subitem ListMore View load subitems test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemListMoreView({
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

    listItemTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.ItemViewTestCase, {
        name: "eZ Subitem ListMore View list items test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            Y.eZ.SubitemListItemView = Y.Base.create('listItemView', Y.View, [Y.View.NodeMap], {});
            this.ItemView = Y.eZ.SubitemListItemView;
            this.view = new Y.eZ.SubitemListMoreView({
                location: this.location,
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.SubitemListMoreItemView;
        },
    }));

    loadingStateTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.LoadingStateTestCase, {
        name: "eZ Subitem ListMore View loading state test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemListMoreView({
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
        name: "eZ Subitem ListMore View pagination update test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemListMoreView({
                location: this.location,
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },
    }));

    loadMoreTest = new Y.Test.Case(Y.merge(Y.eZ.Test.LoadMorePagination.LoadMoreTestCase, {
        name: "eZ Subitem ListMore load more test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemListMoreView({
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
        name: "eZ Subitem ListMore View error handling test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemListMoreView({
                location: this.location,
                itemViewConstructor: Y.View,
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },
    }));

    lockPriorityEditTest = new Y.Test.Case({
        name: "eZ Subitem ListMore View lock priority edit test",

        setUp: function () {
            var ItemView;

            this.items = [];
            ItemView = Y.Base.create('itemView', Y.View, [], {
                initializer: function () {
                    lockPriorityEditTest.items.push(this);
                },
            }, {
                ATTRS: {
                    canEditPriority: {},
                    editingPriority: {},
                }
            });
            this.locationId = 42;
            this.childCount = 49;
            this.location = new Mock(new Y.Model({
                locationId: this.locationId,
                childCount: this.childCount,
            }));
            this.priority = 24;
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            this.lastOffset = 40;
            _configureSubitemsMock.call(this, this.priority);

            this.view = new Y.eZ.SubitemListMoreView({
                container: '.container',
                location: this.location,
                itemViewConstructor: ItemView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should lock the priority edit when item is used to edit a priority": function () {
            var itemView1, itemView2;

            this.view.render();
            this.view.set('active', true);
            this.view.set('items', this.subitems);
            itemView1 = this.items[0];
            itemView2 = this.items[1];

            itemView2.set('editingPriority', true);

            Assert.isTrue(
                itemView2.get('canEditPriority'),
                "canEditPriority should be true for the view when the priority is edited"
            );
            Assert.isFalse(
                itemView1.get('canEditPriority'),
                "canEditPriority should be false for the view when the priority is not edited"
            );
        },

        "Should unlock the priority edit when priority edit ends": function () {
            var itemView1, itemView2;

            this["Should lock the priority edit when item is used to edit a priority"]();

            itemView1 = this.items[0];
            itemView2 = this.items[1];

            itemView2.set('editingPriority', false);

            Assert.isTrue(
                itemView2.get('canEditPriority'),
                "canEditPriority should be true"
            );
            Assert.isTrue(
                itemView1.get('canEditPriority'),
                "canEditPriority should be true"
            );
        },
    });

    refreshTest = new Y.Test.Case(Y.merge(Y.eZ.Test.AsynchronousSubitemView.RefreshTestCase, {
        name: "eZ Subitem ListMore View refresh test",

        setUp: function () {
            var ItemView;

            this.location = new Y.Model({
                locationId: 42,
                sortOrder: 'ASC',
                sortField: 'SECTION',
            });
            ItemView = Y.Base.create('itemView', Y.View, [], {});
            this.view = new Y.eZ.SubitemListMoreView({
                container: '.container',
                location: this.location,
                items: [],
                itemViewConstructor: ItemView,
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },
    }));

    updatePriorityTest = new Y.Test.Case({
        name: "eZ Subitem ListMore View update priority test",

        setUp: function () {
            var ItemView, that = this;

            this.itemView = null;
            ItemView = Y.Base.create('itemView', Y.View, [], {
                initializer: function () {
                    that.itemView = this;
                },
            }, {
                ATTRS: {
                    canEditPriority: {},
                    editingPriority: {},
                }
            });
            this.locationId = 42;
            this.childCount = 40;
            this.location = new Mock(new Y.Model({
                locationId: this.locationId,
                childCount: this.childCount,
            }));
            this.priority = 24;
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            _configureSubitemsMock.call(this, this.priority);

            this.view = new Y.eZ.SubitemListMoreView({
                container: '.container',
                location: this.location,
                itemViewConstructor: ItemView,
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getLoadMoreButton: function () {
            return this.view.get('container').one('.ez-loadmorepagination-more');
        },

        "Should ignore priority update": function () {
            this.location.set('sortField', 'NAME');
            this.view.set('items', this.subitems.slice(10));
            this.itemView.fire('updatePriority', {
                location: this.itemView.get('location'),
            });

            Assert.isFalse(
                this.view.get('loading'),
                "loading should remain false"
            );
            Assert.isFalse(
                this._getLoadMoreButton().get('disabled'),
                "The load more button should be enabled"
            );
        },

        "Should set the loading state": function () {
            this.location.set('sortField', 'PRIORITY');
            this.view.set('items', this.subitems.slice(10));
            this.itemView.fire('updatePriority', {
                location: this.itemView.get('location'),
            });

            Assert.isTrue(
                this.view.get('loading'),
                "loading should be set"
            );
            Assert.isTrue(
                this._getLoadMoreButton().get('disabled'),
                "The load more button should be disabled"
            );
        },

        "Should reload the subitems when the priority is updated": function () {
            var searchFired = false;

            this["Should set the loading state"]();

            this.view.on('locationSearch', function () {
                searchFired = true;
            });
            this.itemView.get('location').set('priority', -10);

            Assert.isTrue(
                searchFired,
                "The subitems should be reloaded"
            );
        },
    });


    Y.Test.Runner.setName("eZ Subitem ListMore View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(itemSetterTest);
    Y.Test.Runner.add(loadSubitemsTest);
    Y.Test.Runner.add(listItemTest);
    Y.Test.Runner.add(loadingStateTest);
    Y.Test.Runner.add(paginationUpdateTest);
    Y.Test.Runner.add(loadMoreTest);
    Y.Test.Runner.add(errorHandlingTest);
    Y.Test.Runner.add(lockPriorityEditTest);
    Y.Test.Runner.add(updatePriorityTest);
    Y.Test.Runner.add(refreshTest);
}, '', {
    requires: [
        'test', 'base', 'view', 'view-node-map', 'model', 'node-event-simulate',
        'ez-loadmorepagination-tests', 'ez-asynchronoussubitemview-tests',
        'ez-subitemlistmoreview'
    ]
});

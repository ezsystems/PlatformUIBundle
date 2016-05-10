/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistview-tests', function (Y) {
    var renderTest, locationSearchEvent, offsetAttrTest, paginationTest, visibilityChangeTest,
        lockPriorityEditTest, itemViewTest, loadingTest,
        Assert = Y.Assert, Mock = Y.Mock;

    function _configureSubitemsMock(priority) {
        var i = 0;

        this.subitems = [];
        this.subitemsJSON = [];
        for (i = 0; i != this.childCount; i++) {
            this.subitems.push({
                location: new Mock(),
                content: {},
                contentType: {},
            });
            this.subitemsJSON.push({location: {}});

            Mock.expect(this.subitems[i].location, {
                method: 'toJSON',
                returns: this.subitemsJSON[i].location,
            });
            Mock.expect(this.subitems[i].location, {
                method: 'get',
                args: [Mock.Value.String],
                run: _getGetterForLocationMock({locationId: 41 + i, priority: priority})
            });
        }
    }

    function _getGetterForLocationMock(attrs) {
        return function (attr) {
            if ( typeof attrs[attr] !== "undefined" ) {
                return attrs[attr];
            }
            Y.fail("Unexpected attr '" + attr + "'");
        };
    }

    renderTest = new Y.Test.Case({
        name: "eZ Subitem List View render test",

        setUp: function () {
            this.location = new Mock();
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            this.childCount = 2;
            Mock.expect(this.location, {
                method: 'get',
                args: [Mock.Value.String],
                run: _getGetterForLocationMock({
                    childCount: this.childCount,
                    locationId: 42,
                }),
            });

            Mock.expect(this.location, {
                method: 'after',
                args: [Mock.Value.Any, Mock.Value.Function],
            });

            _configureSubitemsMock.call(this);

            this.view = new Y.eZ.SubitemListView({
                container: '.container',
                location: this.location,
                subitems: this.subitems,
                itemViewConstructor: Y.View,
            });
        },

        tearDown: function () {
            this.view.destroy();
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

        "Should pass variables to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    7, Y.Object.size(vars),
                    "The template should receive 7 variables"
                );
                Assert.areSame(
                    this.view.get('loadingError'), vars.loadingError,
                    "The template should receive the loadingError flag"
                );
                Assert.areSame(
                    this.locationJSON, vars.location,
                    "The template should receive the jsonified location"
                );
                Assert.areEqual(
                    this.subitems.length, vars.subitems.length,
                    "The template should receive the subitems"
                );
                Assert.areSame(
                    this.subitemsJSON[0].location, vars.subitems[0],
                    "The template should receive the jsonified subitems"
                );
                Assert.areSame(
                    this.subitemsJSON[1].location, vars.subitems[1],
                    "The template should receive the jsonified subitems"
                );
                Assert.isTrue(vars.isFirst, "isFirst should be true");
                Assert.isTrue(vars.isLast, "isLast should be true");
                Assert.isFalse(vars.hasPages, "hasPages should be false");
                Assert.isArray(vars.columns, "columns should be an array");

                Assert.areEqual(
                    this.view.get('displayedProperties').length,
                    vars.columns.length,
                    "The columns array should be build from `displayedProperties`"
                );
                vars.columns.forEach(function (column) {
                    Assert.isObject(
                        column,
                        "Each column should be described by an object"
                    );
                    Assert.isString(
                        column.identifier,
                        "The column object should contain an identifier"
                    );
                    Assert.areNotEqual(
                        -1, this.view.get('displayedProperties').indexOf(column.identifier),
                        "The identifier should be in the `displayedProperties` attribute"
                    );
                    Assert.isString(
                        column.name,
                        "The column object should contain a name"
                    );
                }, this);
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should handle the missing subitems": function () {
            var origTpl;

            this.view.set('subitems', undefined);
            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.isFalse(
                    !!!this.subitems,
                    "The template should receive the subitems"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should compute and pass the hasPages flag": function () {
            var origTpl;

            Mock.expect(this.location, {
                method: 'get',
                args: [Mock.Value.String],
                run: _getGetterForLocationMock({
                    childCount: this.view.get('limit') + 1,
                    locationId: 42,
                }),
            });
            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.isTrue(
                    vars.hasPages,
                    "hasPages should be true"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should compute and pass the isFirst flag": function () {
            var origTpl;

            this.view.set('offset', this.view.get('limit')+1);
            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.isFalse(
                    vars.isFirst,
                    "isFirst should be false"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should compute and pass the isLast flag": function () {
            var origTpl;

            this.childCount = 12;
            this.view.set('offset', this.view.get('limit')+1);
            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.isTrue(
                    vars.isLast,
                    "isLast should be false"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should render the view when the subitems change": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.set('subitems', []);
            Assert.isTrue(templateCalled, "The view should be rendered");
        },

        "Should render the view when loadingError change": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.set('loadingError', true);
            Assert.isTrue(templateCalled, "The view should be rendered");
        },
    });

    locationSearchEvent = new Y.Test.Case({
        name: "eZ Subitem List View locationSearchEvent test",

        setUp: function () {
            this.locationId = 42;
            this.location = new Mock();
            Mock.expect(this.location, {
                method: 'get',
                args: [Mock.Value.String],
                run: _getGetterForLocationMock({
                    locationId: this.locationId,
                    childCount: 1,
                }),
            });
            Mock.expect(this.location, {
                method: 'after',
                args: [Mock.Value.Any, Mock.Value.Function],
            });
            this.view = new Y.eZ.SubitemListView({
                container: '.container',
                location: this.location,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should fire the locationSearch event": function () {
            var fired = false;

            this.view._set('loading', false);
            this.view.on('locationSearch', function (e) {
                fired = true;

                Assert.areEqual(
                    'subitems', e.resultAttribute,
                    "The resultAttribute property should be 'subitems'"
                );
                Assert.isTrue(
                    this.get('loading'),
                    "`loading` should be set to true"
                );
            });
            this.view.set('active', true);
            Assert.isTrue(
                fired, "The locationSearch event should have been fired"
            );
        },

        "Should not fire the locationSearch event": function () {
            var fired = false;

            Mock.expect(this.location, {
                method: 'get',
                args: [Mock.Value.String],
                run: _getGetterForLocationMock({
                    locationId: this.locationId,
                    childCount: 0,
                }),
            });
            this.view._set('loading', true);
            this.view.on('locationSearch', function (e) {
                fired = true;

                Assert.areEqual(
                    'subitems', e.resultAttribute,
                    "The resultAttribute property should be 'subitems'"
                );
            });
            this.view.set('active', true);
            Assert.isFalse(
                fired, "The locationSearch event should not have been fired"
            );
            Assert.isFalse(
                this.view.get('loading'),
                "`loading` should be set to false"
            );
        },

        "Should search for the subitems of the location": function () {
            this.view.on('locationSearch', Y.bind(function (e) {
                Assert.isObject(
                    e.search,
                    "The event facade should contain a location search query"
                );
                Assert.areEqual(
                    this.locationId, e.search.criteria.ParentLocationIdCriterion,
                    "The ParentLocationIdCriterion criterion should be used with the location id"
                );
                Assert.areEqual(
                    this.view.get('limit'), e.search.limit,
                    "The limit should be set to the view limit attribute value"
                );
                Assert.areEqual(
                    this.view.get('offset'), e.search.offset,
                    "The offset should be set to the view offset attribute value"
                );
            }, this));
            this.view.set('active', true);
        },

        "Should set the loadContentType and loadContent flags": function () {
            this.view.on('locationSearch', Y.bind(function (e) {
                Assert.isTrue(
                    e.loadContentType,
                    "The loadContentType flag should be set"
                );
                Assert.isTrue(
                    e.loadContent,
                    "The loadContent flag should be set"
                );
            }, this));
            this.view.set('active', true);
        },
    });

    offsetAttrTest = new Y.Test.Case({
        name: "eZ Subitem List View offset attribute test",

        setUp: function () {
            this.locationId = 42;
            this.location = new Mock();
            Mock.expect(this.location, {
                method: 'get',
                args: [Mock.Value.String],
                run: _getGetterForLocationMock({
                    locationId: this.locationId,
                    childCount: 1,
                }),
            });
            Mock.expect(this.location, {
                method: 'after',
                args: [Mock.Value.Any, Mock.Value.Function],
            });

            this.view = new Y.eZ.SubitemListView({
                container: '.container',
                location: this.location,
            });
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should fire the locationSearch event when offset is changed": function () {
            var fired = false,
                offset = 20;

            this.view.on('locationSearch', function (e) {
                fired = true;

                Assert.areEqual(
                    offset, e.search.offset,
                    "The offset should be provided in the locationSearch event"
                );
            });
            this.view.set('offset', offset);
            Assert.isTrue(
                fired, "The locationSearch event should have been fired"
            );
        },

        "Should set the ui in loading state": function () {
            this.view.set('offset', 20);
            Assert.isTrue(
                this.view.get('container').hasClass('is-page-loading'),
                "The container should get the is-page-loading state"
            );
        },
    });

    visibilityChangeTest = new Y.Test.Case({
        name: "eZ Subitem List View visibility change test",

        setUp: function () {
            this.locationId = 42;
            this.location = new Y.Base();
            this.location.setAttrs({
                'id': this.locationId,
                'childCount': 20,
                'hidden': false,
                'invisible': false,
            });

            this.view = new Y.eZ.SubitemListView({
                container: '.container',
                location: this.location,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testFire: function (attributeName) {
            var fired = false;

            this.view.set('active', true);
            this.view.on('locationSearch', function (e) {
                fired = true;
            });

            this.location.set(attributeName, true);

            Assert.isTrue(
                fired, "The locationSearch event should have been fired"
            );
        },

        "Should fire the locationSearch event when hidden is changed": function () {
            this._testFire('hidden');
        },

        "Should fire the locationSearch event when invisible is changed": function () {
            this._testFire('invisible');
        },

        _testLoading: function (attributeName) {
            this.view.set(attributeName, true);
            Assert.isTrue(
                this.view.get('container').hasClass('is-page-loading'),
                "The container should get the is-page-loading state"
            );
        },

        "Should set the ui in loading state for hidden": function () {
            this._testLoading('hidden');
        },

        "Should set the ui in loading state for invisible": function () {
            this._testLoading('invisible');
        },
    });

    paginationTest = new Y.Test.Case({
        name: "eZ Subitem List View pagination test",

        setUp: function () {
            this.location = new Mock();
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            Mock.expect(this.location, {
                method: 'after',
                args: [Mock.Value.Any, Mock.Value.Function],
            });
            this.childCount = 49;
            this.lastOffset = 40;
            Mock.expect(this.location, {
                method: 'get',
                args: [Mock.Value.String],
                run: _getGetterForLocationMock({
                    childCount: this.childCount,
                    locationId: 42,
                }),
            });
            _configureSubitemsMock.call(this);

            this.view = new Y.eZ.SubitemListView({
                container: '.container',
                location: this.location,
                subitems: this.subitems,
                itemViewConstructor: Y.View,
            });

            this.view.get('container').once('tap', function (e) {
                Assert.isTrue(
                    !!e.prevented,
                    "The tap event should have been prevented"
                );
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should navigate to the last page": function () {
            var c = this.view.get('container');

            this.view.render();

            c.one('[rel=last]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    this.lastOffset, this.view.get('offset'),
                    "The offset should be 40"
                );
            }, this));

            this.wait();
        },

        "Should navigate to the last page when the number of children location is a multiple of the limit": function () {
            //This test is related to "EZP-25175 :Setting incorrect pagination offset in subitems view"
            var c = this.view.get('container');

            this.childCount = 50;
            this.view.render();

            c.one('[rel=last]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    this.lastOffset, this.view.get('offset'),
                    "The offset should be 40"
                );
            }, this));

            this.wait();
        },

        "Should navigate to the previous page": function () {
            var c = this.view.get('container'),
                initialOffset = 30;

            this.view.set('offset', initialOffset);
            this.view.render();

            c.one('[rel=prev]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    initialOffset - this.view.get('limit'), this.view.get('offset'),
                    "The offset should be " + (initialOffset - this.view.get('limit'))
                );
            }, this));

            this.wait();
        },

        "Should navigate to the next page": function () {
            var c = this.view.get('container'),
                initialOffset = 20;

            this.view.set('offset', initialOffset);
            this.view.render();

            c.one('[rel=next]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    initialOffset + this.view.get('limit'), this.view.get('offset'),
                    "The offset should be " + (initialOffset + this.view.get('limit'))
                );
            }, this));

            this.wait();
        },

        "Should navigate to the first page": function () {
            var c = this.view.get('container'),
                initialOffset = 20;

            this.view.set('offset', initialOffset);
            this.view.render();

            c.one('[rel=first]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    0, this.view.get('offset'),
                    "The offset should be 0"
                );
            }, this));

            this.wait();
        },

        "Should ignore disabled link": function () {
            var c = this.view.get('container'),
                initialOffset = 20;

            this.view.set('offset', initialOffset);
            this.view.render();

            c.one('[rel=first]').addClass('is-disabled').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    initialOffset, this.view.get('offset'),
                    "The offset should remain " + initialOffset
                );
            }, this));

            this.wait();
        },
    });

    lockPriorityEditTest = new Y.Test.Case({
        name: "eZ Subitem List View lock priority edit test",

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
            this.location = new Mock();
            this.locationId = 42;
            this.childCount = 49;
            this.priority = 24;
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            Mock.expect(this.location, {
                method: 'get',
                args: [Mock.Value.String],
                run: _getGetterForLocationMock({
                    locationId: this.locationId,
                    childCount: this.childCount,
                }),
            });
            Mock.expect(this.location, {
                method: 'after',
                args: [Mock.Value.Any, Mock.Value.Function],
            });
            this.lastOffset = 40;
            _configureSubitemsMock.call(this, this.priority);

            this.view = new Y.eZ.SubitemListView({
                container: '.container',
                location: this.location,
                subitems: this.subitems,
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

    itemViewTest = new Y.Test.Case({
        name: "eZ Subitem List View item view test",

        setUp: function () {
            var ItemView;

            this.items = [];
            ItemView = Y.Base.create('itemView', Y.View, [], {
                initializer: function () {
                    itemViewTest.items.push(this);
                },
            });
            this.location = new Mock();
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: {},
            });
            Mock.expect(this.location, {
                method: 'after',
                args: [Mock.Value.Any, Mock.Value.Function],
            });

            this.childCount = 3;
            Mock.expect(this.location, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'childCount' ) {
                        return this.childCount;
                    } else if ( attr == 'locationId' ) {
                        return 42;
                    }
                    Y.fail("Unexpected attr '" + attr + "'");
                }, this)
            });
            _configureSubitemsMock.call(this);

            this.view = new Y.eZ.SubitemListView({
                container: '.container',
                location: this.location,
                subitems: this.subitems,
                itemViewConstructor: ItemView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should not instantiate any item view when there's no subitem": function () {
            this.view.set('subitems', []);
            this.view.render();

            Assert.areEqual(
                0, this.items.length,
                "No view should have been instantiated"
            );
        },

        "Should instantiate an item view per subitem": function () {
            this.view.render();

            Assert.areEqual(
                this.subitems.length,
                this.items.length,
                "A view should have been instantiated per subitem"
            );
        },

        "Should receive the displayedProperties, location, content and content type": function () {
            var view = this.view;

            view.render();

            this.items.forEach(function (item, i) {
                Assert.areSame(
                    view.get('displayedProperties'),
                    item.get('displayedProperties'),
                    "The item view should have received the `displayedProperties` attribute value"
                );
                Assert.areSame(
                    view.get('subitems')[i].location,
                    item.get('location'),
                    "The item view should have received the location"
                );
                Assert.areSame(
                    view.get('subitems')[i].content,
                    item.get('content'),
                    "The item view should have received the content"
                );
                Assert.areSame(
                    view.get('subitems')[i].contentType,
                    item.get('contentType'),
                    "The item view should have received the contentType"
                );
            });
        },
    });

    loadingTest = new Y.Test.Case({
        name: "eZ Subitem List View loading test",

        setUp: function () {
            var Location = Y.Base.create('location', Y.Base, [], {
                    toJSON: function () {
                        return {};
                    }
                });

            this.locationId = 42;
            this.location = new Location();
            this.location.setAttrs({
                'id': this.locationId,
                'childCount': 20,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set loading to true": function () {
            this.view = new Y.eZ.SubitemListView({
                location: this.location,
            });
            Assert.isTrue(
                this.view.get('loading'),
                "`loading` should be true"
            );
            Assert.isTrue(
                this.view.get('container').hasClass('is-page-loading'),
                "The loading class should have been added on the container"
            );
        },

        "Should set loading to false": function () {
            this.location.set('childCount', 0);
            this.view = new Y.eZ.SubitemListView({
                location: this.location,
            });
            Assert.isFalse(
                this.view.get('loading'),
                "`loading` should be false"
            );
            Assert.isFalse(
                this.view.get('container').hasClass('is-page-loading'),
                "The loading class should not have been added to the container"
            );
        },

        "Should add the loading class": function () {
            this["Should set loading to false"]();
            this.view._set('loading', true);

            Assert.isTrue(
                this.view.get('container').hasClass('is-page-loading'),
                "The loading class should have been added on the container"
            );
        },

        "Should remove the loading class": function () {
            this["Should set loading to true"]();
            this.view._set('loading', false);

            Assert.isFalse(
                this.view.get('container').hasClass('is-page-loading'),
                "The loading class should have been removed from the container"
            );
        },

        "Should set loading to false on subitemsChange": function () {
            this["Should set loading to true"]();
            this.view.set('subitems', []);

            Assert.isFalse(
                this.view.get('loading'),
                "loading should be set to false"
            );
        },

        "Should set loading to false on loadingErrorChange": function () {
            this["Should set loading to true"]();
            this.view.set('loadingError', true);

            Assert.isFalse(
                this.view.get('loading'),
                "loading should be set to false"
            );
        },
    });

    Y.Test.Runner.setName("eZ Subitem List View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(locationSearchEvent);
    Y.Test.Runner.add(offsetAttrTest);
    Y.Test.Runner.add(visibilityChangeTest);
    Y.Test.Runner.add(paginationTest);
    Y.Test.Runner.add(loadingTest);
    Y.Test.Runner.add(lockPriorityEditTest);
    Y.Test.Runner.add(itemViewTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-subitemlistview']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistview-tests', function (Y) {
    var renderTest, locationSearchEvent, offsetAttrTest, paginationTest, visibilityChangeTest, priorityUpdateTest,
        loadingTest,
        Assert = Y.Assert, Mock = Y.Mock;

    function _configureSubitemsMock(priority) {
        var i = 0;

        this.subitems = [];
        this.subitemsJSON = [];
        for (i = 0; i != this.childCount; i++) {
            this.subitems.push({location: new Mock()});
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

        "Should pass the jsonified location and subitems to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    6, Y.Object.size(vars),
                    "The template should receive 3 variables"
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

    priorityUpdateTest = new Y.Test.Case({
        name: "eZ Subitem List View priority update test",

        setUp: function () {
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
            });

        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should display edit icon while hovering input": function () {
            var c = this.view.get('container'),
                selectedCell,
                fieldInput;

            this.view.render();

            selectedCell = c.one('#priority-cell-' + this.locationId);
            fieldInput =  c.one('.ez-subitem-priority-input');

            Y.Assert.isFalse(
                selectedCell.hasClass('ez-subitem-hovered-priority-cell'),
                "The edit icon should NOT be shown before hovering the input"
            );

            fieldInput.simulate('mouseover');

            Y.Assert.isTrue(
                selectedCell.hasClass('ez-subitem-hovered-priority-cell'),
                "The edit icon should have been shown"
            );
        },

        "Should NOT display edit icon while hovering in another input than the one of the selected cell": function () {
            var c = this.view.get('container'),
                otherLocationId = 43,
                selectedCell,
                fieldInput,
                otherFieldInput,
                otherSelectedCell,
                that = this;

            this.view.render();
            selectedCell = c.one('#priority-cell-' + this.locationId);
            otherSelectedCell = c.one('#priority-cell-' + otherLocationId);
            otherFieldInput =  c.one('#priority-' + otherLocationId);
            fieldInput =  c.one('#priority-' + this.locationId);

            fieldInput.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(selectedCell.hasClass("ez-subitem-selected-priority-cell"), "Validate and Cancel buttons should be visible");
                    otherFieldInput.simulate('mouseover');
                    Y.Assert.isFalse(
                        otherSelectedCell.hasClass('ez-subitem-hovered-priority-cell'),
                        "The edit icon should NOT have been shown"
                    );
                });
            });
            this.wait();
        },

        "Should hide edit icon while moving the mouse out of the input": function () {
            var c = this.view.get('container'),
                selectedCell,
                fieldInput;

            this["Should display edit icon while hovering input"]();
            selectedCell = c.one('#priority-cell-' + this.locationId);
            fieldInput =  c.one('.ez-subitem-priority-input');

            fieldInput.simulate('mouseout');

            Y.Assert.isFalse(
                selectedCell.hasClass('ez-subitem-hovered-priority-cell'),
                "The edit icon should be hidden"
            );
        },

        "Should display priority buttons and activate input on tap on the input": function () {
            var c = this.view.get('container'),
                that = this,
                selectedCell,
                fieldInput;

            this.view.render();

            fieldInput =  c.one('.ez-subitem-priority-input');
            selectedCell = c.one('#priority-cell-' + this.locationId);

            fieldInput.simulateGesture('tap', function () {
                that.resume(function () {

                    Y.Assert.isTrue(selectedCell.hasClass("ez-subitem-selected-priority-cell"), "Validate and Cancel buttons should be visible");
                    Y.Assert.isFalse(fieldInput.hasAttribute("readonly"), "The input should NOT be readonly anymore");
                });
            });
            this.wait();
        },

        "Should NOT display priority buttons and activate input on tap on another input while one is already selected": function () {
            var c = this.view.get('container'),
                otherLocationId = 43,
                that = this,
                selectedCell,
                fieldInput,
                otherFieldInput,
                otherSelectedCell;

            this.view.render();

            fieldInput =  c.one('.ez-subitem-priority-input');
            otherFieldInput = c.one('#priority-' + otherLocationId);
            selectedCell = c.one('#priority-cell-' + this.locationId);
            otherSelectedCell = c.one('#priority-cell-' + otherLocationId);

            fieldInput.simulateGesture('tap', function () {
                that.resume(function () {

                    Y.Assert.isTrue(selectedCell.hasClass("ez-subitem-selected-priority-cell"), "Validate and Cancel buttons should be visible");
                    Y.Assert.isFalse(fieldInput.hasAttribute("readonly"), "The input should NOT be readonly anymore");
                    otherFieldInput.simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.isFalse(
                                otherSelectedCell.hasClass("ez-subitem-selected-priority-cell"),
                                "Validate and Cancel buttons should NOT be visible for the other input"
                            );
                            Y.Assert.isTrue(otherFieldInput.hasAttribute("readonly"), "The other input should stay readonly ");
                        });
                    });
                    that.wait();

                });
            });
            this.wait();
        },

        "Should hide priority buttons and set the input back to readonly with its original value on tap on the cancel button": function () {
            var c = this.view.get('container'),
                that = this,
                selectedCell,
                cancelButton,
                fieldInput;

            this.view.render();

            fieldInput =  c.one('.ez-subitem-priority-input');
            selectedCell = c.one('#priority-cell-' + this.locationId);
            cancelButton = c.one('.ez-subitem-priority-cancel');

            fieldInput.simulateGesture('tap', function () {
                that.resume(function () {

                    Y.Assert.isTrue(selectedCell.hasClass("ez-subitem-selected-priority-cell"), "Validate and Cancel buttons should be visible");
                    fieldInput.set('value', 69);
                    cancelButton.simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.isFalse(
                                selectedCell.hasClass("ez-subitem-selected-priority-cell"),
                                "Validate and Cancel buttons should be hidden"
                            );
                            Y.Assert.isTrue(
                                fieldInput.hasAttribute("readonly"),
                                "The input should be readonly"
                            );
                            Y.Assert.areEqual(
                                fieldInput.get('value'),
                                that.priority,
                                "The input value should be set back to it's original value"
                            );
                        });
                    });
                    that.wait();
                });
            });
            this.wait();
        },

        "Should display an error icon if priority input is not correctly set": function () {
            var c = this.view.get('container'),
                that = this,
                selectedCell,
                fieldInput;

            this.view.render();

            fieldInput =  c.one('.ez-subitem-priority-input');
            selectedCell = c.one('#priority-cell-' + this.locationId);
            fieldInput.simulateGesture('tap');

            this.waitFor(function () {
                return selectedCell.hasClass("ez-subitem-selected-priority-cell");
            }, function () {
                    fieldInput.set('value', 'BAD PRIORITY');
                    fieldInput.simulate('blur');
                    that.waitFor(function () {
                        return selectedCell.hasClass("ez-subitem-error-priority-cell");
                    }, function () {
                        Y.Assert.isFalse(selectedCell.hasClass("ez-subitem-selected-priority-cell"), "Validate and Cancel buttons should be hidden");
                        Y.Assert.isTrue(selectedCell.hasClass("ez-subitem-error-priority-cell"), "Error icon should be displayed");
                    },2000);
                },2000
            );
        },

        "Should hide the error icon if priority input is correctly set again": function () {
            var c = this.view.get('container'),
                that = this,
                selectedCell,
                fieldInput;

            this.view.render();

            fieldInput =  c.one('.ez-subitem-priority-input');
            selectedCell = c.one('#priority-cell-' + this.locationId);
            fieldInput.simulateGesture('tap');

            this.waitFor(function () {
                    return selectedCell.hasClass("ez-subitem-selected-priority-cell");
                }, function () {
                    fieldInput.set('value', 'BAD PRIORITY');
                    fieldInput.simulate('blur');
                    that.waitFor(function () {
                        return selectedCell.hasClass("ez-subitem-error-priority-cell");
                    }, function () {
                        fieldInput.set('value', '42');
                        fieldInput.simulate('blur');
                        that.waitFor(function () {
                            return selectedCell.hasClass("ez-subitem-selected-priority-cell");
                            }, function () {
                                Y.Assert.isFalse(selectedCell.hasClass("ez-subitem-error-priority-cell"), "Error icon should be hidden");
                        }, 2000);
                    },2000);
                },2000
            );
        },

        "Should fire updatePriority and hide priority buttons when form is submitted": function () {
            var c = this.view.get('container'),
                that = this,
                updatePriorityFired = false,
                selectedCell,
                validateButton,
                fieldInput,
                form;

            this.view.render();

            fieldInput = c.one('.ez-subitem-priority-input');
            selectedCell = c.one('#priority-cell-' + this.locationId);
            validateButton = c.one('.ez-subitem-priority-validate');
            form = c.one('.ez-subitem-priority-form');

            this.view.on('updatePriority', function () {
                updatePriorityFired = true;
            });
            this.view.get('container').once('tap', function (e) {
                    Assert.isTrue(
                        !!e.prevented,
                        "The tap event should have been prevented"
                    );
            });

            fieldInput.simulateGesture('tap', function () {
                that.resume(function () {
                    form.simulate('submit');
                    Y.Assert.isTrue(
                        updatePriorityFired,
                        "updatePriority should have been fired"
                    );
                    Y.Assert.isFalse(
                        selectedCell.hasClass(
                            "ez-subitem-selected-priority-cell"),
                        "Validate and Cancel buttons should be hidden"
                    );
                });
            });
            this.wait();
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
    Y.Test.Runner.add(priorityUpdateTest);
    Y.Test.Runner.add(loadingTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-subitemlistview']});

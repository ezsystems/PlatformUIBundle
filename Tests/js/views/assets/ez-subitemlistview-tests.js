/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistview-tests', function (Y) {
    var renderTest, locationSearchEvent,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ Subitem List View render test",

        setUp: function () {
            this.location = new Mock();
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });

            this.subitems = [new Mock(), new Mock()];
            this.subitemsJSON = [{}, {}];
            Mock.expect(this.subitems[0], {
                method: 'toJSON',
                returns: this.subitemsJSON[0],
            });
            Mock.expect(this.subitems[1], {
                method: 'toJSON',
                returns: this.subitemsJSON[1],
            });
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
                    3, Y.Object.size(vars),
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
                    this.subitemsJSON[0], vars.subitems[0],
                    "The template should receive the jsonified subitems"
                );
                Assert.areSame(
                    this.subitemsJSON[1], vars.subitems[1],
                    "The template should receive the jsonified subitems"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should handle the missing subitems": function () {
            var origTpl;

            this.view.set('subitems', undefined);
            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    3, Y.Object.size(vars),
                    "The template should receive 3 variables"
                );
                Assert.isFalse(
                    !!!this.subitems,
                    "The template should receive the subitems"
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
                args: ['locationId'],
                returns: this.locationId
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

            this.view.on('locationSearch', function (e) {
                fired = true;

                Assert.areEqual(
                    'subitems', e.resultAttribute,
                    "The resultAttribute property should be 'subitems'"
                );
            });
            this.view.set('active', true);
            Assert.isTrue(
                fired, "The locationSearch event should have been fired"
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
            }, this));
            this.view.set('active', true);
        },
    });


    Y.Test.Runner.setName("eZ Subitem List View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(locationSearchEvent);
}, '', {requires: ['test', 'ez-subitemlistview']});

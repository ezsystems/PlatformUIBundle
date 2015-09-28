/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewlocationstabview-tests', function (Y) {
    var attributesTest,
        renderTest,
        changeEventTest,
        fireLoadLocationsEventTest,
        addLocationTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    attributesTest = new Y.Test.Case({
        name: "eZ LocationViewLocationsTabView attributes test",
        setUp: function () {
            this.view = new Y.eZ.LocationViewLocationsTabView({
                content: {},
                locations: {},
                config: {},
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _readOnlyString: function (attr) {
            var value = this.view.get(attr);

            Assert.isString(
                this.view.get(attr),
                "The view should have a "+  attr
            );
            this.view.set(attr, value + 'somethingelse');
            Assert.areEqual(
                value, this.view.get(attr),
                "The " + attr + " should be readonly"
            );
        },

        "Should have a title": function () {
            this._readOnlyString('title');
        },

        "Should have a identifier": function () {
            this._readOnlyString('identifier');
        },
    });

    renderTest = new Y.Test.Case({
        name: "eZ LocationViewLocationsTabView render test",
        setUp: function () {
            this.contentMock = new Mock();
            this.locationMock = new Mock();
            this.contentInfoMock = new Mock();
            this.locations = [this.locationMock, this.locationMock];

            Mock.expect(this.locationMock, {
                'method': 'toJSON',
                returns: {}
            });

            Mock.expect(this.locationMock, {
                'method': 'get',
                args: ['contentInfo'],
                returns: this.contentInfoMock
            });

            Mock.expect(this.contentInfoMock, {
                'method': 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.LocationViewLocationsTabView({
                content: this.contentMock,
                locations: this.locations,
                config: {}
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Render should call the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have been used to render this.view");
        },

        "Variables should be available in the template": function () {
            var that = this;

            this.view.template = function (args) {
                Assert.areEqual(
                    that.locations.length, args.locations.length,
                    "Location should be available in the template"
                );
            };

            this.view.render();
        },
    });

    changeEventTest = new Y.Test.Case({
        name: "eZ LocationViewLocationsTabView change event test",
        setUp: function () {
            this.view = new Y.eZ.LocationViewLocationsTabView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Test that locations change event calls render": function () {
            var renderCalled = false;

            this.view.render = function () {
                renderCalled = true;
            };

            this.view.set('locations', [this.locationMock]);

            Assert.isTrue(
                renderCalled,
                "Render should have been called when locations attribute changes: "
            );

        },
    });

    fireLoadLocationsEventTest = new Y.Test.Case({
        name: "eZ LocationViewLocationsTabView fire load user event test",
        setUp: function () {
            this.contentMock = new Mock();
            this.locations = [this.locationMock, this.locationMock];

            this.view = new Y.eZ.LocationViewLocationsTabView({
                content: this.contentMock,
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the loadLocations event": function () {
            var that = this,
                loadLocationsCalled = false;

            this.view.once('loadLocations', function (e) {
                loadLocationsCalled = true;
                Assert.areSame(
                    that.contentMock,
                    e.content,
                    "The event facade should contain the content"
                );
            });

            this.view.set('active', true);

            Assert.isTrue(loadLocationsCalled, "loadLocations should have been called");
        },

        "Should try to reload the content when tapping on the retry button": function () {
            var that = this,
                loadLocationsFired = false;

            this.view.render();
            this.view.set('active', true);
            this.view.set('loadingError', true);

            this.view.on('loadLocations', function () {
                loadLocationsFired = true;
            });

            this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isNull(
                        that.view.get('locations'),
                        "The `locations` attribute should not be defined"
                    );
                    Y.Assert.isTrue(
                        loadLocationsFired,
                        "The loadLocations event should have been fired"
                    );
                });
            });
            this.wait();
        },
    });

    addLocationTest = new Y.Test.Case({
        name: "eZ LocationViewLocationsTabView add location test",
        setUp: function () {
            this.contentMock = new Mock();
            this.locations = [this.locationMock, this.locationMock];

            this.view = new Y.eZ.LocationViewLocationsTabView({
                content: this.contentMock,
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire `createLocation` event": function () {
            var createLocationFired = false,
                that = this;

            this.view.on('createLocation', function (e) {
                createLocationFired = true;

                Assert.areSame(
                    e.content,
                    that.contentMock,
                    'The event facade should contain the content'
                );
                Assert.isFunction(e.afterCreateCallback, 'The event facade should contain callback function');
            });

            this.view.render();
            this.view.get('container').one('.ez-add-location-button').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(
                        createLocationFired,
                        "The `createLocation` event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should fire `loadLocations` event after adding locations": function () {
            var loadLocationsFired = false,
                that = this;

            this.view.on('createLocation', function (e) {
                e.afterCreateCallback();
            });
            this.view.on('loadLocations', function (e) {
                loadLocationsFired = true;

                Assert.areSame(
                    e.content,
                    that.contentMock,
                    'The event facade should contain the content'
                );
            });

            this.view.render();
            this.view.get('container').one('.ez-add-location-button').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(
                        loadLocationsFired,
                        "The `loadLocations` event should have been fired"
                    );
                });
            });
            this.wait();
        }
    });

    Y.Test.Runner.setName("eZ Location View Locations Tab View tests");
    Y.Test.Runner.add(attributesTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(changeEventTest);
    Y.Test.Runner.add(fireLoadLocationsEventTest);
    Y.Test.Runner.add(addLocationTest);
}, '', {requires: ['test', 'ez-locationviewlocationstabview', 'node-event-simulate']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewlocationstabview-tests', function (Y) {
    var attributesTest,
        renderTest,
        changeEventTest,
        fireLoadLocationsEventTest,
        fireSwitchVisibilityEventTest,
        addLocationTest,
        setMainLocationTest,
        removeLocationTest,
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
            this.resources = {
                MainLocation: '/main/location/id'
            };

            Mock.expect(this.contentMock, {
                'method': 'get',
                'args': ['resources'],
                returns: this.resources
            });

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
        name: "eZ LocationViewLocationsTabView fire load locations event test",
        setUp: function () {
            this.contentMock = new Mock();
            this.locationMock = new Mock();
            this.locations = [this.locationMock, this.locationMock];
            this.resources = {
                MainLocation: '/main/location/id'
            };

            Mock.expect(this.contentMock, {
                'method': 'get',
                'args': ['resources'],
                returns: this.resources
            });

            this.view = new Y.eZ.LocationViewLocationsTabView({
                content: this.contentMock,
                location: this.locationMock,
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
                Assert.areSame(
                    that.locationMock,
                    e.location,
                    "The event facade should contain the location"
                );
                Assert.isTrue(
                    e.loadPath,
                    "The event facade should have loadPath set to true"
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

    fireSwitchVisibilityEventTest = new Y.Test.Case({
        name: "eZ LocationViewLocationsTabView fire switch visibility event test",
        setUp: function () {
            this.contentMock = new Mock();
            this.locationMock1 = new Mock();
            this.locationMock2 = new Mock();
            this.locations = [this.locationMock1, this.locationMock2];
            this.refreshCalled = false;

            Mock.expect(this.contentMock, {
                'method': 'get',
                'args': ['resources'],
                returns: '/main/location/id'
            });

            this._initLocationMock(this.locationMock1, '43');
            this._initLocationMock(this.locationMock2, '42');

            this.view = new Y.eZ.LocationViewLocationsTabView({
                content: this.contentMock,
                container: '.container',
                locations: this.locations,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _initLocationMock: function (locationMock, locationId) {
            Mock.expect(locationMock, {
                'method': 'get',
                args: ['id'],
                returns: locationId
            });

            Mock.expect(locationMock, {
                'method': 'toJSON',
                returns: {}
            });
        },

        "Should trigger switchVisibility when tapping on the hide/reveal button": function () {
            var that = this,
                switchVisibilityFired = false;

            this.view.render();
            this.view.set('active', true);

            this.view.on('switchVisibility', function () {
                switchVisibilityFired = true;
            });

            this.view.get('container').one('.ez-locations-hidden-button').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(switchVisibilityFired, "switchVisibility should have been called");
                });
            });
            this.wait();
        },

        "Should provide the location to the `switchVisibility` event when tapping on the hide/reveal button": function () {
            var that = this,
                location = {},
                button;

            this.view.render();
            this.view.set('active', true);

            this.view.on('loadLocations', function () {
                that.refreshCalled = true;
            });

            this.view.on('switchVisibility', function (e) {
                location = e.location;
                e.callback(false);
            });

            button = this.view.get('container').one('.ez-locations-hidden-button');

            button.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.areSame(
                        that.locationMock2, location,
                        "Location object should identical (with id 42)"
                    );
                    Assert.isTrue(
                        button.get('disabled'),
                        "The button should have been disabled"
                    );
                    Assert.isTrue(
                        button.hasClass('is-switching-visibility'),
                        "The button should have the ez-locations-visibility-pending class"
                    );
                    Assert.isTrue(
                        that.refreshCalled,
                        "The location list should have been refreshed"
                    );
                });
            });
            this.wait();
        },

        "Should reactivate the button after error after tapping on the hide/reveal button": function () {
            var that = this,
                location = {},
                button;

            this.view.render();
            this.view.set('active', true);

            this.view.on('loadLocations', function () {
                that.refreshCalled = true;
            });

            this.view.on('switchVisibility', function (e) {
                location = e.location;
                e.callback(true);
            });

            button = this.view.get('container').one('.ez-locations-hidden-button');

            button.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.areSame(
                        that.locationMock2, location,
                        "Location object should identical (with id 42)"
                    );
                    Assert.isFalse(
                        button.get('disabled'),
                        "The button should have been re enabled"
                    );
                    Assert.isFalse(
                        button.hasClass('is-switching-visibility'),
                        "The class ez-locations-visibility-pending class should have been removed from the button"
                    );
                    Assert.isFalse(
                        that.refreshCalled,
                        "The location list should not be refreshed"
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
            this.resources = {
                MainLocation: '/main/location/id'
            };

            Mock.expect(this.contentMock, {
                'method': 'get',
                'args': ['resources'],
                returns: this.resources
            });

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

    setMainLocationTest = new Y.Test.Case({
        name: "eZ LocationViewLocationsTabView set main location test",
        setUp: function () {
            this.contentMock = new Mock();
            this.locations = [this.locationMock, this.locationMock];
            this.resources = {
                MainLocation: '/main/location/id'
            };

            Mock.expect(this.contentMock, {
                'method': 'get',
                'args': ['resources'],
                returns: this.resources
            });

            this.view = new Y.eZ.LocationViewLocationsTabView({
                content: this.contentMock,
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire `setMainLocation` event": function () {
            var eventFired = false,
                that = this,
                mainLocationRadio,
                newMainLocationId;

            this.view.render();

            mainLocationRadio = this.view.get('container').one('#ez-not-main-location-radio');
            newMainLocationId = mainLocationRadio.getAttribute('data-location-id');

            this.view.on('setMainLocation', function (e) {
                eventFired = true;

                Y.Assert.areEqual(
                    e.locationId,
                    newMainLocationId,
                    "The event facade should contain the location id"
                );
                Assert.isFunction(e.afterSetMainLocationCallback, 'The event facade should contain callback function');
            });

            mainLocationRadio.simulateGesture('tap', function () {
                that.resume(function (e) {
                    Y.Assert.isTrue(
                        eventFired,
                        "The `setMainLocation` event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should fire `loadLocations` event after changing main location": function () {
            var loadLocationsFired = false,
                that = this,
                mainLocationRadio,
                newMainLocationId;

            this.view.render();

            mainLocationRadio = this.view.get('container').one('#ez-not-main-location-radio');
            newMainLocationId = mainLocationRadio.getAttribute('data-location-id');

            this.view.on('setMainLocation', function (e) {
                e.afterSetMainLocationCallback();
            });
            this.view.on('loadLocations', function (e) {
                loadLocationsFired = true;

                Assert.areSame(
                    e.content,
                    that.contentMock,
                    'The event facade should contain the content'
                );
            });

            mainLocationRadio.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(
                        loadLocationsFired,
                        "The `loadLocations` event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should not fire `setMainLocation` event when clicking current main location radio": function () {
            var eventFired = false,
                that = this,
                mainLocationRadio,
                newMainLocationId;

            this.view.render();

            mainLocationRadio = this.view.get('container').one('#ez-main-location-radio');
            newMainLocationId = mainLocationRadio.getAttribute('data-location-id');

            this.view.on('setMainLocation', function (e) {
                eventFired = true;
            });

            mainLocationRadio.simulateGesture('tap', function () {
                that.resume(function (e) {
                    Y.Assert.isFalse(
                        eventFired,
                        "The `setMainLocation` event should not have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should disable set main location radio inputs after clicking one of them": function () {
            var that = this,
                mainLocationRadio,
                newMainLocationId;

            this.view.render();

            mainLocationRadio = this.view.get('container').one('#ez-not-main-location-radio');
            newMainLocationId = mainLocationRadio.getAttribute('data-location-id');

            mainLocationRadio.simulateGesture('tap', function () {
                that.resume(function () {
                    that.view.get('container').all('.ez-main-location-radio').each(function (radio) {
                        Assert.isTrue(
                            radio.get('disabled'),
                            "Radio input should be disabled"
                        );
                    });
                });
            });
            this.wait();
        },

        "Should enable set main location radio inputs after cancel confirm box question": function () {
            var that = this,
                mainLocationRadio,
                newMainLocationId;

            this.view.render();

            mainLocationRadio = this.view.get('container').one('#ez-not-main-location-radio');
            newMainLocationId = mainLocationRadio.getAttribute('data-location-id');

            this.view.on('setMainLocation', function (e) {
                e.cancelSetMainLocationCallback();
            });

            mainLocationRadio.simulateGesture('tap', function () {
                that.resume(function () {
                    that.view.get('container').all('.ez-main-location-radio').each(function (radio) {
                        Assert.isFalse(
                            radio.get('disabled'),
                            "Radio input should not be disabled"
                        );
                    });
                });
            });
            this.wait();
        }
    });

    removeLocationTest = new Y.Test.Case({
        name: "eZ LocationViewLocationsTabView remove location test",
        setUp: function () {
            this.contentMock = new Mock();
            this.mainLocationJSON = {id: '/main/location/id'};
            this.mainLocation = this._locationMock(this.mainLocationJSON);
            this.secondLocationJSON = {id: '/another/location/id'};
            this.secondLocation = this._locationMock(this.secondLocationJSON);
            this.locations = [this.mainLocation, this.secondLocation];
            this.resources = {
                MainLocation: this.mainLocationJSON.id
            };

            Mock.expect(this.contentMock, {
                'method': 'get',
                'args': ['resources'],
                returns: this.resources
            });

            this.view = new Y.eZ.LocationViewLocationsTabView({
                content: this.contentMock,
                container: '.container',
                locations: this.locations
            });
        },

        _locationMock: function (locationJSON) {
            var locationMock = new Mock();

            Mock.expect(locationMock, {
                method: 'get',
                args: ['id'],
                returns: locationJSON.id
            });
            Mock.expect(locationMock, {
                method: 'toJSON',
                args: [],
                returns: locationJSON
            });

            return locationMock;
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire `removeLocations` event": function () {
            var eventFired = false,
                that = this,
                locationCheckbox,
                locationIdForRemove,
                removeSelectedButton;

            this.view.render();

            removeSelectedButton = this.view.get('container').one('.ez-remove-locations-button');
            locationCheckbox = this.view.get('container').one('.ez-location-checkbox[data-main-location="0"]');
            locationCheckbox.set('checked', true);
            locationIdForRemove = locationCheckbox.getAttribute('data-location-id');

            this.view.on('removeLocations', function (e) {
                eventFired = true;

                Y.Assert.isArray(
                    e.locations,
                    "The event facade should contain array of location ids"
                );
                Assert.isFunction(e.afterRemoveLocationsCallback, 'The event facade should contain callback function');
            });

            removeSelectedButton.simulateGesture('tap', function () {
                that.resume(function (e) {
                    Y.Assert.isTrue(
                        eventFired,
                        "The `removeLocations` event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should fire `loadLocations` event after removing location": function () {
            var loadLocationsFired = false,
                that = this,
                locationCheckbox,
                locationIdForRemove,
                removeSelectedButton;

            this.view.render();

            removeSelectedButton = this.view.get('container').one('.ez-remove-locations-button');
            locationCheckbox = this.view.get('container').one('.ez-location-checkbox[data-main-location="0"]');
            locationCheckbox.set('checked', true);
            locationIdForRemove = locationCheckbox.getAttribute('data-location-id');

            this.view.on('removeLocations', function (e) {
                e.afterRemoveLocationsCallback(true);
            });
            this.view.on('loadLocations', function (e) {
                loadLocationsFired = true;

                Assert.areSame(
                    e.content,
                    that.contentMock,
                    'The event facade should contain the content'
                );
            });

            removeSelectedButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(
                        loadLocationsFired,
                        "The `loadLocations` event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should not fire `removeLocations` event if no location was selected": function () {
            var eventFired = false,
                that = this,
                removeSelectedButton;

            this.view.render();

            removeSelectedButton = this.view.get('container').one('.ez-remove-locations-button');

            this.view.on('removeLocations', function (e) {
                eventFired = true;
            });

            removeSelectedButton.simulateGesture('tap', function () {
                that.resume(function (e) {
                    Y.Assert.isFalse(
                        eventFired,
                        "The `removeLocations` event should not have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should disable locations' checkboxes after clicking `Remove selected` button": function () {
            var that = this,
                locationCheckbox,
                locationIdForRemove,
                removeSelectedButton;

            this.view.render();

            removeSelectedButton = this.view.get('container').one('.ez-remove-locations-button');
            locationCheckbox = this.view.get('container').one('.ez-location-checkbox[data-main-location="0"]');
            locationCheckbox.set('checked', true);
            locationIdForRemove = locationCheckbox.getAttribute('data-location-id');

            removeSelectedButton.simulateGesture('tap', function () {
                that.resume(function () {
                    that.view.get('container').all('.ez-location-checkbox').each(function (checkbox) {
                        Assert.isTrue(
                            checkbox.get('disabled'),
                            "Checkbox should be disabled"
                        );
                    });
                });
            });
            this.wait();
        },

        "Should enable locations' checkboxes after cancel confirm box question or if no location was removed": function () {
            var that = this,
                locationCheckbox,
                locationIdForRemove,
                removeSelectedButton;

            this.view.render();

            removeSelectedButton = this.view.get('container').one('.ez-remove-locations-button');
            locationCheckbox = this.view.get('container').one('.ez-location-checkbox[data-main-location="0"]');
            locationCheckbox.set('checked', true);
            locationIdForRemove = locationCheckbox.getAttribute('data-location-id');

            this.view.on('removeLocations', function (e) {
                e.afterRemoveLocationsCallback(false);
            });

            removeSelectedButton.simulateGesture('tap', function () {
                that.resume(function () {
                    that.view.get('container').all('.ez-location-checkbox').each(function (checkbox) {
                        if (checkbox.getAttribute('data-main-location') == 1) {
                            Assert.isTrue(
                                checkbox.get('disabled'),
                                "Checkbox of main location should be disabled"
                            );
                        } else {
                            Assert.isFalse(
                                checkbox.get('disabled'),
                                "Checkbox should not be disabled"
                            );
                        }
                    });
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
    Y.Test.Runner.add(fireSwitchVisibilityEventTest);
    Y.Test.Runner.add(addLocationTest);
    Y.Test.Runner.add(setMainLocationTest);
    Y.Test.Runner.add(removeLocationTest);
}, '', {requires: ['test', 'ez-locationviewlocationstabview', 'node-event-simulate']});

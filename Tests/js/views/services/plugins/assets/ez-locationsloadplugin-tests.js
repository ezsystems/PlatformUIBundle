/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationsloadplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Locations Load Plugin event tests",

        setUp: function () {
            this.capi = {};
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('locations', null);
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);
            this.location1Mock = new Mock();
            this.location2Mock = new Mock();
            this.locations = [this.location1Mock, this.location2Mock];
            this.content = new Mock();
            this.location = new Mock();

            Mock.expect(this.content, {
                method: 'loadLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    callback(false, this.locations);
                }
            });

            this.plugin = new Y.eZ.Plugin.LocationsLoad({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        _setupContentMock: function (error, locations) {
            Mock.expect(this.content, {
                method: 'loadLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.isUndefined(
                        options.location,
                        "Location should not be defined"
                    );

                    callback(error, locations);
                }
            });
        },

        "Should load locations on `loadLocations` event": function () {
            var that = this;

            this._setupContentMock(false, that.locations);

            this.view.fire('loadLocations', {
                content: that.content
            });

            Assert.areSame(
                this.locations,
                this.view.get('locations'),
                "The locations should be retrieved"
            );
            Assert.isFalse(
                this.view.get('loadingError'),
                "The error event should not be fired"
            );
        },

        _setupLocationLoadPathMock: function (error, locationMock) {
            Mock.expect(locationMock, {
                method: 'loadPath',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    callback(error, location);
                }
            });
        },

        "Should load locations with path on `loadLocations` event": function () {
            var that = this;

            this._setupLocationLoadPathMock(false, that.location1Mock);
            this._setupLocationLoadPathMock(false, that.location2Mock);
            this._setupContentMock(false, that.locations);

            this.view.fire('loadLocations', {
                content: that.content,
                loadPath: true
            });

            Assert.areSame(
                this.locations,
                this.view.get('locations'),
                "The locations should be retrieved"
            );
            Mock.verify(that.location1Mock);
            Mock.verify(that.location2Mock);

            Assert.isFalse(
                this.view.get('loadingError'),
                "The error event should not be fired"
            );
        },

        "Should handle loading errors": function () {
            var that = this;

            this._setupContentMock(true);

            this.view.fire('loadLocations', {
                content: that.content
            });

            Assert.isNull(
                this.view.get('locations'),
                "The locations should not be retrieved"
            );
            Assert.isTrue(
                this.view.get('loadingError'),
                "The error event should be fired"
            );
        },

        "Should handle error when loading location with path on `loadLocations` event": function () {
            var that = this;

            this._setupLocationLoadPathMock(true, that.location1Mock);
            this._setupLocationLoadPathMock(false, that.location2Mock);
            this._setupContentMock(false, that.locations);

            this.view.fire('loadLocations', {
                content: that.content,
                loadPath: true
            });

            Assert.isTrue(
                this.view.get('loadingError'),
                "The error event should be fired"
            );
            Mock.verify(that.location1Mock);
            Mock.verify(that.location2Mock);
        },

        "Should allow passing the location into options": function () {
            var that = this;

            Mock.expect(this.content, {
                method: 'loadLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.location,
                        options.location,
                        "Location should be provided in options"
                    );

                    callback(false, that.locations);
                }
            });

            this.view.fire('loadLocations', {
                content: that.content,
                location: that.location,
            });

            Assert.areSame(
                this.locations,
                this.view.get('locations'),
                "The locations should be retrieved"
            );

            Assert.isFalse(
                this.view.get('loadingError'),
                "The error event should not be fired"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LocationsLoad;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Locations Load Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-locationsloadplugin', 'ez-pluginregister-tests']});

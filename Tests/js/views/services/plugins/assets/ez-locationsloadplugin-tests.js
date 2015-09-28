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
            this.locations = [{id: 'Location 1'},{id: 'Location 2'}];

            this.content = new Mock();
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

        "Should load locations on `loadLocations` event": function () {
            var that = this;

            Mock.expect(this.content, {
                method: 'loadLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    callback(false, that.locations);
                }
            });

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

        "Should handle loading errors": function () {
            var that = this;

            Mock.expect(this.content, {
                method: 'loadLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    callback(true);
                }
            });

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
        }
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LocationsLoad;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Locations Load Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-locationsloadplugin', 'ez-pluginregister-tests']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerurlhelpersplugin-tests', function (Y) {
    var pluginTest, registerTest,
        pathHelperTest, assetHelperTest,
        Assert = Y.Assert, Mock = Y.Mock;

    pluginTest = new Y.Test.Case({
        name: "eZ Register Partials Plugin test",

        setUp: function () {
            this.app = new Y.Mock();
            this.plugin = new Y.eZ.Plugin.RegisterUrlHelpers({
                host: this.app
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        _assetHelperRegistered: function (name) {
            Y.Assert.isFunction(
                Y.Handlebars.helpers[name],
                "The helper '" + name + "' should be registered"
            );
        },

        "Should register the 'path' helper": function () {
            this._assetHelperRegistered('path');
        },

        "Should register the 'asset' helper": function () {
            this._assetHelperRegistered('asset');
        },
    });

    pathHelperTest = new Y.Test.Case({
        name: "eZ Register Partials Plugin path helper test",

        setUp: function () {
            this.routeName = 'testRouteName';
            this.params = {'id': 1};
            this.resultUri = '/uri/1/42';
            this.routing = window.Routing = new Mock();
            this.plugin = new Y.eZ.Plugin.RegisterUrlHelpers({
                host: {},
            });

            Mock.expect(this.routing, {
                method: 'generate',
                args: [this.routeName, Mock.Value.Object],
                run: Y.bind(function (routeName, p) {
                    Assert.areSame(
                        this.params, p,
                        "The 'params' parameter of 'path' should be passed to routeUri"
                    );
                    return this.resultUri;
                }, this),
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
            delete window.Routing;
        },

        "Should build the path using app routeUri method": function () {
            Y.Assert.areEqual(
                this.resultUri,
                Y.Handlebars.helpers.path(this.routeName, {hash: this.params}),
                "'path' should return the routeUri result"
            );
            Mock.verify(this.routing);
        },

        "Should accept the route params as hash": function () {
            Y.Assert.areEqual(
                this.resultUri,
                Y.Handlebars.helpers.path(this.routeName, this.params, {hash: {}}),
                "'path' should return the routeUri result"
            );
            Mock.verify(this.routing);
        },
    });

    assetHelperTest = new Y.Test.Case({
        name: "eZ Register Partials Plugin asset helper test",

        setUp: function () {
            this.webRootDir = "/webroot/dir/";
            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['assetRoot'],
                returns: this.webRootDir
            });
            this.plugin = new Y.eZ.Plugin.RegisterUrlHelpers({
                host: this.app
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        "Should handle an empty uri": function () {
            Assert.areEqual(
                this.webRootDir,
                Y.Handlebars.helpers.asset("")
            );
        },

        "Should trim the end slashes from the asset root": function () {
            var normalRootDir = this.webRootDir;

            this.webRootDir = normalRootDir + '////';

            Y.Assert.areEqual(
                normalRootDir + "img.png",
                Y.Handlebars.helpers.asset("img.png"),
                "asset should trim the slashes from the asset root"
            );
        },

        "Should trim the starting slashes from the uri": function () {
            var uri = 'img.png';

            Assert.areEqual(
                this.webRootDir + uri,
                Y.Handlebars.helpers.asset("///" + uri),
                "asset should trim the slashes from the asset URI"
            );
        },

        "Should add the missing slash": function () {
            this.webRootDir = '/webroot/dir';

            Y.Assert.areEqual(
                this.webRootDir + "/img.png",
                Y.Handlebars.helpers.asset("img.png"),
                "asset should add the slash"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.RegisterUrlHelpers;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Register Url Helpers Plugin tests");
    Y.Test.Runner.add(pluginTest);
    Y.Test.Runner.add(pathHelperTest);
    Y.Test.Runner.add(assetHelperTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'handlebars', 'ez-registerurlhelpersplugin', 'ez-pluginregister-tests']});

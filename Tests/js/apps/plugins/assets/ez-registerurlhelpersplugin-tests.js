/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerurlhelpersplugin-tests', function (Y) {
    var pluginTest, registerTest,
        pathHelperTest, assetHelperTest,
        Assert = Y.Assert;

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
            this.app = new Y.Mock();
            this.plugin = new Y.eZ.Plugin.RegisterUrlHelpers({
                host: this.app
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        "Should build the path using app routeUri method": function () {
            var name = 'testRouteName', params = {'id': 1},
                resUri = '#/uri/1/42';

            Y.Mock.expect(this.app, {
                method: 'routeUri',
                args: [name, Y.Mock.Value.Object],
                run: function (routeName, p) {
                    Assert.areSame(
                        params, p,
                        "The 'params' parameter of 'path' should be passed to routeUri"
                    );
                    return resUri;
                }
            });
            Y.Assert.areEqual(
                resUri,
                Y.Handlebars.helpers.path(name, {hash: params}),
                "'path' should return the routeUri result"
            );
            Y.Mock.verify(this.app);
        },

        "Should accept the route params as hash": function () {
            var name = 'testRouteName', params = {'id': 1},
                resUri = '#/uri/1/42';

            Y.Mock.expect(this.app, {
                method: 'routeUri',
                args: [name, Y.Mock.Value.Object],
                run: function (routeName, p) {
                    Assert.areSame(
                        params, p,
                        "The 'params' parameter of 'path' should be passed to routeUri"
                    );
                    return resUri;
                }
            });
            Y.Assert.areEqual(
                resUri,
                Y.Handlebars.helpers.path(name, params, {hash: {}}),
                "'path' should return the routeUri result"
            );
            Y.Mock.verify(this.app);
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

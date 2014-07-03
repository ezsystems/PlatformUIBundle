/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-app-extension-tests', function (Y) {
    var extTest, assertSameObject;

    assertSameObject = function (obj1, obj2, msg) {
        Y.Assert.areEqual(
            Y.Object.keys(obj1).length, Y.Object.keys(obj2).length, msg
        );

        Y.Object.each(obj1, function (val, key) {
            Y.Assert.areSame(
                obj1[key], obj2[key], msg
            );
        });
    };

    extTest = new Y.Test.Case({
        name: "eZ App Extension tests",

        setUp: function () {
            this.existingView = {type: function () {}};
            this.app = new Y.Mock();
            this.app.views = {'existingView': this.existingView};

            this.routes = [{
                name: 'testRoute1',
                path: '/test/path/1/',
                callback: function () {}
            }, {
                name: 'testRoute2',
                path: '/test/path/2/',
                callback: function () {}
            }];

            this.views = {
                newView1: {
                    type: function () {}
                },
                newView2: {
                    type: function () {}
                },
            };
        },

        tearDown: function () {
            delete this.app;
        },

        "Extension should add views to the application": function () {
            var Ext = Y.Base.create('testExt', Y.eZ.AppExtension, [], {}, {
                    ATTRS: {
                        views: {value: this.views}
                    }
                }),
                inst;

            inst = new Ext();
            inst.extend(this.app);


            Y.Object.each(this.views, function (view, key) {
                Y.Assert.isNotUndefined(
                    this.app.views[key],
                    "The view '" + key + "' should have been added"
                );
                assertSameObject(view, this.app.views[key], "The view '" + key + "' should have been added");
            }, this);

            assertSameObject(
                this.existingView, this.app.views.existingView,
                "The existing view should be kept intact"
            );
        },

        "Extension should add routes to the application": function () {
            var Ext = Y.Base.create('testExt', Y.eZ.AppExtension, [], {}, {
                    ATTRS: {
                        routes: {value: this.routes}
                    }
                }),
                calls = 0,
                inst, that = this;

            Y.Mock.expect(this.app, {
                method: 'route',
                callCount: this.routes.length,
                args: [Y.Mock.Value.Object],
                run: function (route) {
                    assertSameObject(that.routes[calls], route, "The route should be kept intact");
                    calls++;
                }
            });

            inst = new Ext();
            inst.extend(this.app);

            Y.Mock.verify(this.app);
        },
    });

    Y.Test.Runner.setName("eZ App Extension tests");
    Y.Test.Runner.add(extTest);

}, '', {requires: ['test', 'ez-app-extension']});

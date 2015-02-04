/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationitemsubtreeview-tests', function (Y) {
    var viewTest,
        matchTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Navigation Item Subtree View test",

        setUp: function () {
            this.title = "Title";
            this.route = {
                name: "viewLocation",
                params: {
                    id: 42,
                }
            };
            this.view = new Y.eZ.NavigationItemSubtreeView({
                title: this.title,
                route: this.route,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should use the navigation item view template": function () {
            this.view.render();

            Assert.areEqual(
                Y.one('#navigationitemview-ez-template').get('text'),
                this.view.get('container').get('text')
            );
        },
    });

    matchTest = new Y.Test.Case({
        name: "eZ Navigation Item View match test",

        setUp: function () {
            this.routeName = 'viewLocation';
            this.locationId = '/2/42/4242';
            this.route = {
                name: this.routeName,
                params: {
                    id: this.locationId,
                }
            };
            this.view = new Y.eZ.NavigationItemSubtreeView({
                route: this.route,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should match with the same route": function () {
            var route = {
                    name: this.routeName,
                    parameters: {
                        id: this.locationId,
                    }
                };
            Assert.isTrue(
                this.view.matchRoute(route),
                "The navigation item should match"
            );
        },

        "Should not match with a different route": function () {
            Assert.isFalse(
                this.view.matchRoute({name: this.routeName + 'a different route'}),
                "The navigation item should match"
            );
        },

        "Should match with a route pointing to a subitem": function () {
            var route = {
                    name: this.routeName,
                    parameters: {
                        id: this.locationId + '/4242424',
                    },
                };
            Assert.isTrue(
                this.view.matchRoute(route),
                "The navigation item should match"
            );
        },

        "Should not match with a route pointing to a different subtree": function () {
            var route = {
                    name: this.routeName,
                    parameters: {
                        id: '/2/43/42',
                    },
                };
            Assert.isFalse(
                this.view.matchRoute(route),
                "The navigation item should match"
            );
        },
    });

    Y.Test.Runner.setName("eZ Navigation Item View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(matchTest);
}, '', {requires: ['test', 'ez-navigationitemsubtreeview']});

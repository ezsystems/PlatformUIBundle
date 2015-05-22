/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationitemparameterview-tests', function (Y) {
    var viewTest,
        matchTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Navigation Item Parameter View test",

        setUp: function () {
            this.title = "Title";
            this.route = {
                name: "viewLocation",
                params: {
                    id: 42,
                    languageCode: 'eng-GB',
                }
            };
            this.view = new Y.eZ.NavigationItemParameterView({
                title: this.title,
                route: this.route,
                matchParameter: 'wedontcarehere',
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
        name: "eZ Navigation Item Parameter View match test",

        setUp: function () {
            this.routeName = 'viewLocation';
            this.locationId = 42;
            this.route = {
                name: this.routeName,
                params: {
                    id: this.locationId,
                    languageCode: 'eng-GB',
                }
            };
            this.view = new Y.eZ.NavigationItemParameterView({
                route: this.route,
                matchParameter: 'id',
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should not match with a different route": function () {
            Assert.isFalse(
                this.view.matchRoute({name: this.routeName + 'a different route'}),
                "The navigation item should not match"
            );
        },

        "Should not match (no `matchParameter` parameter in the route)": function () {
            Assert.isFalse(
                this.view.matchRoute({name: this.routeName, parameters: {}}),
                "The navigation item should not match"
            );
        },

        "Should not match (wrong value in the `matchParameter` parameter)": function () {
            Assert.isFalse(
                this.view.matchRoute({name: this.routeName, parameters: {id: this.locationId+1}}),
                "The navigation item should not match"
            );
        },

        "Should match": function () {
            Assert.isTrue(
                this.view.matchRoute({name: this.routeName, parameters: {id: this.locationId}}),
                "The navigation item should match"
            );
        },
    });

    Y.Test.Runner.setName("eZ Navigation Item Parameter View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(matchTest);
}, '', {requires: ['test', 'ez-navigationitemparameterview']});

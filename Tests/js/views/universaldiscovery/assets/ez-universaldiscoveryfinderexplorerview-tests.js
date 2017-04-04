/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderexplorerview-tests', function (Y) {
    var resetTest, renderTest, activeTest, navigateTest,
        startingLocationChangeTest,
        Assert = Y.Assert, Mock = Y.Mock;

    resetTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer reset tests',

        setUp: function () {
            this.levelView1 = new Mock();
            this.levelView2 = new Mock();
            this.levelViews = [this.levelView1, this.levelView2];
            Mock.expect(this.levelView1, {
                method: 'destroy',
                args: [Mock.Value.Object],
                run: function (arg) {
                    Assert.isTrue(
                        arg.remove,
                        "destroy method should be called with remove to true"
                    );
                }
            });
            Mock.expect(this.levelView2, {
                method: 'destroy',
                args: [Mock.Value.Object],
                run: function (arg) {
                    Assert.isTrue(
                        arg.remove,
                        "destroy method should be called with remove to true"
                    );
                }
            });
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerView({
                levelViews: this.levelViews,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.levelViews;
            delete this.levelView1;
            delete this.levelView2;
        },

        "Should keep destroy the level views": function () {
            this.view.reset();
            Mock.verify(this.levelView1);
            Mock.verify(this.levelView2);
            Assert.areSame(
                this.view.get('levelViews').length,
                0,
                "The levelViews attribute should be empty"
            );
        },
    });

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer render tests',

        setUp: function () {
            var that = this,
                LevelView;

            this.levelViewRendered = false;
            LevelView = Y.Base.create('levelView', Y.View, [], {
                render: function () {
                    that.levelViewRendered = true;
                    return this;
                },
            });
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerView({
                levelViews: [new LevelView()],
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should use the template": function () {
            var origTpl = this.view.template,
                templateCalled = false;

            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();

            Assert.isTrue(
                templateCalled, "The template should have been used to render the view"
            );
        },

        "Should render the levelView": function () {
            var container = this.view.get('container'),
                levelViewContainer = this.view.get('levelViews')[0].get('container');

            this.view.render();

            Assert.isTrue(this.levelViewRendered, "The levelView should have been rendered");

            Assert.isTrue(
                container.contains(levelViewContainer),
                "The rendered levelView should be added to the finder explorer view"
            );
        },
    });

    activeTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer active tests',

        setUp: function () {
            Y.eZ.UniversalDiscoveryFinderExplorerLevelView = Y.Base.create('levelView', Y.View, [], {});
            this.levelViews = [new Y.eZ.UniversalDiscoveryFinderExplorerLevelView()];
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerView({
                levelViews: this.levelViews,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoveryFinderExplorerLevelView;
        },

        "Should activate the levelViews when the explorer view get active": function () {
            this.view.set('active', true);

            Y.Array.each(this.levelViews, function (levelView) {
                Assert.isTrue(
                    levelView.get('active'),
                    "The levelView should be active"
                );
            });
        },

        "Should activate the levelViews when the explorer view wakeUp": function () {
            this.view.set('active', true);

            Y.Array.each(this.levelViews, Y.bind(function (levelView) {
                levelView.set('active', false);
                this.view.wakeUp();
                Assert.isTrue(
                    levelView.get('active'),
                    "The levelView should be active"
                );
            }, this));
        },
    });

    navigateTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer navigate tests',

        setUp: function () {
            this.childCount = 0;
            this.location = new Mock();
            Mock.expect(this.location, {
                method: 'get',
                args: ['childCount'],
                returns: this.childCount
            });
            Y.eZ.UniversalDiscoveryFinderExplorerLevelView = Y.Base.create('levelView', Y.View, [], {
                render: function () {
                    this.set('rendered', true);
                    return this;
                },
                displayLevelView: function () {
                    this.set('scrolled', true);
                },
            });
            this.levelView1 = new Y.eZ.UniversalDiscoveryFinderExplorerLevelView();
            this.levelView2 = new Y.eZ.UniversalDiscoveryFinderExplorerLevelView();
            this.levelViews = [this.levelView1, this.levelView2];
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerView({
                levelViews: this.levelViews,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoveryFinderExplorerLevelView;
        },

        "Should add a levelView if the location explored is having children": function () {
            this.childCount = 1;

            Mock.expect(this.location, {
                method: 'get',
                args: ['childCount'],
                returns: this.childCount
            });


            this.view.render();
            this.view.set('active', true);
            this.view.fire('explorerNavigate', {location: this.location, depth: 2});

            Assert.areSame(
                this.view.get('levelViews')[this.view.get('levelViews').length - 1].get('parentLocation'),
                this.location,
                "The new levelView should get the location"
            );
            Assert.areSame(
                this.view.get('levelViews')[this.view.get('levelViews').length - 1].get('depth'),
                this.view.get('levelViews').length,
                "The new levelView should get have a depth"
            );
            Assert.isTrue(
                this.view.get('levelViews')[this.view.get('levelViews').length - 1].get('active'),
                "The new levelView should be active"
            );
            Assert.isTrue(
                this.view.get('levelViews')[this.view.get('levelViews').length - 1].get('rendered'),
                "The new levelView should be rendered"
            );
            Assert.isTrue(
                this.view.get('levelViews')[this.view.get('levelViews').length - 1].get('scrolled'),
                "Should have scrolled to the new level view"
            );
            Assert.isFalse(
                this.view.get('levelViews')[this.view.get('levelViews').length - 3].get('ownSelectedItem'),
                "The previous level view should not have the selected item anymore"
            );
        },

        "Should remove levelViews that are deeper than the one to explore on explorerNavigate": function () {
            var startingLevelViewLength = this.levelViews.length,
                exploredLevelDepth = 1;

            this.view.render();
            this.view.fire('explorerNavigate', {location: this.location, depth: exploredLevelDepth});

            Assert.areSame(
                this.view.get('levelViews').length,
                startingLevelViewLength - exploredLevelDepth,
                "There should remain only one levelView"
            );
        },
    });

    startingLocationChangeTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer startingLocationChange tests',

        setUp: function () {
            var LevelView;

            LevelView = Y.Base.create('levelView', Y.View, [], {
                displayLevelView: function () {
                },
            });
            this.initialLevelView = new Mock(new Y.View());
            this.virtualRootLocation = new Y.Base();
            this.virtualRootLocation.set('childCount', 4);
            Mock.expect(this.initialLevelView, {
                method: 'destroy',
                args: [Mock.Value.Object],
                run: function (option) {
                    Assert.isTrue(
                        option.remove,
                        "The remove option should be set to true"
                    );
                }
            });
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerView({
                levelViews: [this.initialLevelView],
                virtualRootLocation: this.virtualRootLocation,
                levelViewConstructor: LevelView,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should destroy existing level views": function () {
            this.view.set('startingLocation', false);

            Mock.verify(this.initialLevelView);
        },

        "Should create a level view for the virtualRoot children": function () {
            var levelView;

            this.view.set('startingLocation', false);

            Assert.areEqual(
                1, this.view.get('levelViews').length,
                "A level views should have been added"
            );
            levelView = this.view.get('levelViews')[0];
            Assert.areNotSame(
                this.initialLevelView, levelView,
                "A new level view should have been created"
            );
            Assert.areSame(
                this.virtualRootLocation, levelView.get('parentLocation'),
                "The parent Location of the level view should be the virtual root"
            );
            Assert.isUndefined(
                levelView.get('selectLocationId'),
                "The selected Location id should be undefined"
            );
        },

        _getStartingLocation: function (locationId, childCount, path) {
            var location = new Y.Base();

            location.set('locationId', locationId);
            location.set('childCount', childCount);
            location.set('path', path);

            return location;
        },

        "Should create a levelView for the virtualRoot and select the starting Location": function () {
            var levelView,
                locationId = 42;

            this.view.set('startingLocation', this._getStartingLocation(locationId, 0, []));

            Assert.areEqual(
                1, this.view.get('levelViews').length,
                "A level views should have been added"
            );
            levelView = this.view.get('levelViews')[0];
            Assert.areNotSame(
                this.initialLevelView, levelView,
                "A new level view should have been created"
            );
            Assert.areSame(
                this.virtualRootLocation, levelView.get('parentLocation'),
                "The parent Location of the level view should be the virtual root"
            );
            Assert.areEqual(
                locationId,
                levelView.get('selectLocationId'),
                "The selected Location id should be the starting Location id"
            );
        },

        "Should create 2 level views": function () {
            var rootLevelView,
                locationLevelView,
                locationId = 42,
                location = this._getStartingLocation(locationId, 1, []);

            this.view.set('startingLocation', location);

            Assert.areEqual(
                2, this.view.get('levelViews').length,
                "2 level views should have been created"
            );
            rootLevelView = this.view.get('levelViews')[0];
            locationLevelView = this.view.get('levelViews')[1];
            Assert.areSame(
                this.virtualRootLocation, rootLevelView.get('parentLocation'),
                "The parent Location should be the virtual root"
            );
            Assert.areEqual(
                locationId,
                rootLevelView.get('selectLocationId'),
                "The selected Location id should be the id of the startingLocationId"
            );
            Assert.areSame(
                location, locationLevelView.get('parentLocation'),
                "The parent Location should be the starting Location"
            );
            Assert.isUndefined(
                locationLevelView.get('selectLocationId'),
                "The selected Location id should be undefined"
            );
        },

        _configureThreeLevelViewsSetup: function () {
            this.locationId = 42;
            this.pathLocationId = 43;
            this.pathLocation = this._getStartingLocation(this.pathLocationId, 1, []);
            this.location = this._getStartingLocation(this.locationId, 1, [this.pathLocation]);
        },

        "Should create 3 level views": function () {
            var rootLevelView,
                pathLevelView,
                locationLevelView;

            this._configureThreeLevelViewsSetup();

            this.view.set('startingLocation', this.location);

            Assert.areEqual(
                3, this.view.get('levelViews').length,
                "3 level views should have been created"
            );

            rootLevelView = this.view.get('levelViews')[0];
            pathLevelView = this.view.get('levelViews')[1];
            locationLevelView = this.view.get('levelViews')[2];
            Assert.areSame(
                this.virtualRootLocation, rootLevelView.get('parentLocation'),
                "The parent Location should be the virtual root"
            );
            Assert.areEqual(
                this.pathLocationId,
                rootLevelView.get('selectLocationId'),
                "The selected Location id should be the id of the location in the path"
            );
            Assert.areSame(
                this.pathLocation, pathLevelView.get('parentLocation'),
                "The parent Location should be the path Location"
            );
            Assert.areEqual(
                this.locationId, pathLevelView.get('selectLocationId'),
                "The selected Location id should the id of the starting Location"
            );
            Assert.areSame(
                this.location, locationLevelView.get('parentLocation'),
                "The parent Location should be the starting Location"
            );
            Assert.isUndefined(
                locationLevelView.get('selectLocationId'),
                "The selected Location id should be undefined"
            );
        },

        "Should disable the first level view if discoverRootDepth is one": function () {
            var rootLevelView;

            this._configureThreeLevelViewsSetup();

            this.view.set('minDiscoverDepth', 1);
            this.view.set('startingLocation', this.location);


            Assert.areEqual(
                3, this.view.get('levelViews').length,
                "3 level views should have been created"
            );

            rootLevelView = this.view.get('levelViews')[0];

            Assert.isTrue(
                rootLevelView.get('disabled'),
                'The root level view should be disabled'
            );
        },

        "Should disable the first level view if discoverRootDepth is two": function () {
            var rootLevelView,
                pathLevelView;

            this._configureThreeLevelViewsSetup();

            this.view.set('minDiscoverDepth', 2);
            this.view.set('startingLocation', this.location);


            Assert.areEqual(
                3, this.view.get('levelViews').length,
                "3 level views should have been created"
            );

            rootLevelView = this.view.get('levelViews')[0];
            pathLevelView = this.view.get('levelViews')[1];

            Assert.isTrue(
                rootLevelView.get('disabled'),
                'The root level view should be disabled'
            );
            Assert.isTrue(
                pathLevelView.get('disabled'),
                'The path level view should be disabled'
            );
        },

        "Should prevent rebuilding the same level views": function () {
            var rootLevelView,
                locationLevelView,
                locationId = 42,
                location = this._getStartingLocation(locationId, 1, []);

            this.view.set('startingLocation', location);
            rootLevelView = this.view.get('levelViews')[0];
            locationLevelView = this.view.get('levelViews')[1];
            this.view.set('startingLocation', location);

            Assert.areSame(
                rootLevelView, this.view.get('levelViews')[0],
                "The level views should have been kept"
            );
            Assert.areSame(
                locationLevelView, this.view.get('levelViews')[1],
                "The level views should have been kept"
            );
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Finder Explorer View tests");
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(activeTest);
    Y.Test.Runner.add(navigateTest);
    Y.Test.Runner.add(startingLocationChangeTest);
}, '', {requires: ['test', 'base', 'view', 'ez-universaldiscoveryfinderexplorerview']});

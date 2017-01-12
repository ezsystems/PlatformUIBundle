/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderexplorerview-tests', function (Y) {
    var resetTest, defaultSubViewTest, renderTest, activeTest, navigateTest,
        Assert = Y.Assert, Mock = Y.Mock;

    resetTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer reset tests',

        setUp: function () {
            this.levelView1 = new Mock();
            this.levelView2 = new Mock();
            this.levelViews = [this.levelView1, this.levelView2];
            Mock.expect(this.levelView1, {
                method: 'reset',
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

        "Should keep the first levelViews and destroy the others": function () {
            this.view.reset();
            Mock.verify(this.levelView1);
            Assert.areSame(
                this.view.get('levelViews').length,
                1,
                "There should remain only one levelView"
            );
        },
    });

    defaultSubViewTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer default sub views tests',

        setUp: function () {
            Y.eZ.UniversalDiscoveryFinderExplorerLevelView = Y.Base.create('ExplorerLevelView', Y.View, [], {});
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoveryFinderExplorerLevelView;
        },

        "levelView should have an instance of eZ.UniversalDiscoveryFinderExplorerLevelView": function () {
            Y.Array.each(this.view.get('levelViews'), function (levelView) {
                Assert.isInstanceOf(
                    Y.eZ.UniversalDiscoveryFinderExplorerLevelView, levelView,
                    "The levelViews attribute value should have an instance of eZ.UniversalDiscoveryFinderExplorerLevelView"
                );
            });
        },

        "Should be a bubble target of the levelViews": function () {
            var bubble = false;

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            this.view.get('levelViews')[0].fire('whatever');
            Assert.isTrue(bubble, "The event should bubble to the finder explorer view");
        },

    });

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer render tests',

        setUp: function () {
            var that = this;

            this.levelViewRendered = false;
            Y.eZ.UniversalDiscoveryFinderExplorerLevelView = Y.Base.create('levelView', Y.View, [], {
                render: function () {
                    that.levelViewRendered = true;
                    return this;
                },
            });
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoveryFinderExplorerLevelView;
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
                }
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

    Y.Test.Runner.setName("eZ Universal Discovery Finder Explorer View tests");
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(defaultSubViewTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(activeTest);
    Y.Test.Runner.add(navigateTest);
    
}, '', {requires: ['test', 'view', 'ez-universaldiscoveryfinderexplorerview']});

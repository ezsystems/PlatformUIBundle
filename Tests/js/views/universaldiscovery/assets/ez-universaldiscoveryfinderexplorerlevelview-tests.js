/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderexplorerlevelview-tests', function (Y) {
    var renderTest, activeTest, searchResultChangeTest, navigateTest,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer render tests',

        setUp: function () {
            this.items = {};
            this.parentLocationMock = new Mock();
            this.locationId = 0;
            Mock.expect(this.parentLocationMock, {
                method: 'get',
                args: ['locationId'],
                returns: this.locationId,
            });
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerLevelView({
                container: '.container', 
                items: this.items, 
                parentLocation: this.parentLocationMock
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

        "Should render the view when the items attribute changes": function () {
            var that = this,
                templateCalled = false,
                origTpl = this.view.template;


            this.view.template = function (variables) {

                templateCalled = true;

                Assert.isArray(variables.items, 'items should be an array');
                Assert.areSame(
                    that.view.get('loadingError'),
                    variables.loadingError,
                    "loadingError should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.set('items', this.items);

            Assert.isTrue(templateCalled, "The template has been called");
        },

        "Should render the view when the loadingError attribute changes": function () {
            var that = this,
                templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function (variables) {
                templateCalled = true;
                Assert.areSame(
                    that.view.get('loadingError'),
                    variables.loadingError,
                    "loadingError should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };

            this.view.set('loadingError', true);

            Y.Assert.isTrue(templateCalled, "The template has been called");
        },

        "Should try to reload the content when tapping on the retry button": function () {
            this.view.render();
            this.view.set('active', true);
            this.view.set('loadingError', true);
            this.view.on('locationSearch', this.next(function () {
                Assert.isNull(
                    this.view.get('items'),
                    "The `items` attribute should be resetted to null"
                );
                Assert.isFalse(
                    this.view.get('loadingError'),
                    "The `loadingError` attribute should be resetted to false"
                );
            }, this));

            this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap');
            this.wait();
        },
        
        "Test available variables in the template": function () {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 3 variables");
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    activeTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer active tests',

        setUp: function () {
            this.parentLocationMock = new Mock();
            this.locationId =  42;
            Mock.expect(this.parentLocationMock, {
                method: 'get',
                args: ['locationId'],
                returns: this.locationId,
            });
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerLevelView({parentLocation: this.parentLocationMock});
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire locationSearch": function () {
            var locationSearchFired = false;

            this.view.on('*:locationSearch', function () {
               locationSearchFired = true;
            });
            this.view.set('active', true);
             Assert.isTrue(locationSearchFired, 'locationSearch should have been fired');
        },
    });

    navigateTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer navigate tests',

        setUp: function () {
            this.contentInfo = new Mock();
            this.location = new Mock();
            this.contentType = new Mock();
            this.content = new Mock();
            this.locationId = 02;
            this.contentJson = {};
            this.locationJson = {locationId: this.locationId};
            this.contentInfoJson = {};
            this.contentTypeJson = {};
            Mock.expect(this.location, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: Y.bind(function (arg) {
                    if (arg === 'contentInfo') {
                        return this.contentInfo;
                    } else if (arg === 'locationId') {
                        return this.locationId;
                    }
                }, this)
            });
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJson,
            });
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.contentJson,
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.contentTypeJson,
            });
            Mock.expect(this.contentInfo, {
                method: 'toJSON',
                returns: this.contentInfoJson,
            });
            this.result = {location: this.location, contentType: this.contentType, content: this.content};
            this.searchResult = [this.result];
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerLevelView({
                container: '.container',
                depth: 999,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire explorerNavigate on tap on an explorer level item": function () {
            var locationFound = false;

            this.view.set('searchResultList', this.searchResult);
            this.view.on('explorerNavigate', this.next(function (e) {
                Y.Array.each(this.view.get('items'), function (item) {
                    if (item.location.get('locationId') == this.locationId) {
                        locationFound = true;
                        Assert.areSame(e.data, item, 'explorerNavigate should have a data attribute');
                        Assert.areSame(e.location, item.location, 'explorerNavigate should have a location attribute');
                        Assert.areSame(e.depth, this.view.get('depth'), 'explorerNavigate should have a depth attribute');
                    }
                }, this);
                Assert.isTrue(locationFound, 'An item locationId should match the node locationId data attribute');
            }, this));
            this.view.get('container').one('.ez-explorer-level-item').simulateGesture('tap');
            this.wait();
        },

        "Should NOT fire explorerNavigate on tap on an explorer level item if no item match nodeLocationId": function () {
            var fireExplorerNavigate = false;

            this.locationId = 86;
            this.view.set('searchResultList', this.searchResult);
            this.view.on('explorerNavigate', function (e) {
                fireExplorerNavigate = true;
            }, this);
            this.view.get('container').one('.ez-explorer-level-item').simulateGesture('tap', Y.bind(function () {
                this.resume(function () {
                    Assert.isFalse(fireExplorerNavigate, "Should not fire explorer navigate");
                });
            }, this));
            this.wait();
        },

        "Should NOT fire explorerNavigate on tap on an explorer level item if it is already selected": function () {
            var fireExplorerNavigate = false;

            this["Should fire explorerNavigate on tap on an explorer level item"]();

            this.view.set('searchResultList', this.searchResult);
            this.view.on('explorerNavigate', function (e) {
                fireExplorerNavigate = true;
            }, this);
            this.view.get('container').one('.ez-explorer-level-item').simulateGesture('tap', Y.bind(function () {
                this.resume(function () {
                    Assert.isFalse(fireExplorerNavigate, "Should not fire explorer navigate");
                });
            }, this));
            this.wait();
        },
    });
    
    searchResultChangeTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer search result change tests',

        setUp: function () {
            this.contentInfo = new Mock();
            this.location = new Mock();
            this.contentType = new Mock();
            this.content = new Mock();
            this.locationId = 0;
            this.contentJson = {};
            this.locationJson = {};
            this.contentInfoJson = {};
            this.contentTypeJson = {};
            Mock.expect(this.location, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: Y.bind(function (arg) {
                    if (arg === 'contentInfo') {
                        return this.contentInfo;
                    } else if (arg === 'locationId') {
                        return this.locationId;
                    }
                }, this)
            });
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJson,
            });
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.contentJson,
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.contentTypeJson,
            });
            Mock.expect(this.contentInfo, {
                method: 'toJSON',
                returns: this.contentInfoJson,
            });
            this.result = {location: this.location, contentType: this.contentType, content: this.content};
            this.searchResult = [this.result];
            this.view = new Y.eZ.UniversalDiscoveryFinderExplorerLevelView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should update items": function () {
           this.view.set('searchResultList', this.searchResult);

            Assert.areSame(this.view.get('items')[0].location, this.result.location, 'item should have a location');
            Assert.areSame(this.view.get('items')[0].content, this.result.content, 'item should have a location');
            Assert.areSame(this.view.get('items')[0].contentType, this.result.contentType, 'item should have a location');
            Assert.areSame(this.view.get('items')[0].contentInfo, this.result.location.get('contentInfo'), 'item should have a location');
        },
    });


    Y.Test.Runner.setName("eZ Universal Discovery Finder Explorer Level View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(activeTest);
    Y.Test.Runner.add(navigateTest);
    Y.Test.Runner.add(searchResultChangeTest);


}, '', {requires: ['test', 'view', 'ez-universaldiscoveryfinderexplorerlevelview', 'node-event-simulate']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderexplorerlevelview-tests', function (Y) {
    var renderTest, activeTest, searchResultChangeTest, navigateTest, scrollTest,
        removeHighlightTest, loadMoreItemsTest, resetTest, disabledTest,
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
                    "The `items` attribute should be null"
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
                Y.Assert.areEqual(2, Y.Object.keys(variables).length, "The template should receive 2 variables");
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

    var _fullLevelViewSetup = function (context, ownSelectedItem, disabled) {
        context.contentInfo = new Mock();
        context.location = new Mock();
        context.contentType = new Mock();
        context.content = new Mock();
        context.parentLocationMock = new Mock();
        context.locationId = 2;
        context.contentJson = {};
        context.locationJson = {locationId: context.locationId};
        context.contentInfoJson = {};
        context.contentTypeJson = {};
        context.limit = 50;
        context.offset = 0;
        Mock.expect(context.parentLocationMock, {
            method: 'get',
            args: ['locationId'],
            returns: context.locationId,
        });
        Mock.expect(context.location, {
            method: 'get',
            args: [Y.Mock.Value.String],
            run: Y.bind(function (arg) {
                if (arg === 'contentInfo') {
                    return context.contentInfo;
                } else if (arg === 'locationId') {
                    return context.locationId;
                }
            }, context)
        });
        Mock.expect(context.location, {
            method: 'toJSON',
            returns: context.locationJson,
        });
        Mock.expect(context.content, {
            method: 'toJSON',
            returns: context.contentJson,
        });
        Mock.expect(context.contentType, {
            method: 'toJSON',
            returns: context.contentTypeJson,
        });
        Mock.expect(context.contentInfo, {
            method: 'toJSON',
            returns: context.contentInfoJson,
        });
        context.result = {location: context.location, contentType: context.contentType, content: context.content};
        context.searchResult = [context.result];
        context.searchResultLength = context.searchResult.length;
        context.view = new Y.eZ.UniversalDiscoveryFinderExplorerLevelView({
            container: '.container',
            depth: 999,
            parentLocation: context.parentLocationMock,
            offset: context.offset,
            limit: context.limit,
            ownSelectedItem: !!ownSelectedItem,
            disabled: !!disabled,
        });
    };

    navigateTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer navigate tests',

        setUp: function () {
            _fullLevelViewSetup(this);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire explorerNavigate on tap on an explorer level item": function () {
            var locationFound = false;

            this.view.set('ownSelectedItem', true);
            this.view.set('items', this.searchResult);
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
            this.view.set('ownSelectedItem', false);
            this.view.set('items', this.searchResult);
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

        "Should NOT fire explorerNavigate on tap on an explorer level item if it is already selected and owns the selected item": function () {
            var fireExplorerNavigate = false;

            this.view.set('selectLocationId', this.location.get('locationId'));
            this.view.set('ownSelectedItem', true);
            this.view.set('items', this.searchResult);
            this.view.on('explorerNavigate', function () {
                fireExplorerNavigate = true;
            }, this);
            this.view.get('container').one('.ez-explorer-level-item').simulateGesture('tap', Y.bind(function (e) {
                this.resume(function () {
                    Assert.isFalse(fireExplorerNavigate, "Should not fire explorer navigate");
                });
            }, this));
            this.wait();
        },

        "Should fire explorerNavigate on tap on an explorer level item if it is already selected but does NOT own the selected item": function () {
            var fireExplorerNavigate = false;

            this.view.set('selectLocationId', this.location.get('locationId'));
            this.view.set('ownSelectedItem', false);
            this.view.set('items', this.searchResult);
            this.view.on('explorerNavigate', function () {
                fireExplorerNavigate = true;
            }, this);
            this.view.get('container').one('.ez-explorer-level-item').simulateGesture('tap', Y.bind(function () {
                this.resume(function () {
                    Assert.isTrue(fireExplorerNavigate, "Should not fire explorer navigate");
                });
            }, this));
            this.wait();
        },

    });

    searchResultChangeTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer search result change tests',

        setUp: function () {
            _fullLevelViewSetup(this);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should update items": function () {
            this.view.set('items', this.searchResult);

            Assert.areSame(this.view.get('items')[0].location, this.result.location, 'item should have a location');
            Assert.areSame(this.view.get('items')[0].content, this.result.content, 'item should have a location');
            Assert.areSame(this.view.get('items')[0].contentType, this.result.contentType, 'item should have a location');
            Assert.areSame(this.view.get('items')[0].contentInfo, this.result.location.get('contentInfo'), 'item should have a location');
        },

        "Should remove loading after updating items": function () {
            var container = this.view.get('container');

            container.addClass('is-loading');
            this.view.set('items', this.searchResult);

            Assert.isFalse(container.hasClass('is-loading'), 'Should have the loading icon');
        },
    });

    scrollTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer scroll tests',

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

        "Should scroll to the level view": function () {
            var container = this.view.get('container');

            container.setStyle('margin-left', '2000px');
            Assert.areSame(
                0,
                container.get('docScrollX'),
                'Should not be scrolled to view'
            );

            this.view.displayLevelView();

            setTimeout(function () {
                Assert.areNotSame(
                    0,
                    container.get('docScrollX'),
                    'Should have scrolled to view'
                );
            }, 100);

        },
    });

    removeHighlightTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer highlight tests',

        setUp: function () {
            _fullLevelViewSetup(this, true);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should directly add the has selected item class": function () {
            Assert.isTrue(
                this.view.get('container').hasClass('has-selected-item'),
                'The container should have the has selected item class'
            );
        },

        "Should remove the has selected item class": function () {
            var container = this.view.get('container');

            this.view.set('ownSelectedItem', false);
            Assert.isFalse(
                container.hasClass('has-selected-item'),
                'The has selected item class should have been removed'
            );
        },

        "Should add the has selected item class": function () {
            this["Should remove the has selected item class"]();

            this.view.set('ownSelectedItem', true);
            Assert.isTrue(
                this.view.get('container').hasClass('has-selected-item'),
                'The has selected item class should have been added'
            );
        },
    });

    loadMoreItemsTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer load more items tests',

        setUp: function () {
            _fullLevelViewSetup(this);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should update offset and fire locationSearch when scolling to unload items ": function () {
            var container = this.view.get('container'),
                locationSearchFired = false,
                offset = this.view.get('offset');

            this.view.on('*:locationSearch', Y.bind(function () {
                Assert.isTrue(container.hasClass('is-loading'), 'Should have the loading icon');
                locationSearchFired = true;
            }), this);

            container.setStyle('margin-top', 5000);
            this.view.set('childCount', 999);

            container.scrollInfo.fire('scrollDown');

            Assert.areSame(this.view.get('offset'), offset + this.view.get('limit'), 'offset should be updated');
            Assert.isTrue(locationSearchFired, 'locationSearch should have been fired');
        },

        "Should concat the new loaded items": function () {
            var itemsLength = 10,
                itemsArray = [];

            for (var i = 0; i < itemsLength; i++) {
                itemsArray.push(this.result);
            }
            this.view.set('items', itemsArray);
            this.view.set('items', this.searchResult);

            Assert.areSame(
                this.view.get('items').length,
                this.searchResultLength + itemsLength,
                "items attribute should be filled with new item"
            );
        },
    });

    resetTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer reset tests',

        setUp: function () {
            _fullLevelViewSetup(this);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should set items to null on reset": function () {
            this.view.set('items', this.searchResult);
            this.view.reset();
            Assert.isNull(this.view.get('items'), 'items attribute should be resetted');
        },
    });

    disabledTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder Explorer disable tests',

        setUp: function () {
            _fullLevelViewSetup(this, undefined, true);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should set the is-disabled class on container id view is disabled": function () {
            var container = this.view.get('container');

            Assert.isTrue(container.hasClass('is-disabled'), 'Should have the disabled class');
        },

        "Should NOT fire explorerNavigate on tap on an explorer level item if view is disabled": function () {
            var fireExplorerNavigate = false;

            this.view.set('items', this.searchResult);
            this.view.on('explorerNavigate', function () {
                fireExplorerNavigate = true;
            }, this);
            this.view.get('container').one('.ez-explorer-level-item').simulateGesture('tap', Y.bind(function (e) {
                this.resume(function () {
                    Assert.isFalse(fireExplorerNavigate, "Should not fire explorer navigate");
                });
            }, this));
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Finder Explorer Level View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(activeTest);
    Y.Test.Runner.add(navigateTest);
    Y.Test.Runner.add(searchResultChangeTest);
    Y.Test.Runner.add(scrollTest);
    Y.Test.Runner.add(removeHighlightTest);
    Y.Test.Runner.add(loadMoreItemsTest);
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(disabledTest);

}, '', {requires: ['test', 'view', 'ez-universaldiscoveryfinderexplorerlevelview', 'node-screen', 'node-style', 'node-event-simulate']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubview-tests', function (Y) {
    var viewTest, eventTest, logOutTest,
        navigationItemTest, zoneTest,
        navigationItemsSetter, routeMatchTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Navigation Hub View test",

        setUp: function () {
            this.userMock = new Y.Mock();
            this.userJson = {};
            Y.Mock.expect(this.userMock, {
                method: 'toJSON',
                returns: this.userJson,
            });
            this.view = new Y.eZ.NavigationHubView({
                container: '.container',
                user: this.userMock,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template,
                that = this;


            this.view.set(
                'platformNavigationItems',
                [new Y.eZ.NavigationItemView(), new Y.eZ.NavigationItemView()]
            );
            this.view.set('studioNavigationItems', [new Y.eZ.NavigationItemView()]);
            this.view.template = function (variables) {
                Y.Assert.areEqual(
                    2, Y.Object.keys(variables).length,
                    "The template should receive 2 variables"
                );
                Y.Assert.areSame(
                    that.userJson, variables.user,
                    "The template should receive the result of toJSON on the user"
                );
                Assert.isObject(
                    variables.zones,
                    "The zone list should be available"
                );
                Y.Object.each(variables.zones, function (zone, key) {
                    Assert.areEqual(
                        this.get('zones')[key], zone.name,
                        "Each zone should have a name"
                    );
                    Assert.areEqual(
                        (key === 'platform'),
                        zone.hasNavigation,
                        "Only the platform zone has a navigation " + key
                    );
                }, this);

                return origTpl.call(this, variables);
            };
            this.view.render();
        },

        _testRenderNavigationItems: function (zone) {
            var item1 = new Y.eZ.NavigationItemView({containerTemplate: '<li />'}),
                item2 = new Y.eZ.NavigationItemView({containerTemplate: '<li />'}),
                studioItems;

            this.view.set(zone + 'NavigationItems', [item1, item2]);
            this.view.render();

            studioItems = this.view.get('container').all('.ez-navigation-' + zone + ' > li');
            Assert.areSame(
                item1.get('container'), studioItems.item(1),
                "The navigation items for " + zone + " should be rendered"
            );
            Assert.areSame(
                item2.get('container'), studioItems.item(2),
                "The navigation items for " + zone + " should be rendered"
            );
        },

        "Should render the platform navigation items": function () {
            this._testRenderNavigationItems('platform');
        },

        "Should render the studioplus navigation items": function () {
            this._testRenderNavigationItems('studioplus');
        },

        "Should render the admin navigation items": function () {
            this._testRenderNavigationItems('admin');
        },

        "Should render the studio navigation items": function () {
            this._testRenderNavigationItems('studio');
        },
    });

    zoneTest = new Y.Test.Case({
        name: "eZ Navigation Hub View zone tests",

        setUp: function () {
            this.userMock = new Y.Mock();
            Y.Mock.expect(this.userMock, {
                method: 'toJSON',
                returns: {},
            });
            this.routeAdmin = {name: "samplanet", params: {}};
            this.view = new Y.eZ.NavigationHubView({
                container: '.container',
                user: this.userMock,
                studioplusNavigationItems: [
                    new Y.eZ.NavigationItemView(),
                    new Y.eZ.NavigationItemView(),
                ],
                adminNavigationItems: [
                    new Y.eZ.NavigationItemView({route: this.routeAdmin})
                ],
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _testShowNavigationMenu: function (zoneNode, navigationIdentifier) {
            Y.Assert.isTrue(
                zoneNode.hasClass("is-zone-active"),
                "The chosen zone should be active"
            );

            this.view.get('container').one('.ez-navigation').get('children').each(function () {
                if ( this.getAttribute('class').indexOf(navigationIdentifier) === -1 ) {
                    Y.Assert.isTrue(
                        this.hasClass('is-navigation-hidden'),
                        "The non active navigation menu should be hidden"
                    );
                } else {
                    Y.Assert.isFalse(
                        this.hasClass('is-navigation-hidden'),
                        "The active navigation menu should be showed"
                    );
                    Y.Assert.isTrue(
                        this.hasClass('has-more'),
                        "The 'More' link is visible in the active navigation menu"
                    );
                    Y.Assert.areNotEqual(
                        0, this.one('.ez-more .ez-sub-menu').get('children').size(),
                        "The 'more' sub menu be filled with some items"
                    );
                }
            });
        },

        "Should show the navigation menu with some items": function () {
            var container = this.view.get('container'),
                optZone = container.one('.ez-studioplus-zone'),
                navigationIdentifier = optZone.getAttribute('data-navigation'),
                that = this;

            this.view.set('active', true);
            optZone.simulateGesture('tap', function () {
                that.resume(function () {
                    this._testShowNavigationMenu(optZone, navigationIdentifier);
                });
            });
            this.wait();
        },

        "Should not show the navigation menu without items": function () {
            var container = this.view.get('container'),
                optZone = container.one('.ez-platform-zone'),
                that = this;

            this.view.set('active', true);
            optZone.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        optZone.hasClass("is-zone-active"),
                        "The choosen zone should be active"
                    );

                    container.one('.ez-navigation').get('children').each(function () {
                        Assert.isTrue(
                            this.hasClass('is-navigation-hidden'),
                            "The non active navigation menu should be hidden"
                        );
                    });

                });
            });
            this.wait();
        },


        "Should switch to the correct zone": function () {
            var container = this.view.get('container'),
                optZone = container.one('.ez-studioplus-zone'),
                navigationIdentifier = optZone.getAttribute('data-navigation');

            this.view.set('active', true);
            this.view.set('activeNavigation', 'studio');
            this.view.set('activeNavigation', 'studioplus');
            this._testShowNavigationMenu(optZone, navigationIdentifier);
        },

        "Should fire the heightChange event": function () {
            var heightChange = false;

            this.view.on('heightChange', function (e) {
                heightChange = true;

                Assert.isObject(e.height, "The event facade should contain an info object");
                Assert.areEqual(
                    e.height.new - e.height.old,
                    e.height.offset,
                    "The event facade should provide the offset"
                );
            });
            this.view.set('active', true);
            this.view.set('activeNavigation', 'studio');

            Assert.isTrue(heightChange, "The heightChange event should have been fired");
        },

        "Should fire the navigateTo event": function () {
            var fired = false,
                that = this;

            this.view.on('navigateTo', function (e) {
                fired = true;
                Assert.areSame(
                    that.routeAdmin, e.route,
                    "The event facade should provide the route"
                );
            });
            this.view.set('active', true);
            this.view.set('activeNavigation', 'admin');

            Assert.isTrue(fired, "The navigateTo should have been fired");
        },

        "Should not fire the navigateTo event with several items": function () {

            this.view.on('navigateTo', function (e) {
                Assert.fail("The navigateTo event should not be fired");
            });
            this.view.set('active', true);
            this.view.set('activeNavigation', 'studioplus');
        },

        "Should not fire the navigateTo event without items": function () {
            this.view.on('navigateTo', function (e) {
                Assert.fail("The navigateTo event should not be fired");
            });
            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
        },

        "Should not fire the navigateTo event without a zone": function () {
            this.view.on('navigateTo', function (e) {
                Assert.fail("The navigateTo event should not be fired");
            });
            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Navigation Hub View event tests",

        setUp: function () {
            this.userMock = new Y.Mock();
            Y.Mock.expect(this.userMock, {
                method: 'toJSON',
                returns: {},
            });
            this.view = new Y.eZ.NavigationHubView({
                container: '.container',
                user: this.userMock,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _testShowSubMenu: function (link, subMenu, testCoordinates) {
            Y.Assert.isTrue(
                link.hasClass('is-sub-menu-open'),
                "The sub menu link should get the is-sub-menu-open class"
            );
            Y.Assert.areEqual(
                link.get('offsetWidth') + 'px',
                subMenu.getStyle('min-width'),
                "The sub menu should have the width of link as min width"
            );
            if ( testCoordinates ) {
                Y.Assert.areEqual(
                    link.getX(), subMenu.getX(),
                    "The sub menu should be aligned with the link on the X coordinate"
                );
                Y.Assert.areEqual(
                    link.getY() + link.get('offsetHeight'), subMenu.getY(),
                    "The sub menu should be aligned with the bottom of the link on the Y coordinate"
                );
            } else {
                Y.Assert.isTrue(
                    subMenu.inViewportRegion(Y.config.doc),
                    "The sub menu should be in the viewport"
                );
            }
        },

        "Should show the sub-menu when the mouse is over its sub menu link": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu');

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            subMenuLink.simulate('mouseover');
            this._testShowSubMenu(subMenuLink, subMenu, true);
        },

        "Should show the sub-menu when its sub menu link is tapped": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu'),
                that = this;

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            subMenuLink.simulateGesture('tap', function () {
                that.resume(function () {
                    this._testShowSubMenu(subMenuLink, subMenu, true);
                });
            });
            this.wait();
        },

        "Should show the more sub-menu when the mouse is over its sub menu link": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-more.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu');

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            subMenuLink.simulate('mouseover');
            this._testShowSubMenu(subMenuLink, subMenu, false);
        },

        "Should show the more sub-menu when its sub menu link is tapped": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-more.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu'),
                that = this;

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            subMenuLink.simulateGesture('tap', function () {
                that.resume(function () {
                    this._testShowSubMenu(subMenuLink, subMenu, false);
                });
            });
            this.wait();
        },

        _testHiddenSubMenu: function (submenu) {
            Y.Assert.isFalse(
                submenu.hasClass('is-sub-menu-open'),
                "The sub menu should be closed"
            );
        },

        "Should hide the sub menu when the mouse is out of its sub menu link": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-more.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu');

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            subMenuLink.simulate('mouseover');
            subMenuLink.simulate('mouseout');
            this._testHiddenSubMenu(subMenu);
        },

        "Should hide the sub menu when tapping one of its item": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-more.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu'),
                that = this;

            this.view.set('active', true);
            this.view.set('platformNavigationItems', [
                new Y.eZ.NavigationItemView(),
                new Y.eZ.NavigationItemView(),
            ]);
            this.view.set('activeNavigation', 'platform');
            subMenuLink.simulateGesture('tap', function () {
                that.resume(function () {
                    subMenu.one('.ez-navigation-item').simulateGesture('tap', function () {
                        that.resume(function () {
                            this._testHiddenSubMenu(subMenu);
                        });
                    });
                    this.wait();
                });
            });
            this.wait();
        },

        "Should hide the sub menu when clicking outside": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-more.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu'),
                that = this;

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            subMenuLink.simulateGesture('tap', function () {
                that.resume(function () {
                    container.simulate('click');
                    this._testHiddenSubMenu(subMenu);
                });
            });
            this.wait();
        },

        _scrollTo: function (amount) {
            var container = this.view.get('container');

            container.setStyle('margin-top', amount);
            this.view.set('active', false);
            this.view.set('active', true);
            container.simulate('scroll');
        },

        "Should set the navigationFixed attribute depending on scroll": function () {
            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            this._scrollTo('-300px');
            Y.Assert.isTrue(
                this.view.get('navigationFixed'),
                "The navigation fixed attribute should be true"
            );

            this._scrollTo('100px');
            Y.Assert.isFalse(
                this.view.get('navigationFixed'),
                "The navigation fixed attribute should be false"
            );
            this._scrollTo(0);
        },

        "Should fix/unfix the navigation menu": function () {
            var eventFired = 0,
                view = this.view;

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            this.view.on('navigationModeChange', function (e) {
                eventFired++;

                Y.Assert.areSame(
                    view.get('navigationFixed'),
                    e.navigation.value,
                    "The event facade should container the navigation fixed attribute value"
                );

                Y.Assert.areEqual(
                    'is-navigationhubview-fixed',
                    e.navigation.modeClass,
                    "The event facade should contain the class 'is-navigationhubview-fixed'"
                );
            });

            this.view.set('navigationFixed', true);
            Y.Assert.isTrue(
                this.view.get('container').hasClass('is-navigation-fixed'),
                "The view container should get the 'is-navigation-fixed' class"
            );
            this.view.set('navigationFixed', false);
            Y.Assert.isFalse(
                this.view.get('container').hasClass('is-navigation-fixed'),
                "The view container should not have the 'is-navigation-fixed' class"
            );

            Y.Assert.areEqual(2, eventFired, "The 'navigationModeChange' event should be been fire twice");
        },

        "Should fire the heightChange event when getting fixed": function () {
            var heightChange = false;

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            this.view.on('heightChange', function (e) {
                heightChange = true;

                Assert.isObject(e.height, "The event facade should contain an info object");
                Assert.areEqual(
                    e.height.new - e.height.old,
                    e.height.offset,
                    "The event facade should provide the offset"
                );
            });
            this.view.set('navigationFixed', true);

            Assert.isTrue(heightChange, "The heightChange event should have been fired");
        },

        "Should fire the heightChange event when getting unfixed": function () {
            var heightChange = false;

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');
            this.view.set('navigationFixed', true);
            this.view.on('heightChange', function (e) {
                heightChange = true;

                Assert.isObject(e.height, "The event facade should contain an info object");
                Assert.areEqual(
                    e.height.new - e.height.old,
                    e.height.offset,
                    "The event facade should provide the offset"
                );
            });
            this.view.set('navigationFixed', false);

            Assert.isTrue(heightChange, "The heightChange event should have been fired");
        },


        "Should put some elements in the more sub menu": function () {
            var container = this.view.get('container'),
                navigationMenu = container.one('.ez-navigation-platform'),
                more = navigationMenu.one('.ez-more'),
                inMoreMenu = [], inMoreMenuAfter = [];

            this.view.set('active', true);
            this.view.set('platformNavigationItems', [
                new Y.eZ.NavigationItemView(),
                new Y.eZ.NavigationItemView(),
            ]);
            this.view.set('activeNavigation', 'platform');

            // emptying the more navigation
            navigationMenu.all('.ez-more li').each(function () {
                inMoreMenu.push(this);
                navigationMenu.insert(this, more);
            });
            navigationMenu.removeClass('has-more');

            container.simulate('resize');

            Y.Assert.isTrue(
                navigationMenu.hasClass('has-more'),
                "The 'More' link should be visible in the active navigation menu"
            );
            Y.Assert.areEqual(
                inMoreMenu.length,
                navigationMenu.one('.ez-more .ez-sub-menu').get('children').size(),
                "The 'more' sub menu be filled with some numbers of items as initially"
            );

            navigationMenu.all('.ez-more li').each(function () {
                inMoreMenuAfter.push(this);
            });

            Y.Array.each(inMoreMenu, function (val, key) {
                Y.Assert.areSame(
                    val, inMoreMenuAfter[key],
                    "The more menu should remain the same"
                );
            });
        },

        "Should take some elements from the more sub menu": function () {
            var container = this.view.get('container'),
                navigationMenu = container.one('.ez-navigation-platform');

            this.view.set('active', true);
            this.view.set('activeNavigation', 'platform');

            // making some space in the menu
            navigationMenu.all('> li').shift().remove();
            navigationMenu.all('> li').shift().remove();
            // leaving only one element in the more menu
            navigationMenu.all('.ez-more li:not(.last)').each(function () {
                this.remove();
            });
            navigationMenu.removeClass('has-more');

            container.simulate('resize');

            Y.Assert.isFalse(
                navigationMenu.hasClass('has-more'),
                "The 'More' link should not be visible in the active navigation menu"
            );

            Y.Assert.areEqual(
                0, navigationMenu.all('.ez-more li').size(),
                "The 'More' menu should be empty"
            );
        },
    });

    logOutTest = new Y.Test.Case({
        name: "eZ Navigation Hub View test",

        setUp: function () {
            this.userMock = new Y.Mock();
            Y.Mock.expect(this.userMock, {
                method: 'toJSON',
                returns: {},
            });
            this.view = new Y.eZ.NavigationHubView({
                container: '.container',
                user: this.userMock,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the logOut event": function () {
            var link = this.view.get('container').one('.ez-logout'),
                that = this;

            this.view.on('logOut', function (e) {
                that.resume(function () {
                    Y.Assert.areEqual(
                        'tap', e.originalEvent.type,
                        "The original DOM event should be provided in the logOut event facade"
                    );
                    Y.Assert.isTrue(
                        !!e.originalEvent.prevented,
                        "The tap event should have been prevented"
                    );
                });
            });
            link.simulateGesture('tap');
            this.wait();
        },
    });

    navigationItemsSetter = new Y.Test.Case({
        name: "eZ Navigation Hub View navigation items attributes setter test",

        setUp: function () {
            this.view = new Y.eZ.NavigationHubView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _testStructNoConfig: function (attr) {
            var value,
                Constructor = Y.eZ.NavigationItemView;

            this.view.set(attr, [{Constructor: Constructor}]);
            value = this.view.get(attr);

            Assert.isArray(value, "The " + attr + " value should be an array");
            Assert.areEqual(
                1, value.length,
                "The " + attr + " length should be 1"
            );
            Assert.isInstanceOf(
                Constructor, value[0],
                "The " + attr + " should contain an instance of the constructor"
            );
            this._testEventTarget(value[0]);
        },

        _testStructConfig: function (attr) {
            var value,
                config = {title: "Custom title"},
                Constructor = Y.eZ.NavigationItemView;

            this.view.set(attr, [{Constructor: Constructor, config: config}]);
            value = this.view.get(attr);

            Assert.isArray(value, "The " + attr + " value should be an array");
            Assert.areEqual(
                1, value.length,
                "The " + attr + " length should be 1"
            );
            Assert.isInstanceOf(
                Constructor, value[0],
                "The " + attr + " should contain an instance of the constructor"
            );
            Assert.areEqual(
                config.title, value[0].get('title'),
                "The config should be passed to the constructor"
            );
            this._testEventTarget(value[0]);
        },

        _testView: function (attr) {
            var value,
                instance = new Y.eZ.NavigationItemView();

            this.view.set(attr, [instance]);
            value = this.view.get(attr);

            Assert.isArray(value, "The " + attr + " value should be an array");
            Assert.areEqual(
                1, value.length,
                "The " + attr + " length should be 1"
            );
            Assert.areSame(
                instance, value[0],
                "The " + attr + " should contain the view instance"
            );
            this._testEventTarget(instance);
        },

        _testEventTarget: function (itemView) {
            var evt = 'hello',
                bubble = false;

            this.view.on('*:' + evt, function (e) {
                bubble = true;
            });
            itemView.fire(evt);
            Assert.isTrue(bubble, "The event should bubble from the item to the hub view");
        },

        "Test platformNavigationItems setter (struct, no config)": function () {
            this._testStructNoConfig('platformNavigationItems');
        },

        "Test platformNavigationItems setter (struct, config)": function () {
            this._testStructConfig('platformNavigationItems');
        },

        "Test platformNavigationItems setter (view)": function () {
            this._testView('platformNavigationItems');
        },

        "Test studioplusNavigationItems setter (struct, no config)": function () {
            this._testStructNoConfig('studioplusNavigationItems');
        },

        "Test studioplusNavigationItems setter (struct, config)": function () {
            this._testStructConfig('studioplusNavigationItems');
        },

        "Test studioplusNavigationItems setter (view)": function () {
            this._testView('studioplusNavigationItems');
        },

        "Test adminNavigationItems setter (struct, no config)": function () {
            this._testStructNoConfig('adminNavigationItems');
        },

        "Test adminNavigationItems setter (struct, config)": function () {
            this._testStructConfig('adminNavigationItems');
        },

        "Test adminNavigationItems setter (view)": function () {
            this._testView('adminNavigationItems');
        },

        "Test studioNavigationItems setter (struct, no config)": function () {
            this._testStructNoConfig('studioNavigationItems');
        },

        "Test studioNavigationItems setter (struct, config)": function () {
            this._testStructConfig('studioNavigationItems');
        },

        "Test studioNavigationItems setter (view)": function () {
            this._testView('studioNavigationItems');
        },
    });

    routeMatchTest = new Y.Test.Case({
        name: "eZ Navigation Hub View route matching test",

        setUp: function () {
            var that = this;

            this.matchRouteCalls = {};
            this.Item = Y.Base.create('itemTest', Y.eZ.NavigationItemView, [], {
                matchRoute: function (route) {
                    that.matchRouteCalls[this.get('identifier')] = route;
                    return route === that.route3;
                }
            });
            this.route1 = {
                name: "viewLocation",
                params: {
                    id: '/1/2/',
                    languageCode: 'eng-GB',
                }
            };
            this.route2 = {
                name: "viewLocation",
                params: {
                    id: '/1/43/',
                    languageCode: 'eng-GB',
                }
            };
            this.route3 = {
                name: "crapouilleView",
            };
            this.item1 = new this.Item({
                identifier: 'item1',
                route: this.route1,
            });
            this.item2 = new this.Item({
                identifier: 'item2',
                route: this.route2,
            });
            this.item3 = new this.Item({
                identifier: 'item3',
                route: this.route3,
            });
            this.view = new Y.eZ.NavigationHubView({
                platformNavigationItems: [this.item1, this.item2],
                studioplusNavigationItems: [this.item3],
            });
        },

        tearDown: function () {
            this.item1.destroy();
            this.item2.destroy();
            this.item3.destroy();
            this.view.destroy();
            delete this.view;
            delete this.item1;
            delete this.item2;
            delete this.item3;
            delete this.Item;
            delete this.matchRouteCalls;
        },

        "Should call matchRoute on all navigation items": function () {
            var matchedRoute = {name: "externalRoute"};
            this.view.set('matchedRoute', matchedRoute);

            Assert.areEqual(
                3, Y.Object.keys(this.matchRouteCalls).length,
                "matchRoute() should have been called 3 times"
            );
            Assert.areSame(
                this.matchRouteCalls.item1, matchedRoute,
                "matchRoute() should have been called with the matched route"
            );
            Assert.areSame(
                this.matchRouteCalls.item2, matchedRoute,
                "match() should have been called with the matched route"
            );
            Assert.areSame(
                this.matchRouteCalls.item3, matchedRoute,
                "matchRoute() should have been called with the matched route"
            );
        },

        "Should set the corresponding navigation to active": function () {
            this.view.set('matchedRoute', this.route3);

            Assert.areEqual(
                'studioplus', this.view.get('activeNavigation'),
                "The studioplus should be active"
            );
        },

        "Should set the active navigation to null": function () {
            this.view.set('matchedRoute', {name: "unknownRoute"});

            Assert.isNull(
                this.view.get('activeNavigation'),
                "The active navigation should be null"
            );
        },
    });

    navigationItemTest = new Y.Test.Case({
        name: "eZ Navigation Hub view item test",

        setUp: function () {
            var user = new Y.Mock();
            Y.Mock.expect(user, {
                method: 'toJSON',
                returns: {},
            });
            this.item1 = new Y.eZ.NavigationItemView();
            this.item2 = new Y.eZ.NavigationItemView();
            this.item3 = new Y.eZ.NavigationItemView();
            this.view = new Y.eZ.NavigationHubView({
                platformNavigationItems: [this.item1, this.item2],
                studioplusNavigationItems: [this.item3],
                container: '.container',
                user: user,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.item1.destroy();
            this.item2.destroy();
            this.item3.destroy();
            delete this.view;
            delete this.item1;
            delete this.item2;
            delete this.item3;
        },

        "Should forward the active flag to the navigation items": function () {
            this.view.set('active', true);

            Assert.isTrue(
                this.item1.get('active'),
                "The navigation item should be active"
            );
            Assert.isTrue(
                this.item2.get('active'),
                "The navigation item should be active"
            );
            Assert.isTrue(
                this.item3.get('active'),
                "The navigation item should be active"
            );
        },
    });

    Y.Test.Runner.setName("eZ Navigation Hub View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(zoneTest);
    Y.Test.Runner.add(logOutTest);
    Y.Test.Runner.add(navigationItemsSetter);
    Y.Test.Runner.add(routeMatchTest);
    Y.Test.Runner.add(navigationItemTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-navigationhubview', 'ez-navigationitemview', 'view']});

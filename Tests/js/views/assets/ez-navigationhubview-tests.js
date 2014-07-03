/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubview-tests', function (Y) {
    var viewTest, eventTest, logOutTest;

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
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Y.Assert.areEqual(
                    1, Y.Object.keys(variables).length,
                    "The template should receive 1 variable"
                );
                Y.Assert.areSame(
                    that.userJson, variables.user,
                    "The template should receive the result of toJSON on the user"
                );

                return origTpl.call(this, variables);
            };
            this.view.render();
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
        },

        _testShowNavigationMenu: function (zoneNode, navigationIdentifier) {
            Y.Assert.isTrue(
                zoneNode.hasClass("is-zone-active"),
                "The choosen zone should be active"
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

        "Should show the correct navigation menu when the mouse is over a navigation zone": function () {
            var container = this.view.get('container'),
                optZone = container.one('.ez-optimize-zone'),
                navigationIdentifier = optZone.getAttribute('data-navigation');

            optZone.simulate('mouseover');
            this._testShowNavigationMenu(optZone, navigationIdentifier);
        },

        "Should show the correct navigation menu when tapping a navigation zone": function () {
            var container = this.view.get('container'),
                optZone = container.one('.ez-optimize-zone'),
                navigationIdentifier = optZone.getAttribute('data-navigation'),
                that = this;

            optZone.simulateGesture('tap', function () {
                that.resume(function () {
                    this._testShowNavigationMenu(optZone, navigationIdentifier);
                });
            });
            this.wait();
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

            subMenuLink.simulate('mouseover');
            this._testShowSubMenu(subMenuLink, subMenu, true);
        },

        "Should show the sub-menu when its sub menu link is tapped": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu'),
                that = this;

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

            subMenuLink.simulate('mouseover');
            this._testShowSubMenu(subMenuLink, subMenu, false);
        },

        "Should show the more sub-menu when its sub menu link is tapped": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-more.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu'),
                that = this;

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

            subMenuLink.simulate('mouseover');
            subMenuLink.simulate('mouseout');
            this._testHiddenSubMenu(subMenu);
        },

        "Should hide the sub menu when tapping one of its item": function () {
            var container = this.view.get('container'),
                subMenuLink = container.one('.ez-more.ez-sub-menu-link'),
                subMenu = subMenuLink.one('.ez-sub-menu'),
                that = this;

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

        "Should put some elements in the more sub menu": function () {
            var container = this.view.get('container'),
                navigationMenu = container.one('.ez-navigation-create'),
                more = navigationMenu.one('.ez-more'),
                inMoreMenu = [], inMoreMenuAfter = [];

            this.view.set('active', true);
            this.view.set('activeNavigation', 'create');

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
                navigationMenu = container.one('.ez-navigation-create');

            this.view.set('activeNavigation', 'create');
            this.view.set('active', true);

            // making some space in the menu
            navigationMenu.all('li').pop().remove();
            navigationMenu.all('li').pop().remove();
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


    Y.Test.Runner.setName("eZ Navigation Hub View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(logOutTest);

}, '', {requires: ['test', 'node-event-simulate', 'ez-navigationhubview']});

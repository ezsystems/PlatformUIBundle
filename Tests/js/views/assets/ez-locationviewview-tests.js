/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewview-tests', function (Y) {
    var test, tabsTest, eventsTest, destroyTest, attrsToRawContentAndActionBarViewsTest,
        Mock = Y.Mock, Assert = Y.Assert,
        _getModelMock = function (serialized) {
            var mock = new Y.Test.Mock();

            Y.Mock.expect(mock, {
                method: 'toJSON',
                returns: serialized
            });
            return mock;
        };

    test = new Y.Test.Case({
        name: "eZ Location View view tests",

        setUp: function () {

            this.barMock = new Y.View();
            this.tab1 = new Y.View();
            this.tab2 = new Y.View();

            this.tab1.set('identifier', 'tab1');
            this.tab1.set('title', 'Tab1');
            this.tab2.set('identifier', 'tab2');
            this.tab2.set('title', 'Tab2');

            this.locationMock = new Mock();
            this.contentMock = new Mock();
            this.locationJSON = {};
            this.contentJSON = {};
            this.path = [];
            Y.Mock.expect(this.locationMock, {
                method: "toJSON",
                args: [],
                returns: this.locationJSON,
            });
            Y.Mock.expect(this.contentMock, {
                method: "toJSON",
                args: [],
                returns: this.contentJSON,
            });

            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                tabs: [this.tab1, this.tab2],
                location : this.locationMock,
                content : this.contentMock,
                path: this.path,
            });
            this.view._set('selectedTab', 'tab1');
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl,
                container = this.view.get('container');

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(
                templateCalled,
                "The template should have used to render the view"
            );
            Y.Assert.areNotEqual(
                "", this.view.get('container').getHTML(),
                "View container should contain the result of the view"
            );

            Y.Assert.areEqual(
                container.one('.ez-locationview-content').getStyle('min-height'),
                container.get('winHeight') + 'px'
            );
        },

        "Test available variables in the template": function () {
            var plainLocations = [{}, {}, {}],
                plainContents = [{}, {}, {}],
                origTpl = this.view.template,
                location = this.locationMock,
                content = this.contentMock,
                that = this;

            Y.Array.each(plainLocations, function (val, k) {
                this.path.push({
                    location: _getModelMock(plainLocations[k]),
                    content: _getModelMock(plainContents[k])
                });
            }, this);

            this.view.template = function (variables) {
                Y.Array.each(variables.path, function (struct, k) {
                    Y.Mock.verify(struct.location);
                    Y.Mock.verify(struct.content);
                    Y.Assert.areSame(
                        struct.location, plainLocations[k],
                        "path[i].location.toJSON() be passed to the template"
                    );

                    Y.Assert.areSame(
                        struct.content, plainContents[k],
                        "path[i].content.toJSON() be passed to the template"
                    );
                });
                Y.Mock.verify(location);
                Y.Mock.verify(content);
                Y.Assert.areSame(
                    that.locationJSON, variables.location,
                    "location.toJSON() should be passed to the template"
                );
                Y.Assert.areSame(
                    that.contentJSON, variables.content,
                    "content.toJSON() should be passed to the template"
                );
                Assert.isArray(variables.tabs, "The tabs should be passed to the template");
                Assert.areEqual(
                    that.tab1.get('title'), variables.tabs[0].title,
                    "The title of the tab view should be available"
                );
                Assert.areEqual(
                    that.tab1.get('identifier'), variables.tabs[0].identifier,
                    "The identifier of the tab view should be available"
                );
                Assert.isTrue(variables.tabs[0].selected, "The tab1 should be selected");
                Assert.areEqual(
                    that.tab2.get('title'), variables.tabs[1].title,
                    "The title of the tab view should be available"
                );
                Assert.areEqual(
                    that.tab2.get('identifier'), variables.tabs[1].identifier,
                    "The identifier of the tab view should be available"
                );
                Assert.isFalse(variables.tabs[1].selected, "The tab2 should not be selected");

                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Should build the title from the content and the path": function () {
            var contentName = 'Ryan Gosling',
                contentPathNames = ['Hot', 'Male', 'Actors'],
                content = this.contentMock,
                that = this;

            Y.Array.each(contentPathNames, function (val) {
                var content = new Y.Mock();
                Y.Mock.expect(content, {
                    method: 'get',
                    args: ['name'],
                    returns: val
                });
                that.path.push({
                    location: {},
                    content: content
                });
            });

            Y.Mock.expect(content, {
                method: 'get',
                args: ['name'],
                returns: contentName
            });

            Y.Assert.areEqual(
                contentName + ' / ' + contentPathNames.join(' / '),
                this.view.getTitle(),
                "The title should be build with the content and the path"
            );
        },
    });

    attrsToRawContentAndActionBarViewsTest = new Y.Test.Case({
        name: "eZ Location View view tests",

        setUp: function () {
            Y.eZ.ActionBarView = Y.Base.create('actionBarView', Y.View, [], {}, {
                ATTRS: {
                    content: {},
                    actionList: {},
                    viewLessText: {},
                    viewMoreText: {},
                },
            });

            Y.eZ.LocationViewViewTabView = Y.Base.create('locationViewTabView', Y.View, [], {}, {
                ATTRS: {
                    content: {},
                    contentType: {},
                    config: {},
                    priority: {},
                }
            });

            this.view = new Y.eZ.LocationViewView({
                location: {},
                content: {},
                contentType: {},
                config: {},
                path: {},
            });
        },

        tearDown: function () {
            delete Y.eZ.ActionBarView;
            delete Y.eZ.LocationViewViewTabView;
            this.view.destroy();
            delete this.view;
        },

        "Should set the content of the view tab view": function () {
            Assert.areSame(
                this.view.get('content'),
                this.view.get('tabs')[0].get('content'),
                'The content should have been set to the view tab view'
            );
        },

        "Should set the contentType of the view tab view": function () {
            Assert.areSame(
                this.view.get('contentType'),
                this.view.get('tabs')[0].get('contentType'),
                'The contentType should have been set to the view tab view'
            );
        },

        "Should set the config of the view tab view": function () {
            Assert.areSame(
                this.view.get('config'),
                this.view.get('tabs')[0].get('config'),
                'The config should have been set to the view tab view'
            );
        },

        "Should set the priority of the view tab view": function () {
            Assert.areSame(
                1000,
                this.view.get('tabs')[0].get('priority'),
                'The priority should have been set to the view tab view'
            );
        },

        "Should set the location view as a bubble target of the view tab view": function () {
            var bubbled = false, evt = 'whatever';

            this.view.on('*:' + evt, function () {
                bubbled = true;
            });
            this.view.get('tabs')[0].fire(evt);

            Assert.isTrue(bubbled, "The location view should be a bubble target of the tab view");
        },


        "Should set the content of the action bar": function () {
            Y.Assert.areSame(
                this.view.get('content'),
                this.view.get('actionBar').get('content'),
                'The content should have been set to the actionBar'
            );
        },

        "Should set the contentType of the action bar": function () {
            Y.Assert.areSame(
                this.view.get('contentType'),
                this.view.get('actionBar').get('contentType'),
                'The contentType should have been set to the actionBar'
            );
        },
    });

    tabsTest = new Y.Test.Case({
        name: "eZ Location view view tabs tests",

        setUp: function () {
            this.barMock = new Y.View();
            this.tab1 = new Y.View();
            this.tab2 = new Y.View();
            this.tab1.setAttrs({
                title: "Tab 1",
                identifier: "tab1",
            });
            this.tab2.setAttrs({
                title: "Tab 2",
                identifier: "tab2",
            });

            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                tabs: [this.tab1, this.tab2],
                selectedTab: 'tab1',
                location: _getModelMock({}),
                content: _getModelMock({}),
                container: Y.one('.container')
            });
            this.view.render();
        },

        _selectTab: function (linkSelector, labelId) {
            var that = this, c = this.view.get('container'),
                target = c.one(linkSelector),
                initialHash;

            initialHash = Y.config.win.location.hash;
            target.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        labelId, c.one('.is-tab-selected').get('id'),
                        "The last label should have been selected"
                    );

                    Y.Assert.areEqual(
                        c.all('.ez-tabs-list .is-tab-selected').size(), 1,
                        "Only one label should be selected"
                    );

                    Y.Assert.areEqual(
                        c.all('.ez-tabs-panels .is-tab-selected').size(), 1,
                        "Only one panel should be selected"
                    );

                    Y.Assert.areEqual(
                        target.getAttribute('href').replace(/^#/, ''),
                        c.one('.ez-tabs-panels .is-tab-selected').get('id'),
                        "The panel indicated by the label link should be selected"
                    );

                    Y.Assert.areEqual(
                        initialHash, Y.config.win.location.hash,
                        "The location hash should be intact (tap event is prevented)"
                    );
                });
            });
            this.wait();
        },

        "Should select label on tap": function () {
            this._selectTab('[data-tab-identifier="tab2"] a', 'li-tab2');
        },

        "Should not change selection, when already selected label is tapped": function () {
            this._selectTab('[data-tab-identifier="tab1"] a', 'li-tab1');
        },

        tearDown: function () {
            this.view.destroy();
        },

    });

    eventsTest = new Y.Test.Case({
        name: "eZ Location view view events handling tests",

        setUp: function () {
            this.view = new Y.eZ.LocationViewView({
                actionBar: new Y.View(),
                tabs: [],
                container: '.container',
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "The action bar minimized class should be toggled by the minimizeActionBarAction event": function () {
            var container = this.view.get('container');

            this.view.fire('whatever:minimizeActionBarAction');
            Y.Assert.isTrue(
                container.hasClass('is-actionbar-minimized'),
                "The location view container should get the action bar minimized class"
            );
            this.view.fire('whatever:minimizeActionBarAction');
            Y.Assert.isFalse(
                container.hasClass('is-actionbar-minimized'),
                "The location view container should NOT get the action bar minimized class"
            );
        },
    });

    destroyTest = new Y.Test.Case({
        name: "eZ Location view view destructor test",

        setUp: function () {
            this.barMock = new Y.View();
            this.tab1 = new Y.View();
            this.tab2 = new Y.View();
            this.tab1.setAttrs({
                title: "Tab 1",
                identifier: "tab1",
            });
            this.tab2.setAttrs({
                title: "Tab 2",
                identifier: "tab2",
            });

            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                tabs: [this.tab1, this.tab2],
                selectedTab: 'tab1',
                location: {},
                content: {},
            });
        },

        tearDown: function () {
            this.tab1.destroy();
            this.tab2.destroy();
            this.barMock.destroy();
            this.view.destroy();
        },

        "Should destroy the action bar and the tabs": function () {
            this.view.destroy();

            Assert.isTrue(
                this.barMock.get('destroyed'),
                "The action bar should have been destroyed"
            );
            Assert.isTrue(
                this.tab1.get('destroyed'),
                "The tabs should have been destroyed"
            );
            Assert.isTrue(
                this.tab2.get('destroyed'),
                "The tabs should have been destroyed"
            );
        }
    });

    Y.Test.Runner.setName("eZ Location View view tests");
    Y.Test.Runner.add(test);
    Y.Test.Runner.add(tabsTest);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(destroyTest);
    Y.Test.Runner.add(attrsToRawContentAndActionBarViewsTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-locationviewview']});

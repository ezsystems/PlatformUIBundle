/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewview-tests', function (Y) {
    var test, tabsTest, eventsTest, destroyTest, attrsToSubViewsTest,
        selectedTest, forwardActiveTest, subitemListAttr,
        addTabViewTest, removeTabViewTest,
        Mock = Y.Mock, Assert = Y.Assert,
        _getModelMock = function (serialized) {
            var mock = new Y.Test.Mock();

            Y.Mock.expect(mock, {
                method: 'toJSON',
                returns: serialized
            });
            return mock;
        },
        _getLocationModelMock = function (serializedLocation, serializedContentInfo) {
            var locationMock = new Y.Test.Mock();

            Y.Mock.expect(locationMock, {
                method: 'toJSON',
                returns: serializedLocation
            });
            return locationMock;
        },
        RenderedView = Y.Base.create('renderedView', Y.View, [], {
            render: function () {
                this.set('rendered', true);
                return this;
            },
        });

    test = new Y.Test.Case({
        name: "eZ Location View view tests",

        setUp: function () {

            this.barMock = new RenderedView();
            this.tab1 = new Y.View();
            this.tab2 = new Y.View();
            this.subitemList = new RenderedView();

            this.tab1.set('identifier', 'tab1');
            this.tab1.set('title', 'Tab1');
            this.tab2.set('identifier', 'tab2');
            this.tab2.set('title', 'Tab2');

            this.locationMock = new Mock();
            this.contentMock = new Mock();
            this.locationJSON = {};
            this.contentJSON = {};
            this.path = [];
            this.languageCode = 'eng-GB';
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
                subitemList: this.subitemList,
                location : this.locationMock,
                content : this.contentMock,
                path: this.path,
                languageCode: this.languageCode
            });
            this.view._set('selectedTab', 'tab1');
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
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

        _testRenderSubView: function (attr, selector) {
            this.view.render();

            Assert.isTrue(
                this.view.get(attr).get('rendered'),
                "The " + attr + " view should be rendered"
            );
            Assert.isTrue(
                this.view.get('container').one('.ez-'+ selector + '-container').contains(
                    this.view.get(attr).get('container')
                ),
                "The " + attr + " view should be rendered in the " + selector + " container"
            );
        },

        "Should render the subitem list": function () {
            this._testRenderSubView('subitemList', 'subitemlist');
        },

        "Should render the action bar": function () {
            this._testRenderSubView('actionBar', 'actionbar');
        },

        "Should handle a null subitem list": function () {
            this.view._set('subitemList', null);
            this.view.render();

            Assert.areEqual(
                "", this.view.get('container').one('.ez-subitemlist-container').getContent(),
                "The subitem list container should be empty"
            );
        },

        "Test available variables in the template": function () {
            var plainLocations = [{}, {}, {}],
                origTpl = this.view.template,
                location = this.locationMock,
                content = this.contentMock,
                that = this;

            Y.Array.each(plainLocations, function (val, k) {
                this.path.push(_getLocationModelMock(plainLocations[k]));
            }, this);

            this.view.template = function (variables) {
                Y.Array.each(variables.path, function (struct, k) {
                    Y.Mock.verify(struct);
                    Y.Assert.areSame(
                        struct, plainLocations[k],
                        "The jsonified location should be passed to the template"
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
                var contentInfoMock = new Y.Mock(),
                    locationMock = new Y.Mock();
                Y.Mock.expect(contentInfoMock, {
                    method: 'get',
                    args: ['name'],
                    returns: val
                });
                Y.Mock.expect(locationMock, {
                    method: 'get',
                    args: ['contentInfo'],
                    returns: contentInfoMock
                });

                that.path.push(locationMock);
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

    attrsToSubViewsTest = new Y.Test.Case({
        name: "eZ Location View view tests",

        setUp: function () {
            var contentType = new Mock();

            Mock.expect(contentType, {
                method: 'get',
                args: ['isContainer'],
                returns: true
            });
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
                    location: {},
                    config: {},
                    priority: {},
                    languageCode: {},
                }
            });

            Y.eZ.LocationViewDetailsTabView = Y.Base.create('locationViewDetailsTabView', Y.View, [], {}, {
                ATTRS: {
                    content: {},
                    location: {},
                    config: {},
                    priority: {},
                    languageCode: {},
                }
            });

            Y.eZ.LocationViewLocationsTabView = Y.Base.create('locationViewLocationsTabView', Y.View, [], {}, {
                ATTRS: {
                    content: {},
                    locations: {},
                    config: {},
                    priority: {},
                }
            });

            Y.eZ.SubitemListView = Y.Base.create('subitemListView', Y.View, [], {}, {
                ATTRS: {
                    location: {},
                    config: {},
                }
            });

            Y.eZ.LocationViewRelationsTabView = Y.Base.create('locationViewRelationsTabView', Y.View, [], {}, {
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
                contentType: contentType,
                config: {},
                path: {},
                languageCode: 'fre-FR',
            });
        },

        tearDown: function () {
            delete Y.eZ.ActionBarView;
            delete Y.eZ.LocationViewViewTabView;
            delete Y.eZ.LocationViewDetailsTabView;
            delete Y.eZ.SubitemListView;
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

        "Should set the location of the view tab view": function () {
            Assert.areSame(
                this.view.get('location'),
                this.view.get('tabs')[0].get('location'),
                'The location should have been set to the view tab view'
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

        "Should set the languageCode of the view tab view": function () {
            Assert.areSame(
                this.view.get('languageCode'),
                this.view.get('tabs')[0].get('languageCode'),
                'The languageCode should have been set to the view tab view'
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

        "Should set the content of the details tab view": function () {
            Assert.areSame(
                this.view.get('content'),
                this.view.get('tabs')[1].get('content'),
                'The content should have been set to the details tab view'
            );
        },

        "Should set the location of the details tab view": function () {
            Assert.areSame(
                this.view.get('location'),
                this.view.get('tabs')[1].get('location'),
                'The location should have been set to the details tab view'
            );
        },

        "Should set the config of the details tab view": function () {
            Assert.areSame(
                this.view.get('config'),
                this.view.get('tabs')[1].get('config'),
                'The config should have been set to the details tab view'
            );
        },

        "Should set the priority of the details tab view": function () {
            Assert.areSame(
                2000,
                this.view.get('tabs')[1].get('priority'),
                'The priority should have been set to the details tab view'
            );
        },

        "Should set the location view as a bubble target of the details tab view": function () {
            var bubbled = false, evt = 'whatever';

            this.view.on('*:' + evt, function () {
                bubbled = true;
            });
            this.view.get('tabs')[1].fire(evt);

            Assert.isTrue(bubbled, "The location view should be a bubble target of the details tab view");
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
                'The contentType should have been set to the rawContentview'
            );
        },

        "Should set the location on the subitem list": function () {
            Assert.areSame(
                this.view.get('location'),
                this.view.get('subitemList').get('location'),
                'The location should have been set on the subitem list'
            );
        },

        "Should set the config on the subitem list": function () {
            Assert.areSame(
                this.view.get('config'),
                this.view.get('subitemList').get('config'),
                'The config should have been set on the subitem list'
            );
        },

        "Should set the location view as a bubble target of the subitem list": function () {
            var bubbled = false, evt = 'whatever';

            this.view.on('*:' + evt, function () {
                bubbled = true;
            });
            this.view.get('subitemList').fire(evt);

            Assert.isTrue(bubbled, "The location view should be a bubble target of the subitem list");
        },
    });

    tabsTest = new Y.Test.Case({
        name: "eZ Location view view tabs tests",

        setUp: function () {
            this.barMock = new Y.View();
            this.subitemList = new Y.View();
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
                subitemList: this.subitemList,
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
                subitemList: new Y.View(),
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
            this.subitemList = new Y.View();
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
                subitemList: this.subitemList,
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
            this.subitemList.destroy();
        },

        "Should destroy the action bar": function () {
            this.view.destroy();

            Assert.isTrue(
                this.barMock.get('destroyed'),
                "The action bar should have been destroyed"
            );
        },

        "Should destroy the tabs": function () {
            this.view.destroy();

            Assert.isTrue(
                this.tab1.get('destroyed'),
                "The tabs should have been destroyed"
            );
            Assert.isTrue(
                this.tab2.get('destroyed'),
                "The tabs should have been destroyed"
            );
        },

        "Should destroy the subitem list": function () {
            this.view.destroy();

            Assert.isTrue(
                this.subitemList.get('destroyed'),
                "The action bar should have been destroyed"
            );
        },
    });

    addTabViewTest = new Y.Test.Case({
        name: "eZ Location view view addTabView test",

        setUp: function () {
            this.barMock = new Y.View();
            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                tabs: [],
            });
        },

        tearDown: function () {
            this.barMock.destroy();
            this.view.destroy();
        },

        "Should add the tab view to the list": function () {
            var tab = new Y.View({
                    identifier: "lz-hills",
                    title: "Led Zeppelin - Over the hills and far away"
                }),
                tabs = this.view.get('tabs');

            this.view.addTabView(tab);

            Assert.areEqual(
                1, tabs.length,
                "The tab should have been added to the list"
            );
            Assert.areSame(tab, tabs[0], "The tab should be in the list");
        },

        "Should maintain the order by priority": function () {
            var tab1 = new Y.View({
                    identifier: "lz-hills",
                    title: "Led Zeppelin - Over the hills and far away",
                    priority: 1000,
                }),
                tab2 = new Y.View({
                    identifier: "lz-stairway",
                    title: "Led Zeppelin - Stairway to heaven",
                    priority: 500,
                }),
                tab3 = new Y.View({
                    identifier: "lz-ramble",
                    title: "Led Zeppelin - Ramble on",
                    priority: 700,
                }),
                tabs = this.view.get('tabs');

            this.view.addTabView(tab3);
            this.view.addTabView(tab1);
            this.view.addTabView(tab2);

            Assert.areEqual(
                3, tabs.length,
                "The tabs should have been added to the list"
            );
            Assert.areSame(tab1, tabs[0], "The tabs should be ordered by priority");
            Assert.areSame(tab3, tabs[1], "The tabs should be ordered by priority");
            Assert.areSame(tab2, tabs[2], "The tabs should be ordered by priority");
        },

        "Should set the location view a bubble target of the tab": function () {
            var tab = new Y.View({
                    identifier: "lz-hills",
                    title: "Led Zeppelin - Over the hills and far away"
                }),
                evt = "whatever",
                bubbled = false;

            this.view.addTabView(tab);
            this.view.on('*:' + evt, function () {
                bubbled = true;
            });
            tab.fire(evt);
            Assert.isTrue(
                bubbled, "The location view should be a bubble target of the tab"
            );
        },
    });

    removeTabViewTest = new Y.Test.Case({
        name: "eZ Location view view addTabView test",

        setUp: function () {
            this.barMock = new Y.View();
            this.tabs = [
                new Y.View({
                    identifier: "lz-hills",
                    title: "Led Zeppelin - Over the hills and far away",
                    priority: 1000,
                }),
                new Y.View({
                    identifier: "lz-ramble",
                    title: "Led Zeppelin - Ramble on",
                    priority: 700,
                }),
                new Y.View({
                    identifier: "lz-stairway",
                    title: "Led Zeppelin - Stairway to heaven",
                    priority: 500,
                }),
            ];
            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                tabs: [],
            });
            Y.Array.each(this.tabs, function (tab) {
                this.view.addTabView(tab);
            }, this);
        },

        tearDown: function () {
            this.barMock.destroy();
            Y.Array.each(this.tabs, function (t) {
                t.destroy();
            });
            this.view.destroy();
        },

        "Should return null if the tabView is not found": function () {
            Assert.isNull(
                this.view.removeTabView('lady-gaga'),
                "removeTabView should have returned null"
            );
        },

        "Should remove the tab view from the list": function () {
            this.view.removeTabView('lz-ramble');

            Assert.areEqual(2, this.view.get('tabs').length, "Only 2 tabs should remain");
        },

        "Should return the found tab view": function () {
            var tabView,
                removedTabView;

            tabView = this.tabs[1];
            removedTabView = this.view.removeTabView(tabView.get('identifier'));

            Assert.areSame(
                tabView, removedTabView,
                "The removed tab view should have been returned"
            );
        },

        "Should remove the location view from the bubble targets of the tabView": function () {
           var removedTabView, evt = 'whatever', bubbled = false;

           this.view.on('*:' + evt, function () {
                bubbled = true;
           });
           removedTabView = this.view.removeTabView(this.tabs[1].get('identifier'));
           removedTabView.fire(evt);
           Assert.isFalse(bubbled, "The event should not bubbled to the location view");
        }
    });

    selectedTest = new Y.Test.Case({
        name: "eZ Location view view addTabView test",

        setUp: function () {
            this.barMock = new Y.View();
            this.tabs = [
                new Y.View({
                    identifier: "lz-hills",
                    title: "Led Zeppelin - Over the hills and far away",
                    priority: 1000,
                    selected: true,
                }),
                new Y.View({
                    identifier: "lz-ramble",
                    title: "Led Zeppelin - Ramble on",
                    priority: 700,
                    selected: false,
                }),
            ];
            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                tabs: [],
            });
            Y.Array.each(this.tabs, function (tab) {
                this.view.addTabView(tab);
            }, this);
            this.view._set('selectedTab', 'lz-hills');
        },

        tearDown: function () {
            this.barMock.destroy();
            Y.Array.each(this.tabs, function (t) {
                t.destroy();
            });
            this.view.destroy();
        },

        "Should sync the selected tab attribute with selectedTab": function () {
            this.view._set('selectedTab', this.tabs[1].get('identifier'));

            Assert.isTrue(
                this.tabs[1].get('selected'),
                "The tab1 should be selected"
            );
            Assert.isFalse(
                this.tabs[0].get('selected'),
                "The tab0 should not be selected"
            );
        },
    });

    forwardActiveTest = new Y.Test.Case({
        name: "eZ Location view view forward the active state test",

        setUp: function () {
            this.barMock = new Y.View();
            this.tabs = [
                new Y.View({
                    identifier: "let-there-be-rock",
                    title: "AC/DC - Let there be rock",
                    priority: 1000,
                    selected: true,
                }),
                new Y.View({
                    identifier: "thunderstruck",
                    title: "AC/DC - Thunderstruck",
                    priority: 700,
                    selected: false,
                }),
            ];
            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                tabs: [],
            });
            Y.Array.each(this.tabs, function (tab) {
                this.view.addTabView(tab);
            }, this);
        },

        tearDown: function () {
            this.barMock.destroy();
            Y.Array.each(this.tabs, function (t) {
                t.destroy();
            });
            this.view.destroy();
        },

        "Should forward the active state (true)": function () {
            this.view.set('active', true);

            Y.Array.each(this.view.get('tabs'), function (t) {
                Assert.isTrue(
                    t.get('active'),
                    "The tab '" + t.get('identifier') + "' should be active"
                );
            });
        },

        "Should forward the active state (false)": function () {
            this["Should forward the active state (true)"]();
            this.view.set('active', false);

            Y.Array.each(this.view.get('tabs'), function (t) {
                Assert.isFalse(
                    t.get('active'),
                    "The tab '" + t.get('identifier') + "' should NOT be active"
                );
            });
        },
    });

    subitemListAttr = new Y.Test.Case({
        name: "eZ Location view view subitemList attribute test",

        setUp: function () {
            this.contentType = new Mock();

            Mock.expect(this.contentType, {
                method: 'get',
                args: ['isContainer'],
                run: Y.bind(function () {
                    return this.isContainer;
                }, this)
            });
            Y.eZ.SubitemListView = function () {};
        },

        tearDown: function () {
            delete Y.eZ.SubitemListView;
            this.view.destroy();
        },

        "Should not use a subitemList view": function () {
            this.isContainer = false;

            this.view = new Y.eZ.LocationViewView({
                actionBar: new Y.View(),
                tabs: [],
                contentType: this.contentType,
            });

            Assert.isNull(
                this.view.get('subitemList'),
                "The subitemList attribute should be null"
            );
        },

        "Should use a subitemList view": function () {
            this.isContainer = true;

            this.view = new Y.eZ.LocationViewView({
                actionBar: new Y.View(),
                tabs: [],
                contentType: this.contentType,
            });

            Assert.isInstanceOf(
                Y.eZ.SubitemListView, this.view.get('subitemList'),
                "The subitemList attribute should be an instance of Y.eZ.SubitemListView"
            );
        },
    });

    Y.Test.Runner.setName("eZ Location View view tests");
    Y.Test.Runner.add(test);
    Y.Test.Runner.add(tabsTest);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(destroyTest);
    Y.Test.Runner.add(attrsToSubViewsTest);
    Y.Test.Runner.add(addTabViewTest);
    Y.Test.Runner.add(removeTabViewTest);
    Y.Test.Runner.add(selectedTest);
    Y.Test.Runner.add(forwardActiveTest);
    Y.Test.Runner.add(subitemListAttr);
}, '', {requires: ['test', 'node-event-simulate', 'ez-locationviewview']});

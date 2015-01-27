/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewview-tests', function (Y) {
    var test, tabsTest, eventsTest, destroyTest, attrsToRawContentAndActionBarViewsTest,
        Mock = Y.Mock,
        _getModelMock = function (serialized) {
            var mock = new Y.Test.Mock();

            Y.Mock.expect(mock, {
                method: 'toJSON',
                returns: serialized
            });
            return mock;
        },
        _mockSubViewForRender = function (view) {
            Y.Mock.expect(view, {
                method: 'render',
                returns: view,
            });
            Y.Mock.expect(view, {
                method: 'get',
                args: ['container'],
                returns: Y.Node.create('<div/>'),
            });
        },
        _mockSubViewSetAny = function (view) {
            Mock.expect(view, {
                method: 'set',
                args: [Mock.Value.Any, Mock.Value.Any],
            });
        },
        _mockTarget = function (view) {
            Mock.expect(view, {
                method: 'addTarget',
                args: [Mock.Value.Object],
            });
        },
        _mockDestroy = function (view) {
            Y.Mock.expect(view, {
                method: 'destroy',
            });
            Mock.expect(view, {
                method: 'removeTarget',
                args: [Mock.Value.Object],
            });
        };

    test = new Y.Test.Case({
        name: "eZ Location View view tests",

        setUp: function () {

            this.barMock = new Mock();
            this.rawMock = new Mock();

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

            _mockTarget(this.barMock);
            _mockTarget(this.rawMock);

            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                rawContentView: this.rawMock,
                location : this.locationMock,
                content : this.contentMock,
                path: this.path
            });
        },

        tearDown: function () {
            _mockDestroy(this.barMock);
            _mockDestroy(this.rawMock);
            this.view.destroy();
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl,
                plainLocation = {}, plainContent = {}, path = [],
                container = this.view.get('container');

            _mockSubViewForRender(this.barMock);
            _mockSubViewForRender(this.rawMock);

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.setAttrs({
                location: _getModelMock(plainLocation),
                content: _getModelMock(plainContent),
                path: path
            });
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

            Y.Mock.verify(this.rawMock);
            Y.Mock.verify(this.barMock);
        },

        "Test available variables in the template": function () {
            var plainLocation = {}, path = [],
                plainLocations = [{}, {}, {}],
                plainContents = [{}, {}, {}],
                origTpl = this.view.template,
                location = this.locationMock,
                content = this.contentMock,
                that = this;

            _mockSubViewForRender(this.barMock);
            _mockSubViewForRender(this.rawMock);
            _mockSubViewSetAny(this.barMock);
            _mockSubViewSetAny(this.rawMock);

            Y.Array.each(plainLocations, function (val, k) {
                path.push({
                    location: _getModelMock(plainLocations[k]),
                    content: _getModelMock(plainContents[k])
                });
            });

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
                console.log(variables.location, plainLocation, that.locationMock);
                Y.Assert.areSame(
                    that.locationJSON, variables.location,
                    "location.toJSON() should be passed to the template"
                );
                Y.Assert.areSame(
                    that.contentJSON, variables.content,
                    "content.toJSON() should be passed to the template"
                );
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

            Y.eZ.RawContentView = Y.Base.create('rawContentView', Y.View, [], {}, {
                ATTRS: {
                    content: {},
                    contentType: {},
                    config: {},
                },
            });

            Y.eZ.ActionBarView = Y.Base.create('actionBarView', Y.View, [], {}, {
                ATTRS: {
                    content: {},
                    actionList: {},
                    viewLessText: {},
                    viewMoreText: {},
                },
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
            delete Y.eZ.RawContentView;
            this.view.destroy();
        },

        "Should set the content of the action bar": function () {
            Y.Assert.areSame(
                this.view.get('content'),
                this.view.get('actionBar').get('content'),
                'The content should have been set to the actionBar'
            );
        },

        "Should set the content of the raw content view": function () {
            Y.Assert.areSame(
                this.view.get('content'),
                this.view.get('rawContentView').get('content'),
                'The content should have been set to the rawContentview'
            );
        },

        "Should set the content type of the raw content view": function () {
            Y.Assert.areSame(
                this.view.get('contentType'),
                this.view.get('rawContentView').get('contentType'),
                'The content should have been set to the rawContentview'
            );
        },

        "Should set the config of the raw content view": function () {
            Y.Assert.areSame(
                this.view.get('config'),
                this.view.get('rawContentView').get('config'),
                'The content should have been set to the rawContentview'
            );
        },
    });

    tabsTest = new Y.Test.Case({
        name: "eZ Location view view tabs tests",

        setUp: function () {
            this.barMock = new Mock();
            this.rawMock = new Mock();
            _mockTarget(this.barMock);
            _mockTarget(this.rawMock);
            _mockSubViewForRender(this.barMock);
            _mockSubViewForRender(this.rawMock);
            _mockSubViewSetAny(this.barMock);
            _mockSubViewSetAny(this.rawMock);

            this.view = new Y.eZ.LocationViewView({
                actionBar: this.barMock,
                rawContentView: this.rawMock,
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
            this._selectTab('#last-label a', 'last-label');
        },

        "Should not change selection, when already selected label is tapped": function () {
            this._selectTab('#first-label a', 'first-label');
        },

        tearDown: function () {
            _mockDestroy(this.barMock);
            _mockDestroy(this.rawMock);
            this.view.destroy();
        },

    });

    eventsTest = new Y.Test.Case({
        name: "eZ Location view view events handling tests",

        setUp: function () {
            this.barMock = new Mock();
            this.rawMock = new Mock();
            _mockTarget(this.barMock);
            _mockTarget(this.rawMock);
            this.view = new Y.eZ.LocationViewView({
                rawContentView: this.rawMock,
                actionBar: this.barMock,
                container: '.container',
            });
        },

        tearDown: function () {
            _mockDestroy(this.barMock);
            _mockDestroy(this.rawMock);
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

        "Should destroy the raw content view and the actionbar": function () {
            var bar, raw, view;

            bar = new Y.Mock();
            Y.Mock.expect(bar, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object]
            });

            raw = new Y.Mock();
            Y.Mock.expect(raw, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object]
            });

            view = new Y.eZ.LocationViewView({
                rawContentView: raw,
                actionBar: bar
            });

            Y.Mock.expect(bar, {
                method: 'destroy'
            });
            Y.Mock.expect(bar, {
                method: 'removeTarget',
                args: [view]
            });
            Y.Mock.expect(raw, {
                method: 'removeTarget',
                args: [view]
            });
            Y.Mock.expect(raw, {
                method: 'destroy'
            });

            view.destroy();
            Y.Mock.verify(bar);
            Y.Mock.verify(raw);
        }

    });

    Y.Test.Runner.setName("eZ Location View view tests");
    Y.Test.Runner.add(test);
    Y.Test.Runner.add(tabsTest);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(destroyTest);
    Y.Test.Runner.add(attrsToRawContentAndActionBarViewsTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-locationviewview']});

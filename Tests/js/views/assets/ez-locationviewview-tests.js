YUI.add('ez-locationviewview-tests', function (Y) {
    var test, tabsTest, eventsTest, destroyTest,

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
            this.view = new Y.eZ.LocationViewView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        _mockView: function () {
            var view = new Y.Mock();

            Y.Mock.expect(view, {
                method: 'render',
                run: function () {
                    return view;
                }
            });
            Y.Mock.expect(view, {
                method: 'get',
                args: ['container'],
                run: function () {
                    return Y.Node.create('<div/>');
                }
            });
            Y.Mock.expect(view, {
                method: 'set',
                args: [Y.Mock.Value.Any, Y.Mock.Value.Any]
            });
            return view;
        },

        "Should set the content of the action bar": function () {
            var content = {};

            this.view.set('content', content);
            Y.Assert.areSame(
                content, this.view.get('actionBar').get('content'),
                "The content also have been set on the action bar"
            );
        },


        "Should set the content of the raw content view": function () {
            var content = {};

            this.view.set('content', content);
            Y.Assert.areSame(
                content, this.view.get('rawContentView').get('content'),
                "The content also have been set on the raw content view"
            );
        },

        "Should set the content type of the raw content view": function () {
            var contentType = {},
                rawView = new Y.Mock();

            Y.Mock.expect(rawView, {
                method: 'set',
                args: ['contentType', contentType]
            });

            this.view.set('rawContentView', rawView);
            this.view.set('contentType', contentType);
            Y.Mock.verify(rawView);
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl,
                plainLocation = {}, plainContent = {}, path = [],
                container = this.view.get('container');

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.setAttrs({
                actionBar: this._mockView(),
                rawContentView: this._mockView(),
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


            Y.Mock.verify(this.view.get('rawContentView'));
            Y.Mock.verify(this.view.get('actionBar'));
        },

        "Test available variables in the template": function () {
            var plainLocation = {}, plainContent = {}, path = [],
                plainLocations = [{}, {}, {}],
                plainContents = [{}, {}, {}],
                origTpl = this.view.template,
                location = _getModelMock(plainLocation),
                content = _getModelMock(plainContent);

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
                Y.Assert.areSame(
                    variables.location, plainLocation,
                    "location.toJSON() should be passed to the template"
                );
                Y.Assert.areSame(
                    variables.content, plainContent,
                    "content.toJSON() should be passed to the template"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.setAttrs({
                location: location,
                content: content,
                actionBar: this._mockView(),
                rawContentView: this._mockView(),
                path: path
            });
            this.view.render();
        },

        "Should build the title from the content and the path": function () {
            var contentName = 'Ryan Gosling',
                contentPathNames = ['Hot', 'Male', 'Actors'],
                path = [],
                content = new Y.Mock();

            Y.Array.each(contentPathNames, function (val) {
                var content = new Y.Mock();

                Y.Mock.expect(content, {
                    method: 'get',
                    args: ['name'],
                    returns: val
                });
                path.push({
                    location: {},
                    content: content
                });
            });

            Y.Mock.expect(content, {
                method: 'get',
                args: ['name'],
                returns: contentName
            });

            this.view.setAttrs({
                content: content,
                path: path
            });

            Y.Assert.areEqual(
                contentName + ' / ' + contentPathNames.join(' / '),
                this.view.getTitle(),
                "The title should be build with the content and the path"
            );
        },
    });

    tabsTest = new Y.Test.Case({
        name: "eZ Location view view tabs tests",

        setUp: function () {
            this.view = new Y.eZ.LocationViewView({
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
            this.view.destroy();
        },

    });

    eventsTest = new Y.Test.Case({
        name: "eZ Location view view events handling tests",

        setUp: function () {
            this.view = new Y.eZ.LocationViewView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Events from the action bar should bubble to the location view": function () {
            var bubbled = false;

            this.view.on('*:somethingHappened', function () {
                bubbled = true;
            });
            this.view.get('actionBar').fire('somethingHappened');
            Y.Assert.isTrue(
                bubbled,
                "The event should have bubbled to the location view"
            );
        },

        "Events from the raw content view should bubble to the location view": function () {
            var bubbled = false;

            this.view.on('*:somethingElseHappened', function () {
                bubbled = true;
            });
            this.view.get('rawContentView').fire('somethingElseHappened');
            Y.Assert.isTrue(
                bubbled,
                "The event should have bubbled to the location view"
            );
        },

        "The action bar minimized class should be toggled by the minimizeActionBarAction event": function () {
            var container = this.view.get('container');

            this.view.get('actionBar').fire('minimizeActionBarAction');
            Y.Assert.isTrue(
                container.hasClass('is-actionbar-minimized'),
                "The location view container should get the action bar minimized class"
            );
            this.view.get('actionBar').fire('minimizeActionBarAction');
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
}, '0.0.1', {requires: ['test', 'node-event-simulate', 'ez-locationviewview']});

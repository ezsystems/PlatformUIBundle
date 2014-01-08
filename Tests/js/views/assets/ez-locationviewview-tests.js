YUI.add('ez-locationviewview-tests', function (Y) {
    var test, tabsTest,

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

        "Test render": function () {
            var templateCalled = false,
                origTpl,
                plainLocation = {}, plainContent = {}, path = [];

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
                "The template should have used to render the this.view"
            );
            Y.Assert.areNotEqual(
                "", this.view.get('container').getHTML(),
                "View container should contain the result of the view"
            );
        },

        "Test available variables in the template": function () {
            var plainLocation = {}, plainContent = {}, path = [],
                plainLocations = [{}, {}, {}],
                plainContents = [{}, {}, {}],
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
                return '';
            };
            this.view.setAttrs({
                location: location,
                content: content,
                path: path
            });
            this.view.render();
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

    Y.Test.Runner.setName("eZ Location View view tests");
    Y.Test.Runner.add(test);
    Y.Test.Runner.add(tabsTest);
}, '0.0.1', {requires: ['test', 'node-event-simulate', 'ez-locationviewview']});

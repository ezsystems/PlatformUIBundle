YUI.add('ez-locationviewview-tests', function (Y) {
    var test;

    test = new Y.Test.Case({
        name: "eZ Location View view tests",

        setUp: function () {
            this.view = new Y.eZ.LocationViewView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        _getModelMock: function(serialized) {
            var mock = new Y.Test.Mock();

            Y.Mock.expect(mock, {
                method: 'toJSON',
                returns: serialized
            });
            return mock;
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
                location: this._getModelMock(plainLocation),
                content: this._getModelMock(plainContent),
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
                location = this._getModelMock(plainLocation),
                content = this._getModelMock(plainContent);

            Y.Array.each(plainLocations, function (val, k) {
                path.push({
                    location: test._getModelMock(plainLocations[k]),
                    content: test._getModelMock(plainContents[k])
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

    Y.Test.Runner.setName("eZ Location View view tests");
    Y.Test.Runner.add(test);
}, '0.0.1', {requires: ['test', 'ez-locationviewview']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemgriditemview-tests', function (Y) {
    var renderTest,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ Subitem Grid Item View render test",

        _getModelMock: function (json) {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'toJSON',
                returns: json,
            });
            return mock;
        },

        setUp: function () {
            this.locationJSON = {};
            this.contentJSON = {};
            this.contentTypeJSON = {};
            this.view = new Y.eZ.SubitemGridItemView({
                location: this._getModelMock(this.locationJSON),
                content: this._getModelMock(this.contentJSON),
                contentType: this._getModelMock(this.contentTypeJSON),
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should render the view with the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Should pass the models to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    3, Y.Object.size(vars),
                    "The template should receive 3 variables"
                );
                Assert.areSame(
                    this.contentJSON,
                    vars.content,
                    "The template should receive the jsonified content"
                );
                Assert.areSame(
                    this.contentTypeJSON,
                    vars.contentType,
                    "The template should receive the jsonified contentType"
                );
                Assert.areSame(
                    this.locationJSON,
                    vars.location,
                    "The template should receive the jsonified location"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },
    });

    Y.Test.Runner.setName("eZ Subitem Grid Item View tests");
    Y.Test.Runner.add(renderTest);
}, '', {requires: ['test', 'ez-subitemgriditemview']});

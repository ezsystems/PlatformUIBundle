/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemgriditemview-tests', function (Y) {
    var renderTest, uiStateTest, loadImageVariationTest, errorHandlingTest,
        loadedVariationTest,
        Assert = Y.Assert, Mock = Y.Mock,
        getModelMock = function (json) {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'toJSON',
                returns: json,
            });
            return mock;
        };

    renderTest = new Y.Test.Case({
        name: "eZ Subitem Grid Item View render test",

       setUp: function () {
            var content, contentType;

            this.locationJSON = {};
            this.contentJSON = {};
            this.contentTypeJSON = {};

            content = getModelMock(this.contentJSON);
            contentType = getModelMock(this.contentTypeJSON);
            Mock.expect(content, {
                method: 'getFieldsOfType',
                args: [contentType, 'ezimage'],
                returns: [],
            });

            this.view = new Y.eZ.SubitemGridItemView({
                location: getModelMock(this.locationJSON),
                content: content,
                contentType: contentType,
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

    uiStateTest = new Y.Test.Case({
        name: "eZ Subitem Grid Item View UI state test",

       setUp: function () {
            var content, contentType;

            content = new Mock();
            contentType = {};
            Mock.expect(content, {
                method: 'getFieldsOfType',
                args: [contentType, 'ezimage'],
                returns: [],
            });

            this.view = new Y.eZ.SubitemGridItemView({
                location: {},
                content: content,
                contentType: contentType,
            });
            this.state1 = 'working';
            this.state2 = 'still-working';
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set the state class on the container": function () {
            this.view._set('imageState', this.state1);

            Assert.isTrue(
                this.view.get('container').hasClass('is-state-' + this.state1),
                "The container should get the state class"
            );
        },

        "Should remove the previous state class": function () {
            this["Should set the state class on the container"]();
            this.view._set('imageState', this.state2);

            Assert.isFalse(
                this.view.get('container').hasClass('is-state-' + this.state1),
                "The container should not get the previous state class"
            );
        },
    });

    loadImageVariationTest = new Y.Test.Case({
        name: "eZ Subitem Grid Item View loadImageVariation event test",

       setUp: function () {
            this.content = new Mock();
            this.contentType = {};
            this.imageFields = [];

            Mock.expect(this.content, {
                method: 'getFieldsOfType',
                args: [this.contentType, 'ezimage'],
                run: Y.bind(function () {
                    return this.imageFields;
                }, this),
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testNoEvent: function () {
            this.view = new Y.eZ.SubitemGridItemView({
                location: {},
                content: this.content,
                contentType: this.contentType,
            });

            this.view.on('loadImageVariation', function () {
                Assert.fail("The loadImageVariation should not have been fired");
            });
            Assert.areEqual(
                "no-image", this.view.get('imageState'),
                "The state should be 'no-image'"
            );
            this.view.set('active', true);
            Assert.areEqual(
                "no-image", this.view.get('imageState'),
                "The state should still be 'no-image'"
            );
        },

        "Should not fire the loadImageVariation event (no image field)": function () {
            this.imageFields = [];
            this._testNoEvent();
        },

        "Should not fire the loadImageVariation event (no filled field)": function () {
            this.imageFields = [{fieldValue: null}];
            this._testNoEvent();
        },

        _testEvent: function (field) {
            var fired = false;

            this.view = new Y.eZ.SubitemGridItemView({
                location: {},
                content: this.content,
                contentType: this.contentType,
            });
            this.view.on('loadImageVariation', function (e) {
                fired = true;

                Assert.areEqual(
                    this.get('variationIdentifier'),
                    e.variation,
                    "The requested variation should be the one in the `variationIdentifier` attribute"
                );
                Assert.areSame(
                    field, e.field,
                    "The filled field should be provided"
                );
            });

            Assert.areEqual(
                "no-image", this.view.get('imageState'),
                "The state should be 'no-image'"
            );
            this.view.set('active', true);
            Assert.isTrue(fired, "The loadImageVariation event should have been fired");
            Assert.areEqual(
                "image-loading", this.view.get('imageState'),
                "The state should be 'no-image'"
            );
        },

        "Should fire the loadImageVariation event": function () {
            var field = {fieldValue: {}};

            this.imageFields = [field];
            this._testEvent(field);
        },

        "Should pick the filled image field": function () {
            var field = {fieldValue: {}};

            this.imageFields = [{fieldValue: null}, field];
            this._testEvent(field);
        },
    });

    errorHandlingTest = new Y.Test.Case({
        name: "eZ Subitem Grid Item View error handling test",

       setUp: function () {
            var content, contentType;

            content = new Mock();
            contentType = {};
            Mock.expect(content, {
                method: 'getFieldsOfType',
                args: [contentType, 'ezimage'],
                returns: [],
            });

            this.view = new Y.eZ.SubitemGridItemView({
                location: {},
                content: content,
                contentType: contentType,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set the imageState to 'image-error'": function () {
            this.view.set('loadingError', true);

            Assert.areEqual(
                "image-error", this.view.get('imageState'),
                "The `imageState` attribute should be set to 'image-error'"
            );
        },
    });

    loadedVariationTest = new Y.Test.Case({
        name: "eZ Subitem Grid Item View loaded variation test",

       setUp: function () {
            var content, contentType;

            content = getModelMock({});
            contentType = getModelMock({});
            Mock.expect(content, {
                method: 'getFieldsOfType',
                args: [contentType, 'ezimage'],
                returns: [{fieldValue: {}}],
            });

            this.view = new Y.eZ.SubitemGridItemView({
                location: getModelMock({}),
                content: content,
                contentType: contentType,
            });
            this.view.render();
            this.view.set('active', true);

            this.uri ='http://www.reactiongifs.com/wp-content/uploads/2012/12/pimp-walking.gif';
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should update the imageState attribute": function () {
            this.view.set('imageVariation', {
                uri: this.uri,
            });
            Assert.areEqual(
                "image-loaded",
                this.view.get('imageState'),
                "The imageState should be set to 'image-loaded'"
            );
        },

        "Should render the image": function () {
            this.view.set('imageVariation', {
                uri: this.uri,
            });
            Assert.areEqual(
                this.uri,
                this.view.get('container').one('.ez-subitemgrid-item-image').getAttribute('src'),
                "The src attribute of the image should be set with the URI of the variation"
            );
        },
    });

    Y.Test.Runner.setName("eZ Subitem Grid Item View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(uiStateTest);
    Y.Test.Runner.add(loadImageVariationTest);
    Y.Test.Runner.add(errorHandlingTest);
    Y.Test.Runner.add(loadedVariationTest);
}, '', {requires: ['test', 'ez-subitemgriditemview']});

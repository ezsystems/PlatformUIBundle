/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-image-view-tests', function (Y) {
    var registerTest, viewTest, viewTestEmpty,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Image View tests",

            setUp: function () {
                this.templateVariablesCount = 6;
                this.fieldDefinitionIdentifier= "imageField";
                this.fieldDefinition = {
                    fieldType: "ezimage",
                    identifier: this.fieldDefinitionIdentifier
                };
                this.field = {
                    fieldValue: {
                        variations: {},
                    }
                };
                this.isEmpty = false;
                this.variationIdentifier = 'reference';
                this.view = new Y.eZ.ImageView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    variationIdentifier: this.variationIdentifier,
                });

                Y.one('.app').append(this.view.get('container'));
            },

            tearDown: function () {
                this.view.destroy();
                Y.one('.app').empty();
            },

            "Should fire the loadImageVariation event": function () {
                var loadEvent = false,
                    that = this;

                this.view.on('loadImageVariation', function (e) {
                    loadEvent = true;
                    Assert.areSame(
                        that.field,
                        e.field,
                        "The field should be provided in the event facade"
                    );
                    Assert.areEqual(
                        that.variationIdentifier,
                        e.variation,
                        "The variation identifier should be provided in the event facade"
                    );
                });
                this.view.set('active', true);

                Assert.isTrue(loadEvent, "The loadImageVariation event should have been fired");
            },

            "Should render the view when the imageVariation attribute changes": function () {
                var that = this,
                    imageVariation = {},
                    templateCalled = false,
                    origTpl = this.view.template;

                this.view.template = function (variables) {
                    templateCalled = true;
                    Assert.areSame(
                        imageVariation,
                        variables.imageVariation,
                        "The image variation object should be available in the template"
                    );
                    Assert.areSame(
                        that.view.get('loadingError'),
                        variables.loadingError,
                        "loadingError should be available in the template"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.set('imageVariation', imageVariation);

                Assert.isTrue(templateCalled, "The template has not been used");
            },

            "Should render the view when the loadingError attribute changes": function () {
                var that = this,
                    templateCalled = false,
                    origTpl = this.view.template;

                this.view.template = function (variables) {
                    templateCalled = true;
                    Assert.areSame(
                        that.view.get('loadingError'),
                        variables.loadingError,
                        "loadingError should be available in the template"
                    );
                    return origTpl.apply(this, arguments);
                };

                this.view.set('loadingError', true);

                Assert.isTrue(templateCalled, "The template has not been used");
            },

            "Should try to reload the image when tapping on the retry button": function () {
                var that = this,
                    loadImageVariation = false;

                this.view.render();
                this.view.set('active', true);
                this.view.set('loadingError', true);
                this.view.on('loadImageVariation', function () {
                    loadImageVariation = true;
                });

                this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap', function () {
                    that.resume(function () {
                        Assert.isNull(
                            this.view.get('imageVariation'),
                            "The `imageVariation` attribute should be resetted to null"
                        );
                        Assert.isFalse(
                            this.view.get('loadingError'),
                            "The `loadingError` attribute should be resetted to false"
                        );
                        Assert.isTrue(
                            loadImageVariation,
                            "The loadImageVariation should have been fired"
                        );
                    });
                });
                this.wait();
            },
        })
    );

    viewTestEmpty = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Image View tests (empty)",

            setUp: function () {
                this.templateVariablesCount = 6;
                this.fieldDefinition = {fieldType: "ezimage"};
                this.field = {fieldValue: null};
                this.isEmpty = true;
                this.view = new Y.eZ.ImageView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },

            "Should not fire the loadImageVariation event when the image is empty": function () {
                this.view.on('loadImageVariation', function () {
                    Assert.fail("loadImageVariation method should fail");
                });
                this.view.set('active', true);
            }
        })
    );

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Image View registration test";
    registerTest.viewType = Y.eZ.ImageView;
    registerTest.viewKey = "ezimage";

    Y.Test.Runner.setName('eZ Image view tests');
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(viewTestEmpty);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-image-view', 'ez-genericfieldview-tests']});

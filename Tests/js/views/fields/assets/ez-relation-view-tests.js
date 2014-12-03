/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relation-view-tests', function (Y) {
    var registerTest, viewTestWithContent, viewTestWithoutContent;

    viewTestWithContent = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Relation View tests",

            setUp: function () {
                this.destinationContent = new Y.Mock();
                this.destinationContentToJSON = {anythingJSONed: 'somethingJSONed'};
                Y.Mock.expect(this.destinationContent, {
                    method: 'toJSON',
                    returns: this.destinationContentToJSON
                });

                this.templateVariablesCount = 6;
                this.fieldDefinitionIdentifier= "niceField";
                this.fieldDefinition = {
                    fieldType: "ezobjectrelation",
                    identifier: this.fieldDefinitionIdentifier
                };
                this.field = {fieldValue: {destinationContentId: 42}};
                this.isEmpty = false;
                this.view = new Y.eZ.RelationView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                });

                Y.one('.app').append(this.view.get('container'));
            },

            tearDown: function () {
                this.view.destroy();
                Y.one('.app').empty();
            },

            "Should fire the loadFieldRelatedContent event": function () {
                var loadContentEvent = false,
                    that = this;

                this.view.on('loadFieldRelatedContent', function (e) {
                    loadContentEvent = true;
                    Y.Assert.areSame(
                        that.fieldDefinitionIdentifier,
                        e.fieldDefinitionIdentifier,
                        "fieldDefinitionIdentifier is not the same than the one in the field"
                    );

                });
                this.view.set('active', true);

                Y.Assert.isTrue(loadContentEvent, "loadContentEvent should be called when changing active value");
            },

            "Should render the view when the destinationContent attribute changes": function () {
                var that = this,
                    templateCalled = false,
                    origTpl = this.view.template;

                this.view.template = function (variables) {
                    templateCalled = true;
                    Y.Assert.areSame(
                        that.destinationContentToJSON,
                        variables.destinationContent,
                        'destinationContent should match the destinationContentToJSON value'
                    );
                    Y.Assert.areSame(
                        that.view.get('loadingError'),
                        variables.loadingError,
                        "loadingError should be available in the template"
                    );
                    return origTpl.apply(this, arguments);
                };

                this.view.set('destinationContent', this.destinationContent);

                Y.Assert.isTrue(templateCalled, "The template has not been used");
            },

            "Should render the view when the loadingError attribute changes": function () {
                var that = this,
                    templateCalled = false,
                    origTpl = this.view.template;

                this.view.template = function (variables) {
                    templateCalled = true;
                    Y.Assert.areSame(
                        that.view.get('loadingError'),
                        variables.loadingError,
                        "loadingError should be available in the template"
                    );
                    return origTpl.apply(this, arguments);
                };

                this.view.set('loadingError', true);

                Y.Assert.isTrue(templateCalled, "The template has not been used");
            },

            "Should try to reload the content when tapping on the retry button": function () {
                var that = this,
                    loadFieldRelatedContent = false;

                this.view.render();
                this.view.set('active', true);
                this.view.set('loadingError', true);
                this.view.on('loadFieldRelatedContent', function () {
                    loadFieldRelatedContent = true;
                });

                this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap', function () {
                    that.resume(function () {
                        Y.Assert.isNull(
                            this.view.get('destinationContent'),
                            "The `destinationContent` attribute should be resetted to null"
                        );
                        Y.Assert.isFalse(
                            this.view.get('loadingError'),
                            "The `loadingError` attribute should be resetted to false"
                        );
                        Y.Assert.isTrue(
                            loadFieldRelatedContent,
                            "The loadFieldRelatedContent should have been fired"
                        );
                    });
                });
                this.wait();
            },
        })
    );

    viewTestWithoutContent = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Relation View tests (without related content)",

            setUp: function () {
                this.templateVariablesCount = 6;
                this.fieldDefinition = {fieldType: "ezobjectrelation"};
                this.field = {fieldValue: {destinationContentId: null}};
                this.isEmpty = true;
                this.view = new Y.eZ.RelationView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },

            "Should not fire the loadFieldRelatedContent event when the relation is empty": function () {
                this.view.on('loadFieldRelatedContent', function () {
                    Y.Assert.fail("loadFieldRelatedContent method should fail");
                });
                this.view.set('active', true);
            }
        })
    );

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Relation View registration test";
    registerTest.viewType = Y.eZ.RelationView;
    registerTest.viewKey = "ezobjectrelation";

    Y.Test.Runner.setName('eZ Relation view tests');
    Y.Test.Runner.add(viewTestWithContent);
    Y.Test.Runner.add(viewTestWithoutContent);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-relation-view', 'ez-genericfieldview-tests']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relationlist-view-tests', function (Y) {
    var registerTest, viewTestWithContents, viewTestWithoutContents, viewTestWithEmptyDestinationContentsIdArray, viewTestWithEmptyFieldValue;

    viewTestWithContents = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Relation List View tests",

            setUp: function () {
                this.destinationContent1 = new Y.Mock();
                this.destinationContent2 = new Y.Mock();
                Y.Mock.expect(this.destinationContent1, {
                    method: 'toJSON',
                    returns: this.destinationContent1ToJSON
                });
                Y.Mock.expect(this.destinationContent2, {
                    method: 'toJSON',
                    returns: this.destinationContent2ToJSON
                });
                this.relatedContents = [this.destinationContent1, this.destinationContent2];

                this.destinationContent1ToJSON = {anythingJSONed: 'somethingJSONed'};
                this.destinationContent2ToJSON = {anythingJSONed: 'somethingJSONed'};

                this.templateVariablesCount = 6;
                this.fieldDefinitionIdentifier= "niceField";
                this.fieldDefinition = {
                    fieldType: "ezobjectrelationlist",
                    identifier: this.fieldDefinitionIdentifier
                };
                this.field = {fieldValue: {destinationContentIds:[111, 112, 113]}};
                this.isEmpty = false;
                this.view = new Y.eZ.RelationListView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                });

                Y.one('.app').append(this.view.get('container'));
            },

            tearDown: function () {
                this.view.destroy();
                Y.one('.app').empty();
            },

            "Should fire the loadObjectRelations event": function () {
                var loadContentsEvent = false,
                    that = this;

                this.view.on('loadObjectRelations', function (e) {
                    loadContentsEvent = true;
                    Y.Assert.areSame(
                        that.fieldDefinitionIdentifier,
                        e.fieldDefinitionIdentifier,
                        "fieldDefinitionIdentifier is not the same than the one in the field"
                    );
                });
                this.view.set('active', true);

                Y.Assert.isTrue(loadContentsEvent, "loadContentsEvent should be called when changing active value");
            },

            "Should render the view when the relatedContents attribute changes": function () {
                var that = this,
                    templateCalled = false,
                    origTpl = this.view.template;


                this.view.template = function (variables) {

                    templateCalled = true;

                    Y.Assert.isArray(variables.relatedContents, 'relatedContents should be an array');

                    Y.Array.each(that.relatedContents, function (value, i) {

                        Y.Assert.areSame(
                            value.toJSON(),
                            variables.relatedContents[i],
                            'relatedContents should match the relatedContentsToJSON value'
                        );
                    });

                    Y.Assert.areSame(
                        that.view.get('loadingError'),
                        variables.loadingError,
                        "loadingError should be available in the template"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.set('relatedContents', this.relatedContents);

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
                    loadObjectRelations = false;

                this.view.render();
                this.view.set('active', true);
                this.view.set('loadingError', true);
                this.view.on('loadObjectRelations', function () {
                    loadObjectRelations = true;
                });

                this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap', function () {
                    that.resume(function () {
                        Y.Assert.isNull(
                            this.view.get('relatedContents'),
                            "The `relatedContents` attribute should be resetted to null"
                        );
                        Y.Assert.isFalse(
                            this.view.get('loadingError'),
                            "The `loadingError` attribute should be resetted to false"
                        );
                        Y.Assert.isTrue(
                            loadObjectRelations,
                            "The loadObjectRelations should have been fired"
                        );
                    });
                });
                this.wait();
            },
        })
    );

    viewTestWithoutContents = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Relation list View tests (without related content)",

            setUp: function () {
                this.templateVariablesCount = 6;
                this.fieldDefinition = {fieldType: "ezobjectrelationlist"};
                this.field = {fieldValue: {destinationContentsId: null}};
                this.isEmpty = true;
                this.view = new Y.eZ.RelationListView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },
            "Should not fire the loadObjectRelations event when the relation list is null": function () {
                this.view.on('loadObjectRelations', function () {
                    Y.Assert.fail("loadObjectRelations method should fail");
                });
                this.view.set('active', true);
            }
        })
    );

    viewTestWithEmptyDestinationContentsIdArray = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Relation list View tests (without related content)",

            setUp: function () {
                this.templateVariablesCount = 6;
                this.fieldDefinition = {fieldType: "ezobjectrelationlist"};
                this.field = {fieldValue: {destinationContentsId: []}};
                this.isEmpty = true;
                this.view = new Y.eZ.RelationListView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },
            "Should not fire the loadObjectRelations event when the relation list is an empty array": function () {
                this.view.on('loadObjectRelations', function () {
                    Y.Assert.fail("loadObjectRelations method should fail");
                });
                this.view.set('active', true);
            }
        })
    );

    viewTestWithEmptyFieldValue = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Relation list View tests (without related content)",

            setUp: function () {
                this.templateVariablesCount = 6;
                this.fieldDefinition = {fieldType: "ezobjectrelationlist"};
                this.field = {fieldValue: null};
                this.isEmpty = true;
                this.view = new Y.eZ.RelationListView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },
            "Should not fire the loadObjectRelations event when there is no fieldValue": function () {
                this.view.on('loadObjectRelations', function () {
                    Y.Assert.fail("loadObjectRelations method should fail");
                });
                this.view.set('active', true);
            }
        })
    );

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Relation List View registration test";
    registerTest.viewType = Y.eZ.RelationListView;
    registerTest.viewKey = "ezobjectrelationlist";

    Y.Test.Runner.setName('eZ Relation List view tests');
    Y.Test.Runner.add(viewTestWithContents);
    Y.Test.Runner.add(viewTestWithoutContents);
    Y.Test.Runner.add(viewTestWithEmptyDestinationContentsIdArray);
    Y.Test.Runner.add(viewTestWithEmptyFieldValue);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-relationlist-view', 'ez-genericfieldview-tests']});

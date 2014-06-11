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

                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: "ezobjectrelation"};
                this.fieldDefinitionIdentifier= "niceField";
                this.field = {fieldDefinitionIdentifier: this.fieldDefinitionIdentifier};
                this.isEmpty = false;
                this.view = new Y.eZ.RelationView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },

            "Should sucess load content event with content": function () {
                var loadContentEvent = false,
                    that = this;

                this.view.on('loadAttributeRelatedContent', function (e) {
                    loadContentEvent = true;
                    Y.Assert.areSame(
                        e.fieldDefinitionIdentifier,
                        that.fieldDefinitionIdentifier,
                        "fieldDefinitionIdentifier is not the same than the one in the field"
                    );

                });
                this.view.set('active', true);

                Y.Assert.isTrue(loadContentEvent, "loadContentEvent should be called when changing active value");
            },

            "Should call render method": function () {
                var that = this,
                    templateCalled = false,
                    origTpl = this.view.template;

                this.view.template = function (variables) {
                    templateCalled = true;
                    Y.Assert.areSame(variables.destinationContent,
                        that.destinationContentToJSON,
                        'destinationContent should match the destinationContentToJSON value');
                    return origTpl.apply(this, arguments);
                };

                this.view.set('destinationContent', this.destinationContent);

                Y.Assert.isTrue(templateCalled, "The template has not been used");
            },
        })
    );

    Y.Test.Runner.setName("eZ Relation View tests");
    Y.Test.Runner.add(viewTestWithContent);

    viewTestWithoutContent = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Relation View tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: "ezobjectrelation"};
                this.field = {fieldDefinitionIdentifier: null};
                this.isEmpty = true;
                this.view = new Y.eZ.RelationView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },

            "Should fail load content when no content": function () {
                this.view.on('loadAttributeRelatedContent', function () {
                    Y.Assert.fail("loadAttributeRelatedContent method should fail");
                });
                this.view.set('active', true);
            }
        })
    );

    Y.Test.Runner.setName("eZ Relation View tests");
    Y.Test.Runner.add(viewTestWithoutContent);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Relation View registration test";
    registerTest.viewType = Y.eZ.RelationView;
    registerTest.viewKey = "ezobjectrelation";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'ez-relation-view', 'ez-genericfieldview-tests']});

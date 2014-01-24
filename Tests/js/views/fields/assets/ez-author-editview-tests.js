YUI.add('ez-author-editview-tests', function (Y) {
    var viewTest, addAuthorTest, removeAuthorTest, registerTest,
        container = Y.one('.container'),
        content, contentType,
        jsonContent = {}, jsonContentType = {},
        testMinimalAuthorsList = [{id: 1}],
        testAuthorsList = [{id: 1}, {id: 2}];

    content = new Y.Mock();
    contentType = new Y.Mock();
    Y.Mock.expect(content, {
        method: 'toJSON',
        returns: jsonContent
    });
    Y.Mock.expect(contentType, {
        method: 'toJSON',
        returns: jsonContentType
    });

    viewTest = new Y.Test.Case({
        name: "eZ Author View test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        _getField: function (authorsList) {
            return {
                fieldValue: authorsList
            };
        },

        _createAndRenderView: function (required, authorsList) {
            this.view = new Y.eZ.AuthorEditView({
                container: container,
                field: this._getField(authorsList),
                fieldDefinition: this._getFieldDefinition(required),
                content: content,
                contentType: contentType
            });

            this.view.render();
        },

        _setAuthorInputs: function (name, email) {
            container.one('.ez-author-name').set('value', name);
            container.one('.ez-author-email').set('value', email);
        },

        _setAuthorsInputs: function (name1, email1, name2, email2) {
            container.one('.ez-author-name[data-author-id="1"]').set('value', name1);
            container.one('.ez-author-email[data-author-id="1"]').set('value', email1);
            container.one('.ez-author-name[data-author-id="2"]').set('value', name2);
            container.one('.ez-author-email[data-author-id="2"]').set('value', email2);

        },

        _testAvailableVariables: function (required, authorsList, expectRequired, expectAuthorsList) {
            var fieldDefinition = this._getFieldDefinition(required),
                field = this._getField(authorsList),
                origTpl;

            this.view = new Y.eZ.AuthorEditView({
                container: container,
                field: field,
                fieldDefinition: fieldDefinition,
                content: content,
                contentType: contentType
            });

            origTpl = this.view.template;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(6, Y.Object.keys(variables).length, "The template should receive 6 variables");

                Y.Assert.areSame(
                    jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    field, variables.field,
                    "The field should be available in the field edit view template"
                );

                Y.Assert.areSame(expectRequired, variables.isRequired);
                Y.Assert.areSame(expectAuthorsList, variables.authorsList);

                return origTpl.apply(this, arguments);
            };
            this.view.render();
            this.view.destroy();
        },

        "Test variables for not required field with an empty authors list": function () {
            this._testAvailableVariables(false, testMinimalAuthorsList, false, testMinimalAuthorsList);
        },

        "Test variables for required field with an empty authors list": function () {
            this._testAvailableVariables(true, testMinimalAuthorsList, true, testMinimalAuthorsList);
        },

        "Test variables for not required field with non-empty authors list": function () {
            this._testAvailableVariables(false, testAuthorsList, false, testAuthorsList);
        },

        "Test variables for not required field with non-empty authors list": function () {
            this._testAvailableVariables(true, testAuthorsList, true, testAuthorsList);
        },

        "Test single author validation for not required authors field": function () {

            this._createAndRenderView(false, testMinimalAuthorsList);

            this._setAuthorInputs('', '');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "Both empty inputs are valid, if author is not required"
            );

            this._setAuthorInputs('Author', 'author@something.com');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "Both inputs filled-in with valid info are valid"
            );

            this._setAuthorInputs('Author', 'broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "If name is filled-in but email format is wrong the author is not valid"
            );

            this._setAuthorInputs('Author', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "If name is filled-in but email is empty the author is not valid"
            );

            this._setAuthorInputs('', 'broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "If name is empty and email is not empty the author is not valid"
            );

            this._setAuthorInputs('', 'author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "If name is empty and email is valid the author is not valid"
            );

            this.view.destroy();
        },

        "Test single author validation for required authors field": function () {

            this._createAndRenderView(true, testMinimalAuthorsList);

            this._setAuthorInputs('', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Both empty inputs are not valid, if author is required"
            );

            this._setAuthorInputs('Author', 'author@something.com');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "Both inputs filled-in with valid info are valid"
            );

            this._setAuthorInputs('Author', 'broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "If name is filled-in but email format is wrong the author is not valid"
            );

            this._setAuthorInputs('Author', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "If name is filled-in but email is empty the author is not valid"
            );

            this._setAuthorInputs('', 'broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "If name is empty and email is not empty the author is not valid"
            );

            this._setAuthorInputs('', 'author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "If name is empty and email is valid the author is not valid"
            );

            this.view.destroy();
        },

        "Test 2 authors validation for not required authors field": function () {

            this._createAndRenderView(false, testAuthorsList);

            // Valid cases
            this._setAuthorsInputs('','','','');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "All empty inputs are valid, if author is not required"
            );

            this._setAuthorsInputs('Author','author@something.com','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "Both valid authors are valid"
            );

            this._setAuthorsInputs('','','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "One empty author and one with both inputs filled-in with valid info are valid"
            );

            this._setAuthorsInputs('Author','author@something.com','','');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "One with both inputs filled-in with valid info and one empty author are valid"
            );

            // NON-Valid cases
            this._setAuthorsInputs('Author','author@something.com','Another Author','broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is valid and other has name filled-in but email format wrong, it is a not valid situation"
            );

            this._setAuthorsInputs('','','Another Author','broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is empty and other has name filled-in but email format wrong, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','broken email','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has name filled-in but email format wrong and another author is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','broken email','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has name filled-in but email format wrong and another author is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has name filled-in but email is empty and another author is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has name filled-in but email is empty and another author is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('','','Another Author','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one  author is empty and another author has name filled-in but email is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','author@something.com','Another Author','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is valid and another author has name filled-in but email is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('','broken email','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has empty name and email is in wrong format and another author is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('','broken email','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has empty name and email is in wrong format and another author is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('','','','broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is empty and another author has empty name and email is in wrong format, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','author@something.com','','broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is valid and another author has empty name and email is in wrong format, it is a not valid situation"
            );

            this._setAuthorsInputs('','author@something.com','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has empty name and email is valid and another author is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('','author@something.com','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has empty name and email is valid and another author is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('','','','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is empty and another author has empty name and email is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','author@something.com','','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is valid and another author has empty name and email is valid, it is a not valid situation"
            );

            this.view.destroy();
        },

        "Test 2 authors validation for required authors field": function () {

            this._createAndRenderView(true, testAuthorsList);

            // Valid cases
            this._setAuthorsInputs('Author','author@something.com','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "Both valid authors are valid"
            );

            this._setAuthorsInputs('','','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "One empty author and one with both inputs filled-in with valid info are valid"
            );

            this._setAuthorsInputs('Author','author@something.com','','');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "One with both inputs filled-in with valid info and one empty author are valid"
            );

            // NON-Valid cases
            this._setAuthorsInputs('','','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "All empty inputs are not valid, if author is required"
            );

            this._setAuthorsInputs('Author','author@something.com','Another Author','broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is valid and other has name filled-in but email format wrong, it is a not valid situation"
            );

            this._setAuthorsInputs('','','Another Author','broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is empty and other has name filled-in but email format wrong, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','broken email','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has name filled-in but email format wrong and another author is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','broken email','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has name filled-in but email format wrong and another author is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has name filled-in but email is empty and another author is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has name filled-in but email is empty and another author is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('','','Another Author','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one  author is empty and another author has name filled-in but email is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','author@something.com','Another Author','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is valid and another author has name filled-in but email is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('','broken email','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has empty name and email is in wrong format and another author is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('','broken email','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has empty name and email is in wrong format and another author is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('','','','broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is empty and another author has empty name and email is in wrong format, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','author@something.com','','broken email');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is valid and another author has empty name and email is in wrong format, it is a not valid situation"
            );

            this._setAuthorsInputs('','author@something.com','','');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has empty name and email is valid and another author is empty, it is a not valid situation"
            );

            this._setAuthorsInputs('','author@something.com','Another Author','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author has empty name and email is valid and another author is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('','','','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is empty and another author has empty name and email is valid, it is a not valid situation"
            );

            this._setAuthorsInputs('Author','author@something.com','','another.author@something.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "When one author is valid and another author has empty name and email is valid, it is a not valid situation"
            );

            this.view.destroy();
        }
    });

    addAuthorTest = new Y.Test.Case({
        name: "eZ Author View author adding test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        _getField: function (authorsList) {
            return {
                fieldValue: authorsList
            };
        },

        _createAndRenderView: function (required, authorsList) {
            this.view = new Y.eZ.AuthorEditView({
                container: container,
                field: this._getField(authorsList),
                fieldDefinition: this._getFieldDefinition(required),
                content: content,
                contentType: contentType
            });

            this.view.render();
        },


        "Test adding new author to the list": function () {
            var that = this,
                addAuthorButton;

            this._createAndRenderView(true, testMinimalAuthorsList);
            addAuthorButton = container.one('.ez-author-add-button');

            Y.Assert.areEqual(
                container.all('.ez-single-author-controls').size(),
                1,
                "There should be only one author inputs set at the beginning"
            );

            console.log(addAuthorButton);

            addAuthorButton.simulateGesture('tap', function () {
                that.resume(function () {

                    Y.Assert.areEqual(
                        container.all('.ez-single-author-controls').size(),
                        2,
                        "There should become 2 author inputs sets after adding an author"
                    );

                    this.view.destroy();
                });
            });
            this.wait();
        }


    });


    Y.Test.Runner.setName("eZ Author Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(addAuthorTest);


    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);

    registerTest.name = "Author Edit View registration test";
    registerTest.viewType = Y.eZ.AuthorEditView;
    registerTest.viewKey = "ezauthor";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'editviewregister-tests', 'ez-author-editview', 'node-event-simulate']});

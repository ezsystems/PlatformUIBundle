/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-author-editview-tests', function (Y) {
    "use strict";
    var registerTest, removeButtonTests, validationTests, getFieldTest, getEmptyFieldTest;

    removeButtonTests = new Y.Test.Case({
        name: "eZ Author Edit view remove button handling",

        setUp: function () {
            this.authors = [
                {id: "0", name: "Angel", email: "angel@example.com"},
                {id: "1", name: "Sandy", email: "sandy@example.com"},
                {id: "2", name: "Summer", email: "summer@example.com"},
            ];
            this.fieldDefinition = {isRequired: true};

            this.isNew = false;

            this.content = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: {}
            });
            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: this.isNew
            });

            this.contentType = new Y.Mock();
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: {}
            });

            this.version = new Y.Mock();
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: {}
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.view.get('container').setContent('');
            delete this.view;
        },

        _getView: function (authors) {
            return new Y.eZ.AuthorEditView({
                container: '.container',
                field: {fieldValue: authors},
                fieldDefinition: this.fieldDefinition,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
            });
        },

        "Should be disabled by default": function () {
            var view = this.view = this._getView([]);

            view.render();
            Y.Assert.isTrue(
                view.get('container').one('.ez-field-author-remove').get('disabled'),
                "The remove button should be disabled"
            );
        },

        "Should be enabled with several authors": function () {
            var view = this.view = this._getView(this.authors);

            view.render();
            view.get('container').all('.ez-field-author-remove').each(function (button) {
                Y.Assert.isFalse(
                    button.get('disabled'),
                    "The remove button should be enabled"
                );
            });
        },

        "Should be disabled with one author": function () {
            var view = this.view = this._getView([this.authors[0]]);

            view.render();
            Y.Assert.isTrue(
                view.get('container').one('.ez-field-author-remove').get('disabled'),
                "The remove button should be disabled"
            );
        },

        "Should become enabled when adding a second author": function () {
            var view = this.view = this._getView([this.authors[0]]),
                container = view.get('container'),
                that = this;

            view.render();
            container.one('.ez-field-author-add').simulateGesture('tap', function () {
                that.resume(function () {
                    view.get('container').all('.ez-field-author-remove').each(function (button) {
                        Y.Assert.isFalse(
                            button.get('disabled'),
                            "The remove button should be enabled"
                        );
                    });
                });
            });
            this.wait();
        },

        "Should stay enabled when several authors are left": function () {
            var view = this.view = this._getView(this.authors),
                container = view.get('container'),
                that = this;

            view.render();
            container.one('.ez-field-author-remove').simulateGesture('tap', function () {
                that.resume(function () {
                    var remove = view.get('container').all('.ez-field-author-remove');

                    Y.Assert.areEqual(
                        2, remove.size(),
                        "Two authors UI should be left"
                    );
                    remove.each(function (button) {
                        Y.Assert.isFalse(
                            button.get('disabled'),
                            "The left remove buttons should be enabled"
                        );
                    });
                });
            });
            this.wait();
        },


        "Should become disabled when only one author is left": function () {
            var view = this.view = this._getView([this.authors[0], this.authors[1]]),
                container = view.get('container'),
                that = this;

            view.render();
            container.one('.ez-field-author-remove').simulateGesture('tap', function () {
                that.resume(function () {
                    var remove = view.get('container').all('.ez-field-author-remove');

                    Y.Assert.areEqual(
                        1, remove.size(),
                        "One author UI should be left"
                    );
                    Y.Assert.isTrue(
                        remove.item(0).get('disabled'),
                        "The left remove button should be disabled"
                    );
                });
            });
            this.wait();
        },
    });

    validationTests = new Y.Test.Case({
        name: 'eZ Author Edit view validation test',

        setUp: function () {
            this.authors = [
                {id: "0", name: "Angel", email: "angel@example.com"},
            ];

            this.isNew = false;

            this.content = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: {}
            });
            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: this.isNew
            });
            this.version = new Y.Mock();
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: {}
            });

            this.contentType = new Y.Mock();
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: {}
            });

            this.user = new Y.Base();
            this.userId = '32';
            this.userName = 'notSoCold';
            this.userEmail = 'privateJoke@NY.conf';
            this.user.set('id', this.userId);
            this.user.set('name', this.userName);
            this.user.set('email', this.userEmail);
        },

        tearDown: function () {
            this.view.destroy();
            this.view.get('container').setContent('');
            delete this.view;
        },

        _getView: function (authors, required) {
            return new Y.eZ.AuthorEditView({
                container: '.container',
                field: {fieldValue: authors},
                fieldDefinition: {isRequired: required},
                version: this.version,
                content: this.content,
                contentType: this.contentType,
                user: this.user
            });
        },

        _fillInput: function (selector, value) {
            var container = this.view.get('container'),
                elt = container.one(selector);

            elt.set('value', value);
            elt.simulate('blur');
        },

        _assertEmailError: function () {
            var container = this.view.get('container');

            Y.Assert.isTrue(
                container.one('.ez-view-authorinputview').hasClass('is-email-error'),
                "An error on the email should have been detected"
            );
            Y.Assert.areNotEqual(
                "", container.one(".ez-editfield-error-email").getContent(),
                "The error message related to the email should be displayed"
            );
        },

        _assertNoEmailError: function () {
            var container = this.view.get('container');

            Y.Assert.isFalse(
                container.one('.ez-view-authorinputview').hasClass('is-email-error'),
                "No error should be detected on the email"
            );
            Y.Assert.areEqual(
                "", container.one(".ez-editfield-error-email").getContent(),
                "The error message related to the email should be empty"
            );
        },

        _assertNameError: function () {
            var container = this.view.get('container');

            Y.Assert.isTrue(
                container.one('.ez-view-authorinputview').hasClass('is-name-error'),
                "An error on the name should have been detected"
            );
            Y.Assert.areNotEqual(
                "", container.one(".ez-editfield-error-name").getContent(),
                "The error message related to the name should be displayed"
            );
        },

        _assertNoNameError: function () {
            var container = this.view.get('container');

            Y.Assert.isFalse(
                container.one('.ez-view-authorinputview').hasClass('is-name-error'),
                "No error should be detected on the name"
            );
            Y.Assert.areEqual(
                "", container.one(".ez-editfield-error-name").getContent(),
                "The error message related to the name should be empty"
            );
        },

        _assertFieldError: function () {
            var container = this.view.get('container');

            Y.Assert.isTrue(
                container.hasClass('is-author-error'),
                "The container should have the class 'is-author-error' " + container.getAttribute('class')
            );
        },

        _assertNoFieldError: function () {
            var container = this.view.get('container');

            Y.Assert.isFalse(
                container.hasClass('is-author-error'),
                "The container should not have the class 'is-author-error'"
            );
        },

        "Fill the name and the email": function () {
            var view = this.view = this._getView([], false);

            view.render();
            this._fillInput('.ez-field-author-name', 'Angel');
            this._fillInput('.ez-field-author-email', 'angel@example.com');

            this._assertNoEmailError();
            this._assertNoNameError();
            this._assertNoFieldError();
            Y.Assert.isTrue(view.isValid(), "The input is valid");
        },

        "Fill the name only": function () {
            var view = this.view = this._getView([], false);

            view.render();
            this._fillInput('.ez-field-author-name', 'Angel');

            this._assertNoNameError();
            this._assertEmailError();
            this._assertFieldError();
            Y.Assert.isFalse(view.isValid(), "The input is not valid");
        },

        "Fill the email only": function () {
            var view = this.view = this._getView([], false);

            view.render();
            this._fillInput('.ez-field-author-email', 'angel@example.com');

            this._assertNameError();
            this._assertNoEmailError();
            this._assertFieldError();
            Y.Assert.isFalse(view.isValid(), "The input is not valid");
        },

        "Fill an invalid email only": function () {
            var view = this.view = this._getView([], false);

            view.render();
            this._fillInput('.ez-field-author-email', '@angel');

            this._assertNameError();
            this._assertEmailError();
            this._assertFieldError();
            Y.Assert.isFalse(view.isValid(), "The input is not valid");
        },

        "Fill a name and an invalid email": function () {
            var view = this.view = this._getView([], false);

            view.render();
            this._fillInput('.ez-field-author-name', 'Angel');
            this._fillInput('.ez-field-author-email', '@angel');

            this._assertNoNameError();
            this._assertEmailError();
            this._assertFieldError();
            Y.Assert.isFalse(view.isValid(), "The input is not valid");
        },

        "Fill the second author in a required field": function () {
            var view = this.view = this._getView([], true),
                container = view.get('container'), that = this;

            view.render();

            container.simulateGesture('tap', function () {
                that.resume(function () {
                    this._fillInput('.ez-view-authorinputview:last-of-type .ez-field-author-name', 'Sandy');
                    this._fillInput('.ez-field-author-email:last-of-type', 'sandy@example.com');

                    // no error on the first name/email fields
                    this._assertNoNameError();
                    this._assertNoEmailError();
                    this._assertNoFieldError();
                    Y.Assert.isTrue(view.isValid(), "The input is not valid");
                });
            });
            this.wait();
        },

        "Not fill a required author": function () {
            var view = this.view = this._getView([], true);

            view.render();
            this._fillInput('.ez-view-authorinputview .ez-field-author-name', '');
            this._fillInput('.ez-field-author-email', '');

            this._assertNameError();
            this._assertEmailError();
            this._assertFieldError();

            Y.Assert.isFalse(view.isValid(), "The input is not valid");
        },

        "Should prefill with current user when new content": function () {
            var view,
                container;

            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: true
            });

            view =  this.view = this._getView([], true);
            container = this.view.get('container');
            view.render();

            this._assertNoNameError();
            this._assertNoEmailError();
            this._assertFieldError();
            Y.Assert.areSame(container.one('.ez-field-author-email').get('value'),this.userEmail, 'Author mail should be the current user one' );
            Y.Assert.areSame(container.one('.ez-field-author-name').get('value'), this.userName, 'Author mail should be the current user one' );
            Y.Assert.isTrue(view.isValid(), "The input is valid");
        },
    });
    Y.Test.Runner.setName("eZ Author Edit View tests");
    Y.Test.Runner.add(removeButtonTests);
    Y.Test.Runner.add(validationTests);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            _additionalConstructorParameters: {
                user: new Y.Base({
                    id: '32',
                    name: 'notSoCold',
                    email: 'privateJoke@NY.conf'
                })
            },
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.AuthorEditView,
            newValue: [
                {email: 'damien@example.com', name: 'Damien'},
                {email: 'invalid', name: 'Name'},
                {email: 'author@example.com', name: 'Author'},
            ],

            "Test getField": function () {
                var container = this.view.get('container'),
                    that = this;

                this.view.render();
                container.one('.ez-field-author-add').simulateGesture('tap', function () {
                    container.one('.ez-field-author-add').simulateGesture('tap', function () {
                        that.resume(function () {
                            var updatedField;

                            Y.Array.each(this.newValue, function (author, i) {
                                this._fillAuthor(author, i);
                            }, this);


                            updatedField = this.view.getField();

                            Y.Assert.areNotSame(
                                this.view.get('field'), updatedField,
                                "getField should 'clone' the original field"
                            );

                            Y.Object.each(this.view.get('field'), function (val, key) {
                                if ( key !== 'fieldValue' ) {
                                    Y.Assert.areEqual(
                                        val, updatedField[key],
                                        "The property " + key + " should be kept"
                                    );
                                } else {
                                    this._assertCorrectFieldValue(
                                        updatedField.fieldValue,
                                        "The new value should be available in the fieldValue"
                                    );
                                }
                            }, this);
                        });
                    });
                });

                this.wait();
            },

            init: function () {
                this.content = new Y.Mock();
                Y.Mock.expect(this.content, {
                    method: 'toJSON',
                    returns: {}
                });
                Y.Mock.expect(this.content, {
                    method: 'get',
                    args: ['mainLanguageCode'],
                    returns: 'eng-GB'
                });
                Y.Mock.expect(this.content, {
                    method: 'isNew',
                    returns: true
                });
            },

            _fillAuthor: function (author, i) {
                var container = this.view.get('container');

                container.all('.ez-field-author-name').item(i).set('value', author.name);
                container.all('.ez-field-author-name').item(i).simulate('blur');
                container.all('.ez-field-author-email').item(i).set('value', author.email);
                container.all('.ez-field-author-email').item(i).simulate('blur');
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.areEqual(
                    2, fieldValue.length,
                    "The field value should contain only the valid author"
                );
                Y.Assert.areEqual(this.newValue[0].email, fieldValue[0].email, msg);
                Y.Assert.areEqual(this.newValue[0].name, fieldValue[0].name, msg);

                Y.Assert.areEqual(this.newValue[2].email, fieldValue[1].email, msg);
                Y.Assert.areEqual(this.newValue[2].name, fieldValue[1].name, msg);
            },
        })
    );
    Y.Test.Runner.add(getFieldTest);

    getEmptyFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            _additionalConstructorParameters: {
                user: new Y.Base({
                    id: '32',
                    name: 'notSoCold',
                    email: 'privateJoke@NY.conf'
                })
            },
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.AuthorEditView,
            newValue: [],

            init: function () {
                this.content = new Y.Mock();
                Y.Mock.expect(this.content, {
                    method: 'toJSON',
                    returns: {}
                });
                Y.Mock.expect(this.content, {
                    method: 'get',
                    args: ['mainLanguageCode'],
                    returns: 'eng-GB'
                });
                Y.Mock.expect(this.content, {
                    method: 'isNew',
                    returns: true
                });
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isArray(fieldValue, 'fieldValue should be an array');
                Y.Assert.areEqual(fieldValue.length, 0,  msg);
            },
        })
    );
    Y.Test.Runner.add(getEmptyFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Author Edit View registration test";
    registerTest.viewType = Y.eZ.AuthorEditView;
    registerTest.viewKey = "ezauthor";
    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'node-event-simulate', 'getfield-tests', 'editviewregister-tests', 'ez-author-editview']});

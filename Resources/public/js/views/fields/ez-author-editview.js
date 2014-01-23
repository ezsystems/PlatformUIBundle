YUI.add('ez-author-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Author (ezauthor) fields
     *
     * @module ez-author-editview
     */

    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezauthor',
        MSG_CONFIRM_AUTHOR_DELETE = 'Are you sure you want to delete this author?',
        SINGLE_AUTHOR_CONTROLS_SEL = '.ez-single-author-controls',
        BUTTON_AUTHOR_REMOVE_SEL = '.ez-author-remove-button',
        BUTTON_DISABLED_CLASS = 'pure-button-disabled',
        IS_ERROR_CLASS = 'is-error';

    /**
     * Author edit view
     *
     * @namespace eZ
     * @class AuthorEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.AuthorEditView = Y.Base.create('authorEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-author-input-ui input': {
                'blur': 'validate',
                'valuechange': 'validate'
            },
            '.ez-author-add-button': {
                'tap': '_handleAddAuthorTap'
            },
            '.ez-author-remove-button': {
                'tap': '_handleRemoveAuthorTap'
            }
        },

        /**
         * Custom initializer, which is:
         *  - saving default field value into the 'authorsList' attribute
         *  for future use
         *  - changing 'applyErrorClassToContainer' attribute to false which
         *  allows input-by-input custom validation
         *  - subscribing to the custom 'viewRendered' event of the field edit
         *  view, so the 'Remove Author' button will have correct state
         *
         * @method initializer
         */
        initializer: function () {
            this.set('authorsList', this.get('field').fieldValue);
            this.set('applyErrorClassToContainer', false);
            this.on('viewRendered', Y.bind(this._handleRemoveAuthorButton, this));
        },

        /**
         * Validates the current input of the edit view
         *
         * @method validate
         */
        validate: function () {
            var authorsValidity = this._getAuthorsValidity(),
                authorsValidityList = authorsValidity.authorsValidityList,
                container = this.get('container'),
                isRequired = this.get('fieldDefinition').isRequired;

            container.all('.ez-editfield-input').removeClass(IS_ERROR_CLASS);

            Y.Array.each(authorsValidityList, function (authorValidity) {
                var input;

                if (!authorValidity.valid) {
                    if (!authorValidity.nameValidity.valid) {
                        input = container.one('.ez-author-name[data-author-id="' + authorValidity.id + '"]');
                        input.get('parentNode').get('parentNode').addClass(IS_ERROR_CLASS);
                    }

                    if (!authorValidity.emailValidity.valid) {
                        input = container.one('.ez-author-email[data-author-id="' + authorValidity.id + '"]');
                        input.get('parentNode').get('parentNode').addClass(IS_ERROR_CLASS);
                    }
                }
            });

            if (authorsValidity.allAuthorsAreValid && (!isRequired || !authorsValidity.noAuthorIsPresent)) {
                this.set('errorStatus', false);
            } else if (isRequired && (!authorsValidity.atLeastOneAuthorIsPresent || authorsValidity.noAuthorIsPresent)) {
                this.set(
                    'errorStatus',
                    'At least one author should be filled in'
                );
            } else {
                this.set(
                    'errorStatus',
                    'One or more authors in the list are not valid'
                );
            }
        },

        /**
         * Defines the variables to be imported in the field edit template for the
         * author field
         *
         * @protected
         * @method _variables
         * @return {Object} containing isRequired entry
         */
        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired,
                "authorsList": this.get('authorsList')
            };
        },

        /**
         * Checks state of "Remove author" button. It should be disabled when
         * only one author inputs set is present
         *
         * @method _handleRemoveAuthorButton
         * @protected
         */
        _handleRemoveAuthorButton: function () {
            var container = this.get('container');

            if (container.all(SINGLE_AUTHOR_CONTROLS_SEL).size() === 1) {
                container.one(BUTTON_AUTHOR_REMOVE_SEL).addClass(BUTTON_DISABLED_CLASS);
            } else {
                container.all(BUTTON_AUTHOR_REMOVE_SEL).removeClass(BUTTON_DISABLED_CLASS);
            }

        },

        /**
         * Saves current authors list into the 'authorsList' attribute
         *
         * @method _saveAuthors
         * @protected
         */
        _saveAuthors: function () {
            var authorsList = [],
                author;

            this.get('container').all(SINGLE_AUTHOR_CONTROLS_SEL).each(function (authorControls) {
                author = {};

                author.name = authorControls.one('.ez-author-name').get('value');
                author.email = authorControls.one('.ez-author-email').get('value');
                author.id = authorControls.getAttribute('data-author-id');

                authorsList.push(author);
            });

            this.set('authorsList', authorsList);
        },

        /**
         * Returns object pointing if there are any valid authors in the list
         * and providing an array of validity states for each author inputs set
         *
         * See https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
         *
         * @method _getAuthorsValidity
         * @return {Object}
         * @protected
         */
        _getAuthorsValidity: function () {
            var atLeastOneAuthorIsPresent = false,
                noAuthorIsPresent = true,
                allAuthorsAreValid = true,
                authorsValidityList = [];

            this.get('container').all(SINGLE_AUTHOR_CONTROLS_SEL).each(function (authorControls) {
                var nameValidity = authorControls.one('.ez-author-name').get('validity'),
                    emailValidity = authorControls.one('.ez-author-email').get('validity'),
                    authorValidity = {
                        valid: false
                    };

                if (nameValidity.valid && emailValidity.valid) {
                    authorValidity.valid = true;
                    atLeastOneAuthorIsPresent = true;
                    noAuthorIsPresent = false;
                } else if (nameValidity.valueMissing && emailValidity.valueMissing) {
                    authorValidity.valid = true;
                } else {
                    authorValidity.nameValidity = nameValidity;
                    authorValidity.emailValidity = emailValidity;
                    authorValidity.id = authorControls.one('.ez-author-name').getAttribute('data-author-id');
                }

                if (!authorValidity.valid) {
                    allAuthorsAreValid = false;
                }

                authorsValidityList.push(authorValidity);
            });

            return {
                allAuthorsAreValid: allAuthorsAreValid,
                noAuthorIsPresent: noAuthorIsPresent,
                atLeastOneAuthorIsPresent: atLeastOneAuthorIsPresent,
                authorsValidityList: authorsValidityList
            };
        },

        /**
         * Handles tap on the "Add author" button
         *
         * @method _handleAddAuthorTap
         * @param e {Object} Event facade
         * @protected
         */
        _handleAddAuthorTap: function (e) {
            var authorsList,
                lastId,
                newAuthor = {};

            e.preventDefault();
            this._saveAuthors();
            authorsList = this.get('authorsList');
            lastId = authorsList[authorsList.length - 1].id;

            newAuthor.id = lastId + 1;
            newAuthor.email = "";
            newAuthor.name = "";

            authorsList.push(newAuthor);
            this.set('authorsList', authorsList);

            this.render();
            this.validate();
            this._handleRemoveAuthorButton();
        },

        /**
         * Handles tap on the "Remove author" button
         *
         * @method _handleRemoveAuthorTap
         * @param e {Object} Event facade
         * @protected
         */
        _handleRemoveAuthorTap: function (e) {
            var button = e.currentTarget,
                authorId = button.getAttribute('data-author-id'),
                authorsList;

            e.preventDefault();
            this._saveAuthors();
            authorsList = this.get('authorsList');

            if (!button.hasClass(BUTTON_DISABLED_CLASS) && window.confirm(MSG_CONFIRM_AUTHOR_DELETE)) {
                authorsList.some(function (currentAuthor, index) {
                    if (currentAuthor.id === authorId) {
                        authorsList.splice(index, 1);
                        return true;
                    }
                });

                this.set('authorsList', authorsList);

                this.render();
                this.validate();
                this._handleRemoveAuthorButton();
            }
        }
    }, {
        ATTRS: {
            /**
             * The array of objects which stores current authors list
             *
             * @attribute authorsList
             * @type {Array}
             * @default []
             */
            authorsList: {
                value: []
            }
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.AuthorEditView
    );
});

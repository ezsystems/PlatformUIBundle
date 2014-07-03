/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-author-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Author (ezauthor) fields
     *
     * @module ez-author-editview
     */

    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezauthor',
        AUTHOR_INPUT_SECONDARY = 'ez-author-secondary',
        IS_NAME_ERROR = 'is-name-error',
        IS_EMAIL_ERROR = 'is-email-error',
        AuthorInputView, AuthorList, Author;

    /**
     * Internal author model
     *
     * @private
     * @constructor
     * @class Author
     * @extends Model
     */
    Author = Y.Base.create('authorModel', Y.Model, [], {}, {
        ATTRS: {
            /**
             * Stores the name of the author
             *
             * @attribute name
             * @type String
             * @default ""
             */
            name: {
                value: ""
            },

           /**
            * Stores the email of the author
            *
            * @attribute email
            * @type String
            * @default ""
            */
            email: {
                value: ""
            },

            /**
             * Stores the email validity of the author's email
             *
             * @attribute emailValid
             * @type Boolean
             * @default false
             */
            emailValid: {
                value: false
            }
        }
    });

    /**
     * Internal author models list
     *
     * @private
     * @constructor
     * @class AuthorList
     * @extends ModelList
     */
    AuthorList = Y.Base.create('authorModelList', Y.ModelList, [], {model: Author});

    /**
     * Internal author input view. The author input views are responsible for
     * handling one author.
     *
     * @private
     * @constructor
     * @class AuthorInputView
     * @extends eZ.FieldEditView
     */
    AuthorInputView = Y.Base.create('authorInputView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-field-author-remove': {
                'tap': '_removeSelf'
            },
            '.ez-field-author-email': {
                'blur': '_validateEmail'
            },
            '.ez-field-author-name': {
                'blur': '_validateName'
            }
        },

        initializer: function () {
            this.after('canRemoveChange', this._uiHandleCanRemove);

            this._uiHandleShowInfos();
            this.after('showInfosChange', this._uiHandleShowInfos);
        },

        /**
         * Enables/disables the remove author button depending on the
         * `canRemove` attribute value
         *
         * @method _uiHandleCanRemove
         * @protected
         */
        _uiHandleCanRemove: function () {
            var button = this.get('container').one('.ez-field-author-remove');

            if ( button ) {
                button.set('disabled', !this.get('canRemove'));
            }
        },

        /**
         * Reflects in the DOM the `showInfos` attribute value
         *
         * @method _uiHandleShowInfos
         * @protected
         */
        _uiHandleShowInfos: function () {
            var container = this.get('container');

            if ( !this.get('showInfos') ) {
                container.addClass(AUTHOR_INPUT_SECONDARY);
            } else {
                container.removeClass(AUTHOR_INPUT_SECONDARY);
            }
        },

        _variables: function () {
            return {
                author: this.get('author').toJSON(),
                canRemove: this.get('canRemove'),
                isRequired: this.get('required')
            };
        },

        /**
         * Validates the filled author after the name has been changed
         *
         * @method _validateName
         * @protected
         */
        _validateName: function (e) {
            this.get('author').set('name', e.currentTarget.get('value'));
            this.validate();
        },

        /**
         * Validates the filled author after the email has been changed
         *
         * @method _validateEmail
         * @protected
         */
        _validateEmail: function (e) {
            var author = this.get('author'),
                input = e.currentTarget,
                email = input.get('value'),
                emailValid = input.get('validity').valid;

            author.set('email', email);
            author.set('emailValid', emailValid);
            this.validate();
        },

        /**
         * Validates the current author
         *
         * @method validate
         */
        validate: function () {
            var author = this.get('author'),
                hasName = (author.get('name') !== ''),
                hasEmail = (author.get('email') !== ''),
                emailValid = author.get('emailValid'),
                required = this.get('required'),
                errorStatus = {};

            if ( hasEmail && !emailValid ) {
                errorStatus.email =  'The email address should be valid';
            }
            if ( hasName && !hasEmail ) {
                errorStatus.email = 'The email address is required if the name is filled.';
            }
            if ( hasEmail && !hasName ) {
                errorStatus.name = 'The name is required if the email is filled';
            }

            if ( required && !hasName && !hasEmail ) {
                errorStatus = {
                    name: 'The name is required',
                    email: 'The email address is required'
                };
            } else if ( hasName && hasEmail && emailValid ) {
                errorStatus = {email: false, name: false};
            }

            if ( hasEmail && emailValid ) {
                errorStatus.email = false;
            }
            if ( hasName ) {
                errorStatus.name = false;
            }
            this.set('errorStatus', errorStatus);
        },

        /**
         * Checks whether the currently entered author is valid. Overrides the
         * default implementation to take into account the case where
         * errorStatus contains an object reporting no validation error on both
         * the email and the name.
         *
         * @method isValid
         * @return Boolean
         */
        isValid: function () {
            var errorStatus = this.get('errorStatus');
            return (
                errorStatus === false
                || (!errorStatus.email && !errorStatus.name)
            );
        },

        /**
         * Reflects in the UI the error status value
         *
         * @method _errorUI
         * @protected
         */
        _errorUI: function (e) {
            var container = this.get('container'),
                errorName = container.one('.ez-editfield-error-name'),
                errorEmail = container.one('.ez-editfield-error-email'),
                errorStatus = e.newVal;

            if ( errorStatus && errorStatus.name ) {
                container.addClass(IS_NAME_ERROR);
                errorName.setContent(errorStatus.name);
            } else {
                container.removeClass(IS_NAME_ERROR);
                errorName.setContent('');
            }
            if ( errorStatus && errorStatus.email ) {
                container.addClass(IS_EMAIL_ERROR);
                errorEmail.setContent(errorStatus.email);
            } else {
                container.removeClass(IS_EMAIL_ERROR);
                errorEmail.setContent('');
            }
        },

        /**
         * Tap event handler for the remove author button
         *
         * @method _removeSelf
         * @protected
         */
        _removeSelf: function (e) {
            e.preventDefault();
            /**
             * Fired when the user clicks on the remove author button
             *
             * @event authorRemove
             * @param {Author} author the author model attached to the view
             */
            this.fire('authorRemove', {author: this.get('author')});
        },
    }, {
        ATTRS: {
            /**
             * Stores whether the author can be removed
             *
             * @attribute canRemove
             * @type Boolean
             * @default false
             */
            canRemove: {
                value: false
            },

            /**
             * Stores whether the author is required
             *
             * @attribute required
             * @type Boolean
             * @default false
             */
            required: {
                value: false
            },

            /**
             * Stores whether the field definition name should displayed
             *
             * @attribute showInfos
             * @type Boolean
             * @default true
             */
            showInfos: {
                value: true
            },

            /**
             * The author model attached to this view
             *
             * @attribute author
             * @type Author
             * @default undefined
             */
            author: {},

            /**
             * The content model the field belongs to
             *
             * @attribute content
             * @type eZ.Content
             * @default undefined
             */
            content: {},

            /**
             * The field definition
             *
             * @attribute fieldDefinition
             * @type Object
             * @default undefined
             */
            fieldDefinition: {},
        }
    });

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
            '.ez-field-author-add': {
                'tap': '_addAuthor'
            }
        },

        /**
         * Overrides the default error class defined in eZ.FieldEditView
         *
         * @property _errorClass
         * @protected
         * @type String
         * @default is-author-error
         */
        _errorClass: 'is-author-error',

        initializer: function () {
            /**
             * Stores whether the edit view is rendered
             *
             * @property _rendered
             * @type Boolean
             * @default false
             */
            this._rendered = false;

            /**
             * Array of the AuthorInputView which render each author in the
             * author model list
             *
             * @property _authorInputs
             * @type Array of AuthorInputView
             * @default []
             */
            this._authorInputs = [];

            /**
             * List of authors to render
             *
             * @property _authorList
             * @type AuthorList
             * @default an instance of AuthorList
             */
            this._authorList = new AuthorList();
            this._authorList.after('add', Y.bind(this._uiAddAuthor, this));
            this._authorList.after('remove', Y.bind(this._uiRemoveAuthor, this));

            this._fillAuthorList();

            this.on('*:authorRemove', this._removeAuthor);
            this.after('*:errorStatusChange', this._setErrorStatus);
        },

        destructor: function () {
            this._rendered = false;
            this._authorList.destroy();

            Y.Array.each(this._authorInputs, function (input) {
                input.destroy();
            });
            this._authorInputs = [];
            this._authorList.add({id: 0});
        },

        /**
         * Fills the author list property based on the author available in the
         * field value
         *
         * @protected
         * @method _fillAuthorList
         */
        _fillAuthorList: function () {
            var authors = this.get('field').fieldValue;

            if ( authors.length === 0 ) {
                this._authorList.add({id: 0});
            } else {
                Y.Array.each(authors, function (author) {
                    var a = {
                        id: parseInt(author.id, 10),
                        name: author.name,
                        email: author.email,
                        emailValid: true
                    };

                    this._authorList.add(a);
                }, this);
            }
        },

        /**
         * Author list add event handler. Reflects in the UI the newly added
         * author.
         *
         * @method _uiAddAuthor
         * @protected
         * @param {Object} e the add event facade
         */
        _uiAddAuthor: function (e) {
            var list = this._authorList,
                canRemove = (list.size() > 1),
                showInfos = (list.size() === 1),
                inputView;

            inputView = new AuthorInputView({
                author: e.model,
                canRemove: canRemove,
                content: this.get('content'),
                version: this.get('version'),
                contentType: this.get('contentType'),
                fieldDefinition: this.get('fieldDefinition'),
                showInfos: showInfos,
                required: (this.get('fieldDefinition').isRequired && !this._hasContent)
            });

            this._authorInputs.push(inputView);
            inputView.addTarget(this);
            if ( this._rendered ) {
                this._renderAuthorInput(inputView);
            }

            if ( list.size() === 2 ) {
                this._authorInputs[0].set('canRemove', true);
            }
        },

        /**
         * Author list remove event handler. Reflects in the UI the removed
         * author
         *
         * @method _uiRemoveAuthor
         * @protected
         * @param {Object} e the remove event facade
         */
        _uiRemoveAuthor: function (e) {
            this._authorInputs = Y.Array.filter(this._authorInputs, function (view) {
                if ( view.get('author') === e.model ) {
                    this._removeAuthorInputView(view);
                    return false;
                }
                return true;
            }, this);
            if ( e.target.size() === 1 ) {
                this._authorInputs[0].set('canRemove', false);
            }
            this._authorInputs[0].set('showInfos', true);
            this._setRequiredFlag();
            this.validate();
        },

        /**
         * Custom removeAuthor event handler. Removes an author (provided in the
         * event facade) from the author list
         *
         * @method _removeAuthor
         * @protected
         * @param {Object} e removeAuthor event facade
         */
        _removeAuthor: function (e) {
            this._authorList.remove(e.author);
        },

        /**
         * errorStatusChange event handler. "Forwards" the error status change
         * of the author input view to the author edit view.
         *
         * @method _setErrorStatus
         * @protected
         * @param {Object} e errorStatusChange event facade
         */
        _setErrorStatus: function (e) {
            this.set(
                'errorStatus',
                !Y.Array.every(this._authorInputs, function (view) {
                    return view.isValid();
                })
            );
            this._setRequiredFlag();
        },

        /**
         * Removes the author input view instance from the DOM
         *
         * @method _removeAuthorInputView
         * @protected
         */
        _removeAuthorInputView: function (view) {
            view.removeTarget(this);
            view.get('container').remove();
            view.destroy();
        },

        /**
         * Sets the required flag of the author input views depending on the
         * field definition configuration and on the current input
         *
         * @method _setRequiredFlag
         * @protected
         */
        _setRequiredFlag: function () {
            var fieldRequired = this.get('fieldDefinition').isRequired,
                hasContent = this._hasContent();

            Y.Array.each(this._authorInputs, function (view) {
                view.set('required', !hasContent && fieldRequired);
            });
        },

        /**
         * Validates the current input
         *
         * @method validate
         */
        validate: function () {
            Y.Array.each(this._authorInputs, function (view) {
                view.validate();
            });
        },

        /**
         * Checks that at least one author is correctly filled.
         *
         * @method _hasContent
         * @protected
         * @return boolean
         */
        _hasContent: function () {
            return Y.Array.some(this._authorInputs, function (view) {
                var author = view.get('author');

                return (author.get('name') && author.get('email') && author.get('emailValid'));
            });
        },

        /**
         * Renders the view and its author input views
         *
         * @method render
         * @return {eZ.AuthorEditView} the view it self
         */
        render: function () {
            this.constructor.superclass.render.apply(this);
            this._renderAuthorInputs();
            this._rendered = true;
            return this;
        },

        /**
         * Renders the author input views
         *
         * @method _renderAuthorInputs
         * @protected
         */
        _renderAuthorInputs: function () {
            Y.Array.each(this._authorInputs, function (view) {
                this._renderAuthorInput(view);
            }, this);
        },

        /**
         * Render the author input view in parameter in the correct container
         *
         * @method _renderAuthorInput
         * @protected
         */
        _renderAuthorInput: function (view) {
            var inputContainer = this.get('container').one('.ez-authors-input-container');

            inputContainer.append(view.render().get('container'));
        },

        /**
         * Event handler for the tap event on the add author button. Adds a new
         * author in the author list
         *
         * @method _addAuthor
         * @protected
         * @param {Object} e tap event facade
         */
        _addAuthor: function (e) {
            var id;

            e.preventDefault();
            id = this._authorList.item(this._authorList.size() - 1).get('id') + 1;
            this._authorList.add({"id": id});
        },

        /**
         * Defines the variables to imported in the field edit template for the
         * url field
         *
         * @protected
         * @method _variables
         * @return {Object}
         */
        _variables: function () {
            return {};
        },

        /**
         * Returns an array of the author based on the current user input. Only
         * the valid authors are listed.
         *
         * @method _getFieldValue
         * @protected
         * @return Array
         */
        _getFieldValue: function () {
            var value = [];

            this._authorList.each(function (author) {
                var a = author.toJSON();

                if ( a.emailValid ) {
                    delete a.emailValid;
                    value.push(a);
                }
            });
            return value;
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.AuthorEditView
    );
});

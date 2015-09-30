/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-user-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the User (ezuser) fields
     *
     * @module ez-user-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezuser',
        IS_CHECKING_LOGIN = 'is-checking-login',
        AVAILABLE = 'available',
        UNAVAILABLE = 'unavailable',
        CHECKING = 'checking',
        ERROR = 'error';

    /**
     * User edit field view
     *
     * @namespace eZ
     * @class UserEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.UserEditView = Y.Base.create('userEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-user-login-value': {
                'blur': '_validateLogin',
                'valuechange': '_validateLogin',
            },
            '.ez-user-email-value': {
                'blur': '_validateEmail',
                'valuechange': function () {
                    if ( this.get('emailErrorStatus') ) {
                        this._validateEmail();
                    }
                },
            },
            '.ez-user-confirmpassword-value': {
                'blur': '_validatePassword',
                'valuechange': '_validatePassword',
            },
        },

        initializer: function () {
            this.after(
                ['loginErrorStatusChange', 'emailErrorStatusChange', 'passwordErrorStatusChange'],
                this._uiUserError
            );

            this.after('loginAvailabilityStatusChange', this._uiLoginAvailability);
        },

        /**
         * `loginAvailabilityStatusChange` event handler.
         *
         * @method _uiLoginAvailability
         * @protected
         */
        _uiLoginAvailability: function () {
            var availability = this.get('loginAvailabilityStatus'),
                handleClass = 'removeClass';

            if ( availability === UNAVAILABLE ) {
                this.set('loginErrorStatus', 'This login is not available');
            } else if ( availability === AVAILABLE ) {
                this.set('loginErrorStatus', false);
            } else if ( availability === CHECKING ) {
                handleClass = 'addClass';
            }
            this.get('container')[handleClass](IS_CHECKING_LOGIN);
        },

        /**
         * Set the login availability status to available
         *
         * @method setLoginAvailable
         */
        setLoginAvailable: function () {
            this._set('loginAvailabilityStatus', AVAILABLE);
        },

        /**
         * Set the login availability status to unavailable
         *
         * @method setLoginUnavailable
         */
        setLoginUnavailable: function () {
            this._set('loginAvailabilityStatus', UNAVAILABLE);
        },

        /**
         * Set the login availability status to checking
         *
         * @method setCheckingLogin
         */
        setCheckingLogin: function () {
            this._set('loginAvailabilityStatus', CHECKING);
        },

        /**
         * Set the login availability status to error
         *
         * @method setUnableToCheckLogin
         */
        setUnableToCheckLogin: function () {
            this._set('loginAvailabilityStatus', ERROR);
        },

        /**
         * `*ErrorStatusChange` event handler, it sets or removes the error in
         * the correct place depending on the `*ErrorStatus` attribute changed.
         *
         * @method _uiUserError
         * @protected
         * @param {EventFacade} e
         */
        _uiUserError: function (e) {
            var errorNode = this._getErrorDOMNode(e.attrName),
                subContainer = this._getSubContainer(e.attrName);

            if ( !e.newVal ) {
                errorNode.setContent('');
                subContainer.removeClass(this._errorClass);
            } else {
                errorNode.setContent(e.newVal);
                subContainer.addClass(this._errorClass);
            }
        },

        /**
         * Returns the structured filled value. Note that for the User field,
         * this can not be directly used in an update or create struct as the
         * Users have a special API.
         *
         * @protected
         * @method _getFieldValue
         * @return {Object}
         */
        _getFieldValue: function () {
            var fieldValue = {
                    login: this._getInputFieldValue('login'),
                    email: this._getInputFieldValue('email'),
                },
                password = this._getInputFieldValue('password');

            if ( password ) {
                fieldValue.password = password;
            }

            return fieldValue;
        },

        /**
         * Validates the current input of the user.
         *
         * @method validate
         */
        validate: function () {
            this._validateLogin(false);
            this._validateEmail();
            this._validatePassword();
        },

        /**
         * Validates the login input. There's no syntax validation but the
         * login is required if the field is required or if the email has
         * been filled by the editor.
         *
         * @method _validateLogin
         * @param {Boolean} checkUnicity
         * @protected
         */
       _validateLogin: function (checkUnicity) {
            var loginRequired = (this._isLoginRequired() || this._getInputFieldValue('email')),
                login = this._getInputFieldValue('login');

            if ( checkUnicity && login ) {
                this._checkLoginAvailability(login);
                this.set('loginErrorStatus', false);
            } else if ( loginRequired && !login ) {
                this.set('loginErrorStatus', 'The login is required');
            } else {
                this.set('loginErrorStatus', false);
            }
        },

       /**
        * Fires the `isLoginAvailable` to get the availability status of the
        * given login.
        *
        * @method _checkLoginAvailability
        * @protected
        * @param {String} login
        */
        _checkLoginAvailability: function (login) {
           this.setCheckingLogin();
           this.fire('isLoginAvailable', {
               login: login,
           });
       },

       /**
        * Validates the email input. The email should be a valid email and is
        * required if the field is required or if the login has been filled
        * by the editor.
        *
        * @method _validateEmail
        * @protected
        */
        _validateEmail: function () {
            var emailRequired = (this._isFieldRequired() || this._getInputFieldValue('login')),
                validity = this._getEmailInputValidity();

            if ( validity.typeMismatch ) {
                this.set('emailErrorStatus', 'The email is not valid');
            } else if ( emailRequired && !this._getInputFieldValue('email') ) {
                this.set('emailErrorStatus', 'The email is required');
            } else {
                this.set('emailErrorStatus', false);
            }
        },

        /**
         * Validates the password inputs. Both values should be the same.
         *
         * @method _validatePassword
         * @protected
         */
        _validatePassword: function () {
            var password = this._getInputFieldValue('password'),
                confirmedPassword = this._getInputFieldValue('confirmpassword'),
                passwordRequired = (this._isPasswordRequired() || password || confirmedPassword);

            if ( password !== confirmedPassword ) {
                this.set('passwordErrorStatus', 'Passwords must match');
            } else if ( passwordRequired && !password ) {
                this.set('passwordErrorStatus', 'The password is required');
            } else {
                this.set('passwordErrorStatus', false);
            }
        },

        _variables: function () {
            return {
                readOnlyLogin: this._hasStoredLogin(),
                loginRequired: this._isLoginRequired(),
                passwordRequired: this._isPasswordRequired(),
                isRequired: this._isFieldRequired(),
            };
        },

        /**
         * Checks whether the field is set as required.
         *
         * @method _isFieldRequired
         * @protected
         * @return {Boolean}
         */
        _isFieldRequired: function () {
            return this.get('fieldDefinition').isRequired;
        },

        /**
         * Checks whether the login is required. It's required when the field
         * is required and if a login is not already stored.
         *
         * @method _isLoginRequired
         * @protected
         * @return {Boolean}
         */
        _isLoginRequired: function () {
            return (this.get('fieldDefinition').isRequired && !this._hasStoredLogin());
        },

        /**
         * Checks whether the password is required. It's required when the field
         * is required and if a password is not already stored.
         *
         * @method _isPasswordRequired
         * @protected
         * @return {Boolean}
         */
        _isPasswordRequired: function () {
            return this._isLoginRequired();
        },

        /**
         * Checks whether the field already has stored a login. This is useful
         * to detect if the login or the password is required.
         *
         * @method _hasStoredLogin
         * @protected
         * @return {Boolean}
         */
        _hasStoredLogin: function () {
            var fieldValue = this.get('field').fieldValue;

            return !!(fieldValue && fieldValue.hasStoredLogin);
        },

        /**
         * Returns the input field value for the given property.
         *
         * @method _getInputFieldValue
         * @param {String} property 'login', 'email', 'password' or 'confirmpassword'
         * @private
         * @return {String}
         */
        _getInputFieldValue: function (property) {
            var input = this.get('container').one('.ez-user-' + property + '-value');

            return input.get('value');
        },

        /**
         * Returns the email input validity object.
         * See https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
         *
         * @method _getEmailInputValidity
         * @private
         * @return {ValidityState}
         */
        _getEmailInputValidity: function () {
            return this.get('container').one('.ez-user-email-value').get('validity');
        },

        /**
         * Returns the DOM Node where to display an error for the given
         * error status attribute.
         *
         * @method _getErrorDOMNode
         * @private
         * @param {String} attributeName
         * @return {Node}
         */
        _getErrorDOMNode: function (attributeName) {
            var selectorPart = this._attributeNametoSelectorPart(attributeName);

            return this.get('container').one('.ez-editfield-' + selectorPart + '-error-message');
        },

        /**
         * Returns the *sub-container* from the given attribute name ie the part
         * of the DOM dedicated to one of the property (login, email,
         * password).
         *
         * @method _getSubContainer
         * @private
         * @param {String} attributeName
         * @return {Node}
         */
        _getSubContainer: function (attributeName) {
            var selectorPart = this._attributeNametoSelectorPart(attributeName);

            return this.get('container').one('.ez-editfield-row-' + selectorPart);
        },

        /**
         * Converts the attribute error status identifier to its corresponding
         * ezuser property (login, email, password, confirmpassword)
         *
         * @private
         * @method _attributeNametoSelectorPart
         * @param {String} attributeName
         * @return {String}
         */
        _attributeNametoSelectorPart: function (attributeName) {
            return attributeName.replace('ErrorStatus', '');
        },
    }, {
        ATTRS: {
            /**
             * Overrides the default errorStatus attribute to compute it based
             * on `loginErrorStatus`, `emailErrorStatus` and
             * `passwordErrorStatus`.
             *
             * @attribute errorStatus
             * @readOnly
             * @type {Boolean}
             */
            errorStatus: {
                readOnly: true,
                getter: function () {
                    return !!(
                        this.get('loginErrorStatus') ||
                        this.get('emailErrorStatus') ||
                        this.get('passwordErrorStatus')
                    );
                },
            },

            /**
             * `loginErrorStatus` error status
             *
             * @attribute loginErrorStatus
             * @type {Boolean|String}
             */
            loginErrorStatus: {
                value: false,
            },

            /**
             * Flag indicating whether the login availability status.
             * Use `setLoginAvailable`, `setLoginUnavailable`,
             * `setCheckingLogin` or `setUnableToCheckLogin` to set it to the
             * correct value.
             *
             * @attribute loginAvailabilityStatus
             * @type {String}
             * @readOnly
             */
            loginAvailabilityStatus: {
                value: '',
            },

            /**
             * `emailErrorStatus` error status
             *
             * @attribute emailErrorStatus
             * @type {Boolean|String}
             */
            emailErrorStatus: {
                value: false,
            },

            /**
             * `passwordErrorStatus` error status
             *
             * @attribute passwordErrorStatus
             * @type {Boolean|String}
             */
            passwordErrorStatus: {
                value: false,
            },
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.UserEditView
    );
});

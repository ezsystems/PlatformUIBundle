/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditviewservice', function (Y) {
    'use strict';
    /**
     * Provides the view service component for the content edit view
     *
     * @module ez-contenteditviewservice
     */
    Y.namespace('eZ');

    /**
     * Content edit view service.
     *
     * Loads the models needed by the content edit view
     *
     * @namespace eZ
     * @class ContentEditViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.ContentEditViewService = Y.Base.create('contentEditViewService', Y.eZ.ViewService, [], {
        initializer: function () {
            this.on('*:closeView', this._handleCloseView);
            this.after('*:requestChange', function () {
                this._setLanguageCode();
                this._setBaseLanguageCode();
            });
            this.on('*:changeLanguage', this._selectLanguage);

            this._setLanguageCode();
            this._setBaseLanguageCode();
        },

        /**
         * Loads the content, the main location, the content type and the owner
         * of the currently edited content, after that it sets version fields
         *
         * @method _load
         * @protected
         * @param {Function} next
         */
        _load: function (next) {
            var request = this.get('request'),
                service = this,
                languageCode = this.get('languageCode'),
                baseLanguageCode = this.get('baseLanguageCode'),
                languageCodeForLoadContent = baseLanguageCode ? baseLanguageCode : languageCode;

            this.get('version').reset();
            this._loadContent(request.params.id, languageCodeForLoadContent, function () {
                var tasks,
                    content = service.get('content'),
                    translationExists,
                    resources;

                translationExists = service._checkIfTranslationExists(content, languageCodeForLoadContent);

                if (baseLanguageCode && !translationExists) {
                    service._error(
                        "Could not load the content with id '" + content.get('contentId')
                        + "' and languageCode '" + baseLanguageCode + "'"
                    );
                    return;
                }

                resources = content.get('resources');

                tasks = new Y.Parallel();

                service._loadOwner(resources.Owner, tasks.add());
                service._loadLocation(resources.MainLocation, tasks.add());
                service._loadContentType(resources.ContentType, tasks.add());

                tasks.done(function () {
                    service._setVersionFields(content, translationExists);
                    next(service);
                });
            });
        },

        /**
         * Checks if given languageCode is included in translations list of given content
         *
         * @method _checkIfTranslationExists
         * @private
         * @param {Y.eZ.Content} content
         * @param {String} languageCode
         * @return {Boolean}
         */
        _checkIfTranslationExists: function (content, languageCode) {
            var translationExists;

            translationExists = Y.Array.find(
                content.get('currentVersion').getTranslationsList(),
                function (translation) {
                    return (translation === languageCode);
                }
            );

            return !!translationExists;
        },

        /**
         * Sets fields of edited version
         *
         * @method _setVersionFields
         * @private
         * @param {Y.eZ.Content} content
         * @param {Boolean} translationExists defines if fields will be set for existing translation
         */
        _setVersionFields: function (content, translationExists) {
            var fields,
                version = this.get('version');

            fields = this._getFieldsForEdit(content, translationExists);

            version.set('fields', fields);
        },

        /**
         * Returns object containing fields definitions for given content.
         * If editing content in context of creating new translation it returns fields based on default field
         * defitnitions of ContentType if no baseLanguageCode was set, otherwise if baseLanguageCode was set
         * it returns fields cloned from loaded content with setting proper languageCode.
         * If editing content in context of editing existing translation it returns fields from loaded content
         * which is default behaviour.
         *
         * @method _getFieldsForEdit
         * @private
         * @param {Y.eZ.Content} content
         * @param {Boolean} translationExists
         * @return {Object}
         */
        _getFieldsForEdit: function (content, translationExists) {
            var baseLanguageCode = this.get('baseLanguageCode'),
                languageCode = this.get('languageCode'),
                contentFields = content.get('fields'),
                setDefaultFields = false,
                fields;

            if (!baseLanguageCode && !translationExists) {
                setDefaultFields = true;
            }

            if (setDefaultFields) {
                fields = this._getDefaultFields(languageCode);
            } else {
                fields = Y.clone(contentFields);

                Y.each(fields, function (field) {
                    field.languageCode = languageCode;
                });
            }

            return fields;
        },

        /**
         * Returns collection of default fields for ContentType of edited content and sets
         * for them given languageCode
         *
         * @method _getDefaultFields
         * @private
         * @param {String} languageCode
         * @return {Object}
         */
        _getDefaultFields: function (languageCode) {
            var contentType = this.get('contentType'),
                defaultFields = {};

            Y.Object.each(contentType.get('fieldDefinitions'), function (fieldDef, identifier) {
                defaultFields[identifier] = {
                    fieldDefinitionIdentifier: identifier,
                    fieldValue: fieldDef.defaultValue,
                    languageCode: languageCode
                };
            });

            return defaultFields;
        },

        /**
         * Loads a content by its id and language code
         *
         * @method _loadContent
         * @protected
         * @param {String} id
         * @param {String} languageCode
         * @param {Function} callback
         */
        _loadContent: function (id, languageCode, callback) {
            this._loadModel(
                'content',
                id,
                {languageCode: languageCode},
                "Could not load the content with id '" + id + "' and languageCode '" + languageCode + "'",
                callback
            );
         },

        /**
         * Loads a content type by its id
         *
         * @method _loadContentType
         * @protected
         * @param {String} id
         * @param {Function} callback
         */
        _loadContentType: function (id, callback) {
            this._loadModel('contentType', id, {}, "Could not load the content type with id '" + id + "'", callback);
        },

        /**
         * Loads a location type by its id
         *
         * @method _loadLocation
         * @protected
         * @param {String} id
         * @param {Function} callback
         */
        _loadLocation: function (id, callback) {
            this._loadModel('location', id, {}, "Could not load the location with id '" + id + "'", callback);
        },

        /**
         * Loads a user by its id
         *
         * @method _loadOwner
         * @protected
         * @param {String} id
         * @param {Function} callback
         */
        _loadOwner: function (id, callback) {
            this._loadModel('owner', id, {}, "Could not load the user with id '" + id + "'", callback);
        },

        /**
         * Utility method to load a model by its id in a given attribute
         *
         * @method _loadModel
         * @protected
         * @param {String} attr
         * @param {String} id
         * @param {Object} options
         * @param {String} errorMsg
         * @param {Function} callback
         */
        _loadModel: function (attr, modelId, options, errorMsg, callback) {
            var model = this.get(attr),
                loadOptions = {api: this.get('capi')};

            model.set('id', modelId);
            model.load(Y.merge(loadOptions, options), Y.bind(function (error) {
                if (!error) {
                    callback();

                    return;
                }
                this._error(errorMsg);
            }, this));
        },

        /**
         * Returns the view parameters of the content edit view
         *
         * @method _getViewParameters
         * @protected
         * @return {Object}
         */
        _getViewParameters: function () {
            return {
                content: this.get('content'),
                version: this.get('version'),
                mainLocation: this.get('location'),
                contentType: this.get('contentType'),
                owner: this.get('owner'),
                config: this.get('config'),
                languageCode: this.get('languageCode'),
            };
        },

        /**
         * Close view event handler.
         *
         * @method _handleCloseView
         * @protected
         */
        _handleCloseView: function () {
            this.get('app').navigate(this.get('closeRedirectionUrl'));
        },

        /**
         * Set languageCode attribute basing on parameter from request
         *
         * @method _setLanguageCode
         * @protected
         */
        _setLanguageCode: function () {
            this.set('languageCode', this.get('request').params.languageCode);
        },

        /**
         * Set baseLanguageCode attribute basing on parameter from request
         *
         * @method _setBaseLanguageCode
         * @protected
         */
        _setBaseLanguageCode: function () {
            if (this.get('request').params.baseLanguageCode) {
                this.set('baseLanguageCode', this.get('request').params.baseLanguageCode);
            } else {
                this.reset('baseLanguageCode');
            }
        },

        /**
         * Returns uri for user redirection.
         *
         * @method _redirectionUrl
         * @protected
         * @return {String}
         */
        _redirectionUrl: function (value) {
            if ( !value ) {
                return this.get('app').routeUri( 'viewLocation', {
                    id: this.get('location').get('id'),
                    languageCode: this.get('languageCode')
                });
            } else if ( typeof value === 'function' ) {
                return value.call(this);
            }
            return value;
        },

        /**
         * changeLanguage event handler. It opens languageSelectionBox for selecting
         * language of edited content
         *
         * @method _selectLanguage
         * @private
         * @param {EventFacade} e
         */
        _selectLanguage: function (e) {
            var that = this;

            e.preventDefault();
            this.fire('languageSelect', {
                config: {
                    title: "Change language to:",
                    languageSelectedHandler: Y.bind(this._changeContentLanguage, this),
                    cancelLanguageSelectionHandler: null,
                    canBaseTranslation: false,
                    translationMode: false,
                    referenceLanguageList: that.get('content').get('currentVersion').getTranslationsList()
                },
            });
        },

        /**
         * Changes language of edited content
         *
         * @method _changeContentLanguage
         * @private
         * @param {EventFacade} e
         * @param {String} e.selectedLanguageCode language code to which edited ontent will be switched
         */
        _changeContentLanguage: function (e) {
            var app = this.get('app'),
                service = this;

            app.navigateTo('editContent', {
                id: service.get('content').get('id'),
                languageCode: e.selectedLanguageCode
            });
        }
    }, {
        ATTRS: {
            /**
             * The content to be loaded
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {
                valueFn: function () {
                    return new Y.eZ.Content();
                }
            },

            /**
             * The main location of the content
             *
             * @attribute location
             * @type Y.eZ.Location
             */
            location: {
                valueFn: function () {
                    return new Y.eZ.Location();
                }
            },

            /**
             * The owner of the content
             *
             * @attribute owner
             * @type Y.eZ.User
             */
            owner: {
                valueFn: function () {
                    return new Y.eZ.User();
                }
            },

            /**
             * The version that will be edited
             *
             * @attribute version
             * @type eZ.Version
             */
            version: {
                valueFn: function () {
                    return new Y.eZ.Version();
                }
            },

            /**
             * The content type of the content
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             */
            contentType: {
                valueFn: function () {
                    return new Y.eZ.ContentType();
                }
            },

            /**
             * The URL user will be redirected to after closing the edit view
             *
             * @attribute closeRedirectionUrl
             * @type {Object}
             */
            closeRedirectionUrl: {
                getter: '_redirectionUrl'
            },

            /**
             * The URL user will be redirected to after discarding changes
             *
             * @attribute discardRedirectionUrl
             * @type {Object}
             */
            discardRedirectionUrl: {
                getter: '_redirectionUrl'
            },

            /**
             * The url user will be redirected to after publishing the content
             *
             * @attribute closeRedirectionUrl
             * @type {Object}
             */
            publishRedirectionUrl: {
                getter: '_redirectionUrl',
            },

            /**
             * The language code in which the content is edited.
             *
             * @attribute languageCode
             * @type String
             */
            languageCode: {},

            /**
             * The language code on which new translation is basing.
             *
             * @attribute baseLanguageCode
             * @default null
             * @type String
             */
            baseLanguageCode: {
                value: null
            }
        }
    });
});

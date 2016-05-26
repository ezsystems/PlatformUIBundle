/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service components to create some content
     *
     * @module ez-contenteditviewservice
     */
    Y.namespace('eZ');

    /**
     * Content create view service.
     *
     * It initializes the models to use while creating a content.
     *
     * @namespace eZ
     * @class ContentCreateViewService
     * @constructor
     * @extends eZ.ContentEditViewService
     */
    Y.eZ.ContentCreateViewService = Y.Base.create('contentCreateViewService', Y.eZ.ContentEditViewService, [], {
        initializer: function () {
            this.on('*:changeLanguage', this._selectLanguage);
        },

        _load: function (next) {
            var type = this.get('contentType'),
                service = this;

            this._setRedirectionUrls();

            if ( !type.get('fieldDefinitions') ) {
                type.load({api: this.get('capi')}, function (err) {
                    if ( err ) {
                        return service._error("Could not load the content type with id '" + type.get('id') + "'");
                    }
                    service._initModels(next);
                });
            } else {
                service._initModels(next);
            }
        },

        /**
         * Initializes the content, version and ower model so that the edit form
         * is correctly displayed
         *
         * @method _initModels
         * @protected
         * @param {Function} callback
         */
        _initModels: function (callback) {
            var content = new Y.eZ.Content(),
                version = new Y.eZ.Version(),
                type = this.get('contentType'),
                defaultFields = {};

            content.set('name', this._getNewContentName());
            Y.Object.each(type.get('fieldDefinitions'), function (fieldDef, identifier) {
                defaultFields[identifier] = {
                    fieldDefinitionIdentifier: identifier,
                    fieldValue: fieldDef.defaultValue,
                };
            });

            this.set('content', content);
            this.set('version', version);
            this._setFields(defaultFields);

            this.set('owner', this.get('app').get('user'));
            callback(this);
        },

        /**
         * Sets fields on given content and version.
         *
         * @method _setFields
         * @protected
         * @param {Object} fields object containing fields that will be set on given content and version
         * @since 1.1
         */
        _setFields: function (fields) {
            this.get('content').set('fields', fields);
            this.get('version').set('fields', fields);
        },

        /**
         * Sets the redirection URLs attributes
         *
         * @method _setRedirectionUrls
         * @protected
         */
        _setRedirectionUrls: function () {
            var app = this.get('app'),
                viewParent;

            viewParent = app.routeUri('viewLocation', {
                id: this.get('parentLocation').get('id'),
                languageCode: this.get('parentContent').get('mainLanguageCode')
            });
            this.set('discardRedirectionUrl', viewParent);
            this.set('closeRedirectionUrl', viewParent);
            this.set('publishRedirectionUrl', function () {
                var content = this.get('content');
                return app.routeUri('viewLocation', {
                    id: content.get('resources').MainLocation,
                    languageCode: content.get('mainLanguageCode'),
                });
            });
        },

        /**
         * Gets the name for a new content based on current contentType and languageCode
         *
         * @method _getNewContentName
         * @protected
         */
        _getNewContentName: function() {
            var app = this.get('app'),
                type = this.get('contentType'),
                contentTypeNames,
                contentTypeName;

            contentTypeNames = type.get('names');
            contentTypeName = contentTypeNames[app.get('contentCreationDefaultLanguageCode')]
                || contentTypeNames[Object.keys(contentTypeNames)[0]];

            return 'New "' + contentTypeName + '"';
        },

        /**
         * changeLanguage event handler. It opens languageSelectionBox for selecting
         * language of created content
         *
         * @method _selectLanguage
         * @private
         * @param {EventFacade} e
         */
        _selectLanguage: function (e) {
            e.preventDefault();
            this.fire('languageSelect', {
                config: {
                    title: "Change language to:",
                    languageSelectedHandler: Y.bind(this._setLanguage, this, e.target, e.fields),
                    cancelLanguageSelectionHandler: null,
                    canBaseTranslation: false,
                    translationMode: true,
                    referenceLanguageList: [this.get('languageCode')]
                },
            });
        },

        /**
         * Sets language of created content to one given in event facade. After that notification is fired.
         *
         * @method _setLanguage
         * @private
         * @param {Y.eZ.View} view the view which triggered language selection box
         * @param {Object} fields
         * @param {EventFacade} e
         * @param {String} e.selectedLanguageCode language code to which created content will be switched
         */
        _setLanguage: function (view, fields, e) {
            var version = this.get('version'),
                selectedLanguageCode = e.selectedLanguageCode,
                newVersion = new Y.eZ.Version(),
                formFields = {};

            version.destroy({api: this.get('capi'), remove: true}, function (error) {
                if ( error ) {
                    console.warn('Failed to remove the version ' + version.get('versionId'));
                }
            });
            this.set('version', newVersion);

            Y.Object.each(fields, function (field) {
                formFields[field.fieldDefinitionIdentifier] = {
                    fieldDefinitionIdentifier: field.fieldDefinitionIdentifier,
                    fieldValue: field.fieldValue,
                };
            });

            this._setFields(formFields);
            this.set('languageCode', selectedLanguageCode);

            view.setAttrs({
                version: newVersion,
                languageCode: selectedLanguageCode,
            });

            this.fire('notify', {
                notification: {
                    text: 'Language has been changed to ' + this.get('app').getLanguageName(selectedLanguageCode),
                    identifier: 'create-content-change-language-to-' + selectedLanguageCode,
                    state: 'done',
                    timeout: 5,
                }
            });
        }
    }, {
        ATTRS: {
            /**
             * The parent location of the new content
             *
             * @attribute parentLocation
             * @type Y.eZ.Location
             * @required
             */
            parentLocation: {},

            /**
             * The parent content of the new content
             *
             * @attribute parentContent
             * @type Y.eZ.Content
             * @required
             */
            parentContent: {},
        }
    });
});

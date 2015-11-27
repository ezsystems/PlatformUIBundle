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
            this.after('*:requestChange', function () {
                this._setLanguageCode();
                this._setBaseLanguageCode();
            });
            this.on('*:changeLanguage', this._selectLanguage);

            this.after('*:closeView', this._redirectAfterClose);
            this.after('discardedDraft', this._redirectAfterDiscard);
            this.after('publishedDraft', this._redirectAfterPublish);

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
                endVersionLoading;

            this.get('version').reset();
            this._loadContentInfo(request.params.id, function () {
                var resources = service.get('contentInfo').get('resources'),
                    tasks = new Y.Parallel(),
                    content = service.get('content');

                service._loadOwner(resources.Owner, tasks.add());
                if ( resources.MainLocation ) {
                    service._loadLocation(resources.MainLocation, tasks.add());
                }
                service._loadContentType(resources.ContentType, tasks.add());

                if ( baseLanguageCode ) {
                    service._loadContent(request.params.id, baseLanguageCode, tasks.add());
                } else {
                    content.set('id', request.params.id);
                    content.load({api: service.get('capi'), languageCode: languageCode}, tasks.add(function (error) {
                        if ( error ) {
                            // this is the first time we translate the content
                            // into languageCode, so it's not really an error,
                            // in this case, the content is initialized from the
                            // contentInfo.
                            content.setAttrs(service.get('contentInfo').getAttrs());
                        }
                    }));
                }
                if ( request.params.versionId ) {
                    endVersionLoading = tasks.add();
                    service._loadVersion(request.params.versionId, languageCode, function () {
                        if ( service._canEditVersion() ) {
                            endVersionLoading();
                        }
                    });
                }

                tasks.done(function () {
                    if ( baseLanguageCode && !content.hasTranslation(baseLanguageCode) ) {
                        // this can happen if the content is always
                        // available and the user manipulated with URI to pass
                        // any language code.
                        service._error(
                            "Could not load the content with id '" + request.params.id
                            + "' and languageCode '" + baseLanguageCode + "'"
                        );
                        return;
                    }
                    if ( !request.params.versionId ) {
                        service._setVersionFields();
                    }
                    next(service);
                });
            });
        },

        /**
         * Checks whether the version can be edited. A version can be edited if:
         *   - it's a draft
         *   - it's a version of the content which id is passed in the request
         *   - it's translated into the language code passed in the request
         *   - it was created by the currently logged in user
         *
         * @method _canEditVersion
         * @protected
         * @return {Boolean}
         */
        _canEditVersion: function () {
            var version = this.get('version'),
                versionId = version.get('id'),
                contentId = this.get('contentInfo').get('id');

            if ( !version.isDraft() ) {
                this._error("The version '" + versionId + "' is not a draft.");
                return false;
            }
            if ( version.get('resources').Content !== contentId ) {
                this._error("The version '" + versionId + "' is not a version of the content '" + contentId  + "'");
                return false;
            }
            if ( !version.hasTranslation(this.get('languageCode')) ) {
                this._error("The version '" + versionId + "' does not exist in '" + this.get('languageCode') + "'");
                return false;
            }
            if ( !version.createdBy(this.get('app').get('user')) ) {
                this._error("The version '" + versionId + "' does not belong to you");
                return false;
            }
            return true;
        },

        /**
         * Sets fields of edited version
         *
         * @method _setVersionFields
         * @private
         */
        _setVersionFields: function () {
            this.get('version').set('fields', this._getFieldsForEdit());
        },

        /**
         * Returns the fields for the newly created version. Depending on the
         * loaded content, it creates the fields from the content type or from
         * the content.
         *
         * @method _getFieldsForEdit
         * @private
         * @return {Object}
         */
        _getFieldsForEdit: function () {
            var languageCode = this.get('languageCode'),
                content = this.get('content'),
                fields;

            if ( Y.Object.isEmpty(content.get('fields')) ) {
                fields = this._getDefaultFields(languageCode);
            } else {
                fields = Y.clone(content.get('fields'));
            }

            return fields;
        },

        /**
         * Returns collection of default fields from the ContentType of edited
         * content and sets for them given languageCode
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
         * Loads a version by its id and language code
         *
         * @method _loadVersion
         * @protected
         * @param {String} id
         * @param {String} languageCode
         * @param {Function} callback
         */
        _loadVersion: function (id, languageCode, callback) {
            this._loadModel(
                'version',
                id,
                {languageCode: languageCode},
                "Could not load the version with id '" + id + "' and languageCode '" + languageCode + "'",
                callback
            );
        },

        /**
         * Loads a content info by its id
         *
         * @method _loadContentInfo
         * @protected
         * @param {String} id
         * @param {Function} callback
         */
        _loadContentInfo: function (id, callback) {
            this._loadModel('contentInfo', id, {}, "Could not find the content id '" + id + "'", callback);
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
                user: this.get('app').get('user'),
            };
        },

        /**
         * `publishedDraft` event handler. It redirects the user according to
         * the `publishRedirectionUrl` attribute value.
         *
         * @method _redirectAfterPublish
         * @protected
         */
        _redirectAfterPublish: function () {
            this._redirectToAttribute('publishRedirectionUrl');
        },

        /**
         * `discardedDraft` event handler. It redirects the user according to
         * the `discardRedirectionUrl` attribute.
         *
         * @method _redirectAfterDiscard
         * @protected
         */
        _redirectAfterDiscard: function () {
            this._redirectToAttribute('discardRedirectionUrl');
        },

        /**
         * `*:closeView` event handler. It redirects the user according to the
         * `closeRedirectionUrl` attribute.
         *
         * @method _redirectAfterClose
         * @protected
         */
        _redirectAfterClose: function () {
            this._redirectToAttribute('closeRedirectionUrl');
        },

        /**
         * Navigates to view the Location. If the location is not loaded, it is
         * first loaded.
         *
         * @method _navigateToViewLocation
         * @private
         */
        _navigateToViewLocation: function () {
            var locationId = this.get('content').get('resources').MainLocation,
                doRedirectToViewLocation = Y.bind(function () {
                    this.get('app').navigateTo('viewLocation', {
                        id: locationId,
                        languageCode: this.get('location').get('contentInfo').get('mainLanguageCode'),
                    });
                }, this);

            if ( this.get('location').isNew() ) {
                this._loadLocation(locationId, doRedirectToViewLocation);
            } else {
                doRedirectToViewLocation();
            }
        },

        /**
         * Redirects the user according the redirection `attr`. If the attribute
         * is filled, its value is used to redirect the user, otherwise, the
         * main location of the content is used and in last resort, the user is
         * redirected to the 'dashboard'.
         *
         * @method _redirectToAttribute
         * @param {String} attr one of the redirection URL attribute name
         * @private
         */
        _redirectToAttribute: function (attr) {
            var attrRedirectionUrl = this.get(attr);

            if ( attrRedirectionUrl ) {
                return this.get('app').navigate(attrRedirectionUrl);
            }
            if ( this.get('content').get('resources').MainLocation ) {
                this._navigateToViewLocation();
            } else {
                // last option, we don't know where to redirect the user
                this.get('app').navigateTo('dashboard');
            }
        },

        /**
         * Set languageCode attribute basing on parameter from request
         *
         * @method _setLanguageCode
         * @protected
         */
        _setLanguageCode: function () {
            var languageCode = this.get('content').get('mainLanguageCode');

            if (this.get('request').params.languageCode) {
                languageCode = this.get('request').params.languageCode;
            }

            this.set('languageCode', languageCode);
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
            if ( typeof value === 'function' ) {
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
             * The content info the content being edited
             *
             * @attribute contentInfo
             * @type Y.eZ.ContentInfo
             */
            contentInfo: {
                valueFn: function () {
                    return new Y.eZ.ContentInfo();
                },
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

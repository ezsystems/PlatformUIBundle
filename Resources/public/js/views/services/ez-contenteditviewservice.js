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
            this.on('*:saveAction', this._saveDraft);
            this.on('*:publishAction', this._publishDraft);
            this.on('*:discardAction', this._discardDraft);
            this.on('*:closeView', this._handleCloseView);
        },

        /**
         * Event handler for the discardAction event. It deletes the version
         * from the repositry and redirect the user to the location view
         *
         * @method _discardDraft
         * @protected
         */
        _discardDraft: function () {
            var version = this.get('version'),
                that = this,
                app = this.get('app');

            app.set('loading', true);
            version.destroy({
                remove: true,
                api: this.get('capi')
            }, function () {
                app.navigate(that.get('discardRedirectionUrl'));
            });
        },

        /**
         * Event handler for the saveAction event. It stores the version if the
         * form is valid
         *
         * @method _saveDraft
         * @protected
         * @param {Object} event saveAction event facade
         */
        _saveDraft: function (event) {
            if (event.formIsValid) {
                if (this.get('createMode')) {
                    this._createNewContentStruct(event.fields);
                } else {
                    this.get('version').save({
                        api: this.get('capi'),
                        fields: event.fields
                    }, function (error, response) {});
                }
            }
        },

        /**
         * Event handler for the publishAction event. It publishes the version
         * if the form is valid and redirect the user to the corresponding
         * location view.
         *
         * @method _publishDraft
         * @protected
         * @param {Object} e publishAction event facade
         */
        _publishDraft: function (e) {
            var version = this.get('version'),
                app = this.get('app'),
                that = this,
                capi = this.get('capi'),
                promise, redirect;

            if (e.formIsValid) {
                if (this.get('createMode')) {
                    this._createNewContentStruct(e.fields, function () {
                        that._publishDraft(e);
                    });
                } else {
                    redirect = function (id) {
                        app.navigate(
                            app.routeUri('viewLocation', {id: id})
                        );
                    };
                    app.set('loading', true);

                    promise = new Y.Promise(function (resolve, reject) {
                        version.save({
                            api: capi,
                            fields: e.fields,
                            publish: true
                        }, resolve);
                    });

                    promise.then(function () {
                        var returnVal = true;

                        if (that.get('isNewContentDraftCreated')) {
                            returnVal = new Y.Promise(function (resolve, reject) {
                                capi.getContentService().loadLocations(that.get('location').get('id'), function (error, response) {
                                    if (error) {
                                        reject(response);
                                    }

                                    resolve(response);
                                });
                            });
                        }

                        return returnVal;
                    }).then(function (response, isCreated) {
                        redirect(
                            response.document ?
                            response.document.LocationList.Location[0]._href :
                            that.get('location').get('id')
                        );
                    }, function (error) {
                        this._error("Could not create a new content of content with id '" + that.get('version').get('id') + "'");
                    });
                }
            }
        },

        /**
         * Loads the content, the main location, the content type and the owner
         * of the currently edited content
         *
         * @method _load
         * @protected
         * @param {Function} next
         */
        _load: function (next) {
            var request = this.get('request'),
                service = this,
                tasks = new Y.Parallel(),
                resources,
                goToNext = function () { next(service); };

            // check whether content type id is provided with url
            // if so, prepare the service to create a content
            if (request.params.contentTypeIdentifier) {
                this._createEmptyPropertyObject('version');
                this._createEmptyPropertyObject('content');
                this.set('createMode', true);
                this.set('isNewContentDraftCreated', false);

                service._loadOwner(service.get('app').get('user').get('id'), tasks.add());
                service._loadLocation(request.params.id, tasks.add());
                service._loadContentTypeByIdentifier(request.params.contentTypeIdentifier, tasks.add());

                tasks.done(goToNext);
            } else {
                this.set('createMode', false);

                this._loadContent(request.params.id, function () {
                    resources = service.get('content').get('resources');

                    // the new version creation and the loading of the owner, the
                    // location and the content type are done in parallel
                    service._createVersion(tasks.add());
                    service._loadOwner(resources.Owner, tasks.add());
                    service._loadLocation(resources.MainLocation, tasks.add());
                    service._loadContentType(resources.ContentType, tasks.add());

                    tasks.done(goToNext);
                });
            }
        },

        /**
         * Creates a new property object defined by name.
         *
         * @method _createEmptyPropertyObject
         * @protected
         * @param {String} name
         * @return service itself
         */
        _createEmptyPropertyObject: function (name) {
            var EmptyProperty;

            EmptyProperty = this.get(name + 'Class');

            if (EmptyProperty) {
                EmptyProperty = new EmptyProperty();
                this.set(name, EmptyProperty);
            }

            return this;
        },

        /**
         * Creates a new version
         *
         * @method _createVersion
         * @protected
         * @param {Function} callback
         */
        _createVersion: function (callback, contentId) {
            contentId = contentId || this.get('request').params.id;

            this.get('version').loadNew({
                api: this.get('capi'),
                contentId: contentId
            }, Y.bind(function (error) {
                if ( !error ) {
                    callback();
                    return;
                }
                this._error("Could not create a new version of content with id '" + contentId + "'");
            }, this));
        },

        /**
         * Creates a new content struct
         *
         * @method _createNewContentStruct
         * @protected
         * @param {Array} fields provides an array of field objects containing data
         */
        _createNewContentStruct: function (fields, callback) {
            var that = this,
                contentService = this.get('capi').getContentService(),
                version = this.get('version'),
                request = this.get('request'),
                locationStruct = contentService.newLocationCreateStruct(request.params.id),
                contentTypeModel = this.get('contentType'),
                contentCreateStruct = contentService.newContentCreateStruct(
                    this.get('contentTypeId'),
                    locationStruct,
                    request.params.contentTypeLang
                );

            Y.Array.each(fields, function (field) {
                contentCreateStruct.setField(
                    field.id,
                    field.fieldDefinitionIdentifier,
                    field.fieldValue
                );
            });

            Y.Object.each(contentTypeModel.get('fieldDefinitions'), function (field, name) {
                if (field.isRequired && !contentCreateStruct.getField(name)) {
                    var value;

                    if (name === 'intro') {
                        // temporary solution as a field view for xml content is not ready
                        value = {
                            xml: '<?xml version="1.0"?>' +
                            '<section xmlns:image="http://ez.no/namespaces/ezpublish3/image/" ' +
                            'xmlns:xhtml="http://ez.no/namespaces/ezpublish3/xhtml/" ' +
                            'xmlns:custom="http://ez.no/namespaces/ezpublish3/custom/">' +
                            '<paragraph xmlns:tmp="http://ez.no/namespaces/ezpublish3/temporary/">' +
                            '#LetFootballWin</paragraph></section>'
                        };
                    } else {
                        value = 'field: ' + name;
                    }

                    contentCreateStruct.setField(field.id, name, value);
                }
            });

            contentService.createContent(contentCreateStruct, function (error, response) {
                if (error) {
                    console.error('Error: ', response.document.ErrorMessage.errorDescription);
                    return;
                }

                version.setAttrs(response.document.Content.CurrentVersion.Version.VersionInfo);
                version.set('id', response.document.Content.CurrentVersion.Version._href);
                that.set('createMode', false);
                that.set('isNewContentDraftCreated', true);
                that.get('location').set('id', response.document.Content._href);

                if (typeof callback === 'function') {
                    callback();
                }
            });
        },

        /**
         * Loads a content by its id
         *
         * @method _loadContent
         * @protected
         * @param {String} id
         * @param {Function} callback
         */
        _loadContent: function (id, callback) {
            this._loadModel('content', id, "Could not load the content with id '" + id + "'", callback);
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
            this._loadModel('contentType', id, "Could not load the content type with id '" + id + "'", callback);
        },

        /**
         * Loads a content type by its name/identifier
         *
         * @method _loadContentTypeByIdentifier
         * @protected
         * @param {String} name
         * @param {Function} callback
         */
        _loadContentTypeByIdentifier: function (name, callback) {
            var that = this,
                service = this.get('capi').getContentTypeService();

            service.loadContentTypeByIdentifier(name, function (error, response) {
                that.set('contentTypeId', response.document.ContentTypeInfoList.ContentType[0]._href);
                that._loadContentType(that.get('contentTypeId'), callback);
            });
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
            this._loadModel('location', id, "Could not load the location with id '" + id + "'", callback);
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
            this._loadModel('owner', id, "Could not load the user with id '" + id + "'", callback);
        },

        /**
         * Utility method to load a model by its id in a given attribute
         *
         * @method _loadModel
         * @protected
         * @param {String} attr
         * @param {String} id
         * @param {String} errorMsg
         * @param {Function} callback
         */
        _loadModel: function (attr, modelId, errorMsg, callback) {
            var model = this.get(attr);

            model.set('id', modelId);
            model.load({api: this.get('capi')}, Y.bind(function (error) {
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
                createMode: this.get('createMode')
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
         * Returns default uri for user redirection.
         *
         * @method _defaultRedirectionUrl
         * @protected
         * @return {String}
         */
        _defaultRedirectionUrl: function () {
            return this.get('app').routeUri('viewLocation', {id: this.get('location').get('id')});
        }
    }, {
        ATTRS: {
            /**
             * When it's set to true then the view will be informed
             * to load a form without content.
             *
             * @attribute createMode
             * @type {Boolean}
             */
            createMode: {
                value: false
            },

            /**
             * Indicator whether a new draft has been created.
             *
             * @attribute isNewContentDraftCreated
             * @type {Boolean}
             */
            isNewContentDraftCreated: {
                value: false
            },

            /**
             * The content to be loaded
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {
                valueFn: function () {
                    var Content = this.get('contentClass');
                    return new Content();
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
             * The version class to be instantiated
             *
             * @attribute versionClass
             * @type eZ.Version
             */
            versionClass: {
                value: Y.eZ.Version
            },

            /**
             * The content class to be instantiated
             *
             * @attribute contentClass
             * @type eZ.Content
             */
            contentClass: {
                value: Y.eZ.Content
            },

            /**
             * The version that will be edited
             *
             * @attribute version
             * @type eZ.Version
             */
            version: {
                valueFn: function () {
                    var Version = this.get('versionClass');
                    return new Version();
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
             * @default '_defaultRedirectionUrl'
             */
            closeRedirectionUrl: {
                valueFn: '_defaultRedirectionUrl'
            },

            /**
             * The URL user will be redirected to after discarding changes
             *
             * @attribute discardRedirectionUrl
             * @type {Object}
             * @default '_defaultRedirectionUrl'
             */
            discardRedirectionUrl: {
                valueFn: '_defaultRedirectionUrl'
            },

            /**
             * The url user will be redirected to after publishing the content
             *
             * @attribute closeRedirectionUrl
             * @type {Object}
             * @default '_defaultRedirectionUrl'
             */
            publishRedirectionUrl: {
                valueFn: '_defaultRedirectionUrl'
            },
        }
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditviewservice', function (Y) {
    "use strict";
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
        },

        /**
         * Event handler for the discardAction event. It deletes the version
         * from the repositry and redirect the user to the location view
         *
         * @method _discardDraft
         * @protected
         * @param {Object} e event facade
         */
        _discardDraft: function (e) {
            var version = this.get('version'),
                that = this,
                app = this.get('app');

            app.set('loading', true);
            version.destroy({
                remove: true,
                api: this.get('capi')
            }, function () {
                app.navigate(
                    app.routeUri('viewLocation', {
                        id: that.get('location').get('id')
                    })
                );
            });
        },

        /**
         * Event handler for the saveAction event. It stores the version if the
         * form is valid
         *
         * @method _saveDraft
         * @protected
         * @param {Object} e saveAction event facade
         */
        _saveDraft: function (e) {
            var version = this.get('version');

            if ( e.formIsValid ) {
                version.save({
                    api: this.get('capi'),
                    fields: e.fields
                }, function (error, response) {});
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
                that = this;

            if ( e.formIsValid ) {
                app.set('loading', true);
                version.save({
                    api: this.get('capi'),
                    fields: e.fields,
                    publish: true
                }, function (error, response) {
                    app.navigate(
                        app.routeUri('viewLocation', {
                            id: that.get('location').get('id')
                        })
                    );
                });
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
                service = this;

            this._loadContent(request.params.id, function () {
                var tasks,
                    resources;

                resources = service.get('content').get('resources');

                // the new version creation and the loading of the owner, the
                // location and the content type are done in parallel
                tasks = new Y.Parallel();

                service._createVersion(tasks.add());
                service._loadOwner(resources.Owner, tasks.add());
                service._loadLocation(resources.MainLocation, tasks.add());
                service._loadContentType(resources.ContentType, tasks.add());

                tasks.done(function () {
                    next(service);
                });
            });
        },

        /**
         * Creates a new version
         *
         * @method _createVersion
         * @protected
         * @param {Function} callback
         */
        _createVersion: function (callback) {
            var contentId = this.get('request').params.id;

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
                if ( !error ) {
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
                owner: this.get('owner')
            };
        },
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
            }
        }
    });
});

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

            this.get('version').reset();
            this._loadContent(request.params.id, function () {
                var tasks,
                    version = service.get('version'),
                    content = service.get('content'),
                    resources;

                version.set('fields', content.get('fields'));

                resources = content.get('resources');

                tasks = new Y.Parallel();

                service._loadOwner(resources.Owner, tasks.add());
                service._loadLocation(resources.MainLocation, tasks.add());
                service._loadContentType(resources.ContentType, tasks.add());

                tasks.done(function () {
                    next(service);
                });
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
                owner: this.get('owner')
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
         * Returns uri for user redirection.
         *
         * @method _redirectionUrl
         * @protected
         * @return {String}
         */
        _redirectionUrl: function (value) {
            if ( !value ) {
                return this.get('app').routeUri('viewLocation', {id: this.get('location').get('id')});
            } else if ( typeof value === 'function' ) {
                return value.call(this);
            }
            return value;
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
             * @default eng-GB
             */
            languageCode: {
                value: 'eng-GB'
            }
        }
    });
});

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
     * It initliazes the models to use the content edit view.
     *
     * @namespace eZ
     * @class ContentCreateViewService
     * @constructor
     * @extends eZ.ContentEditViewService
     */
    Y.eZ.ContentCreateViewService = Y.Base.create('contentCreateViewService', Y.eZ.ContentEditViewService, [], {
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

            content.set('name', 'New "' + this.get('contentType').get('names')['eng-GB'] + '"');
            Y.Object.each(type.get('fieldDefinitions'), function (fieldDef, identifier) {
                defaultFields[identifier] = {
                    fieldDefinitionIdentifier: identifier,
                    fieldValue: fieldDef.defaultValue,
                };
            });
            content.set('fields', defaultFields);
            version.set('fields', defaultFields);
            this.set('owner', this.get('app').get('user'));
            this.set('content', content);
            this.set('version', version);
            callback(this);
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

            viewParent = app.routeUri('viewLocation', {id: this.get('parentLocation').get('id')});
            this.set('discardRedirectionUrl', viewParent);
            this.set('closeRedirectionUrl', viewParent);
            this.set('publishRedirectionUrl', function () {
                return app.routeUri('viewLocation', {id: this.get('content').get('resources').MainLocation});
            });
        },
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
        }
    });
});

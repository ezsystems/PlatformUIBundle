/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service component for the location view
     *
     * @module ez-locationviewviewservice
     */
    Y.namespace('eZ');

    /**
     * Location view view service.
     *
     * Loads the models needed by the location view
     *
     * @namespace eZ
     * @class LocationViewViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.LocationViewViewService = Y.Base.create('locationViewViewService', Y.eZ.ViewService, [], {
        initializer: function () {
            this.on('*:editAction', this._editContent);
        },

        /**
         * editAction event handler, makes the application navigate to edit the
         * content available in the event facade
         *
         * @method _editContent
         * @protected
         * @param {Object} e event facade of the editAction event
         */
        _editContent: function (e) {
            var app = this.get('app');

            app.navigate(
                app.routeUri('editContent', {id: e.content.get('id')})
            );
        },

        /**
         * Loads the location, the content and the path for the location id
         * available in the request and calls the next callback once it's done.
         *
         * @method _load
         * @protected
         * @param {Function} next
         */
        _load: function (next) {
            var loadOptions = {
                    api: this.get('capi')
                },
                request = this.get('request'),
                service = this,
                location = this.get('location'), content = this.get('content'),
                type = this.get('contentType'),
                contentService = this.get('capi').getContentService();

            location.set('id', request.params.id);
            location.load(loadOptions, function (error) {
                var tasks, endLoadPath, endMainContentLoad;

                if ( error ) {
                    service._error("Failed to load the location " + location.get('id'));
                    return;
                }

                tasks = new Y.Parallel();

                endMainContentLoad = tasks.add();
                content.set('id', location.get('resources').Content);
                content.load(loadOptions, function (error) {
                    if ( error ) {
                        service._error("Failed to load the content " + content.get('id'));
                        return;
                    }
                    type.set('id', content.get('resources').ContentType);
                    type.load(loadOptions, function (error) {
                        if ( error ) {
                            service._error("Failed to load the content type " + type.get('id'));
                            return;
                        }
                        endMainContentLoad();
                    });
                });

                endLoadPath = tasks.add();
                contentService.loadRoot(function (error, response) {
                    var rootLocationId;

                    if ( error ) {
                        service._error("Failed to contact the REST API");
                        return;
                    }

                    rootLocationId = response.document.Root.rootLocation._href;
                    if ( rootLocationId === location.get('id') ) {
                        service.set('path', []);
                        endLoadPath();
                        return;
                    }
                    service._loadPath(rootLocationId, endLoadPath);
                });

                tasks.done(function () {
                    service.get('response').view = {
                        path: service.get('path'),
                        location: service.get('location'),
                        content: service.get('content'),
                    };
                    next(service);
                });
            });
        },

        /**
         * Recursively loads the path to the current location
         *
         * @protected
         * @method _loadPath
         * @param {String} rootLocationId the root location id
         * @param {Function} end the callback to call when the just is done
         */
        _loadPath: function (rootLocationId, end) {
            var service = this,
                loadParentCallback,
                path = [];

            loadParentCallback = function (error, parentStruct) {
                if ( error ) {
                    service._error("Fail to load the path");
                    return;
                }
                path.push(parentStruct);
                if ( rootLocationId !== parentStruct.location.get('id') ) {
                    service._loadParent(parentStruct.location, loadParentCallback);
                } else {
                    service.set('path', path);
                    end();
                }
            };

            this._loadParent(this.get('location'), loadParentCallback);
        },

        /**
         * Loads the parent location and its content
         *
         * @protected
         * @method _loadParent
         * @param {Y.eZ.Location} location
         * @param {Function} callback the function to call when the location and
         *        the content are loaded
         * @param {Boolean} callback.error the error, truthy if an error occured
         * @param {Object} callback.result an object containing the
         *        Y.eZ.Location and the Y.eZ.Content instances under the `location` and
         *        the `content` keys.
         */
        _loadParent: function (location, callback) {
            var loadOptions = {
                    api: this.get('capi')
                },
                that = this,
                parentLocation, parentContent;

            parentLocation = this._newLocation({
                'id': location.get('resources').ParentLocation
            });
            parentLocation.load(loadOptions, function (error) {
                if ( error ) {
                    callback(error);
                    return;
                }
                parentContent = that._newContent({
                    'id': parentLocation.get('resources').Content
                });
                parentContent.load(loadOptions, function (error) {
                    if ( error ) {
                        callback(error);
                        return;
                    }
                    callback(error, {
                        location: parentLocation,
                        content: parentContent
                    });
                });
            });
        },

        _getViewParameters: function () {
            return {
                content: this.get('content'),
                contentType: this.get('contentType'),
                location: this.get('location'),
                path: this.get('path'),
            };
        },

        /**
         * Creates a new instance of Y.eZ.Location with the given params
         *
         * @method _newLocation
         * @protected
         * @param {Object} params the parameters passed to the Y.eZ.Location
         *        constructor
         */
        _newLocation: function (params) {
            return new Y.eZ.Location(params);
        },

        /**
         * Creates a new instance of Y.eZ.Content with the given params
         *
         * @method _newContent
         * @protected
         * @param {Object} params the parameters passed to the Y.eZ.Content
         *        constructor
         */
        _newContent: function (params) {
            return new Y.eZ.Content(params);
        }
    }, {
        ATTRS: {
            /**
             * The viewed location
             *
             * @attribute location
             * @type Y.eZ.Location
             */
            location: {
                cloneDefaultValue: false,
                value: new Y.eZ.Location()
            },

            /**
             * The content associated with the location
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {
                cloneDefaultValue: false,
                value: new Y.eZ.Content()
            },

            /**
             * The content type of the content
             *
             * @attribute contentType
             * @type Y.eZ.Content
             */
            contentType: {
                cloneDefaultValue: false,
                value: new Y.eZ.ContentType()
            },

            /**
             * The path from the root location to the current location. Each
             * entry of the path consists of the location and its content under
             * the `location` and `content` keys sorted by location depth
             *
             * @attribute path
             * @type Array
             */
            path: {
                getter: function (value) {
                    return value.sort(function (a, b) {
                        return (a.location.get('depth') - b.location.get('depth'));
                    });
                }
            }
        }
    });
});

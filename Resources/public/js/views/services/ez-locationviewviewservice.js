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
            this.on('*:sendToTrashAction', this._sendContentToTrash);
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
         * sendToTrashAction event handler, sends location available in request to trash
         * and makes the application navigate to parent location
         *
         * @method _sendContentToTrash
         * @protected
         * @param {Object} e event facade of the sendToTrashAction event
         */
        _sendContentToTrash: function (e) {
            var app = this.get('app'),
                that = this,
                contentService = this.get('capi').getContentService(),
                location = this.get('location'),
                locationId = location.get('id'),
                // TODO this route should be taken from REST not hardcoded
                trashLocation = '/api/ezp/v2/content/trash',
                contentName = e.content.get('name');

            this._set('trackOutsideEvents', false);
            this.fire('confirmBoxOpen', {
                config: {
                    title: "Are you sure you want to send this content to trash?",
                    confirmHandler: Y.bind(function () {
                        that._sendContentToTrashNotificationStarted(locationId, contentName);
                        that._loadParent(location, function(error, parentLocationResponse){
                            if (error) {
                                that._sendContentToTrashNotificationError(locationId, contentName);
                                return;
                            }

                            contentService.moveSubtree (locationId, trashLocation, function(error, response){
                                if (error) {
                                    that._sendContentToTrashNotificationError(locationId, contentName);
                                    return;
                                }

                                that._sendContentToTrashNotificationDone(locationId, contentName);
                                app.navigate(
                                    app.routeUri('viewLocation', {id: parentLocationResponse.location.get('id')})
                                );
                            });
                        });
                        this._set('trackOutsideEvents', true);
                    }, this),
                    cancelHandler: Y.bind(function () {
                        this._set('trackOutsideEvents', true);
                    }, this),
                },
            });
        },

        /**
         * Notification changed to *started* before sending content to trash
         *
         * @method _sendContentToTrashNotificationStarted
         * @protected
         * @param {String} locationId
         * @param {String} contentName
         */
        _sendContentToTrashNotificationStarted: function (locationId, contentName) {
            this.fire('notify', {
                notification: {
                    identifier: 'send-to-trash-' + locationId,
                    text: 'Sending "' + contentName + '" to Trash',
                    state: 'started',
                    timeout: 0
                },
            });
        },

        /**
         * Notification changed to *done* after sucessfull sending content to trash
         *
         * @method _sendContentToTrashNotificationDone
         * @protected
         * @param {String} locationId
         * @param {String} contentName
         */
        _sendContentToTrashNotificationDone: function (locationId, contentName) {
            this.fire('notify', {
                notification: {
                    identifier: 'send-to-trash-' + locationId,
                    text: '"' + contentName + '" sent to Trash',
                    state: 'done',
                    timeout: 5
                },
            });
        },

        /**
         * Notification changed to *error* when sending content to trash has failed
         *
         * @method _sendContentToTrashNotificationError
         * @protected
         * @param {String} locationId
         * @param {String} contentName
         */
        _sendContentToTrashNotificationError: function (locationId, contentName) {
            this.fire('notify', {
                notification: {
                    identifier: 'send-to-trash-' + locationId,
                    text: 'An error occurred when sending "' + contentName + '" to Trash',
                    state: 'error',
                    timeout: 5
                },
            });
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
                    if ( rootLocationId === location.get('id') || location.get('depth') == 1 ) {
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
                if ( rootLocationId === parentStruct.location.get('id') || parentStruct.location.get('depth') == 1 ) {
                    service.set('path', path);
                    end();
                } else {
                    service._loadParent(parentStruct.location, loadParentCallback);
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
                config: this.get('config'),
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

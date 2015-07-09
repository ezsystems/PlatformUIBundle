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
            this.on('*:sendToTrashAction', this._sendContentToTrashConfirmBox);
            this.on('*:moveAction', this._selectLocation);
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
         * `sendToTrashAction` event handler,
         * it asks confirmation to the user before sending the location to the trash.
         *
         * @method _sendContentToTrashConfirmBox
         * @protected
         * @param {Object} e event facade of the sendToTrashAction event
         */
        _sendContentToTrashConfirmBox: function (e) {
            e.preventDefault();
            this.fire('confirmBoxOpen', {
                config: {
                    title: "Are you sure you want to send this content to trash?",
                    confirmHandler: Y.bind(function () {
                        this._sendToTrash(e.content);
                    }, this)
                },
            });
        },

        /**
         * moveAction event handler, launch the universal discovery widget
         * to choose a location to move the content
         *
         * @method _selectLocation
         * @protected
         * @param {EventFacade} e
         */
        _selectLocation: function (e) {
            this.fire('contentDiscover', {
                config: {
                    title: "Select the location you want to move your content into",
                    contentDiscoveredHandler: Y.bind(this._moveContent, this),
                },
            });
        },

        /**
         * Sends location to trash, triggering loading parent location and notifications
         *
         * @method _sendToTrash
         * @protected
         */
        _sendToTrash: function () {
            var that = this,
                location = this.get('location'),
                locationId = location.get('id'),
                path = this.get('path'),
                content = this.get('content'),
                parentLocation = path[path.length - 1].location;

            this._notify(
                'Sending "' + content.get('name') + '" to Trash',
                'send-to-trash-' + locationId,
                'started',
                0
            );

            location.trash({api: this.get('capi')}, Y.bind(that._afterSendToTrashCallback, that, parentLocation, content));
        },

        /**
         * Send to trash callback triggering notifications and making app to navigate to parent location
         *
         * @method _afterSendToTrashCallback
         * @protected
         * @param {eZ.Location} parentLocation the parent location to which app will navigate to
         * @param {eZ.Content} content the content to be trashed
         * @param {Boolean} error
         */
        _afterSendToTrashCallback: function (parentLocation, content, error) {
            var app = this.get('app'),
                location = this.get('location'),
                locationId = location.get('id'),
                contentName = content.get('name');

            if (error) {
                this._notify(
                    'An error occurred when sending "' + contentName + '" to Trash',
                    'send-to-trash-' + locationId,
                    'error',
                    0
                );
                return;
            }

            this._notify(
                '"' + contentName + '" sent to Trash',
                'send-to-trash-' + locationId,
                'done',
                5
            );

            /**
             * Fired when the content is sent to trash
             *
             * @event sentToTrash
             * @param {eZ.Location} location
             */
            this.fire('sentToTrash', {location: location});

            app.navigateTo('viewLocation', {
                id: parentLocation.get('id'),
                languageCode: content.get('mainLanguageCode')
            });
        },

        /**
         * Move the content to the selected location
         *
         * @method _moveContent
         * @protected
         * @param {EventFacade} e
         */
        _moveContent: function (e) {
            var app = this.get('app'),
                initialActiveView = app.get('activeView'),
                parentLocationId = e.selection.location.get('id'),
                oldParentLocationId = this.get('location').get('id'),
                locationId = this.get('location').get('id'),
                that = this,
                content = this.get('content'),
                contentName =  content.get('name'),
                parentContentName = e.selection.content.get('name'),
                notificationIdentifier =  'move-notification-' + parentLocationId + '-' + locationId;

            this._notify("'" + contentName + "' is being moved under '" + parentContentName + "'", notificationIdentifier, 'started', 5);

            this.get('location').move({api: this.get('capi')},  parentLocationId, function (error, response) {
                if (error) {
                    that._notify('An error occured while moving your content', notificationIdentifier, 'error', 0);
                    return;
                }

                that._notify(
                    "'" + contentName + "' has been successfully moved under '" + parentContentName + "'",
                    notificationIdentifier,
                    'done',
                    5
                );
                /**
                 * Fired when the content is moved
                 *
                 * @event movedContent
                 * @param {eZ.Location} location
                 * @param {String} oldParentLocationId
                 */
                that.fire('movedContent', {location: that.get('location'), oldParentLocationId: oldParentLocationId});
                if ( app.get('activeView') === initialActiveView ) {
                    app.navigateTo(
                        'viewLocation',
                        {id: response.getHeader('location'), languageCode: content.get('mainLanguageCode')}
                    );
                }
            });
        },

        /**
         * Fire 'notify' event
         *
         * @method _notify
         * @protected
         * @param {String} text the text shown during the notification
         * @param {String} identifier the identifier of the notification
         * @param {String} state the state of the notification
         * @param {Integer} timeout the number of second, the notification will be shown
         */
        _notify: function (text, identifier, state, timeout) {
            this.fire('notify', {
                notification: {
                    text: text,
                    identifier: identifier,
                    state: state,
                    timeout: timeout,
                }
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
                discoveryService = this.get('capi').getDiscoveryService();

            location.set('id', request.params.id);
            location.load(loadOptions, function (error) {
                var tasks, endLoadPath, endMainContentLoad,
                    loadContentOptions = Y.merge(loadOptions);

                loadContentOptions.languageCode = request.params.languageCode;
                if ( error ) {
                    service._error("Failed to load the location " + location.get('id'));
                    return;
                }

                tasks = new Y.Parallel();

                endMainContentLoad = tasks.add();
                content.set('id', location.get('resources').Content);
                content.load(loadContentOptions, function (error) {
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
                discoveryService.getInfoObject('rootLocation', function (error, response) {
                    var rootLocationId;

                    if ( error ) {
                        service._error("Failed to contact the REST API");
                        return;
                    }

                    rootLocationId = response._href;
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
                languageCode: this.get('request').params.languageCode,
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

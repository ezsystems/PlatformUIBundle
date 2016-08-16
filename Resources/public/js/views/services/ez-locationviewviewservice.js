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
            this.on('*:deleteContentAction', this._confirmDeleteContent);
            this.on('*:moveAction', this._selectLocation);
            this.on('*:translateContent', this._translateContent);
            this.on('*:sortUpdate', this._updateSorting);
            this.on('*:updatePriority', this._updatePriority);
            this.after('*:requestChange', this._setLanguageCode);

            this._setLanguageCode();
        },

        /**
         * Update the priority of the location.
         *
         * @protected
         * @method _updatePriority
         * @param {Object} e the event facade of the sortUpdate event
         */
        _updatePriority: function (e) {
            var loadOptions = {api: this.get('capi')};

            e.location.updatePriority(loadOptions, e.priority, Y.bind(function (error, response) {
                if (error) {
                    this._notify(
                        'An error occurred when updating the priority',
                        'update-priority-' + e.location.get('locationId'),
                        'error',
                        0
                    );
                }
            }, this));
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

            /**
             * Fired when a content needs to be edited
             * @event editContentRequest
             */
            this.fire('editContentRequest', {
                content: e.content,
                languageCode: this.get('languageCode'),
                contentType: this.get('contentType'),
            });
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
         * `deleteContentAction` event handler,
         * it asks confirmation to the user before delete the content item.
         *
         * @method _confirmDeleteContent
         * @protected
         * @param {Object} e event facade of the deleteAction event
         */
        _confirmDeleteContent: function (e) {
            e.preventDefault();
            this.fire('confirmBoxOpen', {
                config: {
                    title: "Are you sure you want to delete this content?",
                    confirmHandler: Y.bind(this._deleteContent, this),
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
                    isSelectable: function (contentStruct) {
                        return contentStruct.contentType.get('isContainer');
                    },
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
                parentLocation = path[path.length - 1];

            this._notify(
                'Sending "' + content.get('name') + '" to Trash',
                'send-to-trash-' + locationId,
                'started',
                0
            );

            location.trash({api: this.get('capi')}, Y.bind(that._afterSendToTrashCallback, that, parentLocation, content));
        },

        /**
         * Deletes the the content item, triggering loading parent location and notifications
         *
         * @method _deleteContent
         * @protected
         */
        _deleteContent: function () {
            var path = this.get('path'),
                content = this.get('content'),
                parentLocation = path[path.length - 1];

            this._notify(
                'Deleting "' + content.get('name') + '"',
                'delete-' + content.get('id'),
                'started',
                0
            );

            content.delete({api: this.get('capi')}, Y.bind(this._afterDeleteCallback, this, parentLocation, content));
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
         * Delete content item callback triggering notifications and making app to navigate to parent location
         *
         * @method _afterDeleteCallback
         * @protected
         * @param {eZ.Location} parentLocation the parent location to which app will navigate to
         * @param {eZ.Content} content the content item that has been deleted
         * @param {Boolean} error
         */
        _afterDeleteCallback: function (parentLocation, content, error) {
            var app = this.get('app'),
                contentName = content.get('name');

            if (error) {
                this._notify(
                    'An error occurred when deleting "' + contentName + '"',
                    'delete-' + content.get('id'),
                    'error',
                    0
                );
                return;
            }

            this._notify(
                '"' + contentName + '" was deleted',
                'delete-' + content.get('id'),
                'done',
                5
            );

            /**
             * Fired when the content has been deleted
             *
             * @event deletedContent
             * @param {eZ.Content} content
             */
            this.fire('deletedContent', {content: content});

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
                parentContentName = e.selection.contentInfo.get('name'),
                notificationIdentifier =  'move-notification-' + parentLocationId + '-' + locationId;

            this._notify("'" + contentName + "' is being moved under '" + parentContentName + "'", notificationIdentifier, 'started', 5);

            this.get('location').move({api: this.get('capi')},  parentLocationId, function (error, response) {
                if (error) {
                    that._notify('An error occurred while moving your content', notificationIdentifier, 'error', 0);
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
         * translate event handler, makes the application to navigate to edit content available
         * in the facade with given language and base language
         *
         * @method _translateContent
         * @protected
         * @param {EventFacade} e
         */
        _translateContent: function (e) {
            var app = this.get('app'),
                routeName = 'editContent',
                routeParams = {
                    id: e.content.get('id'),
                    languageCode: e.toLanguageCode,
                };

            if (e.baseLanguageCode) {
                routeParams.baseLanguageCode = e.baseLanguageCode;
                routeName = 'translateContent';
            }

            app.navigate(
                app.routeUri(routeName, routeParams)
            );
        },

        /**
         * Update the sort methods of the location
         *
         * @method _updateSorting
         * @protected
         * @param {EventFacade} e
         */
        _updateSorting: function (e) {
            var loadOptions = {api: this.get('capi')},
                location = this.get('location'),
                notificationIdentifier = 'sort-change-' + e.sortType + '-' + e.sortOrder;

            this._notify(
                'Updating the sub items sort method',
                notificationIdentifier,
                'started',
                5
            );

            location.updateSorting(loadOptions, e.sortType, e.sortOrder, Y.bind(function (error, response) {
                if (!error) {
                    this._notify(
                        'The sub items sort method has been correctly updated',
                        notificationIdentifier,
                        'done',
                        5
                    );
                    /**
                     * Fired when the sortOrder and/or sortField have been
                     * successfully updated.
                     *
                     * @event updatedLocationSorting
                     * @param {eZ.Location} location the Location that has been
                     * updated
                     */
                    this.fire('updatedLocationSorting', {
                        location: location,
                    });
                } else {
                    this._notify(
                        'An error occured while updating the sub items sort method:' + error,
                        notificationIdentifier,
                        'error',
                        0
                    );
                }
            }, this));
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
                type = this.get('contentType');

            location.set('id', request.params.id);
            location.load(loadOptions, function (error) {
                var tasks, endLoadPath, endMainContentLoad,
                    loadContentOptions = Y.merge(loadOptions);

                loadContentOptions.languageCode = service.get('languageCode');
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
                    type.load(Y.merge(loadOptions, {loadGroups: true}), function (error) {
                        if ( error ) {
                            service._error("Failed to load the content type " + type.get('id'));
                            return;
                        }
                        endMainContentLoad();
                    });
                });

                endLoadPath = tasks.add();
                location.loadPath(loadOptions, function(error, path) {
                    if ( error ) {
                        service._error("Failed to load locations's path with REST API");
                        return;
                    }

                    service.set('path', path);
                    endLoadPath();
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
         * Set languageCode attribute based on parameter from request
         *
         * @method _setLanguageCode
         * @protected
         */
        _setLanguageCode: function () {
            this.set('languageCode', this.get('request').params.languageCode);
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
             * @type Y.eZ.ContentType
             */
            contentType: {
                cloneDefaultValue: false,
                value: new Y.eZ.ContentType()
            },

            /**
             * The path from the root location to the current location. Each
             * entry of the path consists of the location sorted by location depth
             *
             * @attribute path
             * @type Array
             */
            path: {
                value: []
            },

            /**
             * The language code in which the content is being viewed
             *
             * @attribute languageCode
             * @type String
             */
            languageCode: {}
        }
    });
});

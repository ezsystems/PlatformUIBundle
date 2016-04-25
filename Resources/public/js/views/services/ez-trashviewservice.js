/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashviewservice', function (Y) {
    'use strict';
    /**
     * Provides the view service component for the trash view
     *
     * @module ez-trashviewservice
     */
    Y.namespace('eZ');

    /**
     * Trash view service.
     *
     * Loads the trash items needed by the trash view
     *
     * @namespace eZ
     * @class TrashViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.TrashViewService = Y.Base.create('trashViewService', Y.eZ.ViewService, [], {

        initializer: function () {
            this.on('*:emptyTrashAction', this._emptyTrashConfirmBox);
            this.on('*:restoreItems', this._restoreItems);
        },

        /**
         * `emptyTrashAction` event handler,
         * it asks confirmation to the user before emptying the trash.
         *
         * @method _emptyTrashConfirmBox
         * @protected
         * @param {Object} e event facade of the emptyTrashAction event
         */
        _emptyTrashConfirmBox: function (e) {
            e.preventDefault();
            this.fire('confirmBoxOpen', {
                config: {
                    title: "Are you sure you want to permanently delete " + this.get('trashItems').length
                        + " items? This action cannot be reversed.",
                    confirmHandler: Y.bind(function () {
                        this._emptyTrash();
                    }, this)
                },
            });
        },

        /**
         * Loads the list of Trash Items in the `trashItems` attribute and calls `callback` once it's done.
         *
         * @method _load
         * @protected
         * @param {Function} callback
         */
        _load: function (callback) {
            var contentService = this.get('capi').getContentService(),
                service = this;

            contentService.loadTrashItems(-1, 0, function (error, response) {
                var tasks = new Y.Parallel(),
                    trashItems = [],
                    trashItemsHash = response.document.Trash.TrashItem,
                    inTrashList = service._buildInTrashList(trashItemsHash);

                if (error) {
                    callback(error);
                } else {
                    Y.Array.each(trashItemsHash, function (itemHash) {
                        service._loadTrashItem(itemHash, inTrashList, trashItems, tasks.add(function() {}));
                    });
                }

                tasks.done(function () {
                    service.set('trashItems', trashItems);
                    callback();
                });
            });
        },

        /**
         * Loads a single item based on `itemHash` and adds it to `trashItems` in the format expected by the `trashItems`
         * attribute.
         *
         * @method _loadTrashItem
         * @protected
         * @param {Object} itemHash
         * @param {Object} inTrashList
         * @param {Array} trashItems where results are stored
         * @param {Function} callback
         */
        _loadTrashItem: function(itemHash, inTrashList, trashItems, callback) {
            var Location = this.get("locationModelConstructor"),
                ContentType = this.get("contentTypeModelConstructor"),
                TrashItem = this.get("trashItemModelConstructor"),
                parentLocation = new Location(),
                contentType = new ContentType(),
                trashItem = new TrashItem(),
                loadOptions = {api: this.get('capi')},
                service = this,
                tasks = new Y.Parallel();

            trashItem.loadFromHash(itemHash);

            contentType.set('id', trashItem.get('contentInfo').get('resources').ContentType);
            contentType.load(loadOptions, tasks.add(function (error) {
                if (error) {
                    service._error("Failed to load trash item Content Type name with REST API");
                }
            }));

            parentLocation.set('id', itemHash.ParentLocation._href);

            if (!service._isParentInTrash(itemHash.ParentLocation._href, inTrashList)) {
                parentLocation.load(loadOptions, tasks.add(function (error) {
                    // Do nothing if there is an error. The parent might have been deleted/restored
                    if (!error) {
                        parentLocation.loadPath(loadOptions, tasks.add(function (error) {
                            if (error) {
                                service._error("Failed to load parent location path with REST API");
                            }
                        }));
                    }
                }));
            }

            tasks.done(function () {
                trashItems.push({
                    'item': trashItem,
                    'parentLocation': parentLocation,
                    'contentType': contentType,
                });

                callback();
            });
        },

        /**
         * Builds a HashMap with trashItem's pathString as key
         *
         * @method _buildInTrashList
         * @protected
         * @param {Object} trashItemHash
         * @return {Object}
         */
        _buildInTrashList: function (trashItemHash) {
            var inTrashList = {};

            Y.Array.each(trashItemHash, function (itemHash) {
                inTrashList[itemHash.pathString] = "";
            });

            return inTrashList;
        },

        /**
         * Empties the trash, refreshes the list and add a notifications
         *
         * @method _emptyTrash
         * @protected
         */
        _emptyTrash: function () {
            var contentService = this.get('capi').getContentService(),
                notificationName = 'empty-trash',
                itemCount = this.get('trashItems').length;

            this._notify(
                'Emptying the Trash',
                notificationName,
                'started',
                0
            );

            contentService.emptyTrash(Y.bind(function (error) {
                if (error) {
                    this._notify(
                        'An error occurred while emptying the Trash',
                        notificationName,
                        'error',
                        0
                    );
                    return;
                }

                /**
                 * Fired once trash has just been emptied
                 * @event refreshView
                 */
                this.fire('refreshView');

                this._notify(
                    itemCount + ' Items were permanently deleted.',
                    notificationName,
                    'done',
                    5
                );
            }, this));
        },

        /**
         * Returns true if parentLocationId is in inTrashList.
         *
         * @method _isParentInTrash
         * @protected
         * @param {String} parentLocationId
         * @param {Object} inTrashList list of object with pathString as key
         * @return {Boolean}
         */
        _isParentInTrash: function (parentLocationId, inTrashList) {
            var pathString,
                restIdPrefix = "/api/ezp/v2/content/locations";

            /*
             * Converting REST location Id to PathString, until some other Id is provided
             * in the trashItem. Like "original location".
             */
            pathString = parentLocationId.substring(restIdPrefix.length) + "/";

            return inTrashList[pathString] !== undefined;
        },

        /**
         * Restores trash items
         *
         * @method _restoreItems
         * @protected
         * @param {Object} e restoreItems event facade
         * @param {Array} e.trashItems  List of trashItems to be restored
         */
        _restoreItems: function (e) {
            var loadOptions = {api: this.get('capi')},
                tasks = new Y.Parallel(),
                service = this,
                notificationIdentifier = "restoreTrashItems",
                restoreCount = 0;

            this._notify(
                'Restoring trash item(s)',
                notificationIdentifier,
                'started',
                5
            );

            Y.each(e.trashItems, function (trashItem) {
                trashItem.restore(loadOptions, tasks.add(function (error) {
                    var trashItemId = trashItem.get('id');

                    if (error) {
                        service._notify(
                            "An error occurred while restoring trash item with Id: " + trashItemId
                            + ". For the moment item's whose original location has been deleted can not be restored",
                            notificationIdentifier + "-error-" + trashItemId,
                            'error',
                            0
                        );

                        return;
                    }
                    /**
                     * Fired when a Location is restored.
                     *
                     * @event restoredLocation
                     * @param trashItem {eZ.TrashItem}
                     */
                    service.fire('restoredLocation', {
                        trashItem: trashItem,
                    });
                    restoreCount++;
                }));
            });

            tasks.done(function () {

                if (restoreCount > 0) {
                    service._notify(
                        restoreCount + ' Content item(s) have been restored',
                        notificationIdentifier,
                        'done',
                        5
                    );

                    /**
                     * Fired once trash has just been emptied
                     * @event refreshView
                     */
                    service.fire('refreshView');
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
         * @param {Number} timeout the number of second, the notification will be shown
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
        * Returns the view parameters of the trash view
        *
        * @method _getViewParameters
        * @protected
        * @return {Object}
        */
        _getViewParameters: function () {
            return {
                trashItems: this.get('trashItems'),
            };
        },
    }, {
        ATTRS: {

            /**
             * List of Trash Items struct:
             *  - struct.item: Y.eZ.TrashItem
             *  - struct.parentLocation: Y.eZ.Location
             *  - struct.contentType: Y.eZ.ContentType
             *
             * @attribute trashItems
             * @required
             * @default []
             * @type Array
             */
            trashItems: {
                value: [],
            },

            /**
             * Holds the eZ.ContentType constructor function
             *
             * @attribute contentTypeModelConstructor
             * @type {Function}
             * @default Y.eZ.ContentType
             */
            contentTypeModelConstructor: {
                value: Y.eZ.ContentType
            },

            /**
             * Holds the eZ.Location constructor function
             *
             * @attribute locationModelConstructor
             * @type {Function}
             * @default Y.eZ.Location
             */
            locationModelConstructor: {
                value: Y.eZ.Location
            },

            /**
             * Holds the eZ.TrashItem constructor function
             *
             * @attribute trashItemModelConstructor
             * @type {Function}
             * @default Y.eZ.TrashItem
             */
            trashItemModelConstructor: {
                value: Y.eZ.TrashItem
            },
        }
    });
});

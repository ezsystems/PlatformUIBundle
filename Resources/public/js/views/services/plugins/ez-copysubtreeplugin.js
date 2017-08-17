/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-copysubtreeplugin', function (Y) {
    "use strict";
    /**
     * Provides the Copy Subtree plugin.
     *
     * @module ez-copysubtreeplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * CopySubtreePlugin fires the universal discovery widget to copy
     * a subtree under the selected location, on copySubtreeAction event.
     *
     * @namespace eZ.Plugin
     * @class CopySubtree
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.CopySubtree = Y.Base.create('copySubtreePlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:copySubtreeAction', Y.bind(this._handleCopySubtreeAction, this));
        },

        /**
         * it asks confirmation to the user before copy the subtree.
         *
         * @method _handleCopySubtreeAction
         * @protected
         * @param {Object} e event facade of the deleteAction event
         */
        _handleCopySubtreeAction: function (e) {
            var service = this.get('host'),
                location = service.get('location');

            e.preventDefault();
            this._checkSubtreeSizeLimit(location, Y.bind(function(allowed, size) {
                if (allowed) {
                    this._confirmCopyingSubtree(size);
                } else {
                    this._notify(
                        Y.eZ.trans('error.occurred.copying.exceededSubtreeSize', {}, 'bar'),
                        'copy-notification-exceeded-subtree-size',
                        'error',
                        5
                    );
                }
            }, this));
        },

        /**
         * It asks confirmation to the user before copy the subtree.
         *
         * @method _confirmCopyingSubtree
         * @protected
         * @param {Integer} size Subtree size
         */
        _confirmCopyingSubtree: function (size) {
            var service = this.get('host');

            service.fire('confirmBoxOpen', {
                config: {
                    title: Y.eZ.trans('confirmed.copySubtree', { 'size': size }, 'locationview'),
                    confirmHandler: Y.bind(this._copySelectLocation, this),
                },
            });
        },

        /**
         * Checks the limit of copying subtree size.
         *
         * @method _checkSubtreeSizeLimit
         * @protected
         * @param {Location} location The location
         * @param {Function} callback The resolve callaback
         */
        _checkSubtreeSizeLimit: function (location, callback) {
            var service = this.get('host'),
                app = service.get('app'),
                capi = service.get('capi'),
                config = service.get('config').copySubtree;

            if (config.limit !== 0) {
                app.set('loading', true);
                location.getSubtreeSize({ api: capi }, function(error, response) {
                    if (error) {
                        this._notify(
                            Y.eZ.trans('error.occurred.copying', {}, 'bar'),
                            'copy-notification-check-subtree-limit', 'error', 0
                        );
                        app.set('loading', false);
                        return ;
                    }

                    var size = response.document.View.Result.count;

                    app.set('loading', false);
                    callback(config.limit === -1 || size <= config.limit, size);
                });
            } else{
                callback(false, 0);
            }
        },

        /**
         * Selects the destination location for subtree
         *
         * @method _copySubtree
         * @protected
         * @param {EventFacade} e event facade of the deleteAction event
         */
        _copySelectLocation: function (e) {
            var service = this.get('host');

            service.fire('contentDiscover', {
                config: {
                    title: Y.eZ.trans('select.location.to.copySubtree', {}, 'bar'),
                    contentDiscoveredHandler: Y.bind(this._copySubtree, this),
                    isSelectable: function (contentStruct) {
                        return contentStruct.contentType.get('isContainer');
                    },
                },
            });
        },

        /**
         * Copy the subtree to the selected location
         *
         * @method _copySubtree
         * @protected
         * @param {EventFacade} e
         */
        _copySubtree: function (e) {
            var service = this.get('host'),
                app = service.get('app'),
                parentLocationId = e.selection.location.get('id'),
                that = this,
                locationId = service.get('location').get('id'),
                notificationIdentifier =  'copy-notification-' + parentLocationId + '-' + locationId,
                contentName =  service.get('content').get('name'),
                parentContentName = e.selection.contentInfo.get('name');

            this._notify(
                Y.eZ.trans('content.being.copied.under', {contentName: contentName, parentContentName: parentContentName}, 'bar'),
                notificationIdentifier,
                'started',
                5
            );
            app.set('loading', true);
            service.get('location').copy({api: service.get('capi')}, parentLocationId, function(error, response) {
                if (error) {
                    that._notify(
                        Y.eZ.trans('error.occurred.copying', {}, 'bar'),
                        notificationIdentifier, 'error', 0
                    );
                    app.set('loading', false);
                    return;
                }

                that._notify(
                    Y.eZ.trans('content.copied.under', {contentName: contentName, parentContentName: parentContentName}, 'bar'),
                    notificationIdentifier,
                    'done',
                    5
                );

                app.navigateTo('viewLocation', {
                    id: response.getHeader('location'),
                    languageCode: service.get('content').get('mainLanguageCode')
                });
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
            this.get('host').fire('notify', {
                notification: {
                    text: text,
                    identifier: identifier,
                    state: state,
                    timeout: timeout,
                }
            });
        },
    }, {
        NS: 'copySubtree',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.CopySubtree, ['locationViewViewService']
    );
});

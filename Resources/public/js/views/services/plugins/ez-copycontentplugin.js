/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-copycontentplugin', function (Y) {
    "use strict";
    /**
     * Provides the Copy Content plugin.
     *
     * @module ez-copycontentplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * CopyContentPlugin fires the universal discovery widget to copy
     * a content under the selected location, on copyAction event.
     *
     * @namespace eZ.Plugin
     * @class CopyContent
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.CopyContent = Y.Base.create('copyContentPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:copyAction', Y.bind(this._copySelectLocation, this));
        },

        /**
         * copyAction event handler, launch the universal discovery widget
         * to choose a location to copy the content
         *
         * @method _copySelectLocation
         * @protected
         * @param {EventFacade} e
         */
        _copySelectLocation: function (e) {
            var service = this.get('host');

            service.fire('contentDiscover', {
                config: {
                    title: "Select the location you want to copy your content into",
                    contentDiscoveredHandler: Y.bind(this._copyContent, this),
                    isSelectable: function (contentStruct) {
                        return contentStruct.contentType.get('isContainer');
                    },
                },
            });
        },

        /**
         * Copy the content to the selected location
         *
         * @method _copyContent
         * @protected
         * @param {EventFacade} e
         */
        _copyContent: function (e) {
            var service = this.get('host'),
                app = service.get('app'),
                parentLocationId = e.selection.location.get('id'),
                locationId = service.get('location').get('id'),
                that = this,
                contentName =  service.get('content').get('name'),
                parentContentName = e.selection.contentInfo.get('name'),
                notificationIdentifier =  'copy-notification-' + parentLocationId + '-' + locationId;

            this._notify(
                "'" + contentName + "' is being copied under '" + parentContentName + "'",
                notificationIdentifier,
                'started',
                5
            );
            app.set('loading', true);
            service.get('content').copy({api: service.get('capi')}, parentLocationId, function (error, response) {
                if (error) {
                    that._notify('An error occurred while copying your content', notificationIdentifier, 'error', 0);
                    app.set('loading', false);
                    return;
                }
                that._notify(
                    "'" + contentName + "' has been successfully copied under '" + parentContentName + "'",
                    notificationIdentifier,
                    'done',
                    5
                );
                that._redirect(response.getHeader('location'));
            });
        },

        /**
         * Redirect the user to the copied content
         *
         * @method _redirect
         * @param {String} locationId
         * @protected
         */
        _redirect: function (locationId) {
            var service = this.get('host'),
                app = service.get('app'),
                that = this;

            this.get('copiedContent').set('id', locationId);
            this.get('copiedContent').load({api: service.get('capi')}, function (error) {
                if (error) {
                    app.set('loading', false);
                    that._notify('An error occurred while loading your content', 'loading-content-error', 'error', 0);
                    return;
                }
                /**
                 * Fired when the content is copied
                 *
                 * @event copiedContent
                 * @param {eZ.Content} copiedContent
                 * @param {eZ.Content} originalContent
                 */
                service.fire('copiedContent', {copiedContent: that.get('copiedContent'), originalContent: service.get('content')});
                app.navigateTo('viewLocation',
                    {
                        id: that.get('copiedContent').get('resources').MainLocation,
                        languageCode: that.get('copiedContent').get('mainLanguageCode')
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
        NS: 'copyContent',
        ATTRS: {
            /**
             * The copied content
             *
             * @attribute copiedContent
             * @type {eZ.Content}
             */
            copiedContent: {
                valueFn: function() {
                    return new Y.eZ.Content();
                }
            }
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.CopyContent, ['locationViewViewService']
    );
});

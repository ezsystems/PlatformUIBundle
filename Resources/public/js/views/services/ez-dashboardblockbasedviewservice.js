/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockbasedviewservice', function (Y) {
    'use strict';

    /**
     * Provides the dashboard block based view service class
     *
     * @method ez-dashboardblockbasedviewservice
     */
    Y.namespace('eZ');

    var DEFAULT_ERROR_IDENTIFIER = 'dashboardblockbasedviewservice-error',
        DEFAULT_ERROR_MESSAGE = 'DashboardBlockBasedViewService: error';

    /**
     * The dashboard block based view service
     *
     * @namespace eZ
     * @class DashboardBlockBasedViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.DashboardBlockBasedViewService = Y.Base.create('dashboardBlockBasedViewService', Y.eZ.ViewService, [], {
        _load: function (next) {
            this._loadRootLocation()
                .then(Y.bind(this._loadRootLocationModelData, this))
                .then(next)
                .catch(Y.bind(this._handleError, this));
        },

        /**
         * Handles errors during publishing process
         *
         * @method _handleError
         * @protected
         * @param data {Object} error data object. Should contain error message and error identifier
         * @param error {Object} error object
         * @return false;
         */
        _handleError: function (data, error) {
            /**
             * Displays a notification bar with error message.
             * Listened by eZ.PlatformUIApp
             *
             * @event notify
             * @param notification {Object} notification data
             */
            this.fire('notify', {
                notification: {
                    text: data.message || DEFAULT_ERROR_MESSAGE,
                    identifier: data.identifier || DEFAULT_ERROR_IDENTIFIER,
                    state: 'error',
                    timeout: 0
                }
            });

            console.error(DEFAULT_ERROR_IDENTIFIER, data, error);

            this.get('app').set('loading', false);

            return;
        },

        /**
         * Loads content root location
         *
         * @method _loadRootLocation
         * @protected
         * @return {Y.Promise}
         */
        _loadRootLocation: function () {
            var errorData = {
                message: this.get('loadRootLocationErrorMessage'),
                identifier: this.get('loadRootLocationErrorIdentifier')
            };

            return new Y.Promise(Y.bind(function (resolve, reject) {
                this.get('capi').getDiscoveryService().getInfoObject('rootLocation', function (error, response) {
                    if (error) {
                        reject(errorData);

                        return;
                    }

                    try {
                        resolve(response._href);
                    } catch (e) {
                        reject(errorData);
                    }
                });
            }, this));
        },

        /**
         * Loads model data of a root location
         *
         * @method _loadRootLocationModelData
         * @protected
         * @param rootLocationId {String} root location REST id
         * @return {Y.Promise}
         */
        _loadRootLocationModelData: function (rootLocationId) {
            var rootLocation = this.get('rootLocation'),
                errorData = {
                    message: this.get('loadLocationModelErrorMessage'),
                    identifier: this.get('loadLocationModelErrorIdentifier')
                };

            rootLocation.set('id', rootLocationId);

            return new Y.Promise(Y.bind(function (resolve, reject) {
                rootLocation.load({api: this.get('capi')}, function (error, response) {
                    if (error) {
                        reject(errorData);

                        return;
                    }

                    resolve(response.document.Location);
                });
            }, this));
        },
    }, {
        ATTRS: {
            /**
             * Root location model
             *
             * @attribute rootLocation
             * @type Y.eZ.Location
             */
            rootLocation: {
                cloneDefaultValue: false,
                valueFn: function () {
                    return new Y.eZ.Location();
                }
            },

            /**
             * The error message to be displayed
             * when loading root location id fails
             *
             * @attribute loadRootLocationErrorMessage
             * @type String
             * @default 'Cannot load root location'
             */
            loadRootLocationErrorMessage: {
                value: 'Cannot load root location'
            },

            /**
             * The error identifier
             * of loading root location id error
             *
             * @attribute loadRootLocationErrorMessage
             * @type String
             * @default 'Cannot load root location'
             */
            loadRootLocationErrorIdentifier: {
                value: 'load-root-location-error'
            },

            /**
             * The error message to be displayed
             * when loading location model data fails
             *
             * @attribute loadLocationModelErrorMessage
             * @type String
             * @default 'Cannot load root location data into model'
             */
            loadLocationModelErrorMessage: {
                value: 'Cannot load root location data into model'
            },

            /**
             * The error identifier
             * of loading location model data error
             *
             * @attribute loadLocationModelErrorIdentifier
             * @type String
             * @default 'load-root-location-model-data-error'
             */
            loadLocationModelErrorIdentifier: {
                value: 'load-root-location-model-data-error'
            }
        }
    });
});

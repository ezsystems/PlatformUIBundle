/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblocksviewservice', function (Y) {
    'use strict';

    /**
     * Provides the dashboard blocks view service class
     *
     * @method ez-dashboardblocksviewservice
     */
    Y.namespace('eZ');

    /**
     * The dashboard blocks view service
     *
     * @namespace eZ
     * @class DashboardBlocksViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.DashboardBlocksViewService = Y.Base.create('dashboardBlocksViewService', Y.eZ.ViewService, [], {
        _load: function (next) {
            this._loadRootLocation()
                .then(Y.bind(this._loadRootLocationModelData, this))
                .then(next)
                .catch(Y.bind(this._error, this));
        },

        /**
         * Loads content root location
         *
         * @method _loadRootLocation
         * @protected
         * @return {Y.Promise}
         */
        _loadRootLocation: function () {
            var errorMessage = this.get('loadRootLocationErrorMessage');

            return new Y.Promise(Y.bind(function (resolve, reject) {
                this.get('capi').getDiscoveryService().getInfoObject('rootLocation', function (error, response) {
                    if (error) {
                        reject(errorMessage);

                        return;
                    }

                    resolve(response._href);
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
                errorMessage = this.get('loadLocationModelErrorMessage');

            rootLocation.set('id', rootLocationId);

            return new Y.Promise(Y.bind(function (resolve, reject) {
                rootLocation.load({api: this.get('capi')}, function (error, response) {
                    if (error) {
                        reject(errorMessage);

                        return;
                    }

                    resolve(rootLocation);
                });
            }, this));
        },

        _getViewParameters: function () {
            return {
                rootLocation: this.get('rootLocation'),
                currentUser: this.get('app').get('user'),
            };
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
                valueFn: function () {
                    return new Y.eZ.Location();
                }
            },

            /**
             * The error message to be displayed
             * when loading root location id fails.
             *
             * @attribute loadRootLocationErrorMessage
             * @type String
             * @default 'Cannot load root location'
             */
            loadRootLocationErrorMessage: {
                value: 'Cannot load root location'
            },

            /**
             * The error message to be displayed
             * when loading location model data fails.
             *
             * @attribute loadLocationModelErrorMessage
             * @type String
             * @default 'Cannot load root location data into model'
             */
            loadLocationModelErrorMessage: {
                value: 'Cannot load root location data into model'
            },
        }
    });
});

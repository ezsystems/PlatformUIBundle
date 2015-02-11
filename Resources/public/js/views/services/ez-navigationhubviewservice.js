/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service component for the navigation hub
     *
     * @module ez-navigationhubviewservice
     */
    Y.namespace('eZ');

    /**
     * Navigation hub view service.
     *
     * @namespace eZ
     * @class NavigationHubViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.NavigationHubViewService = Y.Base.create('navigationHubViewService', Y.eZ.ViewService, [], {
        initializer: function () {
            this.on('*:logOut', this._logOut);
        },

        /**
         * logOut event handler, it logs out the user and redirect to the login
         * form.
         *
         * @method _logOut
         */
        _logOut: function () {
            var app = this.get('app');

            app.set('loading', true);
            app.logOut(function () {
                app.navigateTo('loginForm');
            });
        },

        /**
         * Returns the parameters for the navigation hub view
         *
         * @method getViewParameters
         * @return {Object}
         */
        _getViewParameters: function () {
            return {
                user: this.get('app').get('user'),
                navigationMenus: this.get('navigationMenus')
            };
        },
    }, {
        ATTRS: {
            /**
             * Contains an object filled with menu links
             * assigned to the tab
             *
             * @attribute navigationMenus
             * @type Object
             * @required
             * @default {
                    create: [{
                        title: 'Content structure',
                        href: '/shell#/view/%2Fapi%2Fezp%2Fv2%2Fcontent%2Flocations%2F1%2F2'
                    }, {
                        title: 'Media library',
                        href: '/shell#/view/%2Fapi%2Fezp%2Fv2%2Fcontent%2Flocations%2F1%2F43'
                    }, {
                        title: 'Campaign',
                        href: '/shell#/'
                    }],
                    optimize: [{
                        title: 'Optimize 1',
                        href: '/shell#'
                    }, {
                        title: 'Optimize 2',
                        href: '/shell#'
                    }, {
                        title: 'Optimize 3',
                        href: '/shell#'
                    }],
                    deliver: [{
                        title: 'Deliver 1',
                        href: '/shell#'
                    }, {
                        title: 'Deliver 2',
                        href: '/shell#'
                    }, {
                        title: 'Deliver 3',
                        href: '/shell#'
                    }]
                }
             */
            navigationMenus: {
                value: {
                    create: [{
                        title: 'Content structure',
                        href: '/shell#/view/%2Fapi%2Fezp%2Fv2%2Fcontent%2Flocations%2F1%2F2'
                    }, {
                        title: 'Media library',
                        href: '/shell#/view/%2Fapi%2Fezp%2Fv2%2Fcontent%2Flocations%2F1%2F43'
                    }, {
                        title: 'Campaign',
                        href: '/shell#/'
                    }],
                    optimize: [{
                        title: 'Optimize 1',
                        href: '/shell#'
                    }, {
                        title: 'Optimize 2',
                        href: '/shell#'
                    }, {
                        title: 'Optimize 3',
                        href: '/shell#'
                    }],
                    deliver: [{
                        title: 'Deliver 1',
                        href: '/shell#'
                    }, {
                        title: 'Deliver 2',
                        href: '/shell#'
                    }, {
                        title: 'Deliver 3',
                        href: '/shell#'
                    }]
                }
            }
        }
    });
});

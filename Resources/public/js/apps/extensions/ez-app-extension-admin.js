YUI.add('ez-app-extension-admin', function (Y) {
    "use strict";
    /**
     * Provides the admin app extension for the eZ.PlatformUIApp
     *
     * @module ez-app-extension-admin
     */
    Y.namespace('eZ');

    /**
     * Admin app extension. It adds some routes and views to the application and
     * also allows to lazy load the admin related code.
     *
     * @namespace eZ
     * @class AdminAppExtension
     * @constructor
     * @extends eZ.AppExtension
     */
    Y.eZ.AdminAppExtension = Y.Base.create('adminAppExtension', Y.eZ.AppExtension, [], {}, {
        ATTRS: {
            routes: {
                readOnly: true,
                value: [{
                    name: "adminGenericRoute",
                    path: "/admin/:uri",
                    sideViews: {'navigationHub': true},
                    service: Y.eZ.ServerSideViewService,
                    view: "serverSideView",
                    callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
                }]
            },

            views: {
                readOnly: true,
                value: {
                    serverSideView: {
                        type: Y.eZ.ServerSideView
                    }
                }
            }
        }
    });
});

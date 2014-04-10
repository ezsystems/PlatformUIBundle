YUI.add('ez-app-extension', function (Y) {
    "use strict";
    /**
     * Provides the base app extension class.
     *
     * @module ez-app-extension
     */
    Y.namespace('eZ');

    /**
     * Base app extension class. App extension are meant to "externally" extend
     * the eZ.PlatformUIApp with routes and views for now.
     *
     * @namespace eZ
     * @class AppExtension
     * @constructor
     * @extends Base
     */
    Y.eZ.AppExtension = Y.Base.create('appExtension', Y.Base, [], {
        /**
         * Extends the application by adding routes and views
         *
         * @method extend
         * @param {App} app an application
         */
        extend: function (app) {
            this._extendViews(app);
            this._extendRoutes(app);
        },

        /**
         * Adds (or overrides) views in the application
         *
         * @method _extendViews
         * @protected
         * @param {App} app an application
         */
        _extendViews: function (app) {
            Y.Object.each(this.get('views'), function (viewInfo, identifier) {
                app.views[identifier] = viewInfo;
            });
        },

        /**
         * Adds routes to the application
         *
         * @method _extendRoutes
         * @protected
         * @param {App} app an application
         */
        _extendRoutes: function (app) {
            Y.Array.each(this.get('routes'), function (route) {
                app.route(route);
            });
        },
    }, {
        ATTRS: {
            /**
             * Routes to add to the application. Each element of the array
             * should be a valid route object.
             *
             * @attribute routes
             * @type Array
             * @default empty array
             * @readOnly
             */
            routes: {
                readOnly: true,
                value: []
            },

            /**
             * Views to add to the appliation. Each element of the hash should
             * be a valid view info object
             *
             * @attribute views
             * @type Object
             * @default empty object
             * @readOnly
             */
            views: {
                readOnly: true,
                value: {}
            },
        }
    });
});

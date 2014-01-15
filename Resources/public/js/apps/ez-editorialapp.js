YUI.add('ez-editorialapp', function (Y) {
    "use strict";
    /**
     * Provides the Editorial Application class
     *
     * @module ez-editorialapp
     */

    Y.namespace('eZ');

    var L = Y.Lang,
        APP_OPEN = 'is-app-open',
        APP_LOADING = 'is-app-loading',
        ERROR_VIEW_CONTAINER = '.ez-errorview-container',
        PARTIALS_SEL = '.ez-editorial-app-partial',

        /**
         * Fired whenever a fatal error occurs and application is not able to continue current action
         *
         * @event fatalError
         * @param retryAction {Object} Object describing the action which was interrupted by error, and could be retried
         * @param additionalInfo {Object} Object containing additional information about the error
         * @example
         *     app.fire(EVT_FATALERROR, {
         *         retryAction: {
         *             run: app.loadContentForEdit,
         *             args: [req, res, next],
         *             context: app
         *         },
         *         additionalInfo: {
         *             errorText: " Could not load the content with id '" + req.params.id + "'"
         *         }
         *     });
         */
        EVT_FATALERROR = 'fatalError';

    /**
     * Editorial Application
     *
     * @namespace eZ
     * @class EditorialApp
     * @constructor
     * @extends App
     */
    Y.eZ.EditorialApp = Y.Base.create('editorialApp', Y.App, [], {
        /**
         * The list of available sides views. Each side view is an entry in this
         * hash which contains the following properties:
         *
         *   * `type`: a reference to the constructor of a view
         *   * `container`: a selector to the node that will receive the
         *      rendered view
         *   * `hideClass`: a class to add on the application container to hide
         *     the rendered side view when it's not needed.
         *
         * The lifecycle of the side views is handled by the `handleSideViews`
         * method based on the meta information available in the route.
         *
         * @property sideViews
         * @type {Object}
         */
        sideViews: {
            discoveryBar: {
                type: Y.eZ.DiscoveryBarView,
                container: '.ez-menu-container',
                hideClass: 'is-menu-hidden'
            },
            navigationHub: {
                type: Y.eZ.NavigationHubView,
                container: '.ez-navigation-container',
                hideClass: 'is-navigation-hidden'
            }
        },

        views: {
            contentEditView: {
                type: Y.eZ.ContentEditView,
                parent: 'locationViewView',
                preserve: true
            },
            locationViewView: {
                type: Y.eZ.LocationViewView,
            },
            dummyView: {
                type: Y.View
            },
            errorView: {
                instance: new Y.eZ.ErrorView({
                    container: ERROR_VIEW_CONTAINER
                })
            }
        },

        /**
         * Initialize the application:
         *
         *   * set up the 'close' event that closes the application
         *
         * @method initializer
         */
        initializer: function () {
            // Setting events handlers
            this.on('*:closeView', function (e) {
                Y.config.win.history.back();
            });

            this.on('*:closeApp', this.close);

            this.on('*:fatalError', this._handleError);

            this.on('*:retryAction', this._retryAction);

            this.on('loadingChange', this._loading);

            this.on('navigate', function (e) {
                this.set('loading', true);
            });

            this.on('*:editAction', this._editContent);

            // Listening for events fired on child views
            this.views.errorView.instance.addTarget(this);

            // Registering handlebars partials
            this._registerPartials();
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
            this.navigate(this.routeUri('editContent', {id: e.content.get('id')}));
        },

        /**
         * Generates the URI for a route identified by its name. All
         * placeholders are replaced by the value found in the `params`
         * parameters, if a value is not found in this object, the placeholder
         * is replaced by an empty string.
         *
         * @method routeUri
         * @param {String} routeName the name of the route to look for
         * @param {Object} params an object containing the key/value to replace
         *                 in the route path
         * @return {String} or null if the route was not found
         */
        routeUri: function (routeName, params) {
            var route = Y.Array.find(this.get('routes'), function (elt) {
                    return (elt.name === routeName);
                });

            if ( !route ) {
                return null;
            }

            return route.path.replace(/(:[a-z0-9]+)/gi, function (matched, placeholder) {
                var paramName = placeholder.substr(1);

                if ( !params[paramName] ) {
                    return '';
                }
                return Y.config.win.encodeURIComponent(params[paramName]);
            });
        },

        /**
         * Display the error view
         *
         * @method _handleError
         * @param errorInfo {Object} Object containing additional info about the error
         * @protected
         */
        _handleError: function (errorInfo) {
            var errorView = this.views.errorView.instance;

            this.set('loading', false);
            errorView.setAttrs({
                'retryAction': errorInfo.retryAction,
                'additionalInfo': errorInfo.additionalInfo
            });
            errorView.render();
            errorView.activeCallback();
        },

        /**
         * Retry the action
         *
         * @method _retryAction
         * @param retryAction {Object} Object containing full info about the action which should be retried
         * @protected
         */
        _retryAction: function (retryAction) {
            retryAction.run.apply(retryAction.context, retryAction.args);
        },

        /**
         * Display the content edit view
         *
         * @method handleContentEdit
         * @param {Object} req the request object
         * @param {Function} res the response object
         * @param {Function} next the function to pass control to the next route callback
         */
        handleContentEdit: function (req, res, next) {
            this.showView('contentEditView', res.variables, {
                update: true,
                render: true,
            });
        },

        /**
         * Displays the location view
         *
         * @method handleLocationView
         * @param {Object} req the request object
         * @param {Function} res the response object
         * @param {Function} next the function to pass control to the next route callback
         */
        handleLocationView: function (req, res, next) {
            this.showView('locationViewView', res.variables, {
                update: true,
                render: true,
            });
        },

        /**
         * Changes the application state to be open
         *
         * @method open
         * @param {Object} req the request object
         * @param {Function} res the response object
         * @param {Function} next the function to pass control to the next route callback
         */
        open: function (req, res, next) {
            var container = this.get('container'),
                viewContainer = this.get('viewContainer');

            container.addClass(APP_OPEN);
            viewContainer.setStyle('height', container.get('docHeight') + 'px');
            if ( L.isFunction(next) ) {
                next();
            }
        },

        /**
         * The run view loader configured in the currently evaluated route
         * If no view loader is defined for this route, just pass to the next
         * middleware
         *
         * @method runLoader
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        runLoader: function (req, res, next) {
            var loader, app = this;

            if ( !req.route.loader ) {
                next();
                return;
            }
            this.set('loading', true);
            loader = new req.route.loader({
                capi: this.get('capi'),
                request: req,
                response: res
            });
            loader.on('error', function (e) {
                app.fire(EVT_FATALERROR, {
                    retryAction: {
                        run: app.runLoader,
                        args: [req, res, next],
                        context: app
                    },
                    additionalInfo: {
                        errorText: e.message
                    }
                });
            });
            loader.load(next);
        },

        /**
         * Middleware to handle the *side views* configured for the given route.
         * Depending on the configuration, it will apply the CSS class to
         * show/hide the side views. If a side view is not explicitely
         * configured to be displayed, it is hidden.
         *
         * @method handleSideViews
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        handleSideViews: function (req, res, next) {
            var container = this.get('container'),
                routeSideViews = req.route.sideViews;

            Y.Object.each(this.sideViews, function (viewInfo, key) {
                var cl = viewInfo.hideClass;

                if ( routeSideViews && routeSideViews[key] ) {
                    if ( !viewInfo.instance ) {
                        viewInfo.instance = new viewInfo.type();
                        viewInfo.instance.render();
                    }
                    this.get('container').one(viewInfo.container).append(
                        viewInfo.instance.get('container')
                    );
                    container.removeClass(cl);
                    viewInfo.instance.addTarget(this);
                    this._viewActiveCallback(viewInfo.instance);
                } else {
                    container.addClass(cl);
                    if ( viewInfo.instance ) {
                        viewInfo.instance.remove();
                        viewInfo.instance.removeTarget(this);
                    }
                }
            }, this);
            next();
        },

        /**
         * Changes the application state to be closed
         *
         * @method close
         */
        close: function () {
            this.showView('dummyView');
            this.get('container').removeClass(APP_OPEN);
            this.views.errorView.instance.hide();
        },

        /**
         * Event handler for the loadingChange event. Adds or removes the
         * is-app-loading class on the application container.
         *
         * @method _loading
         * @method protected
         * @param {Object} e the event facade object of the loadingChange event
         */
        _loading: function (e) {
            if ( e.newVal ) {
                this.get('container').addClass(APP_LOADING);
            } else {
                this.get('container').removeClass(APP_LOADING);
            }
        },

        /**
         * Register any handlebar partials situated in the DOM and sporting
         * PARTIALS_SEL class
         *
         * @method _registerPartials
         * @protected
         */
        _registerPartials: function () {
            Y.all(PARTIALS_SEL).each(function (partial) {
                Y.Handlebars.registerPartial(partial.get('id'), partial.getHTML());
            });
        },

        /*
         * Overrides the default implementation to make sure the view
         * activeCallback callback is called after the view is attached to the
         * DOM. It also sets the loading flag to false.
         *
         * @method _afterActiveViewChange
         * @protected
         * @param {Object} e activeViewChange event facade
         */
        _afterActiveViewChange: function (e) {
            var cb;

            if ( e.options.callback ) {
                cb = e.options.callback;
                e.options.callback = function (view) {
                    cb(e.newVal);
                    this._viewActiveCallback(view);
                };
            } else {
                e.options.callback = this._viewActiveCallback;
            }

            Y.eZ.EditorialApp.superclass._afterActiveViewChange.call(this, e);
            this.set('loading', false);
        },

        /**
         * Calls the view activation callback if it exists
         *
         * @method _viewActiveCallback
         * @protected
         * @param {Y.View} view
         */
        _viewActiveCallback: function (view) {
            if ( typeof view.activeCallback === 'function' ) {
                view.activeCallback.call(view);
            }
        }
    }, {
        ATTRS: {
            /**
             * Stores the available routes for the application.
             *
             * In addition to what is described in the {{#crossLink "App"}}YUI
             * App documentation{{/crossLink}}, each route can have several
             * metadata (all optional):
             *
             *   * `loader`: contains a reference to a constructor function that
             *     extends {{#crossLink "eZ.ViewLoader"}}eZ.ViewLoader{{/crossLink}}.
             *     The {{#crossLink "eZ.EditorialApp/runLoader:method"}}`runLoader`{{/crossLink}}
             *     middleware is responsible for using this function to build the
             *     view loader which can be used to inject custom variables in the
             *     top level view triggered by the route.
             *   * `name`: name of the route which is useful to generate an URI
             *     with {{#crossLink
             *     "eZ.EditorialApp/routeUri:method"}}Y.eZ.EditorialApp.routeUri{{/crossLink}}
             *   * `sideViews`: a hash which keys are the side view keys in the
             *     sideViews property. A truthy value means that the
             *     corresponding side view should be visible.
             *
             * @attribute routes
             */
            routes: {
                value: [{
                    name: "editContent",
                    path: '/edit/:id',
                    loader: Y.eZ.ContentEditViewLoader,
                    sideViews: {},
                    callbacks: ['open', 'handleSideViews', 'runLoader', 'handleContentEdit']
                }, {
                    name: "viewLocation",
                    path: '/view/:id',
                    loader: Y.eZ.LocationViewViewLoader,
                    sideViews: {'discoveryBar': true, 'navigationHub': true},
                    callbacks: ['open', 'handleSideViews', 'runLoader', 'handleLocationView']
                }],
            },
            serverRouting: {
                value: false
            },
            transitions: {
                value: {
                    navigate: 'slideLeft',
                    toChild: 'slideLeft',
                    toParent: 'slideRight'
                }
            },

            /**
             * Loading state. Tells whether the application is waiting for
             * something to be loaded
             *
             * @attribute loading
             * @default false
             * @type boolean
             */
            loading: {
                validator: L.isBoolean,
                value: false
            },

            /**
             * eZ Publish REST client
             *
             * @attribute capi
             * @default null
             * @type eZ.CAPI
             * @writeOnce
             * @required
             */
            capi: {
                writeOnce: "initOnly",
                value: null
            }
        }
    });
});

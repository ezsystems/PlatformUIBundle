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
        MINIMIZE_DISCOVERY_BAR_CLASS = 'is-discoverybar-minimized',
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
            dashboardView: {
                type: Y.eZ.DashboardView,
            },
            contentEditView: {
                type: Y.eZ.ContentEditView,
                parent: 'locationViewView',
            },
            locationViewView: {
                type: Y.eZ.LocationViewView,
                parent: 'dashboardView'
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
            /**
             * Stores the initial title of the page so it can be used when
             * generating the title depending on the active view
             *
             * @property _initialTitle
             * @protected
             * @default the actual page title
             */
            this._initialTitle = Y.config.doc.title;

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

            this.on('*:minimizeDiscoveryBarAction', this._minimizeDiscoveryBar);

            this.on('*:navigationModeChange', this._uiSetNavigationModeClass);

            // Listening for events fired on child views
            this.views.errorView.instance.addTarget(this);

            // Registering handlebars partials
            this._registerPartials();
            this._registerUrlHelpers();
        },

        /**
         * navigationModeChange event handler, it sets or unsets the navigation
         * mode class provided in the event facade to handle the fact that the
         * navigation hub can be fixed or not.
         *
         * @method _uiSetNavigationModeClass
         * @protected
         * @param {Object} e navigation mode event facade
         */
        _uiSetNavigationModeClass: function (e) {
            if ( e.navigation.value ) {
                this.get('container').addClass(e.navigation.modeClass);
            } else {
                this.get('container').removeClass(e.navigation.modeClass);
            }
        },

        /**
         * minimizeDiscoveryBarAction event handler, toggles the discovery bar
         * mininized class on the app container to minimize/maximize the
         * discovery bar
         *
         * @method _minimizeDiscoveryBar
         * @protected
         * @param {Object} e event facade of the minimizeDiscoveryBarAction
         */
        _minimizeDiscoveryBar: function (e) {
            this.get('container').toggleClass(MINIMIZE_DISCOVERY_BAR_CLASS);
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
                }),
                prefix = this.get('root') + '#';

            if ( !route ) {
                return null;
            }

            return prefix + route.path.replace(/(:[a-z0-9]+)/gi, function (matched, placeholder) {
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
            errorView.set('active', true);
        },

        /**
         * Retry the action
         *
         * @method _retryAction
         * @param retryAction {Object} Object containing full info about the action which should be retried
         * @protected
         */
        _retryAction: function (retryAction) {
            this.views.errorView.instance.set('active', false);
            retryAction.run.apply(retryAction.context, retryAction.args);
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
            var container = this.get('container');

            container.addClass(APP_OPEN);
            if ( L.isFunction(next) ) {
                next();
            }
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
                    viewInfo.instance.set('active', true);
                    container.removeClass(cl);
                    viewInfo.instance.addTarget(this);
                } else {
                    container.addClass(cl);
                    if ( viewInfo.instance ) {
                        viewInfo.instance.set('active', false);
                        viewInfo.instance.remove();
                        viewInfo.instance.removeTarget(this);
                    }
                }
            }, this);
            next();
        },

        /**
         * Middleware to display the main view which identifier is in the route
         * metadata
         *
         * @method handleMainView
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        handleMainView: function (req, res, next) {
            var app = this,
                viewInfo = this.getViewInfo(req.route.view),
                showView = function (service) {
                    var parameters = service ? service.getViewParameters() : {};

                    if ( service ) {
                        app.once('activeViewChange', function (e) {
                            var view = e.newVal;

                            view.addTarget(service);
                            service.addTarget(app);
                            view.removeTarget(app);
                        });
                    }

                    app.showView(req.route.view, parameters, {
                        update: true,
                        render: true
                    }, function (view) {
                        if ( typeof next === 'function' ) {
                            next();
                        }
                    });
                };

            if ( req.route.service && viewInfo.service ) {
                this.set('loading', true);
                viewInfo.service.set('request', req);
                viewInfo.service.set('response', res);
                viewInfo.service.load(showView);
            } else if ( req.route.service ) {
                this.set('loading', true);
                viewInfo.service = new req.route.service({
                    app: this,
                    capi: this.get('capi'),
                    request: req,
                    response: res
                });

                viewInfo.service.on('error', function (e) {
                    app.fire(EVT_FATALERROR, {
                        retryAction: {
                            run: app.handleMainView,
                            args: [req, res, next],
                            context: app
                        },
                        additionalInfo: {errorText: e.message}
                    });
                });

                viewInfo.service.load(showView);
            } else {
                showView();
            }
        },

        /**
         * Changes the application state to be closed
         *
         * @method close
         */
        close: function () {
            this.get('container').removeClass(APP_OPEN);
            this.views.errorView.instance.hide();
        },

        /**
         * Event handler for the loadingChange event. Adds or removes the
         * is-app-loading class on the application container.
         *
         * @method _loading
         * @protected
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

        /**
         * Registers the URL related handlebars helpers, ie:
         *
         *   * `path`: to generate an URL from its name and its parameters
         *   * `asset` : to generate the URL to an asset available in the
         *   `assetRoot` directory
         *
         * @method _registerUrlHelpers
         * @protected
         */
        _registerUrlHelpers: function () {
            var that = this;

            Y.Handlebars.registerHelper('path', function (routeName, options) {
                return that.routeUri(routeName, options.hash);
            });

            Y.Handlebars.registerHelper('asset', function (uri) {
                return that.get('assetRoot').replace(/\/+$/, '') + '/' + uri.replace(/^\/+/, '');
            });
        },

        /*
         * Overrides the default implementation to make sure the view `active`
         * attribute is set to true  after the view is attached to the
         * DOM. It also sets the loading flag to false and make sure the title
         * of the page is correct after changing the active view.
         *
         * @method _afterActiveViewChange
         * @protected
         * @param {Object} e activeViewChange event facade
         */
        _afterActiveViewChange: function (e) {
            var cb, prevView = e.prevVal, that = this,
                handleActive = function (view) {
                    if ( prevView ) {
                        prevView.set('active', false);
                    }
                    view.set('active', true);
                },
                removeContainerTransformStyle = function (view) {
                    // removing transform style so that position fixed works
                    // as intended see https://jira.ez.no/browse/EZP-21895
                    view.get('container').setStyle('transform', 'none');
                };

            if ( e.options.callback ) {
                cb = e.options.callback;
                e.options.callback = function (view) {
                    that._setTitle(view);
                    cb(e.newVal);
                    removeContainerTransformStyle(view);
                    handleActive(view);
                };
            } else {
                e.options.callback = function (view) {
                    that._setTitle(view);
                    removeContainerTransformStyle(view);
                    handleActive(view);
                };
            }

            Y.eZ.EditorialApp.superclass._afterActiveViewChange.call(this, e);
            this.set('loading', false);
        },

        /**
         * Sets the title of the page using the new active view `getTitle`
         * method if it exists, otherwise, it just restores the initial page
         * title.
         *
         * @method _setTitle
         * @protected
         * @param {View} the active view
         */
        _setTitle: function (view) {
            if ( typeof view.getTitle === 'function' ) {
                Y.config.doc.title = view.getTitle() + ' - ' + this._initialTitle;
            } else {
                Y.config.doc.title = this._initialTitle;
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
             *   * `view`: the identifier of the view in the `views` hash to
             *     display. This is handled by the `handleMainView` middleware.
             *   * `sideViews`: a hash which keys are the side view keys in the
             *     sideViews property. A truthy value means that the
             *     corresponding side view should be visible.
             *
             * @attribute routes
             */
            routes: {
                value: [{
                    name: "dashboard",
                    path: "/dashboard",
                    sideViews: {'navigationHub': true},
                    view: 'dashboardView',
                    callbacks: ['open', 'handleSideViews', 'handleMainView']
                }, {
                    name: "editContent",
                    path: '/edit/:id',
                    service: Y.eZ.ContentEditViewService,
                    sideViews: {},
                    view: 'contentEditView',
                    callbacks: ['open', 'handleSideViews', 'handleMainView']
                }, {
                    name: "viewLocation",
                    path: '/view/:id',
                    service: Y.eZ.LocationViewViewService,
                    sideViews: {'discoveryBar': true, 'navigationHub': true},
                    view: 'locationViewView',
                    callbacks: ['open', 'handleSideViews', 'handleMainView']
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
             * The root directory where to find the assets.
             *
             * @attribute assetRoot
             * @default "/"
             * @type String
             */
            assetRoot: {
                value: "/"
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

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-platformuiapp', function (Y) {
    "use strict";
    /**
     * Provides the PlatformUI Application class
     *
     * @module ez-platformuiapp
     */

    Y.namespace('eZ');

    var L = Y.Lang,
        APP_OPEN = 'is-app-open',
        APP_LOADING = 'is-app-loading',
        ERROR_VIEW_CONTAINER = '.ez-errorview-container',

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
     * PlatformUI Application
     *
     * @namespace eZ
     * @class PlatformUIApp
     * @constructor
     * @extends App
     */
    Y.eZ.PlatformUIApp = Y.Base.create('platformuiApp', Y.App, [], {
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
                service: Y.eZ.DiscoveryBarViewService,
                container: '.ez-menu-container',
                hideClass: 'is-menu-hidden'
            },
            navigationHub: {
                type: Y.eZ.NavigationHubView,
                service: Y.eZ.NavigationHubViewService,
                container: '.ez-navigation-container',
                hideClass: 'is-navigation-hidden'
            },
            universalDiscovery: {
                type: Y.eZ.UniversalDiscoveryView,
                service: Y.eZ.UniversalDiscoveryViewService,
                container: '.ez-universaldiscovery-container',
                hideClass: 'is-universaldiscovery-hidden',
            },
        },

        views: {
            loginFormView: {
                type: Y.eZ.LoginFormView,
            },
            dashboardView: {
                type: Y.eZ.DashboardView,
                parent: 'loginFormView',
            },
            contentEditView: {
                type: Y.eZ.ContentEditView,
                parent: 'locationViewView',
            },
            locationViewView: {
                type: Y.eZ.LocationViewView,
                parent: 'dashboardView'
            },
            serverSideView: {
                type: Y.eZ.ServerSideView,
            },
            sectionServerSideView: {
                type: Y.eZ.SectionServerSideView,
            },
            errorView: {
                instance: new Y.eZ.ErrorView({
                    container: ERROR_VIEW_CONTAINER
                })
            }
        },

        /**
         * Initializes the application.
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

            this.on({
                '*:closeApp': this.close,
                '*:fatalError': this._handleError,
                '*:retryAction': this._retryAction,
                'loadingChange': this._loading,
                'navigate': function () {
                    this.set('loading', true);
                }
            });

            this.after('activeViewServiceChange', function (event) {
                var newService = event.newVal,
                    oldService = event.prevVal;

                if (oldService && newService) {
                    oldService.setNextViewServiceParameters(newService);
                }
            });
            this._routeConfig();
            // Listening for events fired on child views
            this.views.errorView.instance.addTarget(this);
        },

        /**
         * Reads the `routeConfig` configuration object and applies the given
         * settings to the correct route.
         *
         * @protected
         * @method _routeConfig
         */
        _routeConfig: function () {
            if (this.get('routeConfig')) {
                Y.Array.each(this.get('routes'), Y.bind(this._enrichRoute, this));
            }
        },

        /**
         * Enrich the route with the route configuration
         *
         * @protected
         * @method _enrichRoute
         * @param {Object} route a route object (an entry in the `routes`
         * attribute)
         * @param {Number} index
         */
        _enrichRoute: function (route, index) {
            if (this.get('routeConfig')[route.name]) {
                this.get('routes')[index].config = this.get('routeConfig')[route.name];
            }
        },

        /**
         * Generates the URI for a route identified by its name. All
         * placeholders are replaced by the value found in the `params`
         * parameters, if a value is not found in this object, the placeholder
         * is replaced by an empty string.
         *
         * @method routeUri
         * @param {String} routeName the name of the route to look for
         * @param {Object} [params] an object containing the key/value to replace
         *                 in the route path
         * @return {String|Null} null if the route was not found
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
         * Navigates to the given route build with the given parameters
         *
         * @method navigateTo
         * @param {String} routeName
         * @param {Object} [params]
         */
        navigateTo: function (routeName, params) {
            this.navigate(this.routeUri(routeName, params));
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
         * Logs in a user using the provided credentials. If the credentials
         * are wrong, the callback is called with the error and response from
         * CAPI.logIn. If the credentials are correct, the error and response
         * arguments are set with the ones from eZ.UserModel.load method. If the
         * user loading fails, the user is automatically logged out.
         *
         * @method logIn
         * @param credentials {Object} object containing a `login` and a `password`
         * entries
         * @param callback {Function}
         * @param callback.error {false|CAPIError}
         * @param callback.response {Response}
         */
        logIn: function (credentials, callback) {
            var capi = this.get('capi'),
                app = this;

            capi.logIn(credentials, function (error, response) {
                var user;

                if ( error ) {
                    callback(error, response);
                    return;
                }

                user = app.get('user');
                user.set('id', response.document.Session.User._href);
                user.load({api: capi}, function (error, result) {
                    if ( error ) {
                        app.logOut(function () {
                            callback(error, result);
                        });
                        return;
                    }
                    callback(error, result);
                });
            });
        },

        /**
         * Logs out the current user and resets it
         *
         * @method logOut
         * @param {Function} callback
         * @param {false|CAPIError} callback.error the error provided by the CAPI
         * @param {Response} callback.response the response provided by the CAPI
         */
        logOut: function (callback) {
            var user = this.get('user');

            this.get('capi').logOut(function (error, response) {
                user.reset();
                user.set('id', undefined);
                callback(error, response);
            });
        },

        /**
         * Checks whether the user is logged in. From the application point of
         * view, being logged in means the user has a session and this session
         * is associated with a user which is not the anonymous user.
         *
         * @method isLoggedIn
         * @param {Function} callback function called after the check
         * @param {Boolean} callback.notLoggedIn false if the user is logged in,
         * true otherwise
         * @param {Object} [callback.response] the response object if a REST
         * call is done
         */
        isLoggedIn: function (callback) {
            var capi = this.get('capi'),
                anonymousUserId = this.get('anonymousUserId'),
                userId = this.get('user').get('id');

            if ( userId ) {
                callback(userId === anonymousUserId);
                return;
            }
            capi.isLoggedIn(function (error, response) {
                if ( error || response.document.Session.User._href === anonymousUserId ) {
                    callback(true, response);
                    return;
                }
                callback(false, response);
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
            var routeSideViews = req.route.sideViews,
                tasks = new Y.Parallel();

            Y.Object.each(this.sideViews, function (viewInfo, key) {
                if ( routeSideViews && routeSideViews[key] ) {
                    this._showSideView(viewInfo, req, res, undefined, tasks.add());
                } else {
                    this._hideSideView(viewInfo);
                }
            }, this);
            tasks.done(function () {
                next();
            });
        },

        /**
         * Shows a side view based on its identifier in the sideViews hash.
         * This method also allows to pass a configuration hash that will stored
         * in the `config` attribute of the view service.
         *
         * @method showSideView
         * @param {String} sideViewKey
         * @param {Mixed} config
         * @param {Function} next
         */
        showSideView: function (sideViewKey, config, next) {
            var activeViewService = this.get('activeViewService');

            this._showSideView(
                this.sideViews[sideViewKey],
                activeViewService ? activeViewService.get('request') : null,
                activeViewService ? activeViewService.get('response') : null,
                config,
                next
             );
        },

        /**
         * Hides a side view based on its identifier in the sideViews hash
         *
         * @method hideSideView
         * @param {String} sideViewKey
         */
        hideSideView: function (sideViewKey) {
            this._hideSideView(this.sideViews[sideViewKey]);
        },

        /**
         * Shows the side view
         *
         * @method _showSideView
         * @param {Object} viewInfo the info hash of the side view to show
         * @param {Object} req the request
         * @param {Object} res the response
         * @param {Function} next a callback function to call when the view is
         * shown
         * @protected
         */
        _showSideView: function (viewInfo, req, res, config, next) {
            var view, service,
                container = this.get('container'),
                createView = !viewInfo.instance;

            if ( !viewInfo.serviceInstance ) {
                viewInfo.serviceInstance = new viewInfo.service({
                    app: this,
                    capi: this.get('capi'),
                    plugins: Y.eZ.PluginRegistry.getPlugins(viewInfo.service.NAME),
                });
            }
            service = viewInfo.serviceInstance;
            service.setAttrs({
                config: config,
                request: req,
                response: res,
            });
            if ( createView ) {
                viewInfo.instance = new viewInfo.type();
            }
            view = viewInfo.instance;
            view.addTarget(service);
            service.addTarget(this);
            service.load(function () {
                view.setAttrs(service.getViewParameters());
                if ( createView ) {
                    view.render();
                    container.one(viewInfo.container).append(
                        view.get('container')
                    );
                }
                view.set('active', true);
                container.removeClass(viewInfo.hideClass);
                if ( next ) {
                    next();
                }
            });
        },

        /**
         * Hides the side view
         *
         * @method _hideSideView
         * @param {Object} viewInfo the info hash of the side view to hide
         * @protected
         */
        _hideSideView: function (viewInfo) {
            var view;

            this.get('container').addClass(viewInfo.hideClass);
            if ( viewInfo.instance ) {
                view = viewInfo.instance;
                view.set('active', false);
                viewInfo.serviceInstance.removeTarget(this);
            }
        },

        /**
         * Overrides the default implementation to set the view service as a
         * bubble target of the view and the app as a bubble target of the view
         * service.
         *
         * @protected
         * @method _attachView
         * @param {View} view
         * @param {Boolean} preprend
         */
        _attachView: function (view, prepend) {
            var viewInfo = this.getViewInfo(view);

            this.constructor.superclass._attachView.apply(this, arguments);

            if ( viewInfo && viewInfo.service ) {
                view.removeTarget(this);
                view.addTarget(viewInfo.service);
                viewInfo.service.addTarget(this);
            }
        },

        /**
         * Middleware to check whether the user is logged in. When not logged
         * in, it redirects the user to the login form.
         *
         * @method checkUser
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        checkUser: function (req, res, next) {
            var user = this.get('user'),
                app = this,
                capi = this.get('capi');

            app.isLoggedIn(function (notLoggedIn, response) {
                if ( notLoggedIn ) {
                    app.navigateTo('loginForm');
                    return;
                }
                if ( !user.get('id') ) {
                    user.set('id', response.document.Session.User._href);
                    user.load({api: capi}, function (error) {
                        if ( error ) {
                            app.logOut(function () {
                                app.navigateTo('loginForm');
                            });
                            return;
                        }
                        next();
                    });
                } else {
                    next();
                }
            });
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
                route = req.route,
                ServiceContructor = route.service,
                serviceInstance = route.serviceInstance,
                viewInfo = this.getViewInfo(route.view),
                showView = function (service) {
                    var parameters = service ? service.getViewParameters() : {};

                    app.showView(route.view, parameters, {
                        update: true,
                        render: true
                    });
                };

            if ( serviceInstance ) {
                this.set('loading', true);
                viewInfo.service = serviceInstance;
                viewInfo.service.set('request', req);
                viewInfo.service.set('response', res);

                app._set('activeViewService', viewInfo.service);

                viewInfo.service.load(showView);
            } else if ( ServiceContructor ) {
                this.set('loading', true);
                route.serviceInstance = new ServiceContructor({
                    app: this,
                    capi: this.get('capi'),
                    request: req,
                    response: res,
                    plugins: Y.eZ.PluginRegistry.getPlugins(ServiceContructor.NAME),
                    config: route.config,
                });

                viewInfo.service = route.serviceInstance;
                app._set('activeViewService', viewInfo.service);

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
         * `loadingChange` event handler. Adds or removes the `is-app-loading`
         * class on the application container.
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

            Y.eZ.PlatformUIApp.superclass._afterActiveViewChange.call(this, e);
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
        },
    }, {
        ATTRS: {
            /**
             * Stores the available routes for the application.
             *
             * In addition to what is described in the {{#crossLink "App"}}YUI
             * App documentation{{/crossLink}}, each route can have several
             * metadata (all optional):
             *
             *   * `service`: contains a reference to a constructor function that
             *     extends {{#crossLink "eZ.ViewService"}}eZ.ViewService{{/crossLink}}.
             *     The {{#crossLink "eZ.PlatformUIApp/handleMainView:method"}}`handleMainView`{{/crossLink}}
             *     middleware is responsible for using this function to build the
             *     view service which can be used to inject custom variables in the
             *     top level view triggered by the route. This view service is
             *     also made a bubble target of the view so that it can react to
             *     any custom event fired by the view.
             *   * `name`: name of the route which is useful to generate an URI
             *     with {{#crossLink
             *     "eZ.PlatformUIApp/routeUri:method"}}Y.eZ.PlatformUIApp.routeUri{{/crossLink}}
             *   * `view`: the identifier of the view in the `views` hash to
             *     display. This is handled by the `handleMainView` middleware.
             *   * `sideViews`: a hash which keys are the side view keys in the
             *     sideViews property. A truthy value means that the
             *     corresponding side view should be visible.
             *
             * If a route provides both a `regex` and a `path` properties, the
             * `regex` is used in the route matching process, while the `path`
             * can be used in the reverse routing process (generation of a
             * link). If no `path` is provided, no reverse routing is possible.
             *
             * @attribute routes
             */
            routes: {
                value: [{
                    name: "loginForm",
                    path: "/login",
                    service: Y.eZ.LoginFormViewService,
                    sideViews: {},
                    view: 'loginFormView',
                    callbacks: ['open', 'handleSideViews', 'handleMainView']
                }, {
                    name: "dashboard",
                    path: "/dashboard",
                    sideViews: {'navigationHub': true},
                    view: 'dashboardView',
                    callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
                }, {
                    name: "editContent",
                    path: '/edit/:id',
                    service: Y.eZ.ContentEditViewService,
                    sideViews: {},
                    view: 'contentEditView',
                    callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
                }, {
                    name: "createContent",
                    path: '/create',
                    service: Y.eZ.ContentCreateViewService,
                    sideViews: {},
                    view: 'contentEditView',
                    callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
                }, {
                    name: "viewLocation",
                    path: '/view/:id',
                    service: Y.eZ.LocationViewViewService,
                    sideViews: {'discoveryBar': true, 'navigationHub': true},
                    view: 'locationViewView',
                    callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
                }, {
                    name: "adminSection",
                    regex: /\/admin\/(pjax%2Fsection%2F.*)/,
                    keys: ['uri'],
                    path: "/admin/:uri",
                    sideViews: {'navigationHub': true},
                    service: Y.eZ.SectionServerSideViewService,
                    view: "sectionServerSideView",
                    callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
                }, {
                    name: "adminGenericRoute",
                    path: "/admin/:uri",
                    sideViews: {'navigationHub': true},
                    service: Y.eZ.ServerSideViewService,
                    view: "serverSideView",
                    callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
                }]
            },
            serverRouting: {
                value: false
            },
            linkSelector: {
                // this is to avoid the Y.App to capture the click on the links
                // otherwise the custom code can not prevent a click on any
                // link.
                value: "a.ez-pjax-no-element"
            },
            transitions: {
                value: {
                    navigate: 'slideLeft',
                    toChild: 'slideLeft',
                    toParent: 'slideRight'
                }
            },

            /**
             * The base URI to build the URI of the ajax request
             *
             * @attribute baseUri
             * @default "/"
             * @type String
             */
            baseUri: {
                value: "/"
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
             * Routes configuration
             *
             * It's an object supposed to contain the configuration of a route,
             * the key is the name of the route it should match
             * For example if you want to match "loginForm" route:
             *
             *    "loginForm": {
             *         "fieldsViews": {
             *             "ezthing": 'Something'
             *         }
             *     },
             *
             * @attribute routeConfig
             * @default null
             * @type Object
             * @writeOnce
             */
            routeConfig: {
                writeOnce: "initOnly",
                value: null
            },

            /**
             * eZ Publish REST client
             *
             * @attribute capi
             * @default null
             * @type {eZ.CAPI}
             * @writeOnce
             * @required
             */
            capi: {
                writeOnce: "initOnly",
                value: null
            },

            /**
             * The logged in user
             *
             * @attribute user
             * @type {eZ.User}
             * @readOnly
             */
            user: {
                readOnly: true,
                valueFn: function () {
                    return new Y.eZ.User();
                },
            },

            /**
             * Active view service instance
             *
             * @attribute activeViewService
             * @type {eZ.ViewService}
             * @readOnly
             */
            activeViewService: {
                readOnly: true
            },

            /**
             * Stores the REST id of the configured anonymous user
             *
             * @attribute anonymousUserId
             * @type {String}
             * @required
             */
            anonymousUserId: {
                writeOnce: "initOnly",
            },
        }
    });
});

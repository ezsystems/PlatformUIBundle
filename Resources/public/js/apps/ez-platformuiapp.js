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
            }
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

            // Listening for events fired on child views
            this.views.errorView.instance.addTarget(this);
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
         * Logs in a user using the provided the credentials. If the credentials
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
                routeSideViews = req.route.sideViews,
                tasks = new Y.Parallel();

            Y.Object.each(this.sideViews, function (viewInfo, key) {
                var cl = viewInfo.hideClass,
                    service, view;

                if ( routeSideViews && routeSideViews[key] ) {
                    if ( !viewInfo.serviceInstance ) {
                        viewInfo.serviceInstance = new viewInfo.service({
                            app: this,
                            capi: this.get('capi'),
                            plugins: Y.eZ.PluginRegistry.getPlugins(viewInfo.service.NAME),
                        });
                    }
                    service = viewInfo.serviceInstance;
                    service.setAttrs({
                        request: req,
                        response: res,
                    });
                    if ( !viewInfo.instance ) {
                        viewInfo.instance = new viewInfo.type();
                    }
                    view = viewInfo.instance;
                    view.addTarget(service);
                    service.addTarget(this);
                    service.load(tasks.add(function () {
                        view.setAttrs(service.getViewParameters());
                        view.render();
                        container.one(viewInfo.container).append(
                            view.get('container')
                        );
                        view.set('active', true);
                        container.removeClass(cl);
                    }));
                } else {
                    container.addClass(cl);
                    if ( viewInfo.instance ) {
                        view = viewInfo.instance;
                        view.set('active', false);
                        view.remove();
                        viewInfo.serviceInstance.removeTarget(this);
                    }
                }
            }, this);
            tasks.done(function () {
                next();
            });
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
         * Checks whether the user is loaded and logged in. If the user object
         * in the `user` attribute is loaded, the user is considered logged in.
         * If it's not loaded, the CAPI.isLoggedIn method is called and the user
         * is loaded if it's logged other, the application user is redirected to
         * the login form.
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

            if ( user.get('id') ) {
                next();
                return;
            }

            capi.isLoggedIn(function (error, response) {
                if ( error ) {
                    app.navigateTo('loginForm');
                    return;
                }
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
                viewInfo = this.getViewInfo(req.route.view),
                showView = function (service) {
                    var parameters = service ? service.getViewParameters() : {};

                    app.showView(req.route.view, parameters, {
                        update: true,
                        render: true
                    });
                };

            if ( req.route.service && viewInfo.service ) {
                this.set('loading', true);
                viewInfo.service.set('request', req);
                viewInfo.service.set('response', res);

                app._set('activeViewService', viewInfo.service);

                viewInfo.service.load(showView);
            } else if ( req.route.service ) {
                this.set('loading', true);
                viewInfo.service = new req.route.service({
                    app: this,
                    capi: this.get('capi'),
                    request: req,
                    response: res,
                    plugins: Y.eZ.PluginRegistry.getPlugins(req.route.service.NAME),
                });

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

        /**
         * Middleware that makes sure the admin app extension is loaded and that
         * the application has been extended with it.
         *
         * @method _loadAdminExtension
         * @protected
         * @param {Object} req
         * @param {Object} res
         * @param {Function} next
         */
        _loadAdminExtension: function (req, res, next) {
            Y.use('ez-app-extension-admin', function (Y, status) {
                var extension;

                if ( status.data ) {
                    // first loading of the extension
                    extension = new Y.eZ.AdminAppExtension();
                    extension.extend(req.app);
                    // can not just call next as the routing needs
                    // to be done from scratch with the addition of
                    // the app extension
                    req.app.navigate(req.path);
                } else {
                    next();
                }
            });
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
                    name: "viewLocation",
                    path: '/view/:id',
                    service: Y.eZ.LocationViewViewService,
                    sideViews: {'discoveryBar': true, 'navigationHub': true},
                    view: 'locationViewView',
                    callbacks: ['open', 'checkUser', 'handleSideViews', 'handleMainView']
                }, {
                    path: '/admin/*',
                    callback: '_loadAdminExtension'
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
            },

            /**
             * The logged in user
             *
             * @attribute user
             * @type eZ.User
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
             * @type eZ.ViewService
             * @readOnly
             */
            activeViewService: {
                readOnly: true
            }
        }
    });
});

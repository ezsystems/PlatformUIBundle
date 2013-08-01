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
          *            args: [req, res, next],
          *            context: app
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

        views: {
            contentEditView: {
                type: Y.eZ.ContentEditView,
                preserve: true
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
            this.on('contentEditView:close', function (e) {
                // For now just closing the application
                this.close();
            });

            this.on('*:closeApp', this.close);

            this.on('*:fatalError', this._handleError);

            this.on('*:retryAction', this._retryAction);

            this.on('loadingChange', this._loading);

            this.on('navigate', function (e) {
                this.set('loading', true);
            });

            // Listening for events fired on child views
            this.views.errorView.instance.addTarget(this);
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

            errorView.setAttrs({
                'retryAction': errorInfo.retryAction,
                'additionalInfo': errorInfo.additionalInfo
            });
            errorView.render();
            errorView.setFocus();
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
            this.showView('contentEditView', this.get('contentEditViewVariables'), {
                update: true,
                render: true,
                callback: function (view) {
                    this.set('loading', false);
                    view.setFocus();
                }
            });
        },

        /**
         * Loads the content and the associated entities to edit it
         *
         * @method loadContentForEdit
         * @param {Object} req the request object
         * @param {Function} res the response object
         * @param {Function} next the function to pass control to the next route callback
         */
        loadContentForEdit: function (req, res, next) {
            var app = this,
                loadOptions = {
                    api: this.get('capi')
                },
                vars = this.get('contentEditViewVariables'),
                content = vars.content,
                mainLocation = vars.mainLocation,
                type = vars.contentType,
                owner = vars.owner,
                errorHandling = function (error, errorMessage) {
                    if (error) {
                        app.fire(EVT_FATALERROR, {
                            retryAction: {
                                run: app.loadContentForEdit,
                                args: [req, res, next],
                                context: app
                            },
                            additionalInfo: {
                                errorText: errorMessage
                            }
                        });
                        return true;
                    } else {
                        return false;
                    }
                };

            app.set('loading', true);
            content.set('id', "/api/ezp/v2/content/objects/" + req.params.id);
            content.load(loadOptions, function (error) {
                var tasks,
                    resources;

                if (!errorHandling(error, "Could not load the content with id '" + req.params.id + "'")) {
                    resources = content.get('resources');

                    // parallel loading of owner, mainLocation and contentType
                    tasks = new Y.Parallel();

                    owner.set('id', resources.Owner);
                    owner.load(loadOptions, tasks.add(function (error) {
                        errorHandling(error, "Could not load the user with id '" + resources.Owner + "'");
                    }));

                    mainLocation.set('id', resources.MainLocation);
                    mainLocation.load(loadOptions, tasks.add(function (error) {
                        errorHandling(error, "Could not load the location with id '" + resources.MainLocation + "'");
                    }));

                    type.set('id', resources.ContentType);
                    type.load(loadOptions, tasks.add(function (error) {
                        errorHandling(error, "Could not load the content type with id '" + resources.ContentType + "'");
                    }));

                    tasks.done(function () {
                        next();
                    });
                }
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
            this.showView('dummyView');
            if ( L.isFunction(next) ) {
                next();
            }
        },

        /**
         * Changes the application sate to be close
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
        }

    }, {
        ATTRS: {
            routes: {
                value: [
                    {path: '/edit/:id', callback: ['open', 'loadContentForEdit', 'handleContentEdit']}
                ]
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
            },

            /**
             * The variables needed by the content edit view
             *
             * @attribute contentEditViewVariables
             * @default
             */
            contentEditViewVariables: {
                cloneDefaultValue: false,
                value: {
                    content: new Y.eZ.Content(),
                    contentType: new Y.eZ.ContentType(),
                    mainLocation: new Y.eZ.Location(),
                    owner: new Y.eZ.User(),
                    formView: new Y.eZ.ContentEditFormView({
                        model : {
                            fieldSets : [
                                {
                                    fieldSetName : "Content",
                                    fields : [
                                    ]
                                },
                                {
                                    fieldSetName : "Meta",
                                    fields : [
                                    ]
                                }
                            ]
                        }
                    })
                }
            }
        }
    });
});

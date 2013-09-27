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
        APP_LOADING = 'is-app-loading';

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
            errorView: {
                type: Y.eZ.ErrorView
            },
            dummyView: {
                type: Y.View
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
            this.on('*:closeApp', function (e) {
                this.close();
            });

            this.on('*:fatalError', function (errorInfo) {
                this.handleError(errorInfo);
            });

            this.on('loadingChange', this._loading);

            this.on('navigate', function (e) {
                this.set('loading', true);
            });
        },

        /**
         * Display the error view
         *
         * @method handleError
         * @param errorInfo {Object} Object containing additional info about the error
         */
        handleError: function (errorInfo) {
            this.showView('errorView',
                {
                    retryAction: errorInfo.retryAction,
                    additionalInfo: errorInfo.additionalInfo
                }, {
                    update: true,
                    render: true,
                    callback: function (view) {
                        this.set('loading', false);
                        view.setFocus();
                }
            });
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
                owner = vars.owner;

            app.set('loading', true);
            content.set('id', "/api/ezp/v2/content/objects/" + req.params.id);
            content.load(loadOptions, function (error) {
                var tasks,
                    resources = content.get('resources');

                if (error) {
                    app.fire('fatalError', {
                        retryAction : {
                            run : app.loadContentForEdit,
                            args : [req, res, next],
                            owner : app
                        },
                        additionalInfo : {
                            errorCode : error.errorCode,
                            errorText : error.errorText
                        }
                    })
                } else  {
                    // TODO: Handle errors
                    // parallel loading of owner, mainLocation and contentType
                    tasks = new Y.Parallel();

                    owner.set('id', resources.Owner);
                    owner.load(loadOptions, tasks.add(function (error) {}));

                    mainLocation.set('id', resources.MainLocation);
                    mainLocation.load(loadOptions, tasks.add(function (error) {}));

                    type.set('id', resources.ContentType);
                    type.load(loadOptions, tasks.add(function (error) {}));

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
                    owner: new Y.eZ.User()
                }
            }
        }
    });
});

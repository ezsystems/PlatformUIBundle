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
            this.get('errorView').addTarget(this);
        },

        /**
         * Display the error view
         *
         * @method _handleError
         * @param errorInfo {Object} Object containing additional info about the error
         * @protected
         */
        _handleError: function (errorInfo) {
            var errorView = this.get('errorView');

            errorView.set('retryAction', errorInfo.retryAction);
            errorView.set('additionalInfo', errorInfo.additionalInfo);
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
                owner = vars.owner;

            app.set('loading', true);
            content.set('id', "/api/ezp/v2/content/objects/" + req.params.id);
            content.load(loadOptions, function (error) {
                var tasks,
                    resources = content.get('resources');

                if (error) {

                    /**
                     * Fired when a fatal error occurs
                     *
                     * @event fatalError
                     */
                    app.fire('fatalError', {
                        retryAction: {
                            run: app.loadContentForEdit,
                            args: [req, res, next],
                            context: app
                        },
                        additionalInfo: {
                            errorText: " Could not load the content with id '" + req.params.id + "'"
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
                viewContainer = this.get('viewContainer'),
                errorViewContainer = Y.one(this.get('errorViewContainer'));

            errorViewContainer.setHTML(this.get('errorView').get('container'));
            // Hiding error view, in case if it is already visible
            this.get('errorView').hide();

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
             * CSS selector of a container for the error view
             *
             * @attribute errorViewContainer
             * @default ""
             * @type string
             * @required
             */
            errorViewContainer: {
                value: ""
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
             * Error view of the application
             *
             * @attribute errorView
             * @default new Y.eZ.ErrorView()
             * @type Y.eZ.ErrorView
             */
            errorView: {
                value: new Y.eZ.ErrorView()
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

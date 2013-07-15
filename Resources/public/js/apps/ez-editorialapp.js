YUI.add('ez-editorialapp', function (Y) {
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
                type: Y.eZ.ContentEditView
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
            this.on('contentEditView:close', function (e) {
                this.close();
            });

            this.on('loadingChange', this._loading);

            this.on('navigate', function (e) {
                this.set('loading', true);
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
                callback: function () {
                    this.set('loading', false);
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
                capi = this.get('capi'),
                contentService = capi.getContentService(),
                userService = capi.getUserService(),
                contentTypeService = capi.getContentTypeService();

            app.set('loading', true);
            // TODO moves this to proper Model objects
            contentService.loadContentInfoAndCurrentVersion(
                "/api/ezp/v2/content/objects/" + req.params.id,
                function (error, response) {
                    var struct, tasks;

                    if ( !error ) {
                        struct = Y.JSON.parse(response.body);
                        app.set('contentEditViewVariables.content', struct.Content);

                        // doing the subsequent REST calls in parallel
                        tasks = new Y.Parallel();
                        userService.loadUser(
                            struct.Content.Owner._href,
                            tasks.add(function (error, response) {
                                if ( !error ) {
                                    app.set('contentEditViewVariables.owner', Y.JSON.parse(response.body).User);
                                }
                            })
                        );
                        contentService.loadLocation(
                            struct.Content.MainLocation._href,
                            tasks.add(function (error, response) {
                                if ( !error ) {
                                    app.set('contentEditViewVariables.mainLocation', Y.JSON.parse(response.body).Location);
                                }
                            })
                        );
                        contentTypeService.loadContentType(
                            struct.Content.ContentType._href,
                            tasks.add(function (error, response) {
                                var type = Y.JSON.parse(response.body).ContentType;

                                // TODO: take the one with a correct language
                                type.Name = type.names.value[0]["#text"];
                                if ( !error ) {
                                    app.set('contentEditViewVariables.contentType', type);
                                }
                            })
                        );
                        tasks.done(function() {
                            next();
                        });
                    }
                    // TODO handle errors
                }
            );
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
                value: {
                    content: {},
                    contentType: {},
                    mainLocation: {},
                    owner: {}
                }
            }
        }
    });
});

YUI.add('ez-editorialapp', function (Y) {
    /**
     * Provides the Editorial Application class
     *
     * @module ez-editorialapp
     */

    Y.namespace('eZ');

    var APP_OPEN = 'is-app-open';

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
            this.showView('contentEditView', this.get('contentEditViewVariables'));
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
                                if ( !error ) {
                                    app.set('contentEditViewVariables.contentType', Y.JSON.parse(response.body).ContentType);
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
            next();
        },

        /**
         * Changes the application sate to be close
         *
         * @method close
         */
        close: function () {
            var container = this.get('container'),
                viewContainer = this.get('viewContainer');

            container.transition({
                duration: 0.3,
                transform: 'translateX(100%)',

                on: {
                    end: function () {
                        container.removeClass(APP_OPEN)
                            .setStyle('transform', 'none');
                        viewContainer.setStyle('height', 'auto');
                    }
                }
            });
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

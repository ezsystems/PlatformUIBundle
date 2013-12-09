YUI.add('ez-contenteditviewloader', function (Y) {
    "user strict";
    /**
     * Provides the view loader component for the content edit view
     *
     * @module ez-contenteditviewloader
     */
    Y.namespace('eZ');

    /**
     * Content edit view loader.
     *
     * Loads the models needed by the content edit view
     *
     * @namespace eZ
     * @class ContentEditViewLoader
     * @constructor
     * @extends eZ.ViewLoader
     */
    Y.eZ.ContentEditViewLoader = Y.Base.create('contentEditViewLoader', Y.eZ.ViewLoader, [], {
        /**
         * Loads the content, the main location, the content type and the owner
         * of the currently edited content
         *
         * @method load
         * @param {Function} next
         */
        load: function (next) {
            var loadOptions = {
                    api: this.get('capi')
                },
                request = this.get('request'),
                hasError = false,
                loader = this;

            this.get('content').set('id', request.params.id);
            this.get('content').load(loadOptions, function (error) {
                var tasks,
                    resources;

                if ( error ) {
                    loader._error("Could not load the content with id '" + request.params.id + "'");
                    return;
                }

                resources = loader.get('content').get('resources');

                // parallel loading of owner, mainLocation and contentType
                tasks = new Y.Parallel();

                loader.get('owner').set('id', resources.Owner);
                loader.get('owner').load(loadOptions, tasks.add(function (error) {
                    if ( error ) {
                        loader._error("Could not load the user with id '" + resources.Owner + "'");
                        hasError = true;
                    }
                }));

                loader.get('location').set('id', resources.MainLocation);
                loader.get('location').load(loadOptions, tasks.add(function (error) {
                    if ( error ) {
                        loader._error("Could not load the location with id '" + resources.MainLocation + "'");
                        hasError = true;
                    }
                }));

                loader.get('contentType').set('id', resources.ContentType);
                loader.get('contentType').load(loadOptions, tasks.add(function (error) {
                    if ( error ) {
                        loader._error("Could not load the content type with id '" + resources.ContentType + "'");
                        hasError = true;
                    }
                }));

                tasks.done(function () {
                    if ( !hasError ) {
                        loader._setResponseVariables({
                            content: loader.get('content'),
                            mainLocation: loader.get('location'),
                            contentType: loader.get('contentType'),
                            owner: loader.get('owner')
                        });
                        next();
                    }
                });
            });
        }
    }, {
        ATTRS: {
            /**
             * The content to be loaded
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {
                cloneDefaultValue: false,
                value: new Y.eZ.Content()
            },

            /**
             * The main location of the content
             *
             * @attribute location
             * @type Y.eZ.Location
             */
            location: {
                cloneDefaultValue: false,
                value: new Y.eZ.Location()
            },

            /**
             * The owner of the content
             *
             * @attribute owner
             * @type Y.eZ.User
             */
            owner: {
                cloneDefaultValue: false,
                value: new Y.eZ.User()
            },

            /**
             * The content type of the content
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             */
            contentType: {
                cloneDefaultValue: false,
                value: new Y.eZ.ContentType()
            }
        }
    });
});

YUI.add('ez-contenteditviewservice', function (Y) {
    "user strict";
    /**
     * Provides the view service component for the content edit view
     *
     * @module ez-contenteditviewservice
     */
    Y.namespace('eZ');

    /**
     * Content edit view service.
     *
     * Loads the models needed by the content edit view
     *
     * @namespace eZ
     * @class ContentEditViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.ContentEditViewService = Y.Base.create('contentEditViewService', Y.eZ.ViewService, [], {
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
                service = this;

            this.get('content').set('id', request.params.id);
            this.get('content').load(loadOptions, function (error) {
                var tasks,
                    resources;

                if ( error ) {
                    service._error("Could not load the content with id '" + request.params.id + "'");
                    return;
                }

                resources = service.get('content').get('resources');

                // parallel loading of owner, mainLocation and contentType
                tasks = new Y.Parallel();

                service.get('owner').set('id', resources.Owner);
                service.get('owner').load(loadOptions, tasks.add(function (error) {
                    if ( error ) {
                        hasError = true;
                        service._error("Could not load the user with id '" + resources.Owner + "'");
                    }
                }));

                service.get('location').set('id', resources.MainLocation);
                service.get('location').load(loadOptions, tasks.add(function (error) {
                    if ( error ) {
                        hasError = true;
                        service._error("Could not load the location with id '" + resources.MainLocation + "'");
                    }
                }));

                service.get('contentType').set('id', resources.ContentType);
                service.get('contentType').load(loadOptions, tasks.add(function (error) {
                    if ( error ) {
                        hasError = true;
                        service._error("Could not load the content type with id '" + resources.ContentType + "'");
                    }
                }));

                tasks.done(function () {
                    if ( !hasError ) {
                        next(service);
                    }
                });
            });
        },

        getViewParameters: function () {
            return {
                content: this.get('content'),
                mainLocation: this.get('location'),
                contentType: this.get('contentType'),
                owner: this.get('owner')
            };
        },
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

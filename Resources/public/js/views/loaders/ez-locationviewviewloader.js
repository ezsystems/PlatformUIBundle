YUI.add('ez-locationviewviewloader', function (Y) {
    "user strict";
    /**
     * Provides the view loader component for the location view
     *
     * @module ez-locationviewviewloader
     */
    Y.namespace('eZ');

    /**
     * Location view view loader.
     *
     * Loads the models needed by the location view
     *
     * @namespace eZ
     * @class LocationViewViewLoader
     * @constructor
     * @extends eZ.ViewLoader
     */
    Y.eZ.LocationViewViewLoader = Y.Base.create('locationViewViewLoader', Y.eZ.ViewLoader, [], {
        /**
         * Loads the location, the content and the path for the location id
         * available in the request and calls the next callback once it's done.
         *
         * @method load
         * @param {Function} next
         */
        load: function (next) {
            var loadOptions = {
                    api: this.get('capi')
                },
                request = this.get('request'),
                loader = this,
                location = this.get('location'), content = this.get('content'),
                type = this.get('contentType'),
                contentService = this.get('capi').getContentService();

            location.set('id', request.params.id);
            location.load(loadOptions, function (error) {
                var tasks, endLoadPath, endMainContentLoad;

                if ( error ) {
                    loader._error("Failed to load the location " + location.get('id'));
                    return;
                }

                tasks = new Y.Parallel();

                endMainContentLoad = tasks.add();
                content.set('id', location.get('resources').Content);
                content.load(loadOptions, function (error) {
                    if ( error ) {
                        loader._error("Failed to load the content " + content.get('id'));
                        return;
                    }
                    type.set('id', content.get('resources').ContentType);
                    type.load(loadOptions, function (error) {
                        if ( error ) {
                            loader._error("Failed to load the content type " + type.get('id'));
                            return;
                        }
                        endMainContentLoad();
                    });
                });

                endLoadPath = tasks.add();
                contentService.loadRoot(function (error, response) {
                    var rootLocationId;

                    if ( error ) {
                        loader._error("Failed to contact the REST API");
                        return;
                    }

                    rootLocationId = response.document.Root.rootLocation._href;
                    if ( rootLocationId === location.get('id') ) {
                        endLoadPath();
                        return;
                    }
                    loader._loadPath(rootLocationId, endLoadPath);
                });

                tasks.done(function () {
                    loader._setResponseVariables({
                        location: location,
                        content: content,
                        contentType: type,
                        path: loader.get('path')
                    });
                    next();
                });
            });
        },

        /**
         * Recursively loads the path to the current location
         *
         * @protected
         * @method _loadPath
         * @param {String} rootLocationId the root location id
         * @param {Function} end the callback to call when the just is done
         */
        _loadPath: function (rootLocationId, end) {
            var loader = this,
                loadParentCallback,
                path = [];

            loadParentCallback = function (error, parentStruct) {
                if ( error ) {
                    loader._error("Fail to load the path");
                    return;
                }
                path.push(parentStruct);
                if ( rootLocationId !== parentStruct.location.get('id') ) {
                    loader._loadParent(parentStruct.location, loadParentCallback);
                } else {
                    loader.set('path', path);
                    end();
                }
            };

            this._loadParent(this.get('location'), loadParentCallback);
        },

        /**
         * Loads the parent location and its content
         *
         * @protected
         * @method _loadParent
         * @param {Y.eZ.Location} location
         * @param {Function} callback the function to call when the location and
         *        the content are loaded
         * @param {Boolean} callback.error the error, truthy if an error occured
         * @param {Object} callback.result an object containing the
         *        Y.eZ.Location and the Y.eZ.Content instances under the `location` and
         *        the `content` keys.
         */
        _loadParent: function (location, callback) {
            var loadOptions = {
                    api: this.get('capi')
                },
                that = this,
                parentLocation, parentContent;

            parentLocation = this._newLocation({
                'id': location.get('resources').ParentLocation
            });
            parentLocation.load(loadOptions, function (error) {
                if ( error ) {
                    callback(error);
                    return;
                }
                parentContent = that._newContent({
                    'id': parentLocation.get('resources').Content
                });
                parentContent.load(loadOptions, function (error) {
                    if ( error ) {
                        callback(error);
                        return;
                    }
                    callback(error, {
                        location: parentLocation,
                        content: parentContent
                    });
                });
            });
        },

        /**
         * Creates a new instance of Y.eZ.Location with the given params
         *
         * @method _newLocation
         * @protected
         * @param {Object} params the parameters passed to the Y.eZ.Location
         *        constructor
         */
        _newLocation: function (params) {
            return new Y.eZ.Location(params);
        },

        /**
         * Creates a new instance of Y.eZ.Content with the given params
         *
         * @method _newContent
         * @protected
         * @param {Object} params the parameters passed to the Y.eZ.Content
         *        constructor
         */
        _newContent: function (params) {
            return new Y.eZ.Content(params);
        }
    }, {
        ATTRS: {
            /**
             * The viewed location
             *
             * @attribute location
             * @type Y.eZ.Location
             */
            location: {
                cloneDefaultValue: false,
                value: new Y.eZ.Location()
            },

            /**
             * The content associated with the location
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {
                cloneDefaultValue: false,
                value: new Y.eZ.Content()
            },

            /**
             * The content type of the content
             *
             * @attribute contentType
             * @type Y.eZ.Content
             */
            contentType: {
                cloneDefaultValue: false,
                value: new Y.eZ.ContentType()
            },

            /**
             * The path from the root location to the current location. Each
             * entry of the path consists of the location and its content under
             * the `location` and `content` keys sorted by location depth
             *
             * @attribute path
             * @type Array
             */
            path: {
                value: [],
                getter: function (value) {
                    return value.sort(function (a, b) {
                        return (a.location.get('depth') - b.location.get('depth'));
                    });
                }
            }
        }
    });
});

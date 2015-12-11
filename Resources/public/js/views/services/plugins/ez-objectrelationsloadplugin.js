/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-objectrelationsloadplugin', function (Y) {
    "use strict";
    /**
     * Provides the object relations load plugin
     *
     * @module ez-objectrelationsloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object relations load plugin. It sets an event handler to load related contents.
     *
     * @namespace eZ.Plugin
     * @class ObjectRelationsLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ObjectRelationsLoad = Y.Base.create('objectRelationsPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:loadObjectRelations', this._loadObjectRelations);
        },

        /**
         * Loads the related contents. Once this is done, it sets the contents in
         * the `relatedContents` attribute of the event target.
         *
         * Since version 1.1, the `loadLocation` and `loadLocationPath` are taken into account
         * to provide the Location with optionally its path. If `loadLocation` or `loadLocationPath`
         * is TRUE, then array of content structs is being set in the `relatedContents` attribute of the event target.
         * Content struct contains `content` (eZ.Content) and `location` (eZ.Location) attributes.
         *
         * @protected
         * @method _loadObjectRelations
         * @param {Object} e ObjectRelations event facade
         * @param {Bool} e.loadLocation flag indicating whether to load the Location
         * @param {Bool} e.loadLocationPath flag indicating whether to load the Location's path. If it is TRUE it
         * forces to e.loadLocation be also TRUE
         * @since 1.1
         */
        _loadObjectRelations: function (e) {
            var relatedContentListArray = [],
                stack = new Y.Parallel(),
                loadedRelation = {},
                loadingError = false,
                contentDestinations = this.get('host').get('content').relations(
                    e.relationType, e.fieldDefinitionIdentifier
                ),
                end = stack.add(function (error, struct) {
                    if (error) {
                        e.target.set("loadingError", true);
                        loadingError = true;
                    } else {
                        relatedContentListArray.push(struct);
                    }
                });

            Y.Array.each(contentDestinations, function (value) {
                if (!loadedRelation[value.destination]) {
                    loadedRelation[value.destination] = true;

                    if (e.loadLocation || e.loadLocationPath) {
                        this._loadContentStruct(value.destination, e.loadLocation, e.loadLocationPath, end);
                    } else {
                        this._loadContent(value.destination, end);
                    }
                }
            }, this);

            stack.done(function () {
                e.target.setAttrs({
                    relatedContents: relatedContentListArray,
                    loadingError: loadingError,
                });
            });
        },

        /**
         * Loads content for given content id.
         *
         * @method _loadContent
         * @protected
         * @param {String} contentId
         * @param {Function} callback
         * @param {Bool} callback.error
         * @param {eZ.Content} callback.content
         * @since 1.1
         */
        _loadContent: function (contentId, callback) {
            var ContentModel = this.get('contentModelConstructor'),
                content = new ContentModel(),
                loadOptions = {api: this.get('host').get('capi')};

            content.set('id', contentId);
            content.load(loadOptions, function (error) {
                if (error) {
                    callback(error);
                } else {
                    callback(error, content);
                }
            });
        },

        /**
         * Loads content struct containing content and main location for given content id.
         * The contentStruct is being passed to the callback function.
         *
         * @method _loadContentStruct
         * @protected
         * @param {String} contentId
         * @param {Bool} loadLocation flag indicating whether to load the Location
         * @param {Bool} loadLocationPath flag indicating whether to load the Location's path. If it is TRUE it
         * forces to `loadLocation` be also TRUE
         * @param {Function} callback
         * @param {Bool} callback.error
         * @param {Object} callback.contentStruct content struct with loaded content and location
         * @param {eZ.Content} callback.contentStruct.content
         * @param {eZ.Location} callback.contentStruct.location
         * @since 1.1
         */
        _loadContentStruct: function (contentId, loadLocation, loadLocationPath, callback) {
            var loadLocationContentStruct = Y.bind(this._loadLocationToContentStruct, this),
                contentStruct;

            this._loadContent(contentId, function (error, content) {
                if (error) {
                    callback(error);
                } else {
                    contentStruct = {content: content};
                    if (loadLocation || loadLocationPath) {
                        loadLocationContentStruct(contentStruct, loadLocationPath, callback);
                    } else {
                        callback(error, contentStruct);
                    }
                }
            });
        },

        /**
         * Loads location for content given in contentStruct and injects it to the contentStruct object.
         * Location contains fully loaded path. The contentStruct is being passed to the callback function.
         *
         * @method _loadLocationToContentStruct
         * @protected
         * @param {Object} contentStruct
         * @param {eZ.Content} contentStruct.content eZ.Content object
         * @param {Bool} loadLocationPath flag indicating whether to load the Location's path
         * @param {Function} callback
         * @param {Bool} callback.error
         * @param {Object} callback.contentStruct content struct with loaded content and location
         * @param {eZ.Content} callback.contentStruct.content
         * @param {eZ.Location} callback.contentStruct.location
         * @since 1.1
         */
        _loadLocationToContentStruct: function (contentStruct, loadLocationPath, callback) {
            var LocationModel = this.get('locationModelConstructor'),
                loadOptions = {api: this.get('host').get('capi')},
                content = contentStruct.content,
                location = new LocationModel({id: content.get('resources').MainLocation});

            location.load(loadOptions, function (error) {
                if (error) {
                    callback(error);
                } else {
                    if (loadLocationPath) {
                        location.loadPath(loadOptions, function (error) {
                            if (error) {
                                callback(error);
                            } else {
                                contentStruct.location = location;
                                callback(false, contentStruct);
                            }
                        });
                    } else {
                        contentStruct.location = location;
                        callback(false, contentStruct);
                    }
                }
            });
        },
    }, {
        NS: 'objectRelationsLoad',

        ATTRS: {
            /**
             * Content constructor
             *
             * @attribute contentModelConstructor
             * @type Y.eZ.Content
             */
            contentModelConstructor: {
                value: Y.eZ.Content
            },

            /**
             * Location constructor
             *
             * @attribute locationModelConstructor
             * @type Y.eZ.Location
             * @since 1.1
             */
            locationModelConstructor: {
                value: Y.eZ.Location
            },
        },
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ObjectRelationsLoad, ['locationViewViewService', 'contentEditViewService']
    );
});

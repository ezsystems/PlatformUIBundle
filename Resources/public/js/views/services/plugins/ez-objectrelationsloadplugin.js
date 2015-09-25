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
         * @protected
         * @method _loadObjectRelations
         * @param {Object} e ObjectRelations event facade
         */
        _loadObjectRelations: function (e) {
            var Content = this.get('contentModelConstructor'),
                loadOptions = {api: this.get('host').get('capi')},
                relatedContentListArray = [],
                stack = new Y.Parallel(),
                loadedRelation = {},
                loadingError = false,
                contentDestinations = this.get('host').get('content').relations(
                    e.relationType, e.fieldDefinitionIdentifier
                );

            Y.Array.each(contentDestinations, function (value) {
                var actualRelatedContent;

                if (!loadedRelation[value.destination]) {
                    actualRelatedContent = new Content();
                    loadedRelation[value.destination] = true;

                    actualRelatedContent.set('id', value.destination);
                    actualRelatedContent.load(loadOptions, stack.add(function (error) {
                        if (error) {
                            e.target.set("loadingError", true);
                            loadingError = true;
                        } else {
                            relatedContentListArray.push(actualRelatedContent);
                        }
                    }));
                }
            });

            stack.done(function () {
                e.target.setAttrs({
                    relatedContents: relatedContentListArray,
                    loadingError: loadingError,
                });
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
            }
        },
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ObjectRelationsLoad, ['locationViewViewService', 'contentEditViewService']
    );
});

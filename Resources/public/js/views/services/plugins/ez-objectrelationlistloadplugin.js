/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-objectrelationlistloadplugin', function (Y) {
    "use strict";
    /**
     * Provides the object relation list load plugin
     *
     * @module ez-objectrelationlistloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object relation list load plugin. It sets an event handler to load contents
     * in an object relation list field.
     *
     * @namespace eZ.Plugin
     * @class ObjectRelationListLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ObjectRelationListLoad = Y.Base.create('objectRelationListFieldPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:loadFieldRelatedContents', this._loadFieldRelatedContents);
        },

        /**
         * Loads the related contents. Once this is done, it sets the contents in
         * the `destinationContents` attribute of the event target.
         *
         * @protected
         * @method _loadFieldRelatedContents
         * @param {Object} e loadFieldRelatedContents event facade
         */
        _loadFieldRelatedContents: function (e) {
            var Content = this.get('contentModelConstructor'),
                loadOptions = {api: this.get('host').get('capi')},
                relatedContentListArray = [],
                stack = new Y.Parallel(),
                contentDestinations = this.get('host').get('content').relations(
                    'ATTRIBUTE', e.fieldDefinitionIdentifier
                );

            Y.Array.each(contentDestinations, function (value) {
                var actualRelatedContent = new Content();

                actualRelatedContent.set('id', value.destination);
                actualRelatedContent.load(loadOptions, stack.add(function (error) {
                    if (error) {
                        e.target.set("loadingError", true);
                    } else {
                        relatedContentListArray.push(actualRelatedContent);
                    }
                }));
            });

            stack.done(function () {
                e.target.setAttrs({
                    destinationContents: relatedContentListArray,
                    loadingError: (relatedContentListArray.length != contentDestinations.length),
                });
            });
        },
    }, {
        NS: 'objectRelationListLoad',

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
        Y.eZ.Plugin.ObjectRelationListLoad, ['locationViewViewService', 'contentEditViewService']
    );
});

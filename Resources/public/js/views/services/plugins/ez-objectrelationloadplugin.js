/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-objectrelationloadplugin', function (Y) {
    "use strict";
    /**
     * Provides the object relation load plugin
     *
     * @module ez-objectrelationloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object relation load plugin. It sets an event handler to load a content
     * in an object relation field.
     *
     * @namespace eZ.Plugin
     * @class ObjectRelationLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ObjectRelationLoad = Y.Base.create('objectRelationFieldPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:loadFieldRelatedContent', this._loadFieldRelatedContent);
        },

        /**
         * Loads the related content. Once this is done, it sets the content in
         * the `destinationContent` attribute of the event target.
         *
         * @protected
         * @method _loadFieldRelatedContent
         * @param {Object} e loadFieldRelatedContent event facade
         */
        _loadFieldRelatedContent: function (e) {
            var loadOptions = {api: this.get('host').get('capi')},
                relatedContent = this.get('relatedContent'),
                contentDestination = this.get('host').get('content').relations(
                    'ATTRIBUTE', e.fieldDefinitionIdentifier
                ).shift();

            relatedContent.set('id', contentDestination.destination);
            relatedContent.load(loadOptions, function (error) {
                if (error) {
                    e.target.set("loadingError", true);
                } else {
                    e.target.setAttrs({
                        destinationContent: relatedContent,
                        loadingError: false,
                    });
                }
            });
        },
    }, {
        NS: 'objectRelationLoad',

        ATTRS: {
            /**
             * The related content to be loaded
             *
             * @attribute relatedContent
             * @type eZ.Content
             * @readOnly
             */
            relatedContent: {
                readOnly: true,
                valueFn: function () {
                    return new Y.eZ.Content();
                }
            }
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ObjectRelationLoad, ['locationViewViewService', 'contentEditViewService']
    );
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentinfo-attributes', function (Y) {
    "use strict";
    /**
     * The content info attributes extension
     *
     * @module ez-contentinfo-attributes
     */
    Y.namespace('eZ');

    /**
     * Extension providing ContentInfo attributes for Models needing them.
     *
     * @namespace eZ
     * @class ContentInfoAttributes
     * @extensionfor eZ.RestModel
     */
    Y.eZ.ContentInfoAttributes = Y.Base.create('contentInfoAttributesExtension', Y.eZ.RestModel, [], {}, {
        ATTRS: {
            /**
             * The content id of the content in the eZ Publish repository
             *
             * @attribute contentId
             * @default ''
             * @type string
             */
            contentId: {
                value: ''
            },

            /**
             * The name of the content
             *
             * @attribute name
             * @default ''
             * @type string
             */
            name: {
                value: ''
            },

            /**
             * The remote id of the content in the eZ Publish repository
             *
             * @attribute remoteId
             * @default ''
             * @type string
             */
            remoteId: {
                value: ''
            },

            /**
             * The always available flag of the content
             *
             * @attribute alwaysAvailable
             * @default false
             * @type boolean
             */
            alwaysAvailable: {
                setter: '_setterBoolean',
                value: false
            },

            /**
             * The last modification date of the content
             *
             * @attribute lastModificationDate
             * @default epoch
             * @type Date
             */
            lastModificationDate: {
                setter: '_setterDate',
                value: new Date(0)
            },

            /**
             * The main language code of the content (eng-GB, fre-FR, ...)
             *
             * @attribute mainLanguageCode
             * @default ''
             * @type string
             */
            mainLanguageCode: {
                value: ''
            },

            /**
             * The published date of the content
             *
             * @attribute publishedDate
             * @default epoch
             * @type Date
             */
            publishedDate: {
                setter: '_setterDate',
                value: new Date(0)
            },
        }
    });
});

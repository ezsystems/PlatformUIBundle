/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewviewtabview', function (Y) {
    "use strict";
    /**
     * Provides the Location View View Tab view class.
     *
     * @module ez-locationviewviewtabview
     */
    Y.namespace('eZ');

    /**
     * The Location View View tab class.
     *
     * @namespace eZ
     * @class LocationViewViewTabView
     * @constructor
     * @extends eZ.LocationViewTabView
     */
    Y.eZ.LocationViewViewTabView = Y.Base.create('locationViewViewTabView', Y.eZ.LocationViewTabView, [], {
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template());
            container.one('.ez-rawcontentview-container').append(
                this.get('rawContentView').render().get('container')
            );
            return this;
        }
    }, {
        ATTRS: {
            /**
             * The title of the tab
             *
             * @attribute title
             * @type {String}
             * @default "View"
             * @readOnly
             */
            title: {
                value: "View",
                readOnly: true,
            },

            /**
             * The identifier of the tab
             * 
             * @attribute identifier
             * @type {String}
             * @default "view"
             * @readOnly
             */
            identifier: {
                value: "view",
                readOnly: true,
            },

            /**
             * The content being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             * @writeOnce
             */
            content: {
                writeOnce: 'initOnly',
            },

            /**
             * The location being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             * @writeOnce
             */
            location: {
                writeOnce: 'initOnly',
            },

            /**
             * The content type of the content being displayed
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             * @writeOnce
             */
            contentType: {
                writeOnce: "initOnly",
            },

            /**
             * The config
             *
             * @attribute config
             * @type mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            },

            /**
             * The language code in which the content displayed
             *
             * @attribute languageCode
             * @type {String}
             * @writeOnce
             */
            languageCode: {
                writeOnce: "initOnly",
            },

            /**
             * The raw content view instance
             *
             * @attribute rawContentView
             * @type {eZ.RawContentView}
             */
            rawContentView: {
                valueFn: function () {
                    return new Y.eZ.RawContentView({
                            content: this.get('content'),
                            location: this.get('location'),
                            contentType: this.get('contentType'),
                            config: this.get('config'),
                            languageCode: this.get('languageCode'),
                            bubbleTargets: this,
                        }
                    );
                }
            },
        }
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentpeekview', function (Y) {
    "use strict";
    /**
     * Provide the content peek view
     *
     * @module ez-contentpeekview
     */
    Y.namespace('eZ');

    /**
     * The content peek view
     *
     * @namespace eZ
     * @class ContentPeekView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentPeekView = Y.Base.create('contentPeekView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-contentpeek-close': {
                'tap': '_closeContentPeek',
            },
        },

        initializer: function () {
            this.on(
                ['contentChange', 'locationChange', 'contentTypeChange', 'languageCodeChange'],
                this._forwardToRawContentView
            );
        },

        /**
         * Attribute change event handler. It sets the same value on the raw
         * content view.
         *
         * @method _forwardToRawContentView
         * @protected
         * @param {EventFacade} e
         */
        _forwardToRawContentView: function (e) {
            this.get('rawContentView').set(e.attrName, e.newVal);
        },

        /**
         * Closes the Content Peek side view by firing the `contentPeekClose`
         * event
         *
         * @method _closeContentPeek
         * @protected
         */
        _closeContentPeek: function (e) {
            e.preventDefault();
            /**
             * Fired to close the content peek side view
             *
             * @event contentPeekClose
             */
            this.fire('contentPeekClose');
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                content: this.get('content').toJSON(),
                contentType: this.get('contentType').toJSON(),
            }));
            container.one('.ez-rawcontentview-container').append(
                this.get('rawContentView').render().get('container')
            );
            return this;
        }
    }, {
        ATTRS: {
            /**
             * The Content item being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             * @required
             */
            content: {},

            /**
             * The Location of the Content item being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             * @required
             */
            location: {},

            /**
             * The Content Type of the Content item being displayed
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             * @required
             */
            contentType: {},

            /**
             * The language code in which the Contenti item is displayed
             *
             * @attribute languageCode
             * @type {String}
             * @required
             */
            languageCode: {},

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
                        languageCode: this.get('languageCode'),
                        config: this.get('config'),
                        bubbleTargets: this,
                    });
                },
            },
        }
    });
});

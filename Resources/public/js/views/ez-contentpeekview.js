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
            this.after('activeChange', function (e) {
                if ( !this.get('active') ) {
                    this.reset();
                }
            });
        },

        /**
         * Resets the view attributes. Overriden to destroy and set null in the
         * `rawContentView` attribute.
         *
         * @method reset
         * @param {String} name
         */
        reset: function (name) {
            if ( name === 'rawContentView' ) {
                this.get('rawContentView').destroy();
                this._set('rawContentView', null);
                return;
            }
            this.constructor.superclass.reset.apply(this, arguments);
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
            this._set('rawContentView', this._buildRawContentView());
            container.one('.ez-rawcontentview-container').append(
                this.get('rawContentView').render().get('container')
            );
            return this;
        },

        /**
         * Creates a new RawContentView instance.
         *
         * @method _buildRawContentView
         * @protected
         * @return {eZ.RawContentView}
         */
        _buildRawContentView: function () {
            return new Y.eZ.RawContentView({
                content: this.get('content'),
                location: this.get('location'),
                contentType: this.get('contentType'),
                languageCode: this.get('languageCode'),
                languageSwitchMode: 'event',
                config: this.get('config'),
                bubbleTargets: this,
            });
        },
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
             * The language code in which the Content item is displayed
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
             * @readOnly
             */
            rawContentView: {
                readOnly: true,
                value: null,
            },
        }
    });
});

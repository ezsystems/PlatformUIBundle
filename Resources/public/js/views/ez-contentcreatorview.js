/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreatorview', function (Y) {
    "use strict";
    /**
     * Provides the Content Creator View class
     *
     * @module ez-contentcreatorview
     */
    Y.namespace('eZ');

    /**
     * The content creator view
     *
     * @namespace eZ
     * @class ContentCreatorView
     * @constructor
     * @extends eZ.View
     */
    Y.eZ.ContentCreatorView = Y.Base.create('contentCreatorView', Y.eZ.View, [], {
        initializer: function () {
            this.after('activeChange', this._setContentEditViewActiveState);

            this.get('container').addClass('ez-view-contentcreatorview');
        },

        /**
         * Sets the active state on the Content Edit View.
         *
         * @method _setContentEditViewActiveState
         * @protected
         */
        _setContentEditViewActiveState: function () {
            this._contentEditView.set('active', this.get('active'));
        },

        /**
         * Creates the Content Edit View with the Content Creator View
         * parameters.
         *
         * @method _initContentEditView
         * @protected
         */
        _initContentEditView: function () {
            /**
             * Holds the Content Edit View
             *
             * @property _contentEditView
             * @protected
             * @type {eZ.ContentEditView}
             */
            this._contentEditView = new Y.eZ.ContentEditView({
                contentType: this.get('contentType'),
                content: this.get('content'),
                version: this.get('version'),
                owner: this.get('owner'),
                user: this.get('owner'),
                languageCode: this.get('languageCode'),
                bubbleTargets: this,
            });
        },

        render: function () {
            this._initContentEditView();
            this.get('container').append(
                this._contentEditView.render().get('container')
            );
            return this;
        },

        /**
         * Custom destructor method to destroy the Content Edit View.
         *
         * @method destructor
         */
        destructor: function () {
            this._contentEditView.destroy();
            delete this._contentEditView;
        },
    }, {
        ATTRS: {
            /**
             * The Content Type to use to create the new Content item
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             * @default null
             */
            contentType: {
                value: null,
            },

            /**
             * The Content item being created
             *
             * @attribute content
             * @type {eZ.Content}
             * @default null
             */
            content: {
                value: null,
            },

            /**
             * The initial version of the Content being created.
             *
             * @attribute version
             * @type {eZ.Version}
             * @default null
             */
            version: {
                value: null,
            },

            /**
             * The owner of the future Content item.
             *
             * @attribute owner
             * @type {eZ.User}
             * @default null
             */
            owner: {
                value: null,
            },

            /**
             * The language code in which the Content item will be created.
             *
             * @attribute languageCode
             * @type {String}
             * @default ''
             */
             languageCode: {
                value: '',
             },
        },
    });
});

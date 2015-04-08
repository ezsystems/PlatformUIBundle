/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-media-view', function (Y) {
    "use strict";
    /**
     * Provides the Media field view
     *
     * @module ez-media-view
     */
    Y.namespace('eZ');

    var IS_UNSUPPORTED = 'is-media-unsupported';

    /**
     * The Media field view
     *
     * @namespace eZ
     * @class MediaView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.MediaView = Y.Base.create('mediaView', Y.eZ.FieldView, [], {

        render: function () {
            Y.eZ.FieldView.prototype.render.call(this);
            this._watchPlayerEvents();
            return this;
        },

        _variables: function () {
            return {
                "isAudio": this.get('fieldDefinition').fieldSettings.mediaType === "TYPE_HTML5_AUDIO",
            };
        },

        /**
         * Adds the unsupported class when the file can not read by the browser
         *
         * @method _mediaError
         * @param {Node} player the video/audio node
         */
        _mediaError: function (player) {
            var error = player.get('error');

            if ( error && error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED ) {
                this.get('container').addClass(IS_UNSUPPORTED);
            }
        },

        /**
         * Sets the event handler on the video/audio element to detect whether
         * the file is supported.
         *
         * @method _watchPlayerEvents
         * @protected
         */
        _watchPlayerEvents: function () {
            var that = this,
                container = this.get('container'),
                player = container.one('.ez-media-player');

            if ( !player ) {
                return;
            }
            this._attachedViewEvents.push(player.on('error', function () {
                that._mediaError(player);
            }));
        },
    });

    Y.eZ.FieldView.registerFieldView('ezmedia', Y.eZ.MediaView);
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-height-change', function (Y) {
    "use strict";
    /**
     * The height change extension
     *
     * @module ez-height-change
     */
    Y.namespace('eZ');

    /**
     * Views extension providing base methods to fire a `heightChange` event.
     *
     * @namespace eZ
     * @class HeightChange
     * @extensionfor Y.View
     */
    Y.eZ.HeightChange = Y.Base.create('heightChangeExtension', Y.View, [], {
        /**
         * Returns the height of the view container
         *
         * @method _getContainerHeight
         * @protected
         * @return {Number}
         */
        _getContainerHeight: function () {
            return this.get('container').get('offsetHeight');
        },

        /**
         * Fires the `heightChange` event
         *
         * @method _fireHeightChange
         * @protected
         * @param {Number} the old height
         * @param {Number} the new height
         */
        _fireHeightChange: function (oldHeight, newHeight) {
            /**
             * Fired when the height of the container changes
             *
             * @event heightChange
             * @param height {Object}
             * @param height.old {Number}
             * @param height.new {Number}
             * @param height.offset {Number}
             */
            this.fire('heightChange', {
                height: {
                    "old": oldHeight,
                    "new": newHeight,
                    "offset": newHeight - oldHeight,
                }
            });
        },
    });
});

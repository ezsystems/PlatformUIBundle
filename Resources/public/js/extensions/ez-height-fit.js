/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-height-fit', function (Y) {
    "use strict";
    /**
     * The height fit extension
     *
     * @module ez-height-fit
     */
    Y.namespace('eZ');

    /**
     * Views extension providing the content of height fit . When, `fitted to height`, the view
     * container scales to match the viewport's height new dimension.
     *
     * @namespace eZ
     * @class HeightFit
     * @extensionfor Y.View
     */
    Y.eZ.HeightFit = Y.Base.create('heightFitExtension', Y.View, [], {
        initializer: function () {
            this.after('activeChange', function () {
                if (this.get('active')) {
                    this._uiSetHeight();
                }
            });
        },

        /**
         * Sets the height of the view
         *
         * @private
         * @method _uiSetHeight
         */
        _uiSetHeight: function () {
            var container = this.get('container');

            container.setStyle(
                'height', container.get('winHeight') - container.getY() + 'px'
            );
        },
    });
});

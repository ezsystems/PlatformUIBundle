/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-movecontentactionview', function (Y) {
    'use strict';
    /**
     * Provides the move content action view class
     *
     * @module ez-movecontentactionview
     */
    Y.namespace('eZ');

    /**
     * Move Content Action View
     *
     * @namespace eZ
     * @class MoveContentActionView
     * @constructor
     * @extends eZ.ButtonActionView
     */
    Y.eZ.MoveContentActionView = Y.Base.create('moveContentActionView', Y.eZ.ButtonActionView, [], {
        initializer: function () {
            this.set('disabled', (this.get('location').get('depth') === 1));
        },

        /**
         * Renders the action
         *
         * @method render
         * @return Y.eZ.MoveContentActionView the view itself
         */
        render: function () {
            this._addButtonActionViewClassName();
            return this.constructor.superclass.render.call(this);
        },
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-float-view', function (Y) {
    "use strict";
    /**
     * Provides the Float field view
     *
     * @module ez-float-view
     */
    Y.namespace('eZ');

    /**
     * The Float field view
     *
     * @namespace eZ
     * @class FloatView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.FloatView = Y.Base.create('floatView', Y.eZ.FieldView, [], {
        _isFieldEmpty: function () {
            return (this.get('field').fieldValue === null);
        },

        /**
         * Overrides the name to use the generic field view template
         *
         * @method _getName
         * @protected
         * @return String
         */
        _getName: function () {
            return Y.eZ.FieldView.NAME;
        },
    });

    Y.eZ.FieldView.registerFieldView('ezfloat', Y.eZ.FloatView);
});

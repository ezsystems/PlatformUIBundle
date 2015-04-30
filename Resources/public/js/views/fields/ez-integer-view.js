/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-integer-view', function (Y) {
    "use strict";
    /**
     * Provides the Integer field view
     *
     * @module ez-integer-view
     */
    Y.namespace('eZ');

    /**
     * The Integer field view
     *
     * @namespace eZ
     * @class IntegerView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.IntegerView = Y.Base.create('integerView', Y.eZ.FieldView, [], {
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

    Y.eZ.FieldView.registerFieldView('ezinteger', Y.eZ.IntegerView);
});

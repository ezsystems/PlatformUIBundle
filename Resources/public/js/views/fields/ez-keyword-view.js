/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-keyword-view', function (Y) {
    "use strict";
    /**
     * Provides the Keyword field view
     *
     * @module ez-keyword-view
     */
    Y.namespace('eZ');

    /**
     * The keyword field view
     *
     * @namespace eZ
     * @class KeywordView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.KeywordView = Y.Base.create('keywordView', Y.eZ.FieldView, [], {
        /**
         * Check if the array of the field value is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            return this._getFieldValue().length === 0;
        },
    });

    Y.eZ.FieldView.registerFieldView('ezkeyword', Y.eZ.KeywordView);
});

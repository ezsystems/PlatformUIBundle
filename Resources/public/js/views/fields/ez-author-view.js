/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-author-view', function (Y) {
    "use strict";
    /**
     * Provides the Author View class
     *
     * @module ez-author-view
     */
    Y.namespace('eZ');

    /**
     * The author view
     *
     * @namespace eZ
     * @class AuthorView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.AuthorView = Y.Base.create('authorView', Y.eZ.FieldView, [], {
        _isFieldEmpty: function () {
            var fieldValue = this.get('field').fieldValue;

            return (!fieldValue || fieldValue.length === 0);
        }
    });

    Y.eZ.FieldView.registerFieldView('ezauthor', Y.eZ.AuthorView);
});

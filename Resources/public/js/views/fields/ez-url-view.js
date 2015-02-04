/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-url-view', function (Y) {
    "use strict";
    /**
     * Provides the Url field view
     *
     * @module ez-url-view
     */
    Y.namespace('eZ');

    /**
     * The Url field view
     *
     * @namespace eZ
     * @class UrlView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.UrlView = Y.Base.create('urlView', Y.eZ.FieldView, [], {
       /**
         * Returns the value to be used in the template. If the value is not
         * filled, it returns undefined otherwise an object with a `link` and a
         * `text` entries.
         *
         * @method _getFieldValue
         * @protected
         * @return Object
         */
        _getFieldValue: function () {
            var value = this.get('field').fieldValue, res;

            if ( !value || !value.link ) {
                return res;
            }
            res = {link: value.link, text: value.text};
            if ( !res.text ) {
                res.text = res.link;
            }
            return res;
        }
    });

    Y.eZ.FieldView.registerFieldView('ezurl', Y.eZ.UrlView);
});

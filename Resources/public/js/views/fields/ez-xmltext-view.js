/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-xmltext-view', function (Y) {
    "use strict";
    /**
     * Provides the XmlText view
     *
     * @module ez-xmltext-view
     */
    Y.namespace('eZ');

    /**
     * The XmlText field view
     *
     * @namespace eZ
     * @class XmlTextView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.XmlTextView = Y.Base.create('xmlTextView', Y.eZ.FieldView, [], {
        /**
         * Returns the xml code stored in the XmlText field
         *
         * @method _getFieldValue
         * @protected
         * @return String
         */
        _getFieldValue: function () {
            return this.get('field').fieldValue.xml;
        }
    });

    Y.eZ.FieldView.registerFieldView('ezxmltext', Y.eZ.XmlTextView);
});

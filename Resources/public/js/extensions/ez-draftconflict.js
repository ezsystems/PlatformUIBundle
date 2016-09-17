/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-draftconflict', function (Y) {
    "use strict";
    /**
     * The draft conflict extension
     *
     * @module ez-draftconflict
     */
    Y.namespace('eZ');

    /**
     * Views extension providing the draft conflict feature.
     *
     * When a view is extended with this extension, it needs to call the `_fireEditContentRequest`.
     *
     * @namespace eZ
     * @class DraftConflict
     * @extensionfor Y.View
     */
    Y.eZ.DraftConflict = Y.Base.create('draftConflictExtension', Y.View, [], {

        /**
         * Fire a `editContentRequest` event to edit a content's version
         *
         * @method _fireEditContentRequest
         * @param {Y.eZ.ContentInfo} contentItem
         * @param {Y.eZ.ContentType} contentType
         * @protected
         */
        _fireEditContentRequest: function(contentInfo, contentType) {
            /**
             * Fired when a content needs to be edited
             * @event editContentRequest
             */
            this.fire('editContentRequest',{
                contentInfo: contentInfo,
                languageCode: contentInfo.get('mainLanguageCode'),
                contentType: contentType
            });
        },
    });
});

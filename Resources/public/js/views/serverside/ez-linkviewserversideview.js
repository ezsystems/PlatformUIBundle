/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-linkviewserversideview', function (Y) {
    "use strict";

    /**
     * Provides the link view server side view
     *
     * @module ez-linkviewserversideview
     */
    Y.namespace('eZ');

    var events = {
        '.ez-view-link-usage': {
            'tap': '_viewLinkUsage'
        },
        '.ez-edit-link-usage': {
            'tap': '_editLinkUsage'
        },
    },
    CONTENT_ID = 'data-content-id',
    LANGUAGE_CODE = 'data-language-code';

    /**
     * The link view server side view.
     *
     * @namespace eZ
     * @class LinkViewServerSideView
     * @constructor
     * @extends eZ.ServerSideView
     */
    Y.eZ.LinkViewServerSideView = Y.Base.create('linkViewServerSideView', Y.eZ.ServerSideView, [], {
        initializer: function () {
            this._addDOMEventHandlers(events);
        },

        /**
         * 'tap' event handler on the content view link.
         *
         * @method _viewLinkUsage
         * @protected
         * @param {EventFacade} e
         */
        _viewLinkUsage: function(e) {
            var contentId = e.target.getAttribute(CONTENT_ID),
                languageCode = e.target.getAttribute(LANGUAGE_CODE);

            e.preventDefault();
            this._fireViewLinkUsage(contentId, languageCode);
        },

        /**
         * 'tap' event handler on the content edit button.
         *
         * @method _viewLinkUsage
         * @protected
         * @param {EventFacade} e
         */
        _editLinkUsage: function(e) {
            var contentId = e.target.getAttribute(CONTENT_ID),
                languageCode = e.target.getAttribute(LANGUAGE_CODE);

            e.preventDefault();
            this._fireEditLinkUsage(contentId, languageCode);
        },

        /**
         * Fire viewLinkUsage event which redirects user to main location of content.
         *
         * @method _fireViewLinkUsage
         * @protected
         * @param {String} contentId
         * @param {String} languageCode
         */
        _fireViewLinkUsage: function(contentId, languageCode) {
            this.fire('viewLinkUsage', {
                contentId: contentId,
                languageCode: languageCode
            });
        },

        /**
         * Fire editLinkUsage event which redirects user to the content edit form.
         *
         * @method _fireViewLinkUsage
         * @protected
         * @param {String} contentId
         * @param {String} languageCode
         */
        _fireEditLinkUsage: function(contentId, languageCode) {
            this.fire('editLinkUsage', {
                contentId: contentId,
                languageCode: languageCode
            });
        }
    });
});

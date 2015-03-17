/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sectionserversideviewservice', function (Y) {
    "use strict";
    /**
     * Provides the section server side view service class
     *
     * @method ez-sectionserversideviewservice
     */
    Y.namespace('eZ');

    /**
     * The Section Server Side View Service class.
     *
     * @namespace eZ
     * @class SectionServerSideViewService
     * @constructor
     * @extends eZ.ServerSideViewService
     */
    Y.eZ.SectionServerSideViewService = Y.Base.create('sectionServerSideViewService', Y.eZ.ServerSideViewService, [], {
        initializer: function () {
            this.on('*:contentDiscover', function (e) {
                e.config.contentDiscoveredHandler = Y.bind(this._assignSection, this);
            });
        },

        /**
         * Assign the section to the contents after the user has chosen them in
         * the universal discovery widget
         *
         * @method _assignSection
         * @protected
         * @param {EventFacade} e
         */
        _assignSection: function (e) {
            var data = e.target.get('data'),
                tasks = new Y.Parallel(),
                contentService = this.get('capi').getContentService();

            Y.Array.each(e.selection, function (struct) {
                var update = contentService.newContentMetadataUpdateStruct();

                update.setSection(data.sectionId);
                // TODO error handling, see https://jira.ez.no/browse/EZP-23992
                contentService.updateContentMetadata(
                    struct.content.get('id'), update, tasks.add()
                );
            });
            tasks.done(Y.bind(data.afterUpdateCallback, this));
        },
    });
});

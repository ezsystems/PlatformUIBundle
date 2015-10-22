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

            this.on('*:refreshView', this._refreshView);
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

            this._assignSectionNotificationStarted(
                data.sectionId, data.sectionName, e.selection
            );

            Y.Array.each(e.selection, function (struct) {
                var update = contentService.newContentMetadataUpdateStruct();

                update.setSection(data.sectionId);
                // TODO error handling, see https://jira.ez.no/browse/EZP-23992
                contentService.updateContentMetadata(
                    struct.contentInfo.get('id'), update, tasks.add()
                );
            });

            tasks.done(
                Y.bind(this._assignSectionCallback, this,
                    data.sectionId, data.sectionName, e.selection,
                    Y.bind(data.afterUpdateCallback, this)
                )
            );
        },

        /**
         * Assign section callback trigerring notification and calling given callback
         * 
         * @method _assignSectionCallback
         * @protected
         * @param {String} sectionId the section id
         * @param {String} sectionName the section name
         * @param {Array} contents the array of contents to which section is being assigned to
         * @param {Function} callback the callback to call when other tasks are done
         */
        _assignSectionCallback: function (sectionId, sectionName, contents, callback) {
            this._assignSectionNotificationDone(sectionId, sectionName, contents);
            callback();
        },

        /**
         * Notification changed to *started* before assigning section to contents
         * 
         * @method _assignSectionNotificationStarted
         * @protected
         * @param {String} sectionId the section id
         * @param {String} sectionName the section name
         * @param {Array} selection the UDW selection
         */
        _assignSectionNotificationStarted: function (sectionId, sectionName, selection) {
            var notificationIdentifier = this._getAssignSectionNotificationIdentifier(
                    'assign-section', sectionId, selection
                );

            this.fire('notify', {
                notification: {
                    identifier: notificationIdentifier,
                    text: 'Assigning the section "' + sectionName + '" to ' + selection.length + ' contents',
                    state: 'started',
                    timeout: 0
                },
            });
        },

        /**
         * Notification changed to *done* after assigning section to contents
         * 
         * @method _assignSectionNotificationDone
         * @protected
         * @param {String} sectionId the section id
         * @param {String} sectionName the section name
         * @param {Array} selection the UDW selection
         */
        _assignSectionNotificationDone: function (sectionId, sectionName, selection) {
            var notificationIdentifier = this._getAssignSectionNotificationIdentifier(
                    'assign-section', sectionId, selection
                );

            this.fire('notify', {
                notification: {
                    identifier: notificationIdentifier,
                    text: 'Section "' + sectionName + '" assigned to ' + selection.length + ' contents',
                    state: 'done',
                    timeout: 5
                },
            });
        },

        /**
         * Generates identifier for notifications which is unique basing on
         * section ID and IDs of contents which section is being assigned to.
         * 
         * @method _getAssignSectionNotificationIdentifier
         * @protected
         * @param {String} action custom string describing action which is being taken
         * @param {String} sectionId the section id
         * @param {Array} selection the UDW selection
         * @return {String} unique notification identifier based on passed parameters
         */
        _getAssignSectionNotificationIdentifier: function (action, sectionId, contents) {
            var contentIds = [];

            Y.Array.each(contents, function (struct) {
                contentIds.push(struct.contentInfo.get('id'));
            });
            return action + '-' + sectionId + '-' + contentIds.join('_');
        },

        /**
         * Refreshes the section view
         *
         * @method _refreshView
         * @protected
         * @param {EventFacade} e
         */
        _refreshView: function (e) {
            this.get('app').set('loading', true);
            this.load(Y.bind(function () {
                e.target.set('html', this.get('html'));
                this.get('app').set('loading', false);
            }, this));
        },
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewversionstabview', function (Y) {
    "use strict";
    /**
     * Provides the Location View Versions Tab view class.
     *
     * @module ez-locationviewversionstabview
     */
    Y.namespace('eZ');

    var events = {
        '.ez-create-draft-from-archived-button': {
            'tap': '_createDraftFromArchivedVersion'
        },
        '.ez-archived-version-checkbox': {
            'change': '_setArchivedButtonsState'
        },
        '.ez-edit-draft-button': {
            'tap': '_editDraft'
        },
        '.ez-delete-draft-button': {
            'tap': '_deleteDraft'
        },
        '.ez-delete-archived-button': {
            'tap': '_deleteArchived'
        },
        '.ez-draft-version-checkbox': {
            'change': '_setDraftButtonsState'
        },
    };

    /**
     * The Location View View Versions tab class.
     *
     * @namespace eZ
     * @class LocationViewVersionsTabView
     * @constructor
     * @extends eZ.LocationViewTabView
     */
    Y.eZ.LocationViewVersionsTabView = Y.Base.create('locationViewVersionsTabView', Y.eZ.LocationViewTabView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this.events = Y.merge(this.events, events);
            this._fireMethod = this._fireLoadVersions;
            this._watchAttribute = 'versions';
        },

        render: function () {
            var container = this.get('container'),
                versions = this.get('versions'),
                archived = [],
                draft = [],
                published = [];

            if (versions) {
                archived = this._prepareVersionsForDisplay(versions.ARCHIVED);
                draft = this._prepareVersionsForDisplay(versions.DRAFT);
                published = this._prepareVersionsForDisplay(versions.PUBLISHED);
            }

            container.setHTML(this.template({
                "archivedVersions": archived.items,
                "publishedVersions": published.items,
                "draftVersions": draft.items,
                "hasArchived": archived.hasItems,
                "hasPublished": published.hasItems,
                "hasDraft": draft.hasItems,
                "loadingError": this.get('loadingError'),
            }));

            return this;
        },

        /**
         * Prepares a list of versionInfo to be displayed
         *
         * @method _prepareVersionsForDisplay
         * @protected
         * @param versions {Array} of eZ.VersionInfo
         * @return {Object} of Displayable versions struct:
         *              struct.items: {Array} of JSONified versionInfo
         *              struct.hasItems: true is struct has items
         */
        _prepareVersionsForDisplay: function (versions) {
            var versionsToDisplay = {
                items : [],
                hasItems : false,
            };

            if (versions) {
                versions.forEach(function (version) {
                    versionsToDisplay.hasItems = true;
                    versionsToDisplay.items.push(version.toJSON());
                });
            }

            return versionsToDisplay;
        },

        /**
         * Fire the `loadVersions` event to retrieve the versions
         *
         * @method _fireLoadVersions
         * @protected
         */
        _fireLoadVersions: function () {
            /**
             * Fired when versions are about to be loaded
             *
             * @event loadVersions
             */
            this.fire('loadVersions', {content: this.get('content')});
        },

        /**
         * Enables the `Create Draft form archived version` button if the selection is right
         *
         * @method _enableCreateDraftFromArchivedVersionButton
         * @protected
         * @deprecated
         */
        _enableCreateDraftFromArchivedVersionButton: function () {
            console.log('[DEPRECATED] The method `_enableCreateDraftFromArchivedVersionButton` is deprecated');
            console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');
            this._setArchivedButtonsState.apply(this, arguments);
        },

        /**
         * Enables the Archived buttons if the selection in the list is right
         *
         * @method _setArchivedButtonsState
         * @protected
         */
        _setArchivedButtonsState: function () {
            var c = this.get('container'),
                checked = c.all('.ez-archived-version-checkbox:checked'),
                createDraftButton = c.one('.ez-create-draft-from-archived-button'),
                deleteButton = c.one('.ez-delete-archived-button');

            if (checked.size() === 1) {
                createDraftButton.set('disabled', false);
            } else {
                createDraftButton.set('disabled', true);
            }

            if (checked.size() >= 1) {
                deleteButton.set('disabled', false);
            } else {
                deleteButton.set('disabled', true);
            }
        },

        /**
         * Enables the Draft buttons if the selection in the list is right
         *
         * @method _setDraftButtonsState
         * @protected
         */
        _setDraftButtonsState: function () {
            var c = this.get('container'),
                checked = c.all('.ez-draft-version-checkbox:checked'),
                editDraftButton = c.one('.ez-edit-draft-button'),
                deleteButton = c.one('.ez-delete-draft-button');

            if (checked.size() === 1) {
                editDraftButton.set('disabled', false);
            } else {
                editDraftButton.set('disabled', true);
            }

            if (checked.size() >= 1) {
                deleteButton.set('disabled', false);
            } else {
                deleteButton.set('disabled', true);
            }
        },

        /**
         * Creates a draft from an archived version
         *
         * @method _createDraftFromArchivedVersion
         * @protected
         */
        _createDraftFromArchivedVersion: function () {
            var versions = this._getSelectedArchived();

            if (versions.length === 1) {
                this._disableVersionsCheckboxes();

                /**
                 * Fired when the user clicks on the Create draft from archived version button
                 *
                 * @event createDraft
                 * @param {eZ.Content} content
                 *        {String} versionNo of the archived version. Ex: 42
                 *
                 */
                this.fire('createDraft', {
                    content: this.get('content'),
                    versionNo: versions[0].get('versionNo'),
                });
            }
        },

        /**
         * Edits a selected draft
         *
         * @method _editDraft
         * @protected
         */
        _editDraft: function () {
            var versions = this._getSelectedDrafts();

            if (versions.length === 1) {
                this._disableVersionsCheckboxes();

                /**
                 * Fired when the user clicks on the edit draft button
                 *
                 * @event editVersion
                 * @param {eZ.Content} content
                 * @param {eZ.Version} version
                 *
                 */
                this.fire('editVersion', {
                    content: this.get('content'),
                    version: versions[0],
                });
            }
        },

        /**
         * Returns the selected versions as VersionInfo
         *
         * @method _getSelectedVersionItems
         * @private
         * @param {Array} versionList of eZ.VersionInfo versions to pick from
         * @param {String} checkboxClass CSS class of the checkboxes
         * @return {Array} of eZ.VersionInfo
         */
        _getSelectedVersionItems: function (versionList, checkboxClass) {
            var c = this.get('container');

            return Y.Array.reject(versionList, function (version) {
                var checkbox = c.one(
                    checkboxClass + '[data-version-id="' + version.get('id') + '"]'
                );

                if (checkbox && checkbox.get('checked')) {
                    return false;
                }
                return true;
            });
        },

        /**
         * Returns the selected draft as VersionInfo
         *
         * @method _getSelectedDrafts
         * @protected
         * @return {Array} of eZ.VersionInfo
         */
         _getSelectedDrafts: function () {
             return this._getSelectedVersionItems(
                 this.get('versions').DRAFT,
                 '.ez-draft-version-checkbox'
             );
         },

        /**
         * Returns the selected archived versions as VersionInfo
         *
         * @method _getSelectedArchived
         * @protected
         * @return {Array} of eZ.VersionInfo
         */
        _getSelectedArchived: function () {
            return this._getSelectedVersionItems(
                this.get('versions').ARCHIVED,
                '.ez-archived-version-checkbox'
            );
        },

        /**
         * Deletes one or several archived version
         *
         * @method _deleteArchived
         * @protected
         */
        _deleteArchived: function () {
            this._fireDeleteVersions(this._getSelectedArchived());
        },

        /**
         * Deletes one or several drafts
         *
         * @method _deleteDraft
         * @protected
         */
        _deleteDraft: function () {
            this._fireDeleteVersions(this._getSelectedDrafts());
        },

        /**
         * Fires the Delete version event if `versions` is not empty
         *
         * @method _fireDeleteVersions
         * @protected
         * @param {Array} versions of eZ.VersionInfo
         */
        _fireDeleteVersions: function (versions) {
            if (versions.length > 0) {
                this._disableVersionsCheckboxes();

                /**
                 * Fired when the user clicks any of the delete version buttons
                 *
                 * @event deleteVersion
                 * @param {Array} of eZ.VersionInfo
                 *        {Function} afterDeleteVersionsCallback
                 *
                 */
                this.fire('deleteVersion', {
                    versions: versions,
                    afterDeleteVersionsCallback: Y.bind(this._afterDeleteVersionsCallback, this)
                });
            }
        },

        /**
         * Callback function called after removing version(s).
         *
         * @method _afterDeleteVersionsCallback
         * @protected
         * @param {Boolean} versionsRemoved if TRUE the view is reloaded, if FALSE it just enables checkboxes
         */
        _afterDeleteVersionsCallback: function (versionsRemoved) {
            if (versionsRemoved) {
                this._refresh();
            }
            else {
                this._enableVersionsCheckboxes();
            }
        },

        /**
         * Refreshes the tab. It fires `loadVersions` event.
         *
         * @method _refresh
         * @protected
         */
        _refresh: function () {
            this._fireLoadVersions();
        },

        /**
         * Disables all checkboxes on archived version list preventing from making use of them.
         *
         * @method _disableVersionsCheckboxes
         * @private
         */
        _disableVersionsCheckboxes: function () {
            this.get('container').all('.ez-version-checkbox').set('disabled', true);
        },

        /**
         * Enables checkboxes on version list.
         *
         * @method _enableVersionsCheckboxes
         * @private
         */
        _enableVersionsCheckboxes: function () {
            this.get('container').all('.ez-version-checkbox').set('disabled', false);
        }

    }, {
        ATTRS: {
            /**
             * The title of the tab
             *
             * @attribute title
             * @type {String}
             * @default "Versions"
             * @readOnly
             */
            title: {
                value: "Versions",
                readOnly: true,
            },

            /**
             * The identifier of the tab
             *
             * @attribute identifier
             * @type {String}
             * @default "versions"
             * @readOnly
             */
            identifier: {
                value: "versions",
                readOnly: true,
            },

            /**
             * List of the current content versions sorted by status.
             * Each status name is a properties of the versions object.
             *
             * @attribute versions
             * @type {Object}
             * @default {}
             */
            versions: {
                value: {},
            },

            /**
             * The content being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             * @writeOnce
             */
            content: {
                writeOnce: 'initOnly',
            },

            /**
             * The config
             *
             * @attribute config
             * @type mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            },
        }
    });
});

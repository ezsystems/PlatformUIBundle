/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-roleserversideview', function (Y) {
    "use strict";
    /**
     * Provides the role server side view
     *
     * @module ez-roleserversideview
     */
    Y.namespace('eZ');

    var events = {
            '.ez-role-assign-button': {
                'tap': '_pickSubtree'
            },
            '.ez-pick-location-limitation-button': {
                'tap': '_pickLocationLimitation'
            },
            '.ez-role-assign-limit-section-button': {
                'tap': '_pickSubtreeWithSectionLimitation'
            },
            '.ez-role-assign-limit-subtree-button': {
                'tap': '_pickSubtreeLimitation'
            }
        },
        ROLE_REST_ID = 'data-role-rest-id',
        ROLE_NAME = 'data-role-name';

    /**
     * The role server side view. It adds the handling of the role assign
     * button.
     *
     * @namespace eZ
     * @class RoleServerSideView
     * @constructor
     * @extends eZ.ServerSideView
     */
    Y.eZ.RoleServerSideView = Y.Base.create('roleServerSideView', Y.eZ.ServerSideView, [], {
        initializer: function () {
            this.events = Y.merge(this.events, events);
        },

        /**
         * tap event handler on the role assign buttons. It launches the
         * universal discovery widget so that the user can pick some contents.
         * It also fills the config with data concerning the section limitation
         *
         * @method _pickSubtreeWithSectionLimitation
         * @protected
         * @param {EventFacade} e
         */
        _pickSubtreeWithSectionLimitation: function (e) {
            var button = e.target,
                container = this.get('container'),
                sectionSelector = container.one(".ez-role-assignment-section-id"),
                sectionSelectedIndex = sectionSelector.get('selectedIndex'),
                sectionSelectedItem = sectionSelector.get('options').item(sectionSelectedIndex),
                unsetLoading = Y.bind(this._uiUnsetUDWButtonLoading, this, button),
                section = {
                    sectionId: sectionSelectedItem.get('value'),
                    sectionRestId: sectionSelectedItem.getAttribute('data-section-rest-id'),
                    sectionName: sectionSelectedItem.get('text')
                },
                udwConfigData = {
                    roleId: button.getAttribute(ROLE_REST_ID),
                    roleName: button.getAttribute(ROLE_NAME),
                    afterUpdateCallback: unsetLoading,
                    limitationType: 'Section',
                    section: section,
                    sectionId:sectionSelectedItem.get('value'),
                    sectionRestId: sectionSelectedItem.getAttribute('data-section-rest-id'),
                    sectionName: sectionSelectedItem.get('text'),
                };

            e.preventDefault();
            this._uiSetUDWButtonLoading(button);
            this._fireContentDiscover(button, unsetLoading, udwConfigData);
        },

        /**
         * tap event handler on the role assign buttons. It launches the
         * universal discovery widget so that the user can pick some contents.
         *
         * @method _pickSubtree
         * @protected
         * @param {EventFacade} e
         */
        _pickSubtree: function (e) {
            var button = e.target,
                unsetLoading = Y.bind(this._uiUnsetUDWButtonLoading, this, button),
                udwConfigData = {
                    roleId: button.getAttribute(ROLE_REST_ID),
                    roleName: button.getAttribute(ROLE_NAME),
                    afterUpdateCallback: unsetLoading,
                };

            e.preventDefault();
            this._uiSetUDWButtonLoading(button);
            this._fireContentDiscover(button, unsetLoading, udwConfigData);
        },

        /**
         * 'tap' event handler for assigning role with subtree limitation. It launches the
         * universal discovery widget a first time so that the user can pick a location.
         *
         * @method _pickLocationLimitation
         * @protected
         * @param {EventFacade} e
         */
        _pickSubtreeLimitation: function (e) {
            var button = e.target,
                unsetLoading = Y.bind(this._uiUnsetUDWButtonLoading, this, button),
                that = this;

            e.preventDefault();
            this._uiSetUDWButtonLoading(button);
            this.fire('contentDiscover', {
                config: {
                    title: button.getAttribute('data-universaldiscovery-limit-subtree-title'),
                    cancelDiscoverHandler: unsetLoading,
                    multiple: true,
                    contentDiscoveredHandler: function(e) {
                        that._setSubtreeLimitation(button, this, e);
                    }
                },
            });
        },

        /**
         * Launch a second time the UDW so that the user can pick some contents.
         * The UDW config datas will be filled by the role infos and the locations of the subtree limitation chosen before.
         *
         * @method _pickSubtreeLimitation
         * @protected
         * @param {EventFacade} e
         */
        _setSubtreeLimitation: function (button, udView, e) {
            var unsetLoading = Y.bind(this._uiUnsetUDWButtonLoading, this, button),
                selectedLocationsIds = Y.Array.map(e.selection, function(struct) {
                    return struct.location.get('id');
                }),
                udwConfigData = {
                    roleId: button.getAttribute(ROLE_REST_ID),
                    roleName: button.getAttribute(ROLE_NAME),
                    afterUpdateCallback: unsetLoading,
                    limitationType: 'Subtree',
                    subtreeIds: selectedLocationsIds,
                },
                udwAfterActiveChangeEvent = udView.onceAfter('activeChange', function() {
                    udwAfterActiveChangeEvent.detach();
                    setTimeout(Y.bind(function() {
                        this._fireContentDiscover(button, unsetLoading, udwConfigData);
                    }, this), 0);
                }, this);
        },

        /**
         * Fire contentDiscover event to launch the UDW with a config using the given data
         *
         * @method _fireContentDiscover
         * @protected
         * @param {Y.Node} button
         * @param {Y.Function} unsetLoading
         * @param {Object} data
         */
        _fireContentDiscover: function (button, unsetLoading, data) {
            this.fire('contentDiscover', {
                config: {
                    title: button.getAttribute('data-universaldiscovery-title'),
                    cancelDiscoverHandler: unsetLoading,
                    multiple: true,
                    data: data,
                },
            });
        },

        /**
         * 'tap' event handler for policy limitation on location ("Node"). It launches the
         * universal discovery widget so that the user can pick a location.
         *
         * @method _pickLocationLimitation
         * @protected
         * @param {EventFacade} e
         */
        _pickLocationLimitation: function (e) {
            var button = e.target,
                unsetLoading = Y.bind(this._uiUnsetUDWButtonLoading, this, button);

            e.preventDefault();
            this._uiSetUDWButtonLoading(button);
            this.fire('contentDiscover', {
                config: {
                    title: button.getAttribute('data-universaldiscovery-title'),
                    cancelDiscoverHandler: unsetLoading,
                    multiple: true,
                    contentDiscoveredHandler: Y.bind(this._setLocationLimitation, this, button),
                },
            });
        },

        /**
         * Puts picked location id into location limitation input. Input is selected by the selector
         * provided in the `data-location-input-selector` attribute of the button, for example
         * <button data-location-input-selector="#id_of_input"></button>
         *
         * @method _setLocationLimitation
         * @protected
         * @param {Y.Node} button
         * @param {EventFacade} e
         */
        _setLocationLimitation: function (button, e) {
            this._emptyLocationList(button);
            this._emptyLocationIdHiddenInput(button);

            Y.Array.each(e.selection, function (struct) {
                this._addLocationToDisplayList(button, struct.contentInfo);
                this._addLocationIdToHiddenInput(button, struct.location.get('locationId'));
            }, this);

            this._uiUnsetUDWButtonLoading(button);
        },

        /**
         * Empties the existing list of selected locations.
         *
         * @method _emptyLocationList
         * @protected
         * @param {Y.Node} button
         */
        _emptyLocationList: function (button) {
            var selectedLocationList = this.get('container').one(button.getAttribute('data-selected-location-list-selector'));

            selectedLocationList.empty();
        },

        /**
         * Empties the content of the hidden input field for selected locations.
         *
         * @method _emptyLocationIdHiddenInput
         * @protected
         * @param {Y.Node} button
         */
        _emptyLocationIdHiddenInput: function (button) {
            var locationInput = this.get('container').one(button.getAttribute('data-location-input-selector'));

            locationInput.setAttribute('value', '');
        },

        /**
         * Adds a location to the list of selected locations.
         *
         * @method _addLocationToDisplayList
         * @protected
         * @param {Y.Node} button
         * @param {eZ.ContentInfo} contentInfo
         */
        _addLocationToDisplayList: function (button, contentInfo) {
            var selectedLocationList = this.get('container').one(button.getAttribute('data-selected-location-list-selector'));

            selectedLocationList.appendChild(Y.Node.create('<li>' + Y.Escape.html(contentInfo.get('name')) + '</li>'));
        },

        /**
         * Adds a location to the hidden input field for selected locations.
         *
         * @method _addLocationIdToHiddenInput
         * @protected
         * @param {Y.Node} button
         * @param {String} locationId
         */
        _addLocationIdToHiddenInput: function (button, locationId) {
            var locationInput = this.get('container').one(button.getAttribute('data-location-input-selector')),
                existingLocationsStr = locationInput.getAttribute('value');

            if (existingLocationsStr.length > 0) {
                locationInput.setAttribute('value', existingLocationsStr.concat(',', locationId));
            } else {
                locationInput.setAttribute('value', locationId);
            }
        },

        /**
         * Changes the state of the provided UDW button to be *loading* and
         * to be disabled
         *
         * @method _uiSetUDWButtonLoading
         * @protected
         * @param {Y.Node} button
         */
        _uiSetUDWButtonLoading: function (button) {
            button.addClass('is-loading').set('disabled', true);
        },

        /**
         * Changes the state of the provided UDW button to not be *loading*
         * and to be enabled.
         *
         * @method _uiUnsetUDWButtonLoading
         * @protected
         * @param {Y.Node} button
         */
        _uiUnsetUDWButtonLoading: function (button) {
            button.removeClass('is-loading').set('disabled', false);
        },
    });
});

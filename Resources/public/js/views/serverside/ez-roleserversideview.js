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
            '.ez-role-assign-limit-section-button': {
                'tap': '_pickSubtreeWithSectionLimitation'
            },
        };

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
         * It also define the section limitation
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
                unsetLoading = Y.bind(this._uiUnsetAssignRoleLoading, this, button),
                udwConfigData = {
                    roleId: button.getAttribute('data-role-rest-id'),
                    roleName: button.getAttribute('data-role-name'),
                    afterUpdateCallback: unsetLoading,
                    limitationType: 'Section',
                    sectionId: sectionSelector.get('options').item(sectionSelectedIndex).get('value'),
                    sectionName: sectionSelector.get('options').item(sectionSelectedIndex).get('text'),
                };

            e.preventDefault();
            this._uiSetAssignRoleLoading(button);
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
                unsetLoading = Y.bind(this._uiUnsetAssignRoleLoading, this, button),
                udwConfigData = {
                    roleId: button.getAttribute('data-role-rest-id'),
                    roleName: button.getAttribute('data-role-name'),
                    afterUpdateCallback: unsetLoading,
                };

            e.preventDefault();
            this._uiSetAssignRoleLoading(button);
            this._fireContentDiscover(button, unsetLoading, udwConfigData);
        },

        /**
         * Fire contentDiscover event to launch the UDW with a config using the given data
         *
         * @method _fireContentDiscover
         * @protected
         * @param {Y.Node} button
         * @param {Y.Function} unsetLoading
         * @param {Y.Object} data
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
         * Changes the state of the provided assign button to be *loading* and
         * to be disabled
         *
         * @method _uiSetAssignRoleLoading
         * @protected
         * @param {Y.Node} button
         */
        _uiSetAssignRoleLoading: function (button) {
            button.addClass('is-loading').set('disabled', true);
        },

        /**
         * Changes the state of the provided assign button to not be *loading*
         * and to be enabled.
         *
         * @method _uiUnsetAssignRoleLoading
         * @protected
         * @param {Y.Node} button
         */
        _uiUnsetAssignRoleLoading: function (button) {
            button.removeClass('is-loading').set('disabled', false);
        },

    });
});

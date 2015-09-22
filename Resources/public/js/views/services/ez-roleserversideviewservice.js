/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-roleserversideviewservice', function (Y) {
    "use strict";
    /**
     * Provides the role server side view service class
     *
     * @method ez-roleserversideviewservice
     */
    Y.namespace('eZ');

    /**
     * The Role Server Side View Service class.
     *
     * @namespace eZ
     * @class RoleServerSideViewService
     * @constructor
     * @extends eZ.ServerSideViewService
     */
    Y.eZ.RoleServerSideViewService = Y.Base.create('roleServerSideViewService', Y.eZ.ServerSideViewService, [], {
        initializer: function () {
            this.on('*:contentDiscover', function (e) {
                e.config.contentDiscoveredHandler = Y.bind(this._assignRole, this);
            });
        },

        /**
         * Assign the role to the contents after the user has chosen them in
         * the universal discovery widget
         *
         * @method _assignRole
         * @protected
         * @param {EventFacade} e
         */
        _assignRole: function (e) {
            var data = e.target.get('data'),
                tasks = new Y.Parallel(),
                roleService = this.get('capi').getRoleService(); //TODO

            this._assignRoleNotificationStarted(
                data.roleId, data.roleName, e.selection
            );

            Y.Array.each(e.selection, function (struct) {
                // TODO
                //roleService.assignRoleToUserGroup(role, usergroup, limitation);
                //roleService.assignRoleToUser(role, user, limitation);

                //update.setRole(data.roleId);
                //// TODO error handling, see https://jira.ez.no/browse/EZP-23992
                //roleService.updateContentMetadata(
                //    struct.content.get('id'), update, tasks.add()
                //);
            });

            tasks.done(
                Y.bind(this._assignRoleCallback, this,
                    data.roleId, data.roleName, e.selection,
                    Y.bind(data.afterUpdateCallback, this)
                )
            );
        },

        /**
         * Assign role callback triggering notification and calling given callback
         * 
         * @method _assignRoleCallback
         * @protected
         * @param {String} roleId the role id
         * @param {String} roleName the role name
         * @param {Array} contents the array of contents to which role is being assigned to
         * @param {Function} callback the callback to call when other tasks are done
         */
        _assignRoleCallback: function (roleId, roleName, contents, callback) {
            this._assignRoleNotificationDone(roleId, roleName, contents);
            callback();
        },

        /**
         * Notification changed to *started* before assigning role to contents
         * 
         * @method _assignRoleNotificationStarted
         * @protected
         * @param {String} roleId the role id
         * @param {String} roleName the role name
         * @param {Array} contents the array of contents to which role is being assigned to
         */
        _assignRoleNotificationStarted: function (roleId, roleName, contents) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', roleId, contents
                );

            this.fire('notify', {
                notification: {
                    identifier: notificationIdentifier,
                    text: 'Assigning the role "' + roleName + '" to ' + contents.length + ' contents',
                    state: 'started',
                    timeout: 0
                },
            });
        },

        /**
         * Notification changed to *done* after assigning role to contents
         * 
         * @method _assignRoleNotificationDone
         * @protected
         * @param {String} roleId the role id
         * @param {String} roleName the role name
         * @param {Array} contents the array of contents to which role is being assigned to
         */
        _assignRoleNotificationDone: function (roleId, roleName, contents) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', roleId, contents
                );

            this.fire('notify', {
                notification: {
                    identifier: notificationIdentifier,
                    text: 'Role "' + roleName + '" assigned to ' + contents.length + ' contents',
                    state: 'done',
                    timeout: 5
                },
            });
        },

        /**
         * Generates identifier for notifications which is unique basing on
         * role ID and IDs of contents which role is being assigned to.
         * 
         * @method _getAssignRoleNotificationIdentifier
         * @protected
         * @param {String} action custom string describing action which is being taken
         * @param {String} roleId the role id
         * @param {Array} contents the array of contents to which role is being assigned to
         * @return {String} unique notification identifier based on passed parameters
         */
        _getAssignRoleNotificationIdentifier: function (action, roleId, contents) {
            var contentIds = [];

            Y.Array.each(contents, function (struct) {
                contentIds.push(struct.content.get('id'));
            });
            return action + '-' + roleId + '-' + contentIds.join('_');
        },
    });
});

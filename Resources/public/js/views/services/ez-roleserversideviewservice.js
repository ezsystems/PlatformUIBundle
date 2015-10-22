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
         * Assign the role to the users/groups after the user has chosen them in
         * the universal discovery widget
         *
         * @method _assignRole
         * @protected
         * @param {EventFacade} e
         */
        _assignRole: function (e) {
            var data = e.target.get('data'),
                userService = this.get('capi').getUserService(),
                countAssigned = 0,
                service = this;

            this._assignRoleNotificationStarted(
                data.roleId, data.roleName, e.selection
            );

            userService.loadRole(data.roleId, function (error, response) {
                var tasks = new Y.Parallel(),
                    role;

                if (error) {
                    service._loadRoleErrorNotification(
                        data.roleId, data.roleName, e.selection
                    );
                    return;
                }

                role = response.document.Role;

                Y.Array.each(e.selection, function (struct) {
                    var end = tasks.add(function (err, response) {
                            if (err) {
                                service._notify(
                                    'Role has not been assigned to "' + struct.contentInfo.get('name') + '": ' + err.message,
                                    'assign-role-failed-' + struct.contentInfo.get('id'),
                                    'error',
                                    0
                                );
                                return;
                            }
                            countAssigned++;
                        });

                    service._assignRoleToAssignee(struct, role, end);
                });

                tasks.done(function () {
                    service._assignRoleCallback(
                        data.roleId, data.roleName, e.selection, countAssigned,
                        Y.bind(data.afterUpdateCallback, service)
                    );
                });
            });
        },

        /**
         * Assign the role to selected content
         *
         * @method _assignRoleToAssignee
         * @protected
         * @param {Object} struct the object selected with content discovery
         * @param {Role} role
         * @param {Function} callback the callback function
         */
        _assignRoleToAssignee: function (struct, role, callback) {
            var // TODO: EZP-24905 Role assignment limitations
                // limitation will be filled like example in UserService.prototype.newRoleAssignInputStruct()
                // hrefs in the limitation must be converted to IDs, as expected by the API
                limitation = null,
                contentTypeIdentifier = struct.contentType.get('identifier');

            if (contentTypeIdentifier === 'user') {
                this._assignRoleToUser(role, limitation, struct.contentInfo, callback);
            } else if (contentTypeIdentifier === 'user_group') {
                this._assignRoleToUserGroup(role, limitation, struct.contentInfo, struct.location, callback);
            } else {
                callback({message:'Selected content is not a user or group.'});
            }
        },

        /**
         * Assign the role to a user
         *
         * @method _assignRoleToUser
         * @protected
         * @param {Object} role
         * @param {Object|null} limitation
         * @param {eZ.ContentInfo} contentInfo
         * @param {Function} callback the callback function
         */
        _assignRoleToUser: function (role, limitation, contentInfo, callback) {
            var userService = this.get('capi').getUserService(),
                discoveryService = this.get('capi').getDiscoveryService(),
                roleAssignInputStruct= userService.newRoleAssignInputStruct(role, limitation),
                userIdStr;

            discoveryService.getInfoObject('users', function (error, usersInfoObject) {
                if (error) {
                    callback(error);
                    return;
                }

                // We got a Content, but we need a user ID, e.g.: /api/ezp/v2/user/users/10
                // TODO UDW should be limited to the Users subtree, and return User/UserGroup objects: EZP-24917
                userIdStr = usersInfoObject._href + '/' + contentInfo.get('contentId');

                userService.assignRoleToUser(
                    userIdStr, roleAssignInputStruct, callback
                );
            });
        },

        /**
         * Assign the role to a user group
         *
         * @method _assignRoleToUserGroup
         * @protected
         * @param {Object} role
         * @param {Object|null} limitation
         * @param {eZ.ContentInfo} content
         * @param {eZ.Location} location
         * @param {Function} callback the callback function
         */
        _assignRoleToUserGroup: function (role, limitation, contentInfo, location, callback) {
            var userService = this.get('capi').getUserService(),
                discoveryService = this.get('capi').getDiscoveryService(),
                roleAssignInputStruct= userService.newRoleAssignInputStruct(role, limitation),
                groupIdStr;

            discoveryService.getInfoObject('rootUserGroup', function (error, rootUserGroup) {
                if (error) {
                    callback(error);
                    return;
                }

                /* We need to convert content ID to user group ID, e.g.
                 change this: /api/ezp/v2/content/locations/1/5/14
                 into this: /api/ezp/v2/user/groups/1/5/14
                 */
                // TODO UDW should be limited to the Users subtree, and return User/UserGroup objects: EZP-24917
                groupIdStr = /.+user\/groups/.exec(rootUserGroup._href) + /(\/\d+)+$/g.exec(location.get('id'))[0];

                userService.assignRoleToUserGroup(
                    groupIdStr, roleAssignInputStruct, callback
                );
            });
        },

        /**
         * Assign role callback triggering notification and calling given callback
         *
         * @method _assignRoleCallback
         * @protected
         * @param {String} roleId the role id
         * @param {String} roleName the role name
         * @param {Array} contents the array of users/groups to which role is being assigned to
         * @param {Integer} countAssigned number of successfully assignments
         * @param {Function} callback the callback to call when other tasks are done
         */
        _assignRoleCallback: function (roleId, roleName, contents, countAssigned, callback) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', roleId, contents
                );

            if (countAssigned>0) {
                this._notify(
                    '"' + roleName + '" role has been assigned to ' + countAssigned + ' users/groups',
                    notificationIdentifier,
                    'done',
                    5
                );
            } else {
                this._notify(
                    'Role has not been assigned to any users/groups',
                    notificationIdentifier,
                    'error',
                    0
                );
            }

            callback();
        },

        /**
         * Notification changed to *started* before assigning role to users/groups
         *
         * @method _assignRoleNotificationStarted
         * @protected
         * @param {String} roleId the role id
         * @param {String} roleName the role name
         * @param {Array} contents the array of users/groups to which role is being assigned to
         */
        _assignRoleNotificationStarted: function (roleId, roleName, contents) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', roleId, contents
                );

            this._notify(
                'Assigning the role "' + roleName + '" to ' + contents.length + ' users/groups',
                notificationIdentifier,
                'started',
                5
            );
        },

        /**
         * Notification with *error* state when loadRole fails
         *
         * @method _loadRoleErrorNotification
         * @protected
         * @param {String} roleId the role id
         * @param {String} roleName the role name
         * @param {Array} contents the array of users/groups to which role is being assigned to
         */
        _loadRoleErrorNotification: function (roleId, roleName, contents) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', roleId, contents
                );

            this._notify(
                'The role "' + roleName + '" could not be loaded',
                notificationIdentifier,
                'error',
                0
            );
        },

        /**
         * Generates identifier for notifications which is unique basing on
         * role ID and IDs of users/groups which role is being assigned to.
         *
         * @method _getAssignRoleNotificationIdentifier
         * @protected
         * @param {String} action custom string describing action which is being taken
         * @param {String} roleId the role id
         * @param {Array} contents the array of users/groups to which role is being assigned to
         * @return {String} unique notification identifier based on passed parameters
         */
        _getAssignRoleNotificationIdentifier: function (action, roleId, contents) {
            var contentIds = [];

            Y.Array.each(contents, function (struct) {
                contentIds.push(struct.contentInfo.get('id'));
            });
            return action + '-' + roleId + '-' + contentIds.join('_');
        },

        /**
         * Fire 'notify' event
         *
         * @method _notify
         * @protected
         * @param {String} text the text shown during the notification
         * @param {String} identifier the identifier of the notification
         * @param {String} state the state of the notification
         * @param {Integer} timeout the number of second, the notification will be shown
         */
        _notify: function (text, identifier, state, timeout) {
            this.fire('notify', {
                notification: {
                    text: text,
                    identifier: identifier,
                    state: state,
                    timeout: timeout,
                }
            });
        },
    });
});

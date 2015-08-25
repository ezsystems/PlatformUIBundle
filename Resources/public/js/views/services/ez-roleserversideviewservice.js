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
                service = this;

            this._assignRoleNotificationStarted(
                data.roleId, data.roleName, e.selection
            );

            userService.loadRole(data.roleId, function (error, response) {
                var tasks = new Y.Parallel(),
                    end = tasks.add(function (err, response) {
                        if (err) {
                            service._error('The role could not be assigned: ' + err.message);
                        }
                    });

                if (error) {
                    service._error('The role could not be loaded: ' + error.message);
                    return;
                }

                service._assignRoleToEachAssignee(e, response.document.Role, end);

                tasks.done(function () {
                    service._assignRoleCallback(
                        data.roleId, data.roleName, e.selection,
                        Y.bind(data.afterUpdateCallback, service)
                    );
                });
            });
        },

        /**
         * Assign the role to each user/group
         *
         * @method _assignRoleToEachAssignee
         * @protected
         * @param {EventFacade} e
         * @param {Role} role
         * @param {Function} end Callback function
         */
        _assignRoleToEachAssignee: function (e, role, end) {
            var userService = this.get('capi').getUserService(),
                service = this,
                roleAssignInputStruct;

            Y.Array.each(e.selection, function (struct) {
                var limitation = null,
                    contentTypeIdentifier = struct.contentType.get('identifier');

                // TODO: EZP-24905 Role assignment limitations
                // limitation will be filled like example in UserService.prototype.newRoleAssignInputStruct()
                // hrefs in the limitation must be converted to IDs, as expected by the API

                roleAssignInputStruct = userService.newRoleAssignInputStruct(role, limitation);

                if (contentTypeIdentifier === 'user') {
                    service._assignRoleToUser(roleAssignInputStruct, struct.content, end);
                } else if (contentTypeIdentifier === 'user_group') {
                    service._assignRoleToUserGroup(roleAssignInputStruct, struct.content, end);
                } else {
                    end({message:'The select content is not a user or group.'});
                }
            });
        },

        /**
         * Assign the role to a user
         *
         * @method _assignRoleToUser
         * @protected
         * @param {RoleAssignInputStruct} roleAssignInputStruct
         * @param {Content} content
         * @param {Function} end Callback function
         */
        _assignRoleToUser: function (roleAssignInputStruct, content, end) {
            var userService = this.get('capi').getUserService(),
                discoveryService = this.get('capi').getDiscoveryService(),
                userIdStr;

            discoveryService.getInfoObject('users', function (error, usersInfoObject) {
                if (error) {
                    end(error);
                    return;
                }

                // We got a Content, but we need a user ID, e.g.: /api/ezp/v2/user/users/10
                // TODO UDW should be limited to the Users subtree, and return User/UserGroup objects: EZP-24917
                userIdStr = usersInfoObject._href + '/' + content.get('contentId');

                userService.assignRoleToUser(
                    userIdStr, roleAssignInputStruct, end
                );
            });
        },

        /**
         * Assign the role to a user group
         *
         * @method _assignRoleToUserGroup
         * @protected
         * @param {RoleAssignInputStruct} roleAssignInputStruct
         * @param {Content} content
         * @param {Function} end Callback function
         */
        _assignRoleToUserGroup: function (roleAssignInputStruct, content, end) {
            var userService = this.get('capi').getUserService(),
                discoveryService = this.get('capi').getDiscoveryService(),
                location,
                groupIdStr;

            discoveryService.getInfoObject('rootUserGroup', function (error, rootUserGroup) {
                if (error) {
                    end(error);
                    return;
                }

                /* We need to convert content ID to user group ID, e.g.
                 change this: /api/ezp/v2/content/locations/1/5/14
                 into this: /api/ezp/v2/user/groups/1/5/14
                 */
                // TODO UDW should be limited to the Users subtree, and return User/UserGroup objects: EZP-24917
                location = content.get('resources').MainLocation;
                groupIdStr = /.+user\/groups/.exec(rootUserGroup._href) + /(\/\d+)+$/g.exec(location)[0];

                userService.assignRoleToUserGroup(
                    groupIdStr, roleAssignInputStruct, end
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
         * @param {Array} contents the array of Content items to which role is being assigned to
         * @param {Function} callback the callback to call when other tasks are done
         */
        _assignRoleCallback: function (roleId, roleName, contents, callback) {
            this._assignRoleNotificationDone(roleId, roleName, contents);
            callback();
        },

        /**
         * Notification changed to *started* before assigning role to Content items
         *
         * @method _assignRoleNotificationStarted
         * @protected
         * @param {String} roleId the role id
         * @param {String} roleName the role name
         * @param {Array} contents the array of Content items to which role is being assigned to
         */
        _assignRoleNotificationStarted: function (roleId, roleName, contents) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', roleId, contents
                );

            this.fire('notify', {
                notification: {
                    identifier: notificationIdentifier,
                    text: 'Assigning the role "' + roleName + '" to ' + contents.length + ' Content items',
                    state: 'started',
                    timeout: 0
                },
            });
        },

        /**
         * Notification changed to *done* after assigning role to Content items
         *
         * @method _assignRoleNotificationDone
         * @protected
         * @param {String} roleId the role id
         * @param {String} roleName the role name
         * @param {Array} contents the array of Content items to which role is being assigned to
         */
        _assignRoleNotificationDone: function (roleId, roleName, contents) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', roleId, contents
                );

            this.fire('notify', {
                notification: {
                    identifier: notificationIdentifier,
                    text: 'Role "' + roleName + '" assigned to ' + contents.length + ' Content items',
                    state: 'done',
                    timeout: 5
                },
            });
        },

        /**
         * Generates identifier for notifications which is unique basing on
         * role ID and IDs of Content items which role is being assigned to.
         *
         * @method _getAssignRoleNotificationIdentifier
         * @protected
         * @param {String} action custom string describing action which is being taken
         * @param {String} roleId the role id
         * @param {Array} contents the array of Content items to which role is being assigned to
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

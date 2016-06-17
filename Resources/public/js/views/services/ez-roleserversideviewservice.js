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
                if (this._isDiscoveringForAssigningRole(e)) {
                    e.config.contentDiscoveredHandler = Y.bind(this._assignRole, this);
                }
            });
        },

        /**
         * Return true if we are in the process of assigning a role.
         *
         * @method _isDiscoveringForAssigningRole
         * @protected
         * @param {EventFacade} e
         */
        _isDiscoveringForAssigningRole: function (e) {
            var data = e.config.data;

            return data !== undefined && data.roleId !== undefined;
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
                service = this,
                limitation = null;

            if (this._hasSectionLimitation(data)) {
               limitation = this._createSectionLimitation(data);
            } else if (this._hasSubtreeLimitation(data)) {
                limitation = this._createSubtreeLimitation(data);
            }

            this._assignRoleNotificationStarted(
                data, e.selection
            );

            userService.loadRole(data.roleId, function (error, response) {
                var tasks = new Y.Parallel(),
                    role;

                if (error) {
                    service._loadRoleErrorNotification(
                        data, e.selection
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

                    service._assignRoleToAssignee(struct, role, limitation, end);
                });

                tasks.done(function () {
                    service._assignRoleCallback(
                        data, e.selection, countAssigned,
                        Y.bind(data.afterUpdateCallback, service)
                    );
                });
            });
        },


        /**
         * Check if the UDW config has a section limitationType
         *
         * @method _hasSectionLimitation
         * @protected
         * @param {Object} assignActionData it can contain the limitation type
         * @return {Boolean}
         */
        _hasSectionLimitation: function (assignActionData) {
            return assignActionData.limitationType == 'Section';
        },

        /**
         * Check if the UDW config has a subtree limitationType
         *
         * @method _hasSubtreeLimitation
         * @protected
         * @param {Object} assignActionData it can contain the limitation type
         * @return {Boolean}
         */
        _hasSubtreeLimitation: function (assignActionData) {
            return assignActionData.limitationType == 'Subtree';
        },

        /**
         * Create the limitation object with the section currently chosen.
         *
         * @method _createSectionLimitation
         * @protected
         * @param {Object} data
         * @return {Object} the limitation with its identifer and values as expected by the API
         */
        _createSectionLimitation: function (data) {
            // Creating a limitation in the format described in the JS REST client's `UserService.prototype.newRoleAssignInputStruct()`
            var limitation = {
                    "_identifier": data.limitationType,
                    "values": {
                        "ref": [{
                            "_href": data.section.sectionRestId,
                            "_media-type": "application\/vnd.ez.api.Section+json"
                        }]
                    }
                };
            return limitation;
        },

        /**
         * Create the limitation object with the subtree locations currently chosen.
         *
         * @method _createSubtreeLimitation
         * @protected
         * @param {Object} data
         * @return {Object} the limitation with its identifer and values as expected by the API
         */
        _createSubtreeLimitation: function (data) {
            // Creating a limitation in the format described in the JS REST client's `UserService.prototype.newRoleAssignInputStruct()`
            var limitation,
                limitationValues = Y.Array.map(data.subtreeIds, function(subtreeId) {
                    if (subtreeId.slice(-1) !== "/") {
                        subtreeId += "/";
                    }
                    return {"_href": subtreeId, "_media-type": "application\/vnd.ez.api.Location+json"};
                });

            limitation = {
                "_identifier": "Subtree",
                "values": {
                    "ref": limitationValues
                }
            };
            return limitation;
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
        _assignRoleToAssignee: function (struct, role, limitation, callback) {
            var contentTypeIdentifier = struct.contentType.get('identifier');

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
         * @param {object} assignActionData
         * @param {Array} contents the array of users/groups to which role is being assigned to
         * @param {Integer} countAssigned number of successfully assignments
         * @param {Function} callback the callback to call when other tasks are done
         */
        _assignRoleCallback: function (assignActionData, contents, countAssigned, callback) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', assignActionData, contents
                ),
                notificationSucessText =
                    '"'
                    + assignActionData.roleName
                    + '" role has been assigned to '
                    + countAssigned
                    + ' users/groups';

            if (countAssigned>0) {
                if (this._hasSectionLimitation(assignActionData)) {
                    notificationSucessText += ' limited to ' + assignActionData.section.sectionName + ' section';
                } else if (this._hasSubtreeLimitation(assignActionData)) {
                    notificationSucessText += ' with a subtree limitation';
                }
                this._notify(
                    notificationSucessText ,
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
         * @param {Object} assignActionData it contains the role id, role name and the section name (if there is a section limitation)
         * @param {Array} contents the array of users/groups to which role is being assigned to
         */
        _assignRoleNotificationStarted: function (assignActionData, contents) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', assignActionData, contents
                ),
                notificationText = 'Assigning the role "' + assignActionData.roleName + '" to ' + contents.length + ' users/groups';

            if (this._hasSectionLimitation(assignActionData)) {
                notificationText += ' limited to ' + assignActionData.section.sectionName + ' section';
            } else if (this._hasSubtreeLimitation(assignActionData)) {
                notificationText += ' with a subtree limitation';
            }
            this._notify(
                notificationText,
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
         * @param {Y.Object} assignActionData it contains the role name
         * @param {Array} contents the array of users/groups to which role is being assigned to
         */
        _loadRoleErrorNotification: function (assignActionData, contents) {
            var notificationIdentifier = this._getAssignRoleNotificationIdentifier(
                    'assign-role', assignActionData, contents
                );

            this._notify(
                'The role "' + assignActionData.roleName + '" could not be loaded',
                notificationIdentifier,
                'error',
                0
            );
        },

        /**
         * Generates identifier for notifications which is unique based on
         * role ID and IDs of users/groups which role is being assigned to.
         *
         * @method _getAssignRoleNotificationIdentifier
         * @protected
         * @param {String} action custom string describing action which is being taken
         * @param {Object} assignActionData it contains the role id and infos on the section limitation if there is one.
         * @param {Array} contents the array of users/groups to which role is being assigned to
         * @return {String} unique notification identifier based on passed parameters
         */
        _getAssignRoleNotificationIdentifier: function (action, assignActionData, contents) {
            var contentIds = [],
                identifier,
                subtreeIds = '';

            Y.Array.each(contents, function (struct) {
                contentIds.push(struct.contentInfo.get('id'));
            });
            identifier = action + '-' + assignActionData.roleId + '-' + contentIds.join('_');
            if (this._hasSectionLimitation(assignActionData)) {
                identifier += 'section-limit-'+ assignActionData.section.sectionId;
            } else if (this._hasSubtreeLimitation(assignActionData)) {
                Y.Array.each(assignActionData.subtreeIds, function (subtreeId) {
                    subtreeIds += subtreeId;
                });
                identifier += 'subtree-limit-'+ subtreeIds;
            }
            return identifier;
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

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-roleserversideviewservice-tests', function (Y) {
    var contentDiscoverEventTest,
        assignRoleTest,
        Mock = Y.Mock, Assert = Y.Assert;

    contentDiscoverEventTest = new Y.Test.Case({
        name: "eZ Role Server Side View Service contentDiscover event handler test",

        setUp: function () {
            this.service = new Y.eZ.RoleServerSideViewService();
        },

        tearDown: function () {
            delete this.service;
        },

        "Should add the contentDiscovered handler": function () {
            var config = {};

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            Assert.isFunction(
                config.contentDiscoveredHandler,
                "The contentDiscovered should have been added"
            );
        },
    });

    assignRoleTest = new Y.Test.Case({
        name: "eZ Role Server Side View Service assign role test",

        setUp: function () {
            this.id = 'nyarlathotep';
            this.content = new Mock();
            this.contentId = '31';
            this.contentName = 'The Crawling Chaos';
            this.userId = 'azathoth';
            this.userGroupId = 'yog-sothoth';
            this.roleId = '42';
            this.roleName = 'Shub-niggurath';
            this.capi = new Mock();
            this.userService = new Mock();
            this.discoveryService = new Mock();
            this.service = new Y.eZ.RoleServerSideViewService({
                capi: this.capi
            });

            Mock.expect(this.capi, {
                method: 'getUserService',
                returns: this.userService,
            });
            Mock.expect(this.capi, {
                method: 'getDiscoveryService',
                returns: this.discoveryService,
            });
            Mock.expect(this.discoveryService, {
                method: 'getInfoObject',
                args: [Mock.Value.String, Mock.Value.Function],
                run: function (infObjStr, cb) {
                    if (infObjStr === 'users') {
                        cb(false, { _href: '/api/ezp/v2/user/users' });
                    } else if (infObjStr === 'rootUserGroup') {
                        cb(false, { _href: '/api/ezp/v2/user/groups' });
                    }
                },
            });
            Mock.expect(this.content, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return this.id;
                    } else if (attr === 'contentId') {
                        return this.contentId;
                    } else if (attr === 'name') {
                        return this.contentName;
                    } else if (attr === 'resources') {
                        return {
                            MainLocation: '/1/5/14'
                        };
                    }
                }
            });
        },

        tearDown: function () {
            delete this.service;
            delete this.capi;
            delete this.userService;
        },

        "Should assign the role to the discovered user": function () {
            var that = this,
                config = {},
                content = this.content,
                contentType = new Mock(),
                role = new Mock(),
                roleId = this.roleId,
                roleName = this.roleName,
                roleAssignInputStruct = new Mock(),
                universalDiscovery = new Mock(),
                // TODO UDW should be limited to the Users subtree, and return User/UserGroup objects: EZP-24917
                selection = [{content: content, contentType: contentType}],
                loadRoleResponse = {
                    document: {
                        Role: role
                    }
                },
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                    Assert.areSame(
                        that.service, this,
                        "The callback should be executed in the service context"
                    );
                };

            Mock.expect(contentType, {
                method: 'get',
                args: ['identifier'],
                returns: 'user',
            });
            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: roleId,
                    roleName: roleName,
                    afterUpdateCallback: callback,
                },
            });
            Mock.expect(this.userService, {
                method: 'loadRole',
                args: [this.roleId, Mock.Value.Function],
                run: function (id, cb) {
                    cb(false, loadRoleResponse);
                },
            });
            Mock.expect(this.userService, {
                method: 'newRoleAssignInputStruct',
                args: [Mock.Value.Object, null],
                run: function (role, limitation) {
                    return roleAssignInputStruct;
                }
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUser',
                args: [Mock.Value.String, roleAssignInputStruct, Mock.Value.Function],
                run: function (content, struct, cb) {
                    cb();
                },
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, roleAssignInputStruct, Mock.Value.Function],
                run: function (content, struct, cb) {
                    cb();
                },
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection
            });

            Assert.isTrue(callbackCalled, "The afterUpdateCallback should have been called");
            Mock.verify(universalDiscovery);
            Mock.verify(roleAssignInputStruct);
        },

        "Should assign the role to the discovered group": function () {
            var that = this,
                config = {},
                content = this.content,
                contentType = new Mock(),
                role = new Mock(),
                roleId = this.roleId,
                roleName = this.roleName,
                roleAssignInputStruct = new Mock(),
                universalDiscovery = new Mock(),
                // TODO UDW should be limited to the Users subtree, and return User/UserGroup objects: EZP-24917
                selection = [{content: content, contentType: contentType}],
                loadRoleResponse = {
                    document: {
                        Role: role
                    }
                },
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                    Assert.areSame(
                        that.service, this,
                        "The callback should be executed in the service context"
                    );
                };

            Mock.expect(contentType, {
                method: 'get',
                args: ['identifier'],
                returns: 'user_group',
            });
            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: roleId,
                    roleName: roleName,
                    afterUpdateCallback: callback,
                },
            });
            Mock.expect(this.userService, {
                method: 'loadRole',
                args: [this.roleId, Mock.Value.Function],
                run: function (id, cb) {
                    cb(false, loadRoleResponse);
                },
            });
            Mock.expect(this.userService, {
                method: 'newRoleAssignInputStruct',
                args: [Mock.Value.Object, null],
                run: function (role, limitation) {
                    return roleAssignInputStruct;
                }
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUser',
                args: [Mock.Value.String, roleAssignInputStruct, Mock.Value.Function],
                run: function (content, struct, cb) {
                    cb();
                },
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, roleAssignInputStruct, Mock.Value.Function],
                run: function (content, struct, cb) {
                    cb();
                },
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection
            });

            Assert.isTrue(callbackCalled, "The afterUpdateCallback should have been called");
            Mock.verify(universalDiscovery);
            Mock.verify(roleAssignInputStruct);
        },

        "Should notify about the start of assigning user/group to the role process": function () {
            var that = this,
                config = {},
                content = this.content,
                contentType = new Mock(),
                contentId = this.contentId,
                role = new Mock(),
                roleId = this.roleId,
                roleName = this.roleName,
                roleAssignInputStruct = new Mock(),
                universalDiscovery = new Mock(),
                // TODO UDW should be limited to the Users subtree, and return User/UserGroup objects: EZP-24917
                selection = [{content: content, contentType: contentType}],
                loadRoleResponse = {
                    document: {
                        Role: role
                    }
                },
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                    Assert.areSame(
                        that.service, this,
                        "The callback should be executed in the service context"
                    );
                },
                notified = false;

            Mock.expect(contentType, {
                method: 'get',
                args: ['identifier'],
                returns: contentId,
            });
            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: roleId,
                    roleName: roleName,
                    afterUpdateCallback: callback,
                },
            });
            Mock.expect(this.userService, {
                method: 'loadRole',
                args: [this.roleId, Mock.Value.Function],
                run: function (id, cb) {
                    cb(false, loadRoleResponse);
                },
            });
            Mock.expect(this.userService, {
                method: 'newRoleAssignInputStruct',
                args: [Mock.Value.Object, null],
                run: function (role, limitation) {
                    return roleAssignInputStruct;
                },
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUser',
                args: [this.userId, roleAssignInputStruct, Mock.Value.Function],
                run: function (id, struct, cb) {
                    cb();
                },
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [this.userGroupId, roleAssignInputStruct, Mock.Value.Function],
                run: function (id, struct, cb) {
                    cb();
                },
            });

            this.service.on('notify', function (e) {
                notified = true;
                this.once('notify', function (e) {
                    Assert.areEqual(
                        "started", e.notification.state,
                        "The notification state should be 'started'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a String"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(contentId) !== -1,
                        "The notification identifier should contain the content id" + e.notification.identifier
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(roleId) !== -1,
                        "The notification identifier should contain the role id"
                    );
                    Assert.areSame(
                        0, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection
            });

            Assert.isTrue(notified, "The notify event should have been fired");
        },

        "Should notify about the success of assigning user/group to the role": function () {
            var that = this,
                config = {},
                content = this.content,
                contentType = new Mock(),
                contentId = this.contentId,
                role = new Mock(),
                roleId = this.roleId,
                roleName = this.roleName,
                roleAssignInputStruct = new Mock(),
                universalDiscovery = new Mock(),
                // TODO UDW should be limited to the Users subtree, and return User/UserGroup objects: EZP-24917
                selection = [{content: content, contentType: contentType}],
                loadRoleResponse = {
                    document: {
                        Role: role
                    }
                },
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                    Assert.areSame(
                        that.service, this,
                        "The callback should be executed in the service context"
                    );
                },
                notified = false;

            Mock.expect(contentType, {
                method: 'get',
                args: ['identifier'],
                returns: contentId,
            });
            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: roleId,
                    roleName: roleName,
                    afterUpdateCallback: callback,
                },
            });
            Mock.expect(this.userService, {
                method: 'loadRole',
                args: [this.roleId, Mock.Value.Function],
                run: function (id, cb) {
                    cb(false, loadRoleResponse);
                },
            });
            Mock.expect(this.userService, {
                method: 'newRoleAssignInputStruct',
                args: [Mock.Value.Object, null],
                run: function (role, limitation) {
                    return roleAssignInputStruct;
                },
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUser',
                args: [this.userId, roleAssignInputStruct, Mock.Value.Function],
                run: function (id, struct, cb) {
                    cb();
                },
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [this.userGroupId, roleAssignInputStruct, Mock.Value.Function],
                run: function (id, struct, cb) {
                    cb();
                },
            });

            this.service.on('notify', function (e) {
                notified = true;
                this.once('notify', function (e) {
                    Assert.areEqual(
                        "done", e.notification.state,
                        "The notification state should be 'done'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a String"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(contentId) !== -1,
                        "The notification identifier should contain the content id"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(roleId) !== -1,
                        "The notification identifier should contain the role id"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 5"
                    );
                });
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection
            });

            Assert.isTrue(notified, "The notify event should have been fired");
        },
    });

    Y.Test.Runner.setName("eZ Role Server Side View Service tests");
    Y.Test.Runner.add(contentDiscoverEventTest);
    Y.Test.Runner.add(assignRoleTest);
}, '', {requires: ['test', 'ez-roleserversideviewservice']});

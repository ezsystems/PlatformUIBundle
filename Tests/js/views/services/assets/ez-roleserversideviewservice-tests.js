/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-roleserversideviewservice-tests', function (Y) {
    var contentDiscoverEventTest,
        assignRoleTest, notificationTest,
        Mock = Y.Mock, Assert = Y.Assert,
        getMockForJson = function (modelJson) {
            var model = new Mock();

            Mock.expect(model, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (modelJson[attr]!==undefined) {
                        return modelJson[attr];
                    } else {
                        Y.fail('Trying to `get` incorrect attribute `' + attr + '` from mock');
                    }
                }
            });

            return model;
        };

    contentDiscoverEventTest = new Y.Test.Case({
        name: "eZ Role Server Side View Service contentDiscover event handler test",

        setUp: function () {
            this.service = new Y.eZ.RoleServerSideViewService();
        },

        tearDown: function () {
            delete this.service;
        },

        "Should add the contentDiscovered handler if it is dicovering for assigning role": function () {
            var config = {data: {roleId: '42'}};

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            Assert.isFunction(
                config.contentDiscoveredHandler,
                "The contentDiscovered should have been added"
            );
        },


        "Should NOT add the contentDiscovered handler if it is NOT to assign role": function () {
            var config = {};

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            Assert.isUndefined(
                config.contentDiscoveredHandler,
                "The contentDiscovered should have been added"
            );
        },
    });

    assignRoleTest = new Y.Test.Case({
        name: "eZ Role Server Side View Service assign role test",

        setUp: function () {
            var loadRoleResponse;

            this.capi = new Mock();
            this.userService = new Mock();
            this.discoveryService = new Mock();
            this.role = new Mock();
            this.roleId = 'role-id';
            this.roleName = 'role-name';
            this.roleAssignInputStruct = {};

            loadRoleResponse = {
                document: {
                    Role: this.role
                }
            };

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
            Mock.expect(this.userService, {
                method: 'loadRole',
                args: [this.roleId, Mock.Value.Function],
                run: function (roleId, callback) {
                    callback(false, loadRoleResponse);
                }
            });
            Mock.expect(this.userService, {
                method: 'newRoleAssignInputStruct',
                args: [this.role, Mock.Value.Any],
                returns: this.roleAssignInputStruct
            });

            this.service = new Y.eZ.RoleServerSideViewService({
                capi: this.capi
            });
        },

        tearDown: function () {
            delete this.service;
            delete this.capi;
            delete this.userService;
        },

        _assignRoleAndCallCallback: function (universalDiscoveryMock) {
            var contentJson = {
                    id: 'c-id',
                    contentId: 'content-contentId',
                    name: 'The Crawling Chaos',
                },
                contentInfo = getMockForJson(contentJson),
                contentTypeJson = {
                    identifier: 'user'
                },
                contentType = getMockForJson(contentTypeJson),
                selection = [{contentInfo: contentInfo, contentType: contentType}],
                config = {data: {roleId: '42'}};

            Mock.expect(this.userService, {
                method: 'assignRoleToUser',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
                run: function (userId, roleAssignInputStruct, cb) {
                    Assert.areEqual(
                        userId,
                        '/api/ezp/v2/user/users/' + contentJson.contentId,
                        "The userGroupId should be defined"
                    );
                    cb(false);
                }
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscoveryMock,
                selection: selection
            });
        },

        _assignRoleToGroupAndCallCallback: function (universalDiscoveryMock) {
            var contentJson = {
                    id: 'c-id',
                    contentId: 'content-contentId',
                    name: 'The Crawling Chaos',
                },
                userGroupId = "/1/5/14",
                location = getMockForJson({id: userGroupId}),
                contentInfo = getMockForJson(contentJson),
                contentTypeJson = {
                    identifier: 'user_group'
                },
                contentType = getMockForJson(contentTypeJson),
                selection = [{contentInfo: contentInfo, contentType: contentType, location: location}],
                config = {data: {roleId: '42'}};

            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
                run: function (userGroupURI, roleAssignInputStruct, cb) {
                    Assert.areEqual(
                        userGroupURI,
                        '/api/ezp/v2/user/groups' + userGroupId,
                        "The userGroupId should be defined"
                    );
                    cb(false);
                }
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscoveryMock,
                selection: selection
            });
        },

        "Should assign role to the user and call the callback": function () {
            var universalDiscovery = new Mock(),
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                };

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: callback,
                },
            });

            this._assignRoleAndCallCallback(universalDiscovery);
            Assert.isTrue(callbackCalled, 'The callback should be called');
        },

        "Should assign role with a section limitation to the user and call the callback": function () {
            var universalDiscovery = new Mock(),
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                },
                limitationType = 'Section',
                sectionId = 69,
                sectionName = "SuperSection";

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: callback,
                    limitationType: limitationType,
                    section: {
                        sectionId: sectionId,
                        sectionName: sectionName,
                    },
                },
            });

            this._assignRoleAndCallCallback(universalDiscovery);
            Assert.isTrue(callbackCalled, 'The callback should be called');
        },

        "Should assign role with a subtree limitation to the user and call the callback": function () {
            var universalDiscovery = new Mock(),
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                },
                limitationType = 'Subtree',
                subtreeIds = [
                    '/1/2',
                    '/3/4/'
                ];

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: callback,
                    limitationType: limitationType,
                    subtreeIds: subtreeIds,
                },
            });

            Mock.expect(this.userService, {
                method: 'newRoleAssignInputStruct',
                args: [this.role, Mock.Value.Any],
                run: Y.bind(function (role, limitation) {
                    Assert.areSame(
                        subtreeIds[0] + "/",
                        limitation.values.ref[0]._href
                    );
                    Assert.areSame(
                        subtreeIds[1],
                        limitation.values.ref[1]._href
                    );

                    return this.roleAssignInputStruct;
                }, this)
            });

            this._assignRoleAndCallCallback(universalDiscovery);
            Assert.isTrue(callbackCalled, 'The callback should be called');
        },

        "Should assign role to the user group and call the callback": function () {
            var universalDiscovery = new Mock(),
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                };

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: callback,
                },
            });

            this._assignRoleToGroupAndCallCallback(universalDiscovery );
            Assert.isTrue(callbackCalled, 'The callback should be called');
        },

        "Should assign role with a section limitation to the user group and call the callback": function () {
            var universalDiscovery = new Mock(),
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                },
                limitationType = 'Section',
                sectionId = 69,
                sectionName = "SuperSection";

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: callback,
                    limitationType: limitationType,
                    section: {
                        sectionId: sectionId,
                        sectionName: sectionName,
                    },
                },
            });

            this._assignRoleToGroupAndCallCallback(universalDiscovery );
            Assert.isTrue(callbackCalled, 'The callback should be called');
        },

        "Should assign role with a subtree limitation to the user group and call the callback": function () {
            var universalDiscovery = new Mock(),
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                },
                limitationType = 'Subtree',
                subtreeIds = ['/1/2/', '/1/3'];

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: callback,
                    limitationType: limitationType,
                    subtreeIds: subtreeIds,
                },
            });

            this._assignRoleToGroupAndCallCallback(universalDiscovery );
            Assert.isTrue(callbackCalled, 'The callback should be called');
        },
    });

    notificationTest = new Y.Test.Case({
        name: "eZ Role Server Side View Service notification test",

        setUp: function () {
            this.capi = new Mock();
            this.userService = new Mock();
            this.discoveryService = new Mock();
            this.role = new Mock();
            this.roleId = 'role-id';
            this.roleName = 'role-name';
            this.roleAssignInputStruct = {};
            this.loadRoleResponse = {
                document: {
                    Role: this.role
                }
            };


            Mock.expect(this.capi, {
                method: 'getUserService',
                returns: this.userService,
            });
            Mock.expect(this.capi, {
                method: 'getDiscoveryService',
                returns: this.discoveryService,
            });
            Mock.expect(this.userService, {
                method: 'newRoleAssignInputStruct',
                args: [this.role, Mock.Value.Any],
                returns: this.roleAssignInputStruct
            });

            this.service = new Y.eZ.RoleServerSideViewService({
                capi: this.capi
            });
        },

        tearDown: function () {
            delete this.service;
            delete this.capi;
            delete this.userService;
        },

        _setLoadRoleStatus: function (isError, loadRoleResponse) {
            Mock.expect(this.userService, {
                method: 'loadRole',
                args: [this.roleId, Mock.Value.Function],
                run: function (roleId, callback) {
                    if (isError) {
                        callback(true);
                    } else {
                        callback(false, loadRoleResponse);
                    }
                }
            });
        },

        _setgetInfoObjectStatus: function (isError) {
            Mock.expect(this.discoveryService, {
                method: 'getInfoObject',
                args: [Mock.Value.String, Mock.Value.Function],
                run: function (infObjStr, cb) {
                    if (isError) {
                        cb(true);
                    } else {
                        if (infObjStr === 'users') {
                            cb(false, { _href: '/api/ezp/v2/user/users' });
                        } else if (infObjStr === 'rootUserGroup') {
                            cb(false, { _href: '/api/ezp/v2/user/groups' });
                        }
                    }
                },
            });
        },

        "Should notify about the success of assignment with section limitation": function () {
            var contentJson = {
                    id: 'c-id',
                    contentId: 'content-contentId',
                    name: 'The Crawling Chaos',
                },
                location = getMockForJson({id: "/1/5/14"}),
                contentInfo = getMockForJson(contentJson),
                contentTypeJson = {
                    identifier: 'user_group'
                },
                contentType = getMockForJson(contentTypeJson),
                selection = [{contentInfo: contentInfo, contentType: contentType, location: location}],
                universalDiscovery = new Mock(),
                config = {data: {roleId: '42'}},
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                limitationType = 'Section',
                sectionId = 69,
                sectionName = "SuperSection",
                that = this;

            this._setLoadRoleStatus(false, this.loadRoleResponse);
            this._setgetInfoObjectStatus(false);

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    limitationType: limitationType,
                    section: {
                        sectionId: sectionId,
                        sectionName: sectionName,
                    },
                    afterUpdateCallback: function () {},
                },
            });

            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
                run: function (userGroupId, roleAssignInputStruct, cb) {
                    cb(false);
                }
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.isTrue(
                        (e.notification.text.indexOf(sectionName) >= 0),
                        "The notification text should contain the name of the section limitation"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(sectionId) >= 0),
                        "The notification identifier should contain the id of the section limitation"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                }
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection,
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(errorNotificationFired, 'Should not fire notification with `error` state');
        },

        "Should notify about the success of assignment with subtree limitation": function () {
            var contentJson = {
                    id: 'c-id',
                    contentId: 'content-contentId',
                    name: 'The Crawling Chaos',
                },
                location = getMockForJson({id: "/1/5/14"}),
                contentInfo = getMockForJson(contentJson),
                contentTypeJson = {
                    identifier: 'user_group'
                },
                contentType = getMockForJson(contentTypeJson),
                selection = [{contentInfo: contentInfo, contentType: contentType, location: location}],
                universalDiscovery = new Mock(),
                config = {data: {roleId: '42'}},
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                limitationType = 'Subtree',
                subtreeIds = ["/1/2/"],
                that = this;

            this._setLoadRoleStatus(false, this.loadRoleResponse);
            this._setgetInfoObjectStatus(false);

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    limitationType: limitationType,
                    subtreeIds: subtreeIds,
                    afterUpdateCallback: function () {},
                },
            });

            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
                run: function (userGroupId, roleAssignInputStruct, cb) {
                    cb(false);
                }
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.isTrue(
                        (e.notification.text.indexOf('subtree') >= 0),
                        "The notification text should mention that there is a subtree limitation"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(subtreeIds[0]) >= 0),
                        "The notification identifier should contain the id of the subtree limitation"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                }
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection,
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(errorNotificationFired, 'Should not fire notification with `error` state');
        },

        "Should notify about the error when assigning the role with subtree limitation": function () {
            var contentJson = {
                    id: 'c-id',
                    contentId: 'content-contentId',
                    name: 'The Crawling Chaos',
                },
                location = getMockForJson({id: "/1/5/14"}),
                contentInfo = getMockForJson(contentJson),
                contentTypeJson = {
                    identifier: 'user_group'
                },
                contentType = getMockForJson(contentTypeJson),
                selection = [{contentInfo: contentInfo, contentType: contentType, location: location}],
                universalDiscovery = new Mock(),
                config = {data: {roleId: '42'}},
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                limitationType = 'Subtree',
                subtreeIds = ["/1/2/"],
                that = this;

            this._setLoadRoleStatus(false, this.loadRoleResponse);
            this._setgetInfoObjectStatus(false);

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: that.roleId,
                    roleName: that.roleName,
                    limitationType: limitationType,
                    subtreeIds: subtreeIds,
                    afterUpdateCallback: function () {},
                },
            });

            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
                run: function (userGroupId, roleAssignInputStruct, cb) {
                    cb(true);
                }
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.isTrue(
                        (e.notification.text.indexOf('subtree') >= 0),
                        "The notification text should mention that there is a subtree limitation"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(subtreeIds[0]) >= 0),
                        "The notification identifier should contain the id of the subtree limitation"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                }
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection,
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
        },

        "Should notify about the error when assigning the role": function () {
            var contentJson = {
                    id: 'c-id',
                    contentId: 'content-contentId',
                    name: 'The Crawling Chaos',
                },
                location = getMockForJson({id: "/1/5/14"}),
                contentInfo = getMockForJson(contentJson),
                contentTypeJson = {
                    identifier: 'user_group'
                },
                contentType = getMockForJson(contentTypeJson),
                selection = [{contentInfo: contentInfo, contentType: contentType, location: location}],
                universalDiscovery = new Mock(),
                config = {data: {roleId: '42'}},
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this;

            this._setLoadRoleStatus(false, this.loadRoleResponse);
            this._setgetInfoObjectStatus(false);

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: function () {},
                },
            });

            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
                run: function (userGroupId, roleAssignInputStruct, cb) {
                    cb(true);
                }
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                }
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection,
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
        },

        "Should handle the error if unable to load the role": function () {
            var contentJson = {
                    id: 'c-id',
                },
                contentInfo = getMockForJson(contentJson),
                selection = [{contentInfo: contentInfo}],
                universalDiscovery = new Mock(),
                config = {data: {roleId: '42'}},
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this;

            this._setLoadRoleStatus(true, {});
            this._setgetInfoObjectStatus(false);

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: function () {},
                },
            });

            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 0,
                        "The timeout of notification should be set to 0"
                    );
                }
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection,
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
        },

        _handleGetInfoObjectError: function (contentTypeString) {
            var contentJson = {
                    id: 'c-id',
                    contentId: 'content-contentId',
                    name: 'The Crawling Chaos',
                },
                contentInfo = getMockForJson(contentJson),
                contentTypeJson = {
                    identifier: contentTypeString
                },
                contentType = getMockForJson(contentTypeJson),
                selection = [{contentInfo: contentInfo, contentType: contentType}],
                universalDiscovery = new Mock(),
                config = {data: {roleId: '42'}},
                startNotificationFired = false,
                successNotificationFired = false,
                errorNotificationFired = false,
                that = this;

            this._setLoadRoleStatus(false, this.loadRoleResponse);
            this._setgetInfoObjectStatus(true);

            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    roleId: this.roleId,
                    roleName: this.roleName,
                    afterUpdateCallback: function () {},
                },
            });

            Mock.expect(this.userService, {
                method: 'assignRoleToUserGroup',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
            });
            Mock.expect(this.userService, {
                method: 'assignRoleToUser',
                args: [Mock.Value.String, this.roleAssignInputStruct, Mock.Value.Function],
            });

            this.service.on('notify', function (e) {
                if (e.notification.state === 'started') {
                    startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(that.roleName) >= 0),
                        "The notification should contain name of the role"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(that.roleId) >= 0),
                        "The notification identifier should contain id of assigned role"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    successNotificationFired = true;
                }
                if (e.notification.state === 'error') {
                    errorNotificationFired = true;
                    Assert.areEqual(
                        e.notification.timeout, 0,
                        "The timeout of notification should be set to 0"
                    );
                }
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection,
            });

            Assert.isTrue(startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(errorNotificationFired, 'Should fire notification with `error` state');
        },

        "Should handle error if unable to get info object from discoveryService when assigning role to user group": function () {
            this._handleGetInfoObjectError('user_group');
        },

        "Should handle error if unable to get info object from discoveryService when assigning role to user": function () {
            this._handleGetInfoObjectError('user');
        },

        "Should handle error if trying to assign role to content that is not user nor user group": function () {
            this._handleGetInfoObjectError('folder');
        }
    });

    Y.Test.Runner.setName("eZ Role Server Side View Service tests");
    Y.Test.Runner.add(contentDiscoverEventTest);
    Y.Test.Runner.add(assignRoleTest);
    Y.Test.Runner.add(notificationTest);
}, '', {requires: ['test', 'ez-roleserversideviewservice']});

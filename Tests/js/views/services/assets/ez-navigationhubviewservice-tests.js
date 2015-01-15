/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubviewservice-tests', function (Y) {
    var getViewParametersTest, logOutEvtTest;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service getViewParameters test",

        setUp: function () {
            this.app = new Y.Mock();
            this.user = {};
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['user'],
                returns: this.user
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
            });
        },

        "Should return an object containing the application user and navigation menus": function () {
            var param = this.service.getViewParameters();

            Y.Assert.areSame(
                this.user, param.user,
                "The view parameter should contain the app's user"
            );

            Y.Assert.isObject(param.navigationMenus, 'navigationMenus attribute should be an object');
            Y.Mock.verify(this.app);
        },
    });

    logOutEvtTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service logOut event test",

        setUp: function () {
            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true],
            });
            Y.Mock.expect(this.app, {
                method: 'logOut',
                args: [Y.Mock.Value.Function],
                run: function (cb) {
                    cb();
                },
            });
            Y.Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['loginForm']
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
            });
        },

        "Should handle the logOut event": function () {
            this.service.fire('whatever:logOut');
        },
    });


    Y.Test.Runner.setName("eZ Navigation Hub View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(logOutEvtTest);
}, '', {requires: ['test', 'ez-navigationhubviewservice']});

YUI.add('ez-editorialapp-tests', function (Y) {
    var appTest, reverseRoutingTest, sideViewsTest,
        runLoaderTest, tplTest;

    appTest = new Y.Test.Case({
        name: "eZ Editorial App tests",

        setUp: function () {
            this.root = '/shell';
            this.app = new Y.eZ.EditorialApp({
                container: '.app',
                viewContainer: '.view-container',
                root: this.root
            });
            this.app.render();
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
        },

        "Should open the application": function () {
            var nextCalled = false;

            this.app.open({}, {}, function () {
                nextCalled = true;
            });

            Y.assert(nextCalled, "Next middleware should have been called");
            Y.assert(
                this.app.get('container').hasClass('is-app-open'),
                "The app container should have the class is-app-open"
            );
        },

        "Should close the application": function () {
            var errorViewHidden = false,
                TestErrorViewConstructor = new Y.Base.create('testErrorView', Y.View, [], {
                    hide: function () {
                        errorViewHidden = true;
                    }
                });
            this.app.views.errorView.instance = new TestErrorViewConstructor();

            this.app.close();

            Y.assert(
                !this.app.get('container').hasClass('is-app-open'),
                "The app container should not have the class is-app-open"
            );
            Y.assert(
                errorViewHidden,
                "The error view should have been hidden"
            );
        },

        "Should go back in the history when contentEditView:closeView event is fired": function () {
            var origBack = Y.config.win.history.back, backCalled = false;

            this.app.open();

            Y.config.win.history.back = function () {
                backCalled = true;
            };

            this.app.fire('contentEditView:closeView');

            Y.Assert.isTrue(backCalled, "history.back should have been called");
            Y.config.win.history.back = origBack;
        },

        "Should set/unset the app in loading mode": function () {
            this.app.set('loading', true);
            Y.assert(
                this.app.get('container').hasClass('is-app-loading'),
                "The application container should get the is-app-loading class"
            );
            this.app.set('loading', false);
            Y.assert(
                !this.app.get('container').hasClass('is-app-loading'),
                "The application container should not get the is-app-loading class"
            );
        },

        "Navigate event should change the loading attribute": function () {
            this.app.set('loading', false);
            this.app.fire('navigate');
            Y.assert(
                this.app.get('loading'),
                "The application should be in loading mode"
            );
        },

        "View change should set the view 'active' attribute to true and set loading to false": function () {
            var that = this;

            this.app.views.simpleView = {
                type: Y.Base.create('simpleView', Y.eZ.View, [], {
                    initializer: function () {
                        this.after('activeChange', function () {
                            that.resume(function () {
                                Y.Assert.isTrue(
                                    that.app.get('activeView').get('active'),
                                    "The active attribute of the view should be set to true"
                                );
                            });
                        });
                    }
                })
            };

            this.app.set('loading', true);
            this.app.showView('simpleView', {},
                function () {
                    that.resume(function () {
                        Y.Assert.isFalse(
                            this.app.get('loading'),
                            "The app should not be in loading mode"
                        );
                        this.wait();
                    });
                }
            );
            this.wait();
        },

        "After the view has changed, the view container should not have any transformation": function () {
            // test case for https://jira.ez.no/browse/EZP-21895
            var that = this;

            this.app.views.simpleView = {
                type: Y.Base.create('simpleView', Y.eZ.View, [], {
                    initializer: function () {
                        this.after('activeChange', function () {
                            that.resume(
                                Y.bind(function () {
                                    console.log(this.get('container').getAttribute('style'));
                                    Y.Assert.areEqual(
                                        "none",
                                        this.get('container').getStyle('transform'),
                                        "The view container should not have any transform style"
                                    );
                                }, this)
                            );
                        });
                    }
                })
            };

            this.app.showView('simpleView');
            this.wait();
        },

        "Should show the view which identifier is in the route metadata": function () {
            var rendered = false, initialized = false,
                req = {route: {view: 'myView'}}, resp = {variables: {'myVar': 1}};

            this.app.views.myView = {
                type: Y.Base.create('myView', Y.View, [], {
                    initializer: function () {
                        initialized = true;
                    },

                    render: function () {
                        rendered = true;
                        Y.Assert.areEqual(
                            this.get('myVar'), resp.variables.myVar,
                            "The view attributes should be updated with the result of the loader"
                        );
                    }
                })
            };

            this.app.set('loading', true);
            this.app.handleMainView(req, resp);

            Y.assert(initialized, "The view should have been initialized");
            Y.assert(rendered, "The view should have been rendered");

            rendered = false;
            resp.variables.myVar++;
            this.app.set('loading', true);
            this.app.handleMainView(req, resp);

            Y.assert(rendered, "The location view view should have been rerendered");
        },

        "Should show the error view, when catching 'fatalError' event": function () {
            var rendered = false, initialized = false,
                errorInfo = {'retryAction:': {}, 'additionalInfo': 1},
                TestErrorViewConstructor = new Y.Base.create('testErrorView', Y.View, [], {
                    initializer: function () {
                        initialized = true;
                    },

                    render: function () {
                        rendered = true;
                        Y.Assert.areSame(
                            this.get('additionalInfo'), errorInfo.additionalInfo,
                            "The view attributes should be updated with the app variables attribute"
                        );
                    },
                });

            this.app.views.errorView.instance = new TestErrorViewConstructor();

            this.app.set('loading', false);
            this.app.fire('contentEditView:fatalError', errorInfo);

            Y.assert(initialized, "The error view should have been initialized");
            Y.assert(rendered, "The error view should have been rendered");
            Y.assert(!this.app.get('loading'), "The app should not be in loading mode");
            Y.Assert.isTrue(
                this.app.views.errorView.instance.get('active'),
                "The error view should be active"
            );
        },

        "Should receive 'retryAction' event fired on the errorView": function () {
            var retryActionReceived = false;

            this.app.on('errorView:retryAction', function (retryAction) {
                retryActionReceived = true;
            });

            this.app.views.errorView.instance.fire('retryAction',{
                run: function () {},
                args: [],
                context: null
            });

            Y.assert(
                retryActionReceived,
                "The app should have received 'retryAction' event"
            );
        },

        "Should correctly retry an action with  '_retryAction' method": function () {
            var makeMeTheContext = {},
                testArgumentInput1 = "abc",
                testArgumentInput2 = "xyz",
                actionRetried = false,
                retryMe = function (testArgument1, testArgument2) {
                    Y.Assert.areSame(testArgumentInput1, testArgument1);
                    Y.Assert.areSame(testArgumentInput2, testArgument2);
                    Y.Assert.areSame(this, makeMeTheContext);
                    actionRetried = true;
                };

            this.app.fire('whatever:retryAction', {
                run: retryMe,
                args: [testArgumentInput1, testArgumentInput2],
                context: makeMeTheContext
            });

            Y.assert(
                actionRetried,
                "Test action should have been retried"
            );
        },

        "Should toggle the discovery bar minimized class on minimizeDiscoveryBarAction event": function () {
            var container = this.app.get('container');

            this.app.fire('whatever:minimizeDiscoveryBarAction');
            Y.Assert.isTrue(
                container.hasClass('is-discoverybar-minimized'),
                "The app container should have the discovery bar minimized class"
            );
            this.app.fire('whatever:minimizeDiscoveryBarAction');
            Y.Assert.isFalse(
                container.hasClass('is-discoverybar-minimized'),
                "The app container should have the discovery bar minimized class"
            );
        },

        "Should navigate to the content edit when receiving an editAction event": function () {
            var contentMock, contentId = 'aContentId';

            contentMock = new Y.Test.Mock();
            Y.Mock.expect(contentMock, {
                method: 'get',
                args: ['id'],
                returns: contentId
            });

            this.app.fire('whatever:editAction', {content: contentMock});
            // .replace() calls are necessary because app.getPath() does not
            // take into account serverRouting set to false
            Y.Assert.areEqual(
                this.app.routeUri('editContent', {id: contentId}).replace(this.root + '#'),
                this.app.getPath().replace(this.root),
                "The current path should be the edit content route for the content '" + contentId + "'"
            );
        },

        "Should set a class on the app container when receiving a 'navigationModeChange' event": function () {
            var container = this.app.get('container'),
                testClass = 'test-class';

            this.app.fire('whatever:navigationModeChange', {
                navigation: {
                    modeClass: testClass,
                    value: true
                }
            });

            Y.Assert.isTrue(
                container.hasClass(testClass),
                "The container should have the class '" + testClass + "'"
            );

            this.app.fire('whatever:navigationModeChange', {
                navigation: {
                    modeClass: testClass,
                    value: false
                }
            });
            Y.Assert.isFalse(
                container.hasClass(testClass),
                "The container should not have the class '" + testClass + "'"
            );
        },
    });

    tplTest = new Y.Test.Case({
        name: "runLoader app tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.webRootDir = "/webroot/dir/";
            this.app = new Y.eZ.EditorialApp({
                container: '.app',
                viewContainer: '.view-container',
                assetRoot: this.webRootDir,
                capi: this.capiMock
            });
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
        },

        _assetHelperRegistered: function (name) {
            Y.Assert.isFunction(
                Y.Handlebars.helpers[name],
                "The helper '" + name + "' should be registered"
            );
        },

        "Should register the 'path' helper": function () {
            this._assetHelperRegistered('path');
        },

        "Test 'path' helper": function () {
            var name = 'testRouteName', params = {'id': 1},
                resUri = '#/uri/1/42';

            this.app.routeUri = function (routeName, p) {
                Y.Assert.areSame(
                    routeName, name,
                    "The route name parameter of 'path' should be passed to routeUri"
                );

                Y.Assert.areSame(
                    params, p,
                    "The 'params' parameter of 'path' should be passed to routeUri"
                );
                return resUri;
            };

            Y.Assert.areEqual(
                resUri,
                Y.Handlebars.helpers.path(name, {hash: params}),
                "'path' should return the routeUri result"
            );
        },

        "Should register the 'asset' helper": function () {
            this._assetHelperRegistered('asset');
        },

        "Test 'asset' helper": function () {
            Y.Assert.areEqual(
                this.webRootDir,
                Y.Handlebars.helpers.asset("")
            );

            Y.Assert.areEqual(
                this.webRootDir + "img.png",
                Y.Handlebars.helpers.asset("///img.png"),
                "asset should trim the slashes from the asset URI"
            );

            this.app.set('assetRoot', '/webroot/dir/////');
            Y.Assert.areEqual(
                this.webRootDir + "img.png",
                Y.Handlebars.helpers.asset("img.png"),
                "asset should trim the slashes from the asset root"
            );

            this.app.set('assetRoot', '/webroot/dir');
            Y.Assert.areEqual(
                this.webRootDir + "img.png",
                Y.Handlebars.helpers.asset("img.png"),
                "asset should add the slash"
            );
        },

        "Should register partials found inside the DOM": function () {
            var template = Y.Handlebars.compile('Test partial should be here: {{> ezTestPartial}}');

            Y.Assert.isFunction(template);
            Y.Assert.areEqual(
                "Test partial should be here: I'm a test partial!",
                template()
            );
        },
    });

    runLoaderTest = new Y.Test.Case({
        name: "runLoader app tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.app = new Y.eZ.EditorialApp({
                container: '.app',
                viewContainer: '.view-container',
                capi: this.capiMock
            });
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
        },

        "runLoader should call the next middleware if no loader is defined": function () {
            var url = '/the_killers/sam_s_town',
                test = this,
                next = function () {
                    test.resume(function () {
                        Y.Assert.pass();
                    });
                };

            this.app.route({
                path: url,
                callbacks: ['runLoader', next]
            });
            this.app.navigate(url);
            this.wait();
        },

        "runLoader should call the view loader": function () {
            var url = '/the_killers/the_dustland_fairytale',
                reqStamp = 'A Dustland fairytale beginning',
                respStamp = 'Is there still magic in the midnight sun',
                stampReqResp = function (req, resp, next) {
                    // to make sure the loader receives the correct request and
                    // response
                    req.stamp = reqStamp;
                    resp.stamp = respStamp;
                    next();
                },
                next = function () {
                    Y.Assert.isTrue(this.get('loading'), "The application should be in loading mode");
                },
                ViewLoader, that = this;

            ViewLoader = Y.Base.create('testViewLoader', Y.eZ.ViewLoader, [], {
                load: function (cb) {
                    Y.Assert.areSame(
                        that.capiMock, this.get('capi'),
                        "The view loader should receive the capi"
                    );
                    Y.Assert.isObject(
                        this.get('request'),
                        "The view loader should receive the request"
                    );
                    Y.Assert.areSame(
                        reqStamp, this.get('request').stamp,
                        "The view loader should receive the request"
                    );
                    Y.Assert.isObject(
                        this.get('response'),
                        "The view loader should receive the response"
                    );
                    Y.Assert.areSame(
                        respStamp, this.get('response').stamp,
                        "The view loader should receive the response"
                    );
                    Y.Assert.pass();
                    cb();
                }
            });

            this.app.route({
                path: url,
                loader: ViewLoader,
                callbacks: [stampReqResp, 'runLoader', next]
            });
            this.app.navigate(url);
        },

        "runLoader should catch the view loader error and throw an app fatal error": function () {
            var url = '/the_killers/deadlines_and_commitments',
                errorMsg = 'Late',
                stamps = ['deadlines', 'and', 'commitments'],
                test = this, ViewLoader,
                stampReqRespNext = function (req, resp, next) {
                    // to make sure the fatal error event receives the correct
                    // retry action arguments
                    req.stamp = stamps[0];
                    resp.stamp = stamps[1];
                    next.stamp = stamps[2];
                    next();
                },
                TestErrorViewConstructor = new Y.Base.create('testErrorView', Y.eZ.ErrorView, [], {
                    render: function () {},
                });


            this.app.views.errorView.instance = new TestErrorViewConstructor();

            ViewLoader = Y.Base.create('testViewLoader', Y.eZ.ViewLoader, [], {
                load: function () {
                    this.fire('error', {message: errorMsg});
                }
            });

            this.app.route({
                path: url,
                loader: ViewLoader,
                callbacks: [stampReqRespNext, 'runLoader']
            });
            this.app.on('fatalError', function (e) {
                test.resume(function () {
                    Y.Assert.areSame(
                        e.additionalInfo.errorText, errorMsg,
                        "The fatal error message should be the same as the error message"
                    );

                    Y.Assert.areSame(
                        this.app.runLoader, e.retryAction.run,
                        "The retry action method should be runLoader"
                    );

                    for (var i = 0; i != e.retryAction.args.length; ++i) {
                        Y.Assert.areSame(
                            e.retryAction.args[i].stamp, stamps[i]
                        );
                    }

                    Y.Assert.areSame(
                        e.retryAction.context, this.app,
                        "The retry action context should be set to the app"
                    );
                });
            });
            this.app.navigate(url);
            this.wait();
        },
    });


    sideViewsTest = new Y.Test.Case({
        name: "Side views management",

        setUp: function () {
            this.sideView1Hidden = "is-sideview1-hidden";
            this.sideView2Hidden = "is-sideview2-hidden";
            this.app = new Y.eZ.EditorialApp({
                container: '.app-sideviews',
                viewContainer: '.view-container'
            });
            this.app.sideViews = {
                sideView1: {
                    hideClass: this.sideView1Hidden,
                    type: Y.View,
                    container: '.sideview1'
                },
                sideView2: {
                    hideClass: this.sideView2Hidden,
                    type: Y.View,
                    container: '.sideview2'
                }
            };
        },

        tearDown: function () {
            this.app.destroy();
        },

        "Should hide all the side views using a route without sideViews": function () {
            var container = this.app.get('container'),
                nextCalled = false;

            this.app.handleSideViews({route: {}}, {}, function () {
                nextCalled = true;
            });

            Y.Assert.isTrue(
                container.hasClass(this.sideView1Hidden),
                "The side view 1 should be hidden"
            );
            Y.Assert.isTrue(
                container.hasClass(this.sideView2Hidden),
                "The side view 2 should be hidden"
            );
            Y.Assert.isTrue(nextCalled, "The next callback should have been called");
        },

        "Should hide all the side views using a route with sideViews containing falsy value": function () {
            var container = this.app.get('container'),
                req = {
                    route: {
                        sideViews: {
                            sideView1: 0,
                            sideView2: false,
                        }
                    }
                },
                nextCalled = false;

            this.app.handleSideViews(req, {}, function () {
                nextCalled = true;
            });

            Y.Assert.isTrue(
                container.hasClass(this.sideView1Hidden),
                "The side view 1 should be hidden"
            );
            Y.Assert.isTrue(
                container.hasClass(this.sideView2Hidden),
                "The side view 2 should be hidden"
            );
            Y.Assert.isTrue(nextCalled, "The next callback should have been called");
        },

        "Should show the side views using a route with sideViews": function () {
            var container = this.app.get('container'),
                req = {
                    route: {
                        sideViews: {
                            sideView1: true,
                        }
                    }
                },
                initialized = false, rendered = false, bubble = false,
                nextCalled = false;


            this.app.sideViews.sideView1.type = Y.Base.create('sideView1', Y.View, [], {
                render: function () {
                    rendered = true;
                    this.get('container').setHTML(this.name);
                    return this;
                },

                initializer: function () {
                    initialized = true;
                },
            });

            this.app.on('sideView1:testEvent', function () {
                bubble = true;
            });

            this.app.handleSideViews(req, {}, function () {
                nextCalled = true;
            });
            this.app.sideViews.sideView1.instance.fire('testEvent');
            Y.Assert.isFalse(
                container.hasClass(this.sideView1Hidden),
                "The side view 1 should be hidden"
            );

            Y.Assert.isTrue(
                container.hasClass(this.sideView2Hidden),
                "The side view 2 should be hidden"
            );

            Y.Assert.isTrue(initialized, "The side view should have been build");
            Y.Assert.isTrue(rendered, "The side view should have been rendered");
            Y.Assert.isTrue(
                this.app.sideViews.sideView1.instance.get('active'),
                "The side view 'active' attribute should been set to 'true'"
            );
            Y.Assert.isTrue(bubble, "The event from the side view should bubble to the app");
            Y.Assert.isTrue(nextCalled, "The next callback should have been called");
            Y.Assert.isTrue(
                Y.one(this.app.sideViews.sideView1.container).contains(
                    this.app.sideViews.sideView1.instance.get('container')
                )
            );
        },

        "Should reuse the same instance of a sideview": function () {
            var container = this.app.get('container'),
                req = {
                    route: {
                        sideViews: {
                            sideView1: true,
                        }
                    }
                },
                initialized = 0, rendered = 0, bubble = 0,
                activeSet = 0, nextCalls = 0;


            this.app.sideViews.sideView1.type = Y.Base.create('sideView1', Y.View, [], {
                render: function () {
                    rendered++;
                    this.get('container').setHTML(this.name);
                    return this;
                },

                initializer: function () {
                    initialized++;
                    this.after('activeChange', function (e) {
                        if ( e.newVal ) {
                            activeSet++;
                        }
                    });
                },
            });

            this.app.on('sideView1:testEvent', function () {
                bubble = true;
            });

            this.app.handleSideViews(req, {}, function () {
                nextCalls++;
            });
            this.app.handleSideViews({route: {}}, {}, function () {});
            this.app.handleSideViews(req, {}, function () {
                nextCalls++;
            });

            this.app.sideViews.sideView1.instance.fire('testEvent');
            Y.Assert.isFalse(
                container.hasClass(this.sideView1Hidden),
                "The side view 1 should be hidden"
            );

            Y.Assert.isTrue(
                container.hasClass(this.sideView2Hidden),
                "The side view 2 should be hidden"
            );

            Y.Assert.isTrue(initialized === 1, "The side view should have been build one time");
            Y.Assert.isTrue(rendered === 1, "The side view should have been rendered one time");
            Y.Assert.isTrue(activeSet === 2, "The active flag should have been set two times " + activeSet);
            Y.Assert.isTrue(bubble, "The event from the side view should bubble to the app");
            Y.Assert.isTrue(nextCalls === 2, "The next callback should have been called two times");
            Y.Assert.isTrue(
                Y.one(this.app.sideViews.sideView1.container).contains(
                    this.app.sideViews.sideView1.instance.get('container')
                )
            );
        },

        "Should remove the side view instance": function () {
            var req = {
                    route: {
                        sideViews: {
                            sideView1: true,
                        }
                    }
                },
                removed = false, nextCalled = false;


            this.app.sideViews.sideView1.type = Y.Base.create('sideView1', Y.View, [], {
                remove: function () {
                    removed = true;
                }
            });

            this.app.on('sideView1:testEvent', function () {
                Y.Assert.fail("The side view event should not bubble");
            });

            this.app.handleSideViews(req, {}, function () {});
            this.app.handleSideViews({route: {}}, {}, function () {
                nextCalled = true;
            });

            this.app.sideViews.sideView1.instance.fire('testEvent');
            Y.Assert.isTrue(removed, "The side view should have been removed");
            Y.Assert.isTrue(nextCalled, "The next callback should have been called");
        },
    });

    reverseRoutingTest = new Y.Test.Case({
        name: "eZ Editorial App reverse routing tests",

        setUp: function () {
            var routes = [
                {path: '/simple', name: "simple"},
                {path: '/noname'},
                {path: '/:param', name: "oneParam"},
                {path: '/:param/:PARAM2', name: "twoParams"},
                {path: '/sTr1ng/:param/m1X3d/:PARAM2', name: "complex"},
            ];
            this.root = '/this/is/the/root/';
            this.app = new Y.eZ.EditorialApp({
                root: this.root,
                container: '.app',
                viewContainer: '.view-container'
            });
            Y.Array.each(routes, function (route) {
                reverseRoutingTest.app.route(route, function () {});
            });
        },

        tearDown: function () {
            this.app.destroy();
        },

        _testRoute: function (routeName, params, expected, msg) {
            Y.Assert.areSame(expected, this.app.routeUri(routeName, params), msg);
        },

        "Route does not exist": function () {
            this._testRoute(
                "do not exist", {}, null,
                "The URI of an inexistent route should be null"
            );
        },

        "Route without parameter": function () {
            this._testRoute(
                "simple", {not: "used"}, this.root + "#/simple",
                "The route path should be left intact"
            );
        },

        "Route with one parameter only and a matching parameters": function () {
            this._testRoute(
                "oneParam", {param: "repl aced"}, this.root + "#/repl%20aced",
                "The parameter should be replaced by the correct value"
            );
        },

        "Route with one parameter only and no matching parameter": function () {
            this._testRoute(
                "oneParam", {doesnotmatch: "repl aced"}, this.root + "#/",
                "The parameter should just be removed"
            );
        },

        "Route with 2 parameters only and 2 matching parameters": function () {
            this._testRoute(
                "twoParams", {param: "repl aced", PARAM2: "ag ain"}, this.root + "#/repl%20aced/ag%20ain",
                "The parameters should be replaced by the correct value"
            );
        },

        "Route with 2 parameters only and 1 matching parameter": function () {
            this._testRoute(
                "twoParams", {param: "repl aced", not: "again"}, this.root + "#/repl%20aced/",
                "The parameter should be replaced by the correct value and the other not matching by an empty string"
            );
        },

        "Route with 2 parameters only and no matching parameter": function () {
            this._testRoute(
                "twoParams", {}, this.root + "#//",
                "The parameters should be removed"
            );
        },

        "Complex route with 2 parameters only and 2 matching parameters": function () {
            this._testRoute(
                "complex", {param: "repl aced", PARAM2: "ag ain"}, this.root + "#/sTr1ng/repl%20aced/m1X3d/ag%20ain",
                "The parameters should be replaced by the correct value"
            );
        },

        "Complex route with 2 parameters only and 1 matching parameter": function () {
            this._testRoute(
                "complex", {param: "repl aced", not: "again"}, this.root + "#/sTr1ng/repl%20aced/m1X3d/",
                "The parameter should be replaced by the correct value and the other not matching by an empty string"
            );
        },

        "Complex route with 2 parameters only and no matching parameter": function () {
            this._testRoute(
                "complex", {}, this.root + "#/sTr1ng//m1X3d/",
                "The parameters should be removed"
            );
        },
    });

    Y.Test.Runner.setName("eZ Editorial App tests");
    Y.Test.Runner.add(appTest);
    Y.Test.Runner.add(tplTest);
    Y.Test.Runner.add(runLoaderTest);
    Y.Test.Runner.add(sideViewsTest);
    Y.Test.Runner.add(reverseRoutingTest);

}, '0.0.1', {requires: ['test', 'ez-editorialapp', 'ez-viewloader']});

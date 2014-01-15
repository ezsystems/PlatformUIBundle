YUI.add('ez-editorialapp-tests', function (Y) {
    var app, appTest, reverseRoutingTest, sideViewsTest,
        capiMock,
        container = Y.one('.app'),
        mockActionBar = {};

    mockActionBar.handleHeightUpdate = function () {};

    capiMock = new Y.Mock();
    app = new Y.eZ.EditorialApp({
        container: '.app',
        viewContainer: '.view-container',
        capi: capiMock
    });
    app.render();

    appTest = new Y.Test.Case({
        name: "eZ Editorial App tests",

        "Should open the application": function () {
            var nextCalled = false,
                 docHeight = container.get('docHeight');

            app.open({}, {}, function () {
                nextCalled = true;
            });

            Y.assert(nextCalled, "Next middleware should have been called");
            Y.assert(
                container.hasClass('is-app-open'),
                "The app container should have the class is-app-open"
            );
            Y.Assert.areEqual(
                app.get('viewContainer').getStyle('height').replace('px', ''),
                docHeight,
                "The view container should have the same height as the document"
            );
        },

        "Should close the application": function () {
            var errorViewHidden = false,
                TestErrorViewConstructor = new Y.Base.create('testErrorView', Y.View, [], {
                    hide: function () {
                        errorViewHidden = true;
                    }
                });
            app.views.errorView.instance = new TestErrorViewConstructor();

            app.close();

            Y.assert(
                !container.hasClass('is-app-open'),
                "The app container should not have the class is-app-open"
            );
            Y.assert(
                errorViewHidden,
                "The error view should have been hidden"
            );
        },

        "Should open again the application": function () {
            this["Should open the application"]();
        },

        "Should close again the application": function () {
            this["Should close the application"]();
        },

        "Should go back in the history when contentEditView:closeView event is fired": function () {
            var origBack = Y.config.win.history.back, backCalled = false;

            app.open();

            Y.config.win.history.back = function () {
                backCalled = true;
            };

            app.fire('contentEditView:closeView');

            Y.Assert.isTrue(backCalled, "history.back should have been called");
            Y.config.win.history.back = origBack;
        },

        "Should set/unset the app in loading mode": function () {
            app.set('loading', true);
            Y.assert(
                container.hasClass('is-app-loading'),
                "The application container should get the is-app-loading class"
            );
            app.set('loading', false);
            Y.assert(
                !container.hasClass('is-app-loading'),
                "The application container should not get the is-app-loading class"
            );
        },

        "Navigate event should change the loading attribute": function () {
            app.set('loading', false);
            app.fire('navigate');
            Y.assert(
                app.get('loading'),
                "The application should be in loading mode"
            );
            app.set('loading', false);
        },

        "View change should trigger the activeCallback callback and set loading to false": function () {
            var activeCallbackCalled = false, showViewCallbackCalled = false;

            app.views.simpleView = {
                type: Y.View
            };
            app.views.viewWithCallback = {
                type: Y.Base.create('testView', Y.View, [], {
                    activeCallback: function () {
                        activeCallbackCalled = true;
                    }
                })
            };

            app.showView('simpleView', {},
                function () {
                    showViewCallbackCalled = true;
                }
            );
            this.wait(function () {
                Y.Assert.isTrue(
                    showViewCallbackCalled,
                    "The showview callback should have been called"
                );
                Y.Assert.isFalse(app.get('loading'), "The app should not be in loading mode");

                app.set('loading', true);
                app.showView('viewWithCallback');
                this.wait(function () {
                    Y.Assert.isTrue(
                        activeCallbackCalled, "The active callback should have been called"
                    );
                    Y.Assert.isFalse(app.get('loading'), "The app should not be in loading mode");

                    delete app.views.simpleView;
                    delete app.views.viewWithCallback;
                }, 800);

            }, 800);
        },

        "Should show the content edit view": function () {
            var rendered = false, initialized = false,
                req = {}, resp = {};

            resp.variables = {'content': 1, 'contentType': {}, 'mainLocation': {}, 'owner': {}};

            app.views.contentEditView.type = Y.Base.create('testView', Y.View, [], {
                initializer: function () {
                    initialized = true;
                },

                render: function () {
                    rendered = true;
                    Y.Assert.areEqual(
                        this.get('content'), resp.variables.content,
                        "The view attributes should be updated with the result of the loader"
                    );
                }
            }, {
                ATTRS: {
                    actionBar: {
                        value: mockActionBar
                    }
                }

            });

            app.set('loading', true);
            app.handleContentEdit(req, resp);

            Y.assert(initialized, "The content edit view should have been initialized");
            Y.assert(rendered, "The content edit view should have been rendered");

            rendered = false;
            resp.variables.content++;
            app.set('loading', true);
            app.handleContentEdit(req, resp);

            Y.assert(rendered, "The content edit view should have been rerendered");
        },

        "Should show the location view": function () {
            var rendered = false, initialized = false,
                req = {}, resp = {};

            resp.variables = {'content': 1, 'path': [], 'location': {}};

            app.views.locationViewView.type = Y.Base.create('testView', Y.View, [], {
                initializer: function () {
                    initialized = true;
                },

                render: function () {
                    rendered = true;
                    Y.Assert.areEqual(
                        this.get('content'), resp.variables.content,
                        "The view attributes should be updated with the result of the loader"
                    );
                }
            });

            app.set('loading', true);
            app.handleLocationView(req, resp);

            Y.assert(initialized, "The location view view should have been initialized");
            Y.assert(rendered, "The location view should have been rendered");

            rendered = false;
            resp.variables.content++;
            app.set('loading', true);
            app.handleLocationView(req, resp);

            Y.assert(rendered, "The location view view should have been rerendered");
        },

        "Should show the error view, when catching 'fatalError' event": function () {
            var rendered = false, initialized = false, activeCallbackCalled = false,
                errorInfo = {'retryAction:': {}, 'additionalInfo': 1},
                originalErroView,
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

                    activeCallback: function () {
                        activeCallbackCalled = true;
                    }
                });

            originalErroView = app.views.errorView.instance;
            app.views.errorView.instance = new TestErrorViewConstructor();

            app.fire('contentEditView:fatalError', errorInfo);

            Y.assert(initialized, "The error view should have been initialized");
            Y.assert(rendered, "The error view should have been rendered");
            Y.assert(!app.get('loading'), "The app should not be in loading mode");
            Y.assert(activeCallbackCalled, "The error view should have input focus");

            app.views.errorView.instance = originalErroView;
        },

        "Should receive 'retryAction' event fired on the errorView": function () {
            var retryActionReceived = false;

            // We have to reinitialize the App, so our previous changes to app.views.errorView.instance will not have effect
            app = new Y.eZ.EditorialApp({
                container: '.app',
                viewContainer: '.view-container',
                capi: capiMock
            });
            app.render();

            app.on('errorView:retryAction', function (retryAction) {
                retryActionReceived = true;
            });

            app.views.errorView.instance.fire('retryAction',{
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

            app.fire('whatever:retryAction', {
                run: retryMe,
                args: [testArgumentInput1, testArgumentInput2],
                context: makeMeTheContext
            });

            Y.assert(
                actionRetried,
                "Test action should have been retried"
            );
        },

        "runLoader should call the next middleware if no loader is defined": function () {
            var url = '/the_killers/sam_s_town',
                test = this,
                next = function () {
                    test.resume(function () {
                        Y.Assert.pass();
                    });
                };

            app.route({
                path: url,
                callbacks: ['runLoader', next]
            });
            app.navigate(url);
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
                ViewLoader;

            ViewLoader = Y.Base.create('testViewLoader', Y.eZ.ViewLoader, [], {
                load: function (cb) {
                    Y.Assert.areSame(
                        capiMock, this.get('capi'),
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

            app.route({
                path: url,
                loader: ViewLoader,
                callbacks: [stampReqResp, 'runLoader', next]
            });
            app.navigate(url);
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
                    activeCallback: function () {}
                });


            app.views.errorView.instance = new TestErrorViewConstructor();

            ViewLoader = Y.Base.create('testViewLoader', Y.eZ.ViewLoader, [], {
                load: function () {
                    this.fire('error', {message: errorMsg});
                }
            });

            app.route({
                path: url,
                loader: ViewLoader,
                callbacks: [stampReqRespNext, 'runLoader']
            });
            app.on('fatalError', function (e) {
                test.resume(function () {
                    Y.Assert.areSame(
                        e.additionalInfo.errorText, errorMsg,
                        "The fatal error message should be the same as the error message"
                    );

                    Y.Assert.areSame(
                        app.runLoader, e.retryAction.run,
                        "The retry action method should be runLoader"
                    );

                    for (var i = 0; i != e.retryAction.args.length; ++i) {
                        Y.Assert.areSame(
                            e.retryAction.args[i].stamp, stamps[i]
                        );
                    }

                    Y.Assert.areSame(
                        e.retryAction.context, app,
                        "The retry action context should be set to the app"
                    );
                });
            });
            app.navigate(url);
            this.wait();
        },

        "Should register partials found inside the DOM": function () {
            var template = Y.Handlebars.compile('Test partial should be here: {{> ezTestPartial}}');

            Y.Assert.isFunction(template);
            Y.Assert.areEqual(
                "Test partial should be here: I'm a test partial!",
                template()
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

            app.fire('whatever:editAction', {content: contentMock});
            Y.Assert.areEqual(
                app.routeUri('editContent', {id: contentId}), app.getPath(),
                "The current path should be the edit content route for the content '" + contentId + "'"
            );
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
                activeCallbackCalled = false, nextCalled = false;


            this.app.sideViews.sideView1.type = Y.Base.create('sideView1', Y.View, [], {
                render: function () {
                    rendered = true;
                    this.get('container').setHTML(this.name);
                    return this;
                },

                initializer: function () {
                    initialized = true;
                },

                activeCallback: function () {
                    activeCallbackCalled = true;
                }
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
            Y.Assert.isTrue(activeCallbackCalled, "The active callback should have been called");
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
                activeCallbackCalled = 0, nextCalls = 0;


            this.app.sideViews.sideView1.type = Y.Base.create('sideView1', Y.View, [], {
                render: function () {
                    rendered++;
                    this.get('container').setHTML(this.name);
                    return this;
                },

                initializer: function () {
                    initialized++;
                },

                activeCallback: function () {
                    activeCallbackCalled++;
                }
            });

            this.app.on('sideView1:testEvent', function () {
                bubble = true;
            });

            this.app.handleSideViews(req, {}, function () {
                nextCalls++;
            });
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
            Y.Assert.isTrue(activeCallbackCalled === 2, "The active callback should have been called two times");
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
            this.app = new Y.eZ.EditorialApp({
                container: '.app',
                viewContainer: '.view-container',
                capi: capiMock
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
                "simple", {not: "used"}, "/simple",
                "The route path should be left intact"
            );
        },

        "Route with one parameter only and a matching parameters": function () {
            this._testRoute(
                "oneParam", {param: "repl aced"}, "/repl%20aced",
                "The parameter should be replaced by the correct value"
            );
        },

        "Route with one parameter only and no matching parameter": function () {
            this._testRoute(
                "oneParam", {doesnotmatch: "repl aced"}, "/",
                "The parameter should just be removed"
            );
        },

        "Route with 2 parameters only and 2 matching parameters": function () {
            this._testRoute(
                "twoParams", {param: "repl aced", PARAM2: "ag ain"}, "/repl%20aced/ag%20ain",
                "The parameters should be replaced by the correct value"
            );
        },

        "Route with 2 parameters only and 1 matching parameter": function () {
            this._testRoute(
                "twoParams", {param: "repl aced", not: "again"}, "/repl%20aced/",
                "The parameter should be replaced by the correct value and the other not matching by an empty string"
            );
        },

        "Route with 2 parameters only and no matching parameter": function () {
            this._testRoute(
                "twoParams", {}, "//",
                "The parameters should be removed"
            );
        },

        "Complex route with 2 parameters only and 2 matching parameters": function () {
            this._testRoute(
                "complex", {param: "repl aced", PARAM2: "ag ain"}, "/sTr1ng/repl%20aced/m1X3d/ag%20ain",
                "The parameters should be replaced by the correct value"
            );
        },

        "Complex route with 2 parameters only and 1 matching parameter": function () {
            this._testRoute(
                "complex", {param: "repl aced", not: "again"}, "/sTr1ng/repl%20aced/m1X3d/",
                "The parameter should be replaced by the correct value and the other not matching by an empty string"
            );
        },

        "Complex route with 2 parameters only and no matching parameter": function () {
            this._testRoute(
                "complex", {}, "/sTr1ng//m1X3d/",
                "The parameters should be removed"
            );
        },
    });

    Y.Test.Runner.setName("eZ Editorial App tests");
    Y.Test.Runner.add(appTest);
    Y.Test.Runner.add(sideViewsTest);
    Y.Test.Runner.add(reverseRoutingTest);

}, '0.0.1', {requires: ['test', 'ez-editorialapp', 'json', 'parallel']});

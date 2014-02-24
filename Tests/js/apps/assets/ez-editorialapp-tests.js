YUI.add('ez-editorialapp-tests', function (Y) {
    var appTest, reverseRoutingTest, sideViewsTest,
        handleMainViewTest, tplTest, titleTest;

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

    titleTest = new Y.Test.Case({
        name: "Title tests",

        setUp: function () {
            this.initialTitle = Y.config.doc.title;

            this.app = new Y.eZ.EditorialApp({
                container: '.app',
                viewContainer: '.view-container'
            });
        },

        tearDown: function () {
            Y.config.doc.title = this.initialTitle;
        },

        "Should set the title with the title returned by the active view": function () {
            var viewTitle = 'awesome view title', that = this;

            this.app.views.testTitleView = {
                type: Y.Base.create('testTitleView', Y.View, [], {
                    getTitle: function () {
                        return viewTitle;
                    }
                })
            };
            this.app.showView('testTitleView', {}, function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        viewTitle + ' - ' + this.initialTitle,
                        Y.config.doc.title,
                        "The title of the page should be build with the view title and the initial page title"
                    );
                });
            });
            this.wait();
        },

        "Should restore the initial page title if the view does not implement getTitle": function () {
            var that = this;

            Y.config.doc.title = 'Changed title!';
            this.app.views.testNoTitleView = {
                type: Y.View
            };
            this.app.showView('testNoTitleView', {}, function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        this.initialTitle,
                        Y.config.doc.title,
                        "The title of the page should be build with the view title and the initial page title"
                    );
                });
            });
            this.wait();
        },
    });

    tplTest = new Y.Test.Case({
        name: "Handlebars app tests",

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

    handleMainViewTest = new Y.Test.Case({
        name: "handleMainView app tests",

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

        "Should show the view without a defined view service": function () {
            var req = {route: {view: 'testView'}},
                rendered = false;

            this.app.views.testView = {
                type: Y.Base.create('testView', Y.View, [], {
                    render: function () {
                        rendered = true;
                        return this;
                    }
                })
            };

            this.app.handleMainView(req);
            Y.Assert.isTrue(rendered, "The view should be rendered");

            rendered = false;
            this.app.handleMainView(req);
            Y.Assert.isTrue(rendered, "The view should be rerendered");
        },

        "Should show the view after using the view service": function () {
            var rendered = false,
                serviceInit = false, serviceLoad = false,
                viewParameters = {'myVar': 1},
                test = this,
                TestService = Y.Base.create('testService', Y.eZ.ViewService, [], {
                    initializer: function () {
                        Y.Assert.areSame(
                            test.capiMock, this.get('capi'),
                            "The CAPI should be passed to the service"
                        );
                        Y.Assert.areSame(
                            test.app, this.get('app'),
                            "The app should be passed to the service"
                        );
                        Y.Assert.areSame(
                            req, this.get('request'),
                            "The request object should be passed to the service"
                        );
                        Y.Assert.areSame(
                            res, this.get('response'),
                            "The response object should be passed to the service"
                        );
                        serviceInit = true;
                    },

                    load: function (callback) {
                        serviceLoad = true;
                        callback(this);
                    },

                    getViewParameters: function () {
                        return viewParameters;
                    }
                }),
                req = {
                    route: {
                        view: 'myView',
                        service: TestService,
                    },
                },
                res = {};

            this.app.views.myView = {
                type: Y.Base.create('myView', Y.View, [], {
                    render: function () {
                        rendered = true;
                        Y.Assert.areEqual(
                            this.get('myVar'), viewParameters.myVar,
                            "The view attributes should be updated with the result of the loader"
                        );
                    }
                })
            };

            this.app.handleMainView(req, res);

            Y.Assert.isTrue(rendered, "The view should have been rendered");
            Y.Assert.isTrue(serviceInit, "The service should have been created");
            Y.Assert.isTrue(serviceLoad, "The service load method should been called");
        },

        "With a service, the view events should bubble to the app through the service": function () {
            var TestService = Y.Base.create('testService', Y.eZ.ViewService, [], {
                    initializer: function () {
                        this.on('*:testEvent', function (e) {
                            bubbleService = true;
                        });
                    }
                }),
                req = {
                    route: {
                        view: 'myView',
                        service: TestService,
                    },
                },
                bubbleApp = false, bubbleService = false,
                test = this;

            this.app.on('*:testEvent', function (e) {
                bubbleApp = true;
            });
            this.app.views.myView = {
                type: Y.eZ.View
            };

            this.app.handleMainView(req, {}, function () {
                test.resume(function () {
                    test.app.get('activeView').fire('testEvent');
                    Y.Assert.isTrue(bubbleService, "The service should have received the view event");
                    Y.Assert.isTrue(bubbleApp, "The app should have received the view event");
                });
            });
            this.wait();
        },

        "Should reuse the view service if available": function () {
            var serviceInit = 0, serviceLoad = 0,
                updatedRequest = false, updatedResponse = false,
                TestService = Y.Base.create('testService', Y.eZ.ViewService, [], {
                    initializer: function (){
                        serviceInit++;
                        this.on('responseChange', function () { updatedResponse = true; });
                        this.on('requestChange', function () { updatedRequest = true; });
                    },
                    load: function(cb) { serviceLoad++; cb(this); }
                }),
                req = {
                    route: {
                        view: 'myView',
                        service: TestService,
                    },
                },
                test = this;

            this.app.views.myView = {
                type: Y.eZ.View
            };

            this.app.handleMainView(req, {}, function () {
                test.resume(function () {
                    this.app.handleMainView(req, {}, function () {
                        test.resume(function () {
                            Y.Assert.areEqual(
                                1, serviceInit,
                                "The service should have been build once"
                            );
                            Y.Assert.areEqual(
                                2, serviceLoad,
                                "load should have been called twice"
                            );
                            Y.Assert.isTrue(
                                updatedRequest,
                                "The request should have been updated"
                            );
                            Y.Assert.isTrue(
                                updatedResponse,
                                "The response should have been updated"
                            );
                        });
                    });
                    test.wait();
                });
            });
            this.wait();
        },

        "Should catch the view service error and throw an app fatal error": function () {
            var msg = 'test message',
                fatalErrorTriggered = false,
                TestService = Y.Base.create('testService', Y.eZ.ViewService, [], {
                    load: function (callback) {
                        this.fire('error', {message: msg});
                    }
                }),
                next = function () { },
                req = {route: {service: TestService, view: 'testView'}},
                res = {};

            this.app.views.errorView.instance.destroy();
            this.app.views.testView = {
                type: Y.View
            };
            this.app.on('fatalError', function (e) {
                fatalErrorTriggered = true;
                Y.Assert.areSame(
                    e.additionalInfo.errorText, msg,
                    "The fatal error message should be the same as the error message"
                );

                Y.Assert.areSame(
                    this.handleMainView, e.retryAction.run,
                    "The retry action method should be runLoader"
                );

                Y.Assert.areSame(
                    req, e.retryAction.args[0],
                    "The request should be passed in the error facade"
                );
                Y.Assert.areSame(
                    res, e.retryAction.args[1],
                    "The response should be passed in the error facade"
                );
                Y.Assert.areSame(
                    next, e.retryAction.args[2],
                    "The next callback should be passed in the error facade"
                );

                Y.Assert.areSame(
                    this, e.retryAction.context,
                    "The retry action context should be set to the app"
                );
            });
            this.app.handleMainView(req, res, next);
            Y.Assert.isTrue(fatalErrorTriggered, "A fatal error should have been triggered");
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
    Y.Test.Runner.add(titleTest);
    Y.Test.Runner.add(tplTest);
    Y.Test.Runner.add(handleMainViewTest);
    Y.Test.Runner.add(sideViewsTest);
    Y.Test.Runner.add(reverseRoutingTest);

}, '0.0.1', {requires: ['test', 'ez-editorialapp', 'ez-viewservice']});

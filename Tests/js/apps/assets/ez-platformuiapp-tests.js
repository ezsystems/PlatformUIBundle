/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-platformuiapp-tests', function (Y) {
    var appTest, reverseRoutingTest, sideViewsTest, sideViewServicesTest,
        loginTest, logoutTest, isLoggedInTest, checkUserTest,
        showSideViewTest, hideSideViewTest,
        handleMainViewTest, titleTest, configRouteTest,
        dispatchConfigTest,
        Assert = Y.Assert, Mock = Y.Mock;

    appTest = new Y.Test.Case({
        name: "eZ Platform UI App tests",

        setUp: function () {
            this.root = '/ez';
            this.app = new Y.eZ.PlatformUIApp({
                container: '.app',
                viewContainer: '.view-container',
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

        'Should call setNextViewServiceParameters() when changing the active view service': function () {
            var firstService = new Y.Test.Mock(),
                secondService = new Y.Test.Mock();

            Y.Mock.expect(firstService, {
                method: 'setNextViewServiceParameters',
                args: [secondService]
            });

            this.app._set('activeViewService', firstService);
            this.app._set('activeViewService', secondService);

            Y.Mock.verify(firstService);
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
    });

    titleTest = new Y.Test.Case({
        name: "Title tests",

        setUp: function () {
            this.initialTitle = Y.config.doc.title;

            this.app = new Y.eZ.PlatformUIApp({
                container: '.app',
                viewContainer: '.view-container'
            });
        },

        tearDown: function () {
            Y.config.doc.title = this.initialTitle;
            this.app.destroy();
            delete this.app;
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

    handleMainViewTest = new Y.Test.Case({
        name: "handleMainView app tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.app = new Y.eZ.PlatformUIApp({
                container: '.app',
                viewContainer: '.view-container',
            });
            this.app._set('capi', this.capiMock);
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

        "Should show the view after using the view service with config": function () {
            var rendered = false,
                serviceInit = false, serviceLoad = false,
                viewParameters = {'myVar': 1},
                test = this,
                appConf = {countriesInfo: {}},
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
                        Y.Assert.areSame(
                            appConf,
                            this.get('config'),
                            'The view service should receive the config from the app'
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

            this.app._set('config', appConf);
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
                bubbleApp = false, bubbleService = false;

            this.app.on('*:testEvent', function (e) {
                bubbleApp = true;
            });
            this.app.views.myView = {
                type: Y.eZ.View
            };

            this.app.after('activeViewChange', function () {
                this.get('activeView').fire('testEvent');
                Y.Assert.isTrue(bubbleService, "The service should have received the view event");
                Y.Assert.isTrue(bubbleApp, "The app should have received the view event");

            });


            this.app.handleMainView(req, {});
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
                    load: function(cb) {
                        serviceLoad++;
                        cb(this);
                    }
                }),
                req = {
                    route: {
                        view: 'myView',
                        service: TestService,
                        serviceInstance: new TestService(),
                    },
                };

            this.app.views.myView = {
                type: Y.eZ.View,
            };

            this.app.after('activeViewChange', function () {
                Y.Assert.areEqual(
                    1, serviceInit,
                    "The service should have been build once"
                );
                Y.Assert.areEqual(
                    1, serviceLoad,
                    "load should have been called"
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

            this.app.handleMainView(req, {});
        },

        "Should catch the view service error and fire an app notification": function () {
            var msg = 'test message',
                notificationIdentifier = "ViewService-notification-error",
                notified = false,
                TestService = Y.Base.create('testService', Y.eZ.ViewService, [], {
                    load: function (callback) {
                        this.fire('error', {message: msg});
                    }
                }),
                next = function () { },
                req = {route: {service: TestService, view: 'testView'}},
                res = {};

            this.app.views.testView = {
                type: Y.View
            };
            this.app.on('notify', function (e) {
                notified = true;
                Y.Assert.areSame(
                    e.notification.text,
                    msg,
                    'The notification text should match the error message'
                );
                Y.Assert.areSame(
                    e.notification.identifier,
                    notificationIdentifier,
                    'The notification identifier should be correct'
                );
                Y.Assert.areSame(
                    e.notification.state,
                    "error",
                    'The notification state should be "error"'
                );
                Y.Assert.areSame(
                    e.notification.timeout,
                    0,
                    'The notification timeout should be 0'
                );

            });
            this.app.handleMainView(req, res, next);
            Y.Assert.isTrue(notified, "A fatal error should have been triggered");
            Y.assert(!this.app.get('loading'), "The app should not be in loading mode");
        },

        "Should catch the view service error and not fire an empty app notification": function () {
            var TestService = Y.Base.create('testService', Y.eZ.ViewService, [], {
                    load: function (callback) {
                        this.fire('error', {message: ""});
                    }
                }),
                next = function () { },
                req = {route: {service: TestService, view: 'testView'}},
                res = {};

            this.app.views.testView = {
                type: Y.View
            };
            this.app.on('notify', function (e) {
                Y.Assert.fail("The user should not be notified with an empty message");
            });
            this.app.handleMainView(req, res, next);
            Y.assert(!this.app.get('loading'), "The app should not be in loading mode");
        },


        "Should inject the registered plugin in the view service": function () {
            var serviceName = 'testService', pluginNS = 'mainViewPluginNS',
                TestService = Y.Base.create(serviceName, Y.eZ.ViewService, [], {}),
                req = {
                    route: {
                        view: 'myView',
                        service: TestService,
                    },
                };

            Y.eZ.PluginRegistry.registerPlugin(
                Y.Base.create(pluginNS, Y.eZ.Plugin.ViewServiceBase, [], {}, {
                    NS: pluginNS
                }), [serviceName]
            );
            this.app.views.myView = {
                type: Y.eZ.View
            };

            this.app.handleMainView(req, {});

            Y.Assert.isObject(
                this.app.getViewInfo(req.route.view).service.hasPlugin(pluginNS),
                "The service should get the registered plugin"
            );
            Y.eZ.PluginRegistry.reset();
        },
    });

    showSideViewTest = new Y.Test.Case({
        name: "showSideView test",

        setUp: function () {
            this.app = new Y.eZ.PlatformUIApp({
                container: '.app-sideviews',
                viewContainer: '.view-container'
            });

            this.app.sideViews = {
                sideView1: {
                    hideClass: 'sideview1-hidden',
                    type: Y.View,
                    service: Y.eZ.ViewService,
                    container: '.sideview1'
                },
            };
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
        },

        "Should show the side view": function () {
            var parameters = {some: "parameters"};

            this.app.set('config', {});
            this.app.showSideView("sideView1", parameters);
            Assert.isFalse(
                this.app.get('container').hasClass(this.app.sideViews.sideView1.hideClass),
                "The side view should not be hidden"
            );
            Assert.areSame(
                parameters.some, this.app.sideViews.sideView1.serviceInstance.get('parameters').some,
                "The parameters should be passed to the view service"
            );
            Assert.isNull(
                this.app.sideViews.sideView1.serviceInstance.get('request'),
                "The request should be null"
            );
            Assert.isNull(
                this.app.sideViews.sideView1.serviceInstance.get('response'),
                "The response should be null"
            );
            Assert.areSame(
                this.app.get('config'),
                this.app.sideViews.sideView1.serviceInstance.get('config'),
                "The app config should be given to the view service"
            );
        },

        "Should catch the side view error service and fire a notification": function () {
            var notified = false,
                serviceName = 'MI5',
                msg = 'GodSaveTheQueen';
            this.app.sideViews = {
                sideView1: {
                    hideClass: 'sideview1-hidden',
                    type: Y.View,
                    service: Y.Base.create(serviceName, Y.eZ.ViewService, [], {
                        load: function (callback) {
                            this.fire('error', {message: msg});
                        }
                    }),
                    container: '.sideview1'
                },
            };

            this.app.on('notify', function (e) {
                notified = true;
                Y.Assert.areSame(
                    e.notification.text,
                    msg,
                    'The notification text should match the error message'
                );
                Y.Assert.areSame(
                    e.notification.identifier,
                    'notification-' + serviceName,
                    'The notification identifier should be correct'
                );
                Y.Assert.areSame(
                    e.notification.state,
                    "error",
                    'The notification state should be "error"'
                );
                Y.Assert.areSame(
                    e.notification.timeout,
                    0,
                    'The notification timeout should be 0'
                );
            });

            this.app.showSideView("sideView1");
            Y.Assert.isTrue(notified, "A fatal error should have been triggered");
        },

        "Should show the side view (activeViewService is set)": function () {
            var parameters = {some: "parameters"},
                response = {},
                request = {},
                viewService = new Y.eZ.ViewService({
                    response: response,
                    request: request,
                });

            this.app.set('config', {});
            this.app._set('activeViewService', viewService);
            this.app.showSideView("sideView1", parameters);
            Assert.isFalse(
                this.app.get('container').hasClass(this.app.sideViews.sideView1.hideClass),
                "The side view should not be hidden"
            );
            Assert.areSame(
                parameters.some, this.app.sideViews.sideView1.serviceInstance.get('parameters').some,
                "The parameters should be passed to the view service"
            );
            Assert.areSame(
                request,
                this.app.sideViews.sideView1.serviceInstance.get('request'),
                "The request should be provided by the active view service"
            );
            Assert.areSame(
                response,
                this.app.sideViews.sideView1.serviceInstance.get('response'),
                "The response should be provided by the active view service"
            );
            Assert.areSame(
                this.app.get('config'),
                this.app.sideViews.sideView1.serviceInstance.get('config'),
                "The app config should be given to the view service"
            );
        },
    });

    hideSideViewTest = new Y.Test.Case({
        name: "hideSideView test",

        setUp: function () {
            this.app = new Y.eZ.PlatformUIApp({
                container: '.app-sideviews',
                viewContainer: '.view-container'
            });

            this.app.sideViews = {
                sideView1: {
                    hideClass: 'sideview1-hidden',
                    type: Y.View,
                    service: Y.eZ.ViewService,
                    container: '.sideview1'
                },
            };
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
        },

        "Should hide the side view": function () {
            this.app.showSideView("sideView1");
            this.app.hideSideView("sideView1");
            Assert.isTrue(
                this.app.get('container').hasClass(this.app.sideViews.sideView1.hideClass),
                "The side view should be hidden"
            );
        },
    });

    sideViewServicesTest = new Y.Test.Case({
        name: "Side view service test",

        setUp: function () {
            var that = this;

            this.app = new Y.eZ.PlatformUIApp({
                container: '.app-sideviews',
                viewContainer: '.view-container'
            });
            this.load1Calls = 0;
            this.load2Calls = 0;
            this.load1 = function (next) { setTimeout(function () { that.load1Calls++; next(); }, 100); };
            this.load2 = function (next) { setTimeout(function () { that.load2Calls++; next(); }, 50); };
            this.viewParameters1 = {"bike": "Lapierre X-Control 229"};
            this.viewParameters2 = {"bike": "Sunn Xicrcuit"};
            this.viewService1 = 'viewService1';
            this.pluginNS = 'testPlugin';
            Y.eZ.PluginRegistry.registerPlugin(
                Y.Base.create(this.pluginNS, Y.eZ.Plugin.ViewServiceBase, [], {}, {
                    NS: this.pluginNS,
                }), [this.viewService1]
            );
            this.app.sideViews = {
                sideView1: {
                    hideClass: 'sideview1-hidden',
                    type: Y.Base.create('view1', Y.View, [], {
                    }),
                    service: Y.Base.create(that.viewService1, Y.eZ.ViewService, [], {
                        load: that.load1,
                        getViewParameters: function () {
                            return that.viewParameters1;
                        }
                    }),
                    container: '.sideview1'
                },
                sideView2: {
                    hideClass: 'sideview2-hidden',
                    type: Y.Base.create('view2', Y.View, [], {
                    }),
                    service: Y.Base.create('viewService2', Y.eZ.ViewService, [], {
                        load: that.load2,
                        getViewParameters: function () {
                            return that.viewParameters2;
                        }
                    }),
                    container: '.sideview2'
                }
            };
        },

        tearDown: function () {
            this.app.destroy();
            Y.eZ.PluginRegistry.reset();
        },

        "Should instantiate the view service associated with the view": function () {
            var that = this,
                request, response = {};

            request = {
                route: {
                    sideViews: {
                        "sideView1": true,
                        "sideView2": false,
                    }
                }
            };

            this.app.handleSideViews(request, response, function () {
                that.resume(function () {
                    var service = this.app.sideViews.sideView1.serviceInstance,
                        view = this.app.sideViews.sideView1.instance;

                    Y.Assert.isInstanceOf(
                        this.app.sideViews.sideView1.service,
                        service,
                        "The service instance should be kept"
                    );
                    Y.Assert.isUndefined(
                        this.app.sideViews.sideView2.serviceInstance,
                        "The service 2 should not be instantiated"
                    );

                    Y.Assert.areEqual(
                        1, this.load1Calls, "service 1 load should have been called once"
                    );
                    Y.Assert.areEqual(
                        0, this.load2Calls, "service 2 load should not have been called"
                    );

                    Y.Assert.areEqual(
                        view.get('bike'),
                        this.viewParameters1.bike,
                        "The side view should receive the view parameters from its service"
                    );
                    Y.Assert.isTrue(
                        view.getTargets().indexOf(service) !== -1,
                        "The service should be a bubble target of the view"
                    );
                });
            });
            this.wait();
        },

        "Should inject the registered plugins into services": function () {
            var that = this,
                request, response = {};

            request = {
                route: {
                    sideViews: {
                        "sideView1": true,
                        "sideView2": false,
                    }
                }
            };

            this.app.handleSideViews(request, response, function () {
                that.resume(function () {
                    var service = this.app.sideViews.sideView1.serviceInstance;

                    Y.Assert.isObject(
                        service.hasPlugin(this.pluginNS),
                        "The service should get the registered plugins"
                    );
                });
            });
            this.wait();
        },

        "Should call next after all service load are finished": function () {
            var that = this,
                request, response = {};

            request = {
                route: {
                    sideViews: {
                        "sideView1": true,
                        "sideView2": true,
                    }
                }
            };

            this.app.handleSideViews(request, response, function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        1, this.load1Calls, "service 1 load should have been called once"
                    );
                    Y.Assert.areEqual(
                        1, this.load2Calls, "service 2 load should have been called once"
                    );
                });
            });
            this.wait();
        },

        "Should remove the app from the bubble target of the service": function () {
            var that = this,
                request, response = {}, request2;

            request = {
                route: {
                    sideViews: {
                        "sideView1": true,
                        "sideView2": true,
                    }
                }
            };
            request2 = {
                route: {
                    sideViews: {
                        "sideView1": true,
                        "sideView2": false,
                    }
                }
            };

            this.app.handleSideViews(request, response, function () {
                that.app.handleSideViews(request2, response, function () {
                    that.resume(function () {
                        var service = this.app.sideViews.sideView2.serviceInstance;

                        Y.Assert.areEqual(
                            2, this.load1Calls, "service 1 load should have been called twice"
                        );
                        Y.Assert.areEqual(
                            1, this.load2Calls, "service 2 load should have been called once"
                        );
                        Y.Assert.isTrue(
                            service.getTargets().indexOf(this.app) === -1,
                            "The app should not be a bubble target of the service"
                        );
                    });
                });
            });
            this.wait();
        },
    });

    sideViewsTest = new Y.Test.Case({
        name: "Side views management",

        setUp: function () {
            this.sideView1Hidden = "is-sideview1-hidden";
            this.sideView2Hidden = "is-sideview2-hidden";
            this.app = new Y.eZ.PlatformUIApp({
                container: '.app-sideviews',
                viewContainer: '.view-container'
            });
            this.app.sideViews = {
                sideView1: {
                    hideClass: this.sideView1Hidden,
                    type: Y.View,
                    service: Y.eZ.ViewService,
                    container: '.sideview1'
                },
                sideView2: {
                    hideClass: this.sideView2Hidden,
                    type: Y.View,
                    service: Y.eZ.ViewService,
                    container: '.sideview2'
                }
            };
        },

        tearDown: function () {
            this.app.destroy();
        },

        "Should keep the side views state using a route without sideViews": function () {
            var container = this.app.get('container'),
                nextCalled = false;

            this.app.hideSideView('sideView1');
            this.app.showSideView('sideView2');
            this.app.handleSideViews({route: {}}, {}, function () {
                nextCalled = true;
            });

            Y.Assert.isTrue(
                container.hasClass(this.sideView1Hidden),
                "The side view 1 should stay hidden"
            );
            Y.Assert.isFalse(
                container.hasClass(this.sideView2Hidden),
                "The side view 2 should stay visible"
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
            this.app.handleSideViews({route: {sideViews: {sideView1: false}}}, {}, function () {});
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
            Y.Assert.isTrue(rendered === 1, "The side view should have been rendered once");
            Y.Assert.isTrue(activeSet === 2, "The active flag should have been set two times " + activeSet);
            Y.Assert.isTrue(bubble, "The event from the side view should bubble to the app");
            Y.Assert.isTrue(nextCalls === 2, "The next callback should have been called two times");
            Y.Assert.isTrue(
                Y.one(this.app.sideViews.sideView1.container).contains(
                    this.app.sideViews.sideView1.instance.get('container')
                )
            );
        },

        "Should hide the side view instance": function () {
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
            this.app.handleSideViews({route: {sideViews: {sideView1: false}}}, {}, function () {
                nextCalled = true;
            });

            this.app.sideViews.sideView1.instance.fire('testEvent');
            Y.Assert.isFalse(removed, "The side view should not be removed");
            Y.Assert.isTrue(nextCalled, "The next callback should have been called");
        },
    });

    reverseRoutingTest = new Y.Test.Case({
        name: "eZ Platform UI App reverse routing tests",

        setUp: function () {
            var routes = [
                {path: '/simple', name: "simple"},
                {path: '/noname'},
                {path: '/:param', name: "oneParam"},
                {path: '/:param/:PARAM2', name: "twoParams"},
                {path: '/sTr1ng/:param/m1X3d/:PARAM2', name: "complex"},
            ];
            this.root = '/this/is/the/root/';
            this.app = new Y.eZ.PlatformUIApp({
                config: {
                    rootInfo: {
                        root: this.root,
                    },
                },
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

        "Should navigate to the given route": function () {
            var navigate = false,
                that = this;

            this.app.on('navigate', function (e) {
                e.preventDefault();
                navigate = true;

                Y.Assert.areEqual(
                    e.url.split(that.root)[1],
                    "sTr1ng/string/m1X3d/mixed"
                );
            });

            this.app.navigateTo('complex', {param: "string", PARAM2: "mixed"});

            Y.Assert.isTrue(
                navigate, "The navigate event should have been fired"
            );
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

    loginTest = new Y.Test.Case({
        name: "Login app tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.userMock = new Y.Mock();
            this.app = new Y.eZ.PlatformUIApp();
            this.app._set('capi', this.capiMock);
            this.app._set('user', this.userMock);
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
            delete this.capiMock;
        },

        _configureCapiMockLogIn: function (credentials, error, response) {
            Y.Mock.expect(this.capiMock, {
                method: 'logIn',
                args: [credentials, Y.Mock.Value.Function],
                run: function (c, callback) {
                    callback(error, response);
                }
            });
        },

        _configureUserMock: function (userId, error, loadUserResponse) {
            var that = this;

            if ( !error ) {
                Y.Mock.expect(this.userMock, {
                    method: 'set',
                    args: ['id', userId],
                });
            } else {
                Y.Mock.expect(this.userMock, {
                    method: 'set',
                    args: ['id', Y.Mock.Value.Any],
                    callCount: 2,
                });
            }
            Y.Mock.expect(this.userMock, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Y.Assert.areSame(
                        that.capiMock, options.api,
                        "The CAPI should be availabled in the options"
                    );
                    callback(error, loadUserResponse);
                },
            });
        },

        "Should load the user on login": function () {
            var credentials = {
                    login: "samsam",
                    password: "heroscosmique"
                },
                userId = "/user/samsam",
                loginError = false,
                createSession = {
                    document: {
                        Session: {
                            User: {
                                _href: userId,
                            }
                        }
                    }
                },
                loadUser = {},
                callbackCalled = false;

            this._configureCapiMockLogIn(credentials, loginError, createSession);
            this._configureUserMock(userId, false, loadUser);

            this.app.logIn(credentials, function (error, result) {
                callbackCalled = true;
                Y.Assert.areSame(
                    loginError, error,
                    "The error of the failed login should be provided"
                );
                Y.Assert.areSame(
                    loadUser, result,
                    "The result of the user loading should be provided"
                );
            });
            Y.Assert.isTrue(callbackCalled, "The logIn callback should have been called");
            Y.Mock.verify(this.userMock);
            Y.Mock.verify(this.capiMock);
        },

        "Should handle the logIn error": function () {
            var credentials = {
                    login: "samsam",
                    password: "grandheros"
                },
                loginError = {},
                createSessionErrorResponse = {},
                callbackCalled = false;

            this._configureCapiMockLogIn(credentials, loginError, createSessionErrorResponse);

            this.app.logIn(credentials, function (error, result) {
                callbackCalled = true;
                Y.Assert.areSame(
                    loginError, error,
                    "The error of the failed login should be provided"
                );
                Y.Assert.areSame(
                    createSessionErrorResponse, result,
                    "The result of the failed login should be provided"
                );
            });
            Y.Assert.isTrue(callbackCalled, "The logIn callback should have been called");
            Y.Mock.verify(this.capiMock);
        },

        "Should logout when the user loading fails": function () {
            var credentials = {
                    login: "samsam",
                    password: "heroscosmique"
                },
                userId = "/user/samsam",
                loginError = false,
                createSession = {
                    document: {
                        Session: {
                            User: {
                                _href: userId,
                            }
                        }
                    }
                },
                loadUserError = {},
                loadUser = {},
                callbackCalled = false;

            this._configureCapiMockLogIn(credentials, loginError, createSession);
            this._configureUserMock(userId, loadUserError, loadUser);

            Y.Mock.expect(this.capiMock, {
                method: 'logOut',
                args: [Y.Mock.Value.Function],
                run: function (cb) {
                    cb();
                },
            });
            Y.Mock.expect(this.userMock, {
                method: 'reset'
            });

            this.app.logIn(credentials, function (error, result) {
                callbackCalled = true;
                Y.Assert.areSame(
                    loadUserError, error,
                    "The error of the failed user loading should be provided"
                );
                Y.Assert.areSame(
                    loadUser, result,
                    "The resulf of the failed user loading should be provided"
                );
            });
            Y.Assert.isTrue(callbackCalled, "The logIn callback should have been called");
            Y.Mock.verify(this.userMock);
            Y.Mock.verify(this.capiMock);
        },
    });

    logoutTest = new Y.Test.Case({
        name: "Login app tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.userMock = new Y.Mock();
            this.app = new Y.eZ.PlatformUIApp();
            this.app._set('capi', this.capiMock);
            this.app._set('user', this.userMock);
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
            delete this.capiMock;
        },

        "Should reset the user and provide the response when logging out": function () {
            var logOutResponse = {},
                logOutError = {};

            Y.Mock.expect(this.capiMock, {
                method: 'logOut',
                args: [Y.Mock.Value.Function],
                run: function (cb) {
                    cb(logOutError, logOutResponse);
                },
            });
            Y.Mock.expect(this.userMock, {
                method: 'reset',
            });
            Y.Mock.expect(this.userMock, {
                method: 'set',
                args: ['id', undefined]
            });

            this.app.logOut(function (err, resp) {
                Y.Assert.areSame(
                    logOutError, err, "The error of the logout should be provided"
                );
                Y.Assert.areSame(
                    logOutResponse, resp, "The response of the logout should be provided"
                );
            });

            Y.Mock.verify(this.userMock);
            Y.Mock.verify(this.capiMock);
        },
    });

    isLoggedInTest = new Y.Test.Case({
        name: "isLoggedIn tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.userMock = new Y.Mock();
            this.anonymousUserId = "10";
            this.app = new Y.eZ.PlatformUIApp({
                config: {
                    anonymousUserId: this.anonymousUserId,
                }
            });
            this.app._set('capi', this.capiMock);
            this.app._set('user', this.userMock);
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
            delete this.capiMock;
        },

        _mockUserGetId: function (ret) {
            Mock.expect(this.userMock, {
                method: 'get',
                args: ['id'],
                returns: ret,
            });
        },

        "Should consider the anonymous user as not logged in": function () {
            var callbackCalled = false;

            this._mockUserGetId(this.anonymousUserId);
            this.app.isLoggedIn(function (notLoggedIn) {
                callbackCalled = true;
                Assert.isTrue(
                    notLoggedIn,
                    "The anonymous user can not be logged in"
                );
            });
            Assert.isTrue(callbackCalled, "The callback should have been called");
        },

        "Should consider any other user than anonymous as logged in": function () {
            var callbackCalled = false;

            this._mockUserGetId("crapouille");
            this.app.isLoggedIn(function (notLoggedIn) {
                callbackCalled = true;
                Assert.isFalse(
                    notLoggedIn,
                    "The user should be considered as logged in"
                );
            });
            Assert.isTrue(callbackCalled, "The callback should have been called");
        },

        "Should call the capi isLoggedIn": function () {
            var callbackCalled = false;

            this._mockUserGetId(undefined);
            Mock.expect(this.capiMock, {
                method: 'isLoggedIn',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(true);
                },
            });
            this.app.isLoggedIn(function (notLoggedIn) {
                callbackCalled = true;
                Assert.isTrue(
                    notLoggedIn,
                    "The user should not be considered as logged in"
                );
            });
            Assert.isTrue(callbackCalled, "The callback should have been called");
        },

        "Should call the capi isLoggedIn and check the user id": function () {
            var callbackCalled = false,
                response = {
                    document: {
                        Session: {
                            User: {
                                _href: this.anonymousUserId
                            }
                        }
                    }
                };

            this._mockUserGetId(undefined);
            Mock.expect(this.capiMock, {
                method: 'isLoggedIn',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(false, response);
                },
            });
            this.app.isLoggedIn(function (notLoggedIn) {
                callbackCalled = true;
                Assert.isTrue(
                    notLoggedIn,
                    "The user should not be considered as logged in"
                );
            });
            Assert.isTrue(callbackCalled, "The callback should have been called");
        },

        "Should call the capi isLoggedIn and check the user id (not anonymous)": function () {
            var callbackCalled = false,
                response = {
                    document: {
                        Session: {
                            User: {
                                _href: 'crapouille'
                            }
                        }
                    }
                };

            this._mockUserGetId(undefined);
            Mock.expect(this.capiMock, {
                method: 'isLoggedIn',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(false, response);
                },
            });
            this.app.isLoggedIn(function (notLoggedIn) {
                callbackCalled = true;
                Assert.isFalse(
                    notLoggedIn,
                    "The user should be considered as logged in"
                );
            });
            Assert.isTrue(callbackCalled, "The callback should have been called");
        },
    });

    checkUserTest = new Y.Test.Case({
        name: "Check user app tests",

        setUp: function () {
            this.capiMock = new Y.Mock();
            this.userMock = new Y.Mock();
            this.app = new Y.eZ.PlatformUIApp({
                config: {
                    anonymousUserId: '10',
                },
            });
            this.app._set('capi', this.capiMock);
            this.app._set('user', this.userMock);
        },

        tearDown: function () {
            this.app.destroy();
            delete this.app;
            delete this.capiMock;
        },

        _configureUserMockGet: function (userId) {
            Y.Mock.expect(this.userMock, {
                method: 'get',
                args: ['id'],
                returns: userId,
            });
        },

        _configureCapiUserLoad: function (userId, loadError) {
            var that = this;

            if ( !loadError ) {
                Y.Mock.expect(this.userMock, {
                    method: 'set',
                    args: ['id', userId],
                });
            } else {
                Y.Mock.expect(this.userMock, {
                    method: 'set',
                    args: ['id', Y.Mock.Value.Any],
                    callCount: 2,
                });
            }

            Y.Mock.expect(this.userMock, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, cb) {
                    Y.Assert.areSame(
                        that.capiMock, options.api,
                        "The CAPI should be provided to the load method"
                    );
                    cb(loadError);
                }
            });
        },

        _configureCapiMockIsLoggedIn: function (error, response) {
            Y.Mock.expect(this.capiMock, {
                method: 'isLoggedIn',
                args: [Y.Mock.Value.Function],
                run: function (callback) {
                    callback(error, response);
                }
            });
        },

        "Should call the next callback if the user is loaded": function () {
            var userId = '14',
                nextCalled = false;

            this._configureUserMockGet(userId);

            this.app.checkUser({}, {}, function () {
                nextCalled = true;
            });

            Y.Assert.isTrue(nextCalled, "The next callback should have been called");
        },

        "Should check if the user is logged in and load the user": function () {
            var nextCalled = false,
                userId = '14',
                isLoggedInResponse = {
                    document: {
                        Session: {
                            User: {
                                _href: userId
                            }
                        }
                    }
                };

            this._configureUserMockGet(false);
            this._configureCapiMockIsLoggedIn(false, isLoggedInResponse);
            this._configureCapiUserLoad(userId, false);

            this.app.checkUser({}, {}, function () {
                nextCalled = true;
            });

            Y.Assert.isTrue(nextCalled, "The next callback should have been called");
            Y.Mock.verify(this.capiMock);
        },

        "Should redirect to the login form if the user not logged in": function () {
            var navigateToLoginForm = false;

            this.app.navigateTo = function (routeName, params) {
                Y.Assert.areSame(
                    'loginForm', routeName,
                    "The app should navigate to the login form"
                );
                Y.Assert.isUndefined(params);
                navigateToLoginForm = true;
            };

            this._configureUserMockGet(false);
            this._configureCapiMockIsLoggedIn(true, {});

            this.app.checkUser({}, {}, function () {
                Y.Assert.fail("The next callback should not have been called");
            });

            Y.Assert.isTrue(navigateToLoginForm);
            Y.Mock.verify(this.capiMock);
        },

        "Should redirect to the login form if the user loading fails": function () {
            var navigateToLoginForm = false,
                userId = '14',
                isLoggedInResponse = {
                    document: {
                        Session: {
                            User: {
                                _href: userId
                            }
                        }
                    }
                };

            this.app.navigateTo = function (routeName, params) {
                Y.Assert.areSame(
                    'loginForm', routeName,
                    "The app should navigate to the login form"
                );
                Y.Assert.isUndefined(params);
                navigateToLoginForm = true;
            };

            this._configureUserMockGet(false);
            this._configureCapiMockIsLoggedIn(false, isLoggedInResponse);
            this._configureCapiUserLoad(userId, true);

            Y.Mock.expect(this.capiMock, {
                method: 'logOut',
                args: [Y.Mock.Value.Function],
                run: function (cb) {
                    cb();
                }
            });
            Y.Mock.expect(this.userMock, {
                method: 'reset'
            });

            this.app.checkUser({}, {}, function () {
                Y.Assert.fail("The next callback should not have been called");
            });

            Y.Assert.isTrue(navigateToLoginForm);
            Y.Mock.verify(this.capiMock);
        },
    });

    configRouteTest = new Y.Test.Case({
        name: "eZ Platform UI App route config tests",

        setUp: function () {
            this.app = new Y.eZ.PlatformUIApp();
        },

        tearDown: function () {
            this.app.destroy();
        },

        _getRouteByName: function (name) {
            return Y.Array.find(this.app.get('routes'), function (elt) {
                return (elt.name === name);
            });
        },

        "Should enrich route with config": function () {
            Y.Object.each(this.app.get('routeConfig'), function (value, routeName) {
                var route = this._getRouteByName(routeName);

                Assert.areSame(
                    value,
                    route.config,
                    'The route config should have received a config'
                );
            }, this);
        },

        "Should not enrich route with config if routeConfig does NOT match": function () {
            var dashboard = this._getRouteByName('dashboard');

            Assert.isUndefined(
                dashboard.config,
                'The dashboard route config should be undefined'
            );
        },
    });

    dispatchConfigTest = new Y.Test.Case({
        name: "eZ Platform UI App reverse dispatch config tests",

        setUp: function () {
            this.origCAPI = Y.eZ.CAPI;
            this.origSessionAuthAgent = Y.eZ.SessionAuthAgent;
            this.apiRoot = 'apiRoot';
            this.anonymousUserId = 'anonymousUserId';
            this.assetRoot = 'assetRoot';
            this.ckeditorPluginPath = 'ckeditorPluginPath';
            this.root = 'root';
            this.configLanguages = [
                {'languageCode': 'eng-GB', 'name': 'English'},
                {'languageCode': 'pol-PL', 'name': 'Polish'}
            ];
            this.systemLanguageList = {
                'eng-GB': {'languageCode': 'eng-GB', 'name': 'English'},
                'pol-PL': {'languageCode': 'pol-PL', 'name': 'Polish'}
            };
            Y.eZ.CAPI = Y.bind(function (apiRoot, sessionAuthAgent) {
                Assert.areEqual(
                    this.apiRoot, apiRoot,
                    "The CAPI constructor should receive a / trimed version of apiRoot"
                );

                this.sessionAuthAgent = sessionAuthAgent;
            }, this);
            Y.eZ.SessionAuthAgent = Y.bind(function (sessionInfo) {
                this.sessionAuthAgentConfig = sessionInfo;
            }, this);
        },

        tearDown: function () {
            Y.eZ.CAPI = this.origCAPI;
            Y.eZ.SessionAuthAgent = this.origSessionAuthAgent;
            this.app.destroy();
        },

        _buildApp: function () {
            this.app = new Y.eZ.PlatformUIApp({
                config: {
                    rootInfo: {
                        root: this.root,
                        apiRoot: this.apiRoot + '/',
                        assetRoot: this.assetRoot,
                        ckeditorPluginPath: this.ckeditorPluginPath,
                    },
                    anonymousUserId: this.anonymousUserId,
                    sessionInfo: this.sessionInfo,
                    languages: this.configLanguages
                },
            });
        },

        "Should configure the CAPI": function () {
            this._buildApp();
            Assert.isInstanceOf(
                Y.eZ.CAPI,
                this.app.get('capi'),
                "The CAPI object should be an instance of eZ.CAPI"
            );
            Assert.isInstanceOf(
                Y.eZ.SessionAuthAgent,
                this.sessionAuthAgent,
                "The session auth agent should be an instance of eZ.SessionAuthAgent"
            );
            Assert.isUndefined(
                this.sessionAuthAgentConfig,
                "The sessionAuthAgent should not have received any sessionInfo"
            );
        },

        "Should configure the SessionAuthAgent with the given sessionInfo": function () {
            this.sessionInfo = {isStarted: true};
            this._buildApp();
            Assert.areSame(
                this.sessionInfo,
                this.sessionAuthAgentConfig,
                "The sessionAuthAgent should have received the sessionInfo"
            );
            Assert.isUndefined(
                this.app.get('config').sessionInfo,
                "The sessionInfo should have been removed from the configuration"
            );
        },

        "Should not configure the SessionAuthAgent": function () {
            this.sessionInfo = {isStarted: false};
            this._buildApp();
            Assert.isUndefined(
                this.sessionAuthAgentConfig,
                "The sessionAuthAgent should not have received any sessionInfo"
            );
            Assert.isUndefined(
                this.app.get('config').sessionInfo,
                "The sessionInfo should have been removed from the configuration"
            );
        },

        "Should configure the `root`": function () {
            this._buildApp();
            Assert.areSame(
                this.root,
                this.app.get('root'),
                "The `root` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').root,
                "The root should have been removed from the configuration"
            );
        },

        "Should configure the `apiRoot`": function () {
            this._buildApp();
            Assert.areSame(
                this.apiRoot + '/',
                this.app.get('apiRoot'),
                "The `apiRoot` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').apiRoot,
                "The apiRoot should have been removed from the configuration"
            );
        },

        "Should configure the `assetRoot`": function () {
            this._buildApp();
            Assert.areSame(
                this.assetRoot,
                this.app.get('assetRoot'),
                "The `assetRoot` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').assetRoot,
                "The assetRoot should have been removed from the configuration"
            );
        },

        "Should configure the `anonymousUserId`": function () {
            this._buildApp();
            Assert.areSame(
                this.anonymousUserId,
                this.app.get('anonymousUserId'),
                "The `anonymousUserId` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').anonymousUserId,
                "The anonymousUserId should have been removed from the configuration"
            );
        },

        "Should configure the `systemLanguageList`": function () {
            this._buildApp();

            Assert.areSame(
                JSON.stringify(this.systemLanguageList),
                JSON.stringify(this.app.get('systemLanguageList')),
                "The `systemLanguageList` should have been set"
            );
            Assert.isUndefined(
                this.app.get('config').languages,
                "The languages should have been removed from the configuration"
            );
        },
    });

    Y.Test.Runner.setName("eZ Platform UI App tests");
    Y.Test.Runner.add(appTest);
    Y.Test.Runner.add(titleTest);
    Y.Test.Runner.add(handleMainViewTest);
    Y.Test.Runner.add(sideViewsTest);
    Y.Test.Runner.add(showSideViewTest);
    Y.Test.Runner.add(hideSideViewTest);
    Y.Test.Runner.add(sideViewServicesTest);
    Y.Test.Runner.add(reverseRoutingTest);
    Y.Test.Runner.add(loginTest);
    Y.Test.Runner.add(logoutTest);
    Y.Test.Runner.add(isLoggedInTest);
    Y.Test.Runner.add(checkUserTest);
    Y.Test.Runner.add(configRouteTest);
    Y.Test.Runner.add(dispatchConfigTest);
}, '', {requires: ['test', 'ez-platformuiapp', 'ez-viewservice', 'ez-viewservicebaseplugin']});

YUI.add('ez-editorialapp-tests', function (Y) {
    var app, appTest,
        capiMock,
        container = Y.one('.app'),
        mockActionBar = {};

    mockActionBar.handleHeightUpdate = function () {};
    Y.Handlebars = {};
    Y.Handlebars.registerPartial = function () {};

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

        "Should show the content edit view": function () {
            var rendered = false, initialized = false, focused = false,
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
                },

                setFocus: function () {
                    focused = true;
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
            this.wait(function () {
                Y.assert(!app.get('loading'), "The app should not be in loading mode");
                Y.assert(focused, "The content edit view should have input focus");
            }, 800);

            rendered = false;
            resp.variables.content++;
            app.set('loading', true);
            app.handleContentEdit(req, resp);

            Y.assert(rendered, "The content edit view should have been rerendered");
            this.wait(function () {
                Y.assert(!app.get('loading'), "The app should not be in loading mode");
            }, 500);
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
            this.wait(function () {
                Y.assert(!app.get('loading'), "The app should not be in loading mode");
            }, 800);

            rendered = false;
            resp.variables.content++;
            app.set('loading', true);
            app.handleLocationView(req, resp);

            Y.assert(rendered, "The location view view should have been rerendered");
            this.wait(function () {
                Y.assert(!app.get('loading'), "The app should not be in loading mode");
            }, 500);
        },

        "Should show the error view, when catching 'fatalError' event": function () {
            var rendered = false, initialized = false, focused = false,
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

                    setFocus: function () {
                        focused = true;
                    }
                });

            originalErroView = app.views.errorView.instance;
            app.views.errorView.instance = new TestErrorViewConstructor();

            app.fire('contentEditView:fatalError', errorInfo);

            Y.assert(initialized, "The error view should have been initialized");
            Y.assert(rendered, "The error view should have been rendered");
            this.wait(function () {
                Y.assert(!app.get('loading'), "The app should not be in loading mode");
                Y.assert(focused, "The error view should have input focus");

                app.views.errorView.instance = originalErroView;
            }, 500);
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
                    setFocus: function () {}
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
        }
    });

    Y.Test.Runner.setName("eZ Editorial App tests");
    Y.Test.Runner.add(appTest);

}, '0.0.1', {requires: ['test', 'ez-editorialapp', 'json', 'parallel']});

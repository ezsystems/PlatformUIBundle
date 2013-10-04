YUI.add('ez-editorialapp-tests', function (Y) {

    var app, appTest,
        capiMock,
        container = Y.one('.app');

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
            app.close();

            this.wait(function () {
                Y.assert(
                    !container.hasClass('is-app-open'),
                    "The app container should not have the class is-app-open"
                );
            }, 400);
        },

        "Should open again the application": function () {
            this["Should open the application"]();
        },


        "Should close again the application": function () {
            this["Should close the application"]();
        },

        "Should close the application when contentEditView:close event is fired": function () {
            app.open();

            app.fire('contentEditView:closeApp');

            this.wait(function () {
                Y.assert(
                    !container.hasClass('is-app-open'),
                    "The app container should not have the class is-app-open"
                );
            }, 400);
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

        "Should load the content, the location, the owner and the content type": function () {
            var contentMock, userMock, locationMock, typeMock,
                resources = {
                    'Owner': '/api/ezp/v2/user/users/14',
                    'MainLocation': '/api/ezp/v2/content/locations/1/2/61',
                    'ContentType': '/api/ezp/v2/content/types/23'
                },
                nextCalled = false,
                contentId = 59,
                runLoadCallback = function (options, callback) {
                    Y.Assert.isObject(options.api, "The load options should an 'api' property");
                    Y.Assert.areSame(options.api, capiMock, "The 'api' property should be the CAPI");

                    callback(false);
                },
                vars;

            contentMock = new Y.Mock();
            userMock = new Y.Mock();
            locationMock = new Y.Mock();
            typeMock = new Y.Mock();

            Y.Mock.expect(contentMock, {
                method: 'set',
                args: [
                    'id',
                    "/api/ezp/v2/content/objects/" + contentId
                ]
            });
            Y.Mock.expect(contentMock, {
                method: 'get',
                args: [
                    'resources'
                ],
                returns: resources
            });

            Y.Mock.expect(userMock, {
                method: 'set',
                args: [
                    'id',
                    resources.Owner
                ]
            });
            Y.Mock.expect(locationMock, {
                method: 'set',
                args: [
                    'id',
                    resources.MainLocation
                ]
            });
            Y.Mock.expect(typeMock, {
                method: 'set',
                args: [
                    'id',
                    resources.ContentType
                ]
            });

            Y.Mock.expect(contentMock, {
                method: 'load',
                args: [
                    Y.Mock.Value.Object,
                    Y.Mock.Value.Function
                ],
                run: runLoadCallback
            });
            Y.Mock.expect(userMock, {
                method: 'load',
                args: [
                    Y.Mock.Value.Object,
                    Y.Mock.Value.Function
                ],
                run: runLoadCallback
            });
            Y.Mock.expect(typeMock, {
                method: 'load',
                args: [
                    Y.Mock.Value.Object,
                    Y.Mock.Value.Function
                ],
                run: runLoadCallback
            });
            Y.Mock.expect(locationMock, {
                method: 'load',
                args: [
                    Y.Mock.Value.Object,
                    Y.Mock.Value.Function
                ],
                run: runLoadCallback
            });

            app.set('contentEditViewVariables', {
                content: contentMock,
                owner: userMock,
                contentType: typeMock,
                mainLocation: locationMock
            });

            app.loadContentForEdit({params: {id: contentId}}, {}, function () {
                nextCalled = true;
            });

            Y.assert(nextCalled, 'Next middleware should have been called');

            Y.Mock.verify(contentMock);
            Y.Mock.verify(userMock);
            Y.Mock.verify(locationMock);
            Y.Mock.verify(typeMock);

            Y.assert(app.get('loading'), "The app should be in loading mode");
        },

        "Should show the content edit view": function () {
            var rendered = false, initialized = false, focused = false,
                vars = {'content': 1, 'contentType': {}, 'mainLocation': {}, 'owner': {}};

            app.views.contentEditView.type = Y.Base.create('testView', Y.View, [], {
                initializer: function () {
                    initialized = true;
                },

                render: function () {
                    rendered = true;
                    Y.Assert.areEqual(
                        this.get('content'), vars.content,
                        "The view attributes should be updated with the app contentEditViewVariables attribute"
                    );
                },

                setFocus: function () {
                    focused = true;
                }
            });

            app.set('loading', true);
            app.set('contentEditViewVariables', vars);
            app.handleContentEdit();

            Y.assert(initialized, "The content edit view should have been initialized");
            Y.assert(rendered, "The content edit view should have been rendered");
            this.wait(function () {
                Y.assert(!app.get('loading'), "The app should not be in loading mode");
                Y.assert(focused, "The content edit view should have input focus");
            }, 500);

            rendered = false;
            vars.content++;
            app.set('loading', true);
            app.set('contentEditViewVariables', vars);
            app.handleContentEdit();

            Y.assert(rendered, "The content edit view should have been rerendered");
            this.wait(function () {
                Y.assert(!app.get('loading'), "The app should not be in loading mode");
            }, 500);
        },

        "Should show the error view, when catching 'fatalError' event": function () {
            var rendered = false, initialized = false, focused = false,
                newErrorViewAttrs,
                errorInfo = {'retryAction:': {}, 'additionalInfo': 1};

            app.views.errorView.instance = Y.Base.create('testView', Y.View, [], {
                initializer: function () {
                    initialized = true;
                },

                render: function () {
                    rendered = true;
                    Y.Assert.areEqual(
                        this.get('additionalInfo'), errorInfo.additionalInfo,
                        "The view attributes should be updated with the app variables attribute"
                    );
                },

                setFocus: function () {
                    focused = true;
                },

                setAttrs: function (newAttrs) {
                    newErrorViewAttrs = newAttrs;
                }
            });

            app.fire('contentEditView:fatalError', errorInfo);

            Y.assert(initialized, "The error view should have been initialized");
            Y.assert(rendered, "The error view should have been rendered");
            this.wait(function () {
                Y.assert(!app.get('loading'), "The app should not be in loading mode");
                Y.assert(focused, "The error view should have input focus");
            }, 500);
        }


    });

    Y.Test.Runner.setName("eZ Editorial App tests");
    Y.Test.Runner.add(appTest);


}, '0.0.1', {requires: ['test', 'ez-editorialapp', 'json', 'parallel']});

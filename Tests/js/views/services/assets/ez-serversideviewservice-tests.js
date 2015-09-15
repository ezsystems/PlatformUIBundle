/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversideviewservice-tests', function (Y) {
    var unitTest, loadErrorTest, rewriteTest, formTest, notificationTest, pjaxHeaderTest,
        Mock = Y.Mock, Assert = Y.Assert;

    unitTest = new Y.Test.Case({
        name: "eZ Server Side View Service test",

        setUp: function () {
            this.apiRoot = '/Tests/js/views/services/';
            this.title = 'Right Thoughts, Right Words, Right Actions';
            this.html = '<p>Right action</p>';

            this.pjaxResponse = '<div data-name="title">' + this.title + '</div>' +
                '<div data-name="html">' + this.html + '</div>';

            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['apiRoot'],
                returns: this.apiRoot,
            });

            this.request = {'params': {'uri': ''}};
        },

        tearDown: function () {
            delete this.app;
            delete this.request;
        },

        _normalLoad: function (response, expectedTitle, expectedHtml) {
            var uri = 'echo/get/html/?response='+ response,
                service,
                that = this;

            this.request.params.uri = uri;
            service = new Y.eZ.ServerSideViewService({
                request: this.request,
                app: this.app
            });

            service.on('error', function () {
                that.resume(function () {
                    Y.Assert.fail("No error event should have been triggered");
                });
            });

            service.load(function (serv) {
                that.resume(function () {
                    Y.Assert.areSame(
                        service, serv, "The service should be passed to the callback"
                    );
                    Y.Assert.areEqual(
                        expectedTitle,
                        service.get('title'),
                        "The title should be available in the title attribute"
                    );
                    Y.Assert.areEqual(
                        expectedHtml,
                        service.get('html'),
                        "The html should be available in the html attribute"
                    );
                });
            });
            this.wait();
        },

        "Should load the URI contained in the request": function () {
            this._normalLoad(this.pjaxResponse, this.title, this.html);
        },

        "Should be able to parse incomplete response": function () {
            this._normalLoad("<div></div>", "", "");
        },

        "Should be able to parse non html response": function () {
            this._normalLoad('{"bla": "bla"}', "", "");
        },


        "getViewParameters should return the title and html attribute values": function () {
            var title = 'Love Illumination',
                html = 'When you are happy from a dream...',
                service = new Y.eZ.ServerSideViewService({
                    title: title,
                    html: html,
                }),
                params = service.getViewParameters();

            Y.Assert.isObject(
                params,
                "getViewParameters() result should be an object"
            );
            Y.Assert.areEqual(
                2, Y.Object.keys(params).length,
                "getViewParameters() result should contain 2 properties"
            );

            Y.Assert.areEqual(
                title, params.title,
                "getViewParameters() result should contain the title"
            );
            Y.Assert.areEqual(
                html, params.html,
                "getViewParameters() result should contain the html code"
            );
        }
    });

    loadErrorTest = new Y.Test.Case({
        name: "eZ Server Side View Service loading error test",

        setUp: function () {
            this.app = new Y.Base();
            this.app.set('baseUri', '');
            this.request = {params: {uri: ""}};
            this.service = new Y.eZ.ServerSideViewService({
                app: this.app,
                request: this.request
            });
            this.service.addTarget(this.app);
            this.origIO = Y.io;
        },

        tearDown: function () {
            this.app.destroy();
            this.service.destroy();
            delete this.app;
            delete this.service;
            delete this.request;

            Y.io = this.origIO;
        },

        _loadingError: function (responseText) {
            // overriding Y.io to simulate an error which a specific response
            // grover's echoecho server does not allow that.
            Y.io = function (uri, config) {
                config.on.failure.call(config.context, "", {responseText: responseText});
            };

           this.service.load(function (serv) {
                Y.Assert.fail("The 'normal' callback should not be called");
            });
        },

        "Should fire the  'error'": function () {
            this.service.on('error', function (e) {
                Assert.areNotEqual(
                    "", e.message,
                    "An error message should have been generated"
                );
            });
            this._loadingError("<div></div>");
        },

        "Should fire the notification and the  'error' events": function () {
            var responseWithNotifications = '<div><ul data-name="notification">' +
                    '<li data-state="error">error1</li>' +
                    '<li data-state="error">error2</li>' +
                    '</ul></div>',
                notificationCount = 0,
                msg = '';

            this.app.on('notify', function (e) {
                notificationCount++;
                Assert.areEqual(
                    'error', e.notification.state,
                    "The notification state should be 'error'"
                );
                msg += e.notification.text;
            });
            this.service.on('error', function (e) {
                Assert.areEqual(
                    "", e.message,
                    "An error message should have been generated"
                );
            });

            this._loadingError(responseWithNotifications);
            Assert.areEqual(2, notificationCount, "2 notifications should have been sent");
            Assert.areEqual("error1error2", msg);
        },
    });

    rewriteTest = new Y.Test.Case({
        name: "eZ Server Side View Service rewrite HTML test",

        setUp: function () {
            this.apiRoot = '/Tests/js/views/services/';

            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['apiRoot'],
                returns: this.apiRoot,
            });

            this.request = {'params': {'uri': ''}};
        },

        _getPjaxResponse: function (html) {
            return '<div data-name="title"></div><div data-name="html">' + html + '</div>';
        },

        tearDown: function () {
            delete this.app;
            delete this.request;
        },

        _normalLoad: function (response, expectedHtml) {
            var uri = 'echo/get/html/?response='+ Y.config.win.encodeURIComponent(this._getPjaxResponse(response)),
                service,
                that = this;

            Y.Mock.expect(this.app, {
                method: 'routeUri',
                args: ['adminGenericRoute', Y.Mock.Value.Object],
                run: function (routeName, params) {
                    Y.Assert.isString(params.uri);
                    Y.Assert.areNotEqual("", params.uri);
                    return 'appUri ' + params.uri;
                }
            });

            this.request.params.uri = uri;
            service = new Y.eZ.ServerSideViewService({
                request: this.request,
                app: this.app
            });

            service.on('error', function () {
                that.resume(function () {
                    Y.Assert.fail("No error event should have been triggered");
                });
            });

            service.load(function (serv) {
                that.resume(function () {
                    Y.Assert.areEqual(
                        expectedHtml,
                        service.get('html'),
                        "The resulted html is incorrect"
                    );
                });
            });
            this.wait();
        },

        "Should not rewrite anchor links": function () {
            var html = '<a href="#nowhere">Nowhere</a>';
            this._normalLoad(html, html);
        },

        "Should not rewrite targetted links": function () {
            var html = '<a href="/somewhere" target="_blank">Somewhere</a>';
            this._normalLoad(html, html);
        },

        "Should not rewrite absolute http links": function () {
            var html = '<a href="http://en.wikipedia.org/wiki/Absolute_value">Absolute</a>';
            this._normalLoad(html, html);
        },

        "Should not rewrite absolute https links": function () {
            var html = '<a href="https://en.wikipedia.org/wiki/Absolute_value">Absolute</a>';
            this._normalLoad(html, html);
        },

        "Should rewrite links": function () {
            var html = '<a href="/Tests/js/views/services/pjax/link">Link</a>',
                res = '<a href="appUri pjax/link">Link</a>';
            this._normalLoad(html, res);
        },

        "Should rewrite links (apiRoot value in the link)": function () {
            var html = '<a href="/Tests/js/views/services/pjax/link/Tests/js/views/services/">Link</a>',
                res = '<a href="appUri pjax/link/Tests/js/views/services/">Link</a>';
            this._normalLoad(html, res);
        },

        "Should rewrite targetted to self links": function () {
            var html = '<a href="/Tests/js/views/services/somewhere" target="_self">Somewhere</a>',
                res = '<a href="appUri somewhere" target="_self">Somewhere</a>';
            this._normalLoad(html, res);
        },
    });

    formTest = new Y.Test.Case({
        name: "eZ Server Side View Service form test",

        setUp: function () {
            this.apiRoot = '/Tests/js/views/services/';
            this.title = 'Right Thoughts, Right Words, Right Actions';
            this.html = '<p>Right action</p>';
            this.pjaxResponse = '<div data-name="title">' + this.title + '</div>' +
                '<div data-name="html">' + this.html + '</div>';
            this.form = '<form action="' + this.apiRoot + 'echo/post/html/?response=' +
                 Y.config.win.encodeURIComponent(this.pjaxResponse) +
                '" method="post"></form>';

            this.app = new Mock();
            Mock.expect(this.app, {
                method: 'get',
                args: ['apiRoot'],
                returns: this.apiRoot
            });
            this.service = new Y.eZ.ServerSideViewService({
                app: this.app,
            });
            this.view = new Y.View();
            this.view.addTarget(this.service);

            this.originalEvent = new Mock();
            Mock.expect(this.originalEvent, {
                method: 'preventDefault'
            });
        },

        "Should handle submitForm event": function () {
            var that = this;

            Mock.expect(this.app, {
                method: 'set',
                args: ['loading', Mock.Value.Boolean],
            });
            this.view.after('htmlChange', function (e) {
                that.resume(function () {
                    Assert.areEqual(
                        this.html, this.service.get('html'),
                        "The service html attribute should have been updated"
                    );
                    Assert.areEqual(
                        this.title, this.service.get('title'),
                        "The service title attribute should have been updated"
                    );
                    Assert.areEqual(
                        this.html, this.view.get('html'),
                        "The view html attribute should have been updated"
                    );
                    Assert.areEqual(
                        this.title, this.view.get('title'),
                        "The view title attribute should have been updated"
                    );

                    Mock.verify(this.originalEvent);
                });
            });

            this.view.fire('submitForm', {
                form: Y.Node.create(this.form),
                originalEvent: this.originalEvent,
            });
            this.wait();
        },

        "Should handle the submit error": function () {
            var that = this;

            this.form = '<form action="' + this.apiRoot +
                'echo/status/404" method="post"></form>';

            Mock.expect(this.app, {
                method: 'set',
                args: ['loading', Mock.Value.Boolean],
                callCount: 2,
            });
            this.service.on('error', function () {
                that.resume(function () {
                    Mock.verify(this.originalEvent);
                });
            });

            this.view.fire('submitForm', {
                form: Y.Node.create(this.form),
                originalEvent: this.originalEvent,
            });
            this.wait();
        },

        "Should handle PJAX custom redirection": function () {
            var pjaxLocation = 'pjax/new/location',
                adminRoute = '/ez/#' + pjaxLocation;

            this.form = '<form action="' + this.apiRoot +
                'echo/status/205" method="post"></form>';

            Mock.expect(this.app, {
                method: 'set',
                args: ['loading', Mock.Value.Boolean],
            });
            Y.once('io:complete', function (tId, response) {
                // That's ugly but unfortunately it seems it's impossible to
                // send a custom header with the echoecho server
                response.getResponseHeader = function (header) {
                    Assert.areEqual(
                        'PJAX-Location', header,
                        'The PJAX Location header should be retrieved'
                    );
                    return pjaxLocation;
                };
            });
            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['adminGenericRoute', Mock.Value.Object],
                run: function (route, params) {
                    Assert.areEqual(
                        pjaxLocation, params.uri,
                        "The user should be redirected to admin " + params.uri
                    );
                    return adminRoute;
                },
            });
            Mock.expect(this.app, {
                method: 'navigate',
                args: [adminRoute],
                run: Y.bind(function () {
                    this.resume();
                }, this)
            });

            this.view.fire('submitForm', {
                form: Y.Node.create(this.form),
                originalEvent: this.originalEvent,
            });
            this.wait();
        },
    });

    notificationTest = new Y.Test.Case({
        name: "eZ Server Side View Service notification test",

        setUp: function () {
            this.apiRoot = '/Tests/js/views/services/';
            this.app = new Y.Base();
            this.app.set('apiRoot', this.apiRoot);
            this.service = new Y.eZ.ServerSideViewService({
                app: this.app
            });
        },

        _notificationLoad: function (notificationState, notificationText) {
            var pjaxResponse = '<div data-name="title"></div>' +
                    '<div data-name="html"></div>' +
                    '<ul data-name="notification">' +
                    '<li data-state="' + notificationState +'">' + notificationText + '</li>' +
                    '</ul>',
                uri = 'echo/get/html/?response='+ Y.config.win.encodeURIComponent(pjaxResponse),
                request = {'params': {'uri': uri}};

            this.service.set('request', request);
        },

        tearDown: function () {
            this.service.destroy();
            this.app.destroy();
            delete this.service;
            delete this.app;
            delete this.request;
        },

        "Should fire notify event with started state": function () {
            var that = this,
                notificationState = 'started',
                notificationText = 'Emmanuel Olisadebe';

            this._notificationLoad(notificationState, notificationText);

            this.app.once('notify', function (e) {
                that.resume(function () {
                    Assert.areEqual(
                        notificationState,
                        e.notification.state,
                        "The state should be passed to notification"
                    );
                    Assert.areEqual(
                        notificationText,
                        e.notification.text,
                        "The text should be passed to notification"
                    );
                    Assert.areEqual(
                        5,
                        e.notification.timeout,
                        "The timeout should be set to 5"
                    );
                });
            });

            this.service.load(function () {});
            this.wait();
        },

        "Should fire notify event with done state": function () {
            var that = this,
                notificationState = 'done',
                notificationText = 'Tomasz Hajto';

            this._notificationLoad(notificationState, notificationText);

            this.app.once('notify', function (e) {
                that.resume(function () {
                    Assert.areEqual(
                        notificationState,
                        e.notification.state,
                        "The state should be passed to notification"
                    );
                    Assert.areEqual(
                        notificationText,
                        e.notification.text,
                        "The text should be passed to notification"
                    );
                    Assert.areEqual(
                        5,
                        e.notification.timeout,
                        "The timeout should be set to 5"
                    );
                });
            });

            this.service.load(function () {});
            this.wait();
        },

        "Should fire notify event with error state": function () {
            var that = this,
                notificationState = 'error',
                notificationText = 'Roman Kosecki';

            this._notificationLoad(notificationState, notificationText);

            this.app.once('notify', function (e) {
                that.resume(function () {
                    Assert.areEqual(
                        notificationState,
                        e.notification.state,
                        "The state should be passed to notification"
                    );
                    Assert.areEqual(
                        notificationText,
                        e.notification.text,
                        "The text should be passed to notification"
                    );
                    Assert.areEqual(
                        0,
                        e.notification.timeout,
                        "The timeout should be set to 0"
                    );
                });
            });

            this.service.load(function () {});
            this.wait();
        },
    });

    pjaxHeaderTest = new Y.Test.Case({
        name: "eZ Server Side View Service X-PJAX Header test",

        init: function () {
            var origIO = Y.io,
                that = this;

            this.origIO = origIO;
            Y.io = function (uri, config) {
                that.XPJAXHeader = config.headers['X-PJAX'];
                origIO.apply(this, arguments);
            };
            Y.io._map = origIO._map;
        },

        setUp: function () {
            this.app = new Y.Base();
            this.app.set('apiRoot', '/Tests/js/views/services/');
            this.request = {params: {uri: 'echo/status/200'}};
            this.service = new Y.eZ.ServerSideViewService({
                app: this.app,
                request: this.request,
            });
        },

        tearDown: function () {
            this.app.destroy();
            this.service.destroy();
            delete this.app;
            delete this.service;
            delete this.XPJAXHeader;
        },

        destroy: function () {
            Y.io = this.origIO;
            Y.io._map = this.origIO._map;
        },

        "Should add the X-PJAX header to form requests": function () {
            var view = new Y.Base(),
                originalEvent = new Mock(),
                form;

            Mock.expect(originalEvent, {
                method: 'preventDefault'
            });
            view.addTarget(this.service);

            form = '<form action="' + this.app.get('apiRoot') +
                'echo/status/200" method="post"></form>';

            view.on('titleChange', this.next(function () {
                Assert.areEqual(
                    "true", this.XPJAXHeader,
                    "The X-PJAX header should set to true"
                );
            }, this));

            view.fire('submitForm', {
                form: Y.Node.create(form),
                originalEvent: originalEvent,
            });
            this.wait();
        },

        "Should add the X-PJAX header to load requests": function () {
            this.service.load(this.next(function () {
                Assert.areEqual(
                    "true", this.XPJAXHeader,
                    "The X-PJAX header should set to true"
                );
            }, this));
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Server Side View Service tests");
    Y.Test.Runner.add(unitTest);
    Y.Test.Runner.add(loadErrorTest);
    Y.Test.Runner.add(rewriteTest);
    Y.Test.Runner.add(formTest);
    Y.Test.Runner.add(notificationTest);
    Y.Test.Runner.add(pjaxHeaderTest);
}, '', {requires: ['test', 'ez-serversideviewservice', 'node', 'view']});

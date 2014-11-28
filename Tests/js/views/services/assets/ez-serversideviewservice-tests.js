/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversideviewservice-tests', function (Y) {
    var unitTest, rewriteTest, formTest,
        Mock = Y.Mock, Assert = Y.Assert;

    unitTest = new Y.Test.Case({
        name: "eZ Server Side View Service test",

        setUp: function () {
            this.baseUri = '/Tests/js/views/services/';
            this.title = 'Right Thoughts, Right Words, Right Actions';
            this.html = '<p>Right action</p>';

            this.pjaxResponse = '<div data-name="title">' + this.title + '</div>' +
                '<div data-name="html">' + this.html + '</div>';

            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['baseUri'],
                returns: this.baseUri,
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

        "Should fire the 'error'": function () {
            var uri = 'echo/status/404',
                service,
                that = this;

            this.request.params.uri = uri;
            service = new Y.eZ.ServerSideViewService({
                request: this.request,
                app: this.app
            });

            service.on('error', function () {
                that.resume(function () {
                    Y.Assert.pass();
                });
            });

            service.load(function (serv) {
                that.resume(function () {
                    Y.Assert.fail("The 'normal' callback should not be called");
                });
            });
            this.wait();
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

    rewriteTest = new Y.Test.Case({
        name: "eZ Server Side View Service rewrite HTML test",

        setUp: function () {
            this.baseUri = '/Tests/js/views/services/';

            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['baseUri'],
                returns: this.baseUri,
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
                    return 'REWRITTEN ' + params.uri;
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
            var html = '<a href="pjax/link">Link</a>',
                res = '<a href="REWRITTEN pjax/link">Link</a>';
            this._normalLoad(html, res);
        },

        "Should rewrite targetted to self links": function () {
            var html = '<a href="somewhere" target="_self">Somewhere</a>',
                res = '<a href="REWRITTEN somewhere" target="_self">Somewhere</a>';
            this._normalLoad(html, res);
        },

        "Should rewrite links when a path starting with a '/'": function () {
            var html = '<a href="/somewhere">Somewhere</a>',
                res = '<a href="REWRITTEN somewhere">Somewhere</a>';
            this._normalLoad(html, res);
        },

        "Should rewrite links when a path starting with several '/'": function () {
            var html = '<a href="////somewhere">Somewhere</a>',
                res = '<a href="REWRITTEN somewhere">Somewhere</a>';
            this._normalLoad(html, res);
        },
    });

    formTest = new Y.Test.Case({
        name: "eZ Server Side View Service form test",

        setUp: function () {
            this.baseUri = '/Tests/js/views/services/';
            this.title = 'Right Thoughts, Right Words, Right Actions';
            this.html = '<p>Right action</p>';
            this.pjaxResponse = '<div data-name="title">' + this.title + '</div>' +
                '<div data-name="html">' + this.html + '</div>';
            this.form = '<form action="' + this.baseUri + 'echo/post/html/?response=' +
                 Y.config.win.encodeURIComponent(this.pjaxResponse) +
                '" method="post"></form>';

            this.app = new Mock();
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
                callCount: 2,
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
                    Mock.verify(this.app);
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

            this.form = '<form action="' + this.baseUri +
                'echo/status/404" method="post"></form>';

            Mock.expect(this.app, {
                method: 'set',
                args: ['loading', Mock.Value.Boolean],
                callCount: 2,
            });
            this.service.on('error', function () {
                that.resume(function () {
                    Mock.verify(this.originalEvent);
                    Mock.verify(this.app);
                });
            });

            this.view.fire('submitForm', {
                form: Y.Node.create(this.form),
                originalEvent: this.originalEvent,
            });
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Server Side View Service tests");
    Y.Test.Runner.add(unitTest);
    Y.Test.Runner.add(rewriteTest);
    Y.Test.Runner.add(formTest);
}, '', {requires: ['test', 'ez-serversideviewservice', 'node', 'view']});

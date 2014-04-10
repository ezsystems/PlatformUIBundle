YUI.add('ez-serversideviewservice-tests', function (Y) {
    var unitTest;

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

    Y.Test.Runner.setName("eZ Server Side View Service tests");
    Y.Test.Runner.add(unitTest);
}, '0.0.1', {requires: ['test', 'ez-serversideviewservice']});

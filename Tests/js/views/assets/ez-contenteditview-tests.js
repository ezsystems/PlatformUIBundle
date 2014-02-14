YUI.add('ez-contenteditview-tests', function (Y) {
    var container = Y.one('.container'),
        formContents = "<form></form>",
        content, contentType, owner, mainLocation, formView,
        actionBar,
        actionBarContents = "<menu></menu>",
        mockConf = {
            method: 'toJSON',
            returns: {}
        },
        viewTest, titleTest;

    content = new Y.Mock();
    contentType = new Y.Mock();
    owner = new Y.Mock();
    mainLocation = new Y.Mock();

    Y.Mock.expect(content, mockConf);
    Y.Mock.expect(contentType, mockConf);
    Y.Mock.expect(owner, mockConf);
    Y.Mock.expect(mainLocation, mockConf);

    viewTest = new Y.Test.Case({
        name: "eZ Content Edit View test",

        setUp: function () {
            formView = new Y.Mock();
            actionBar = new Y.Mock();

            Y.Mock.expect(formView, {
                method: 'get',
                args: ['container'],
                returns: formContents
            });
            Y.Mock.expect(formView, {
                method: 'set',
                callCount: 2,
                args: [Y.Mock.Value.String, Y.Mock.Value.Object],
                run: function (attribute, value) {
                    // fails if attribute and value are not consistent
                    // or if we set something else than content or contentType
                    if (
                        ( attribute === 'content' && value !== content ) ||
                        ( attribute === 'contentType' && value !== contentType ) ||
                        ( attribute !== 'content' && attribute !== 'contentType' )
                    ) {
                        Y.Assert.fail('Expecting to set either the content or contentType on the formView');
                    }
                }
            });
            Y.Mock.expect(formView, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(formView, {
                method: 'render',
                returns: formView
            });
            Y.Mock.expect(formView, {
                method: 'destroy'
            });

            Y.Mock.expect(actionBar, {
                method: 'get',
                args: ['container'],
                returns: actionBarContents
            });
            Y.Mock.expect(actionBar, {
                method: 'set',
                args: ['content', content]
            });
            Y.Mock.expect(actionBar, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(actionBar, {
                method: 'render',
                returns: actionBar
            });
            Y.Mock.expect(actionBar, {
                method: 'destroy'
            });

            this.view = new Y.eZ.ContentEditView({
                container: container,
                content: content,
                contentType: contentType,
                mainLocation: mainLocation,
                owner: owner,
                formView: formView,
                actionBar: actionBar
            });

        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
            Y.Assert.areNotEqual("", container.getHTML(), "View container should contain the result of the this.view");

            Y.Assert.areEqual(
                container.one('.ez-main-content').getStyle('min-height'),
                container.get('winHeight') + 'px'
            );

            this.view.destroy();
            Y.Mock.verify(formView);
            Y.Mock.verify(actionBar);
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(5, Y.Object.keys(variables).length, "The template should receive 5 variables");
                Y.Assert.isBoolean(variables.isTouch, "isTouch should be available in the template and should be boolean");
                Y.Assert.isObject(variables.content, "content should be available in the template and should be an object");
                Y.Assert.isObject(variables.contentType, "contentType should be available in the template and should be an object");
                Y.Assert.isObject(variables.mainLocation, "mainLocation should be available in the template and should be an object");
                Y.Assert.isObject(variables.owner, "owner should be available in the template and should be an object");

                return  origTpl.call(this, variables);
            };
            this.view.render();
            this.view.destroy();
            Y.Mock.verify(formView);
            Y.Mock.verify(actionBar);
        },

        "Should render formView and actionBar in designated containers": function () {
            this.view.render();

            Y.Assert.areEqual(
                formContents,
                container.one('.ez-contenteditformview-container').getHTML(),
                "mock formContents is rendered in container"
            );
            Y.Assert.areEqual(
                actionBarContents,
                container.one('.ez-editactionbar-container').getHTML(),
                "mock actionBarContents is rendered in container"
            );

            this.view.destroy();
            Y.Mock.verify(formView);
            Y.Mock.verify(actionBar);
        },

        "Should destroy formView and ActionBar when destroying itself": function () {
            Y.Mock.expect(formView, {
                method: 'destroy'
            });
            Y.Mock.expect(actionBar, {
                method: 'destroy'
            });

            this.view.render();
            this.view.destroy();
            Y.Mock.verify(formView);
            Y.Mock.verify(actionBar);
        },

        "Should recieve events fired on it's child formView": function () {
            // We need another (not as in "setUp") view initialization sequence to test that
            var testEventReceived = false,
                view = new Y.eZ.ContentEditView({
                    container: container,
                    content: content,
                    contentType: contentType,
                    mainLocation: mainLocation,
                    owner: owner,
                    actionBar: actionBar
                });

            view.on('contentEditFormView:testEvent', function () {
                testEventReceived = true;
            });

            view.get('formView').fire('testEvent');

            Y.assert(testEventReceived, "Should have recieved the 'testEvent' from child contentEditFormView");
        },

        "Should recieve events fired on it's child actionBar": function () {
            // We need another (not as in "setUp") view initialization sequence to test that
            var view = new Y.eZ.ContentEditView({
                    container: container,
                    content: content,
                    contentType: contentType,
                    mainLocation: mainLocation,
                    owner: owner,
                    formView: formView
                }),
                testEventReceived = false;

            view.on('editActionBarView:testEvent', function () {
                testEventReceived = true;
            });

            view.get('actionBar').fire('testEvent');

            Y.assert(testEventReceived, "Should have recieved the 'testEvent' from child editActionBarView");
        },

        "Should fire a closeView event when tapping 'close' link": function () {
            var closeFired = false, that = this;

            this.view.render();

            this.view.on('closeView', function (e) {
                closeFired = true;
            });

            Y.one('.ez-view-close').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.assert(closeFired, "The close event should have been fired");
                });
            });
            this.wait();
        },

        "Should fire a closeView event when 'escape' hotkey is pressed": function () {
            var closeFired = false;

            this.view.on('closeView', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-main-content').simulate("keyup", { charCode: 27 }); // Sending "escape" key code
            Y.assert(closeFired, "The close event should have been fired");
        },

        "Should NOT fire a closeView event when any hotkey other than 'escape' is pressed": function () {
            var closeFired = false;

            this.view.on('closeView', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-main-content').simulate("keyup", { charCode: 28 }); // Sending some other key code
            Y.assert(!closeFired, "The close event should NOT have been fired");
        },

        "Should focus on the content element when the view becomes active": function () {
            this.view.render().set('active', true);
            Y.Assert.areSame(
                Y.config.doc.activeElement,
                container.one('.ez-main-content').getDOMNode(),
                "The main content should get the focus"
            );
        },

        "opacity of technical infos should vary if the device is not a touch device": function () {
            var header;

            this.view._isTouch = function () { return false; };
            this.view.render();

            header = this.view.get('container').one('header');
            header.simulate('mouseover');

            this.wait(function () {
                Y.Assert.areEqual(
                    1, header.one('.ez-technical-infos').getStyle('opacity'),
                    "Opacity should be 1"
                );
                header.simulate('mouseout');
                this.wait(function () {
                    Y.Assert.areEqual(
                        0, header.one('.ez-technical-infos').getStyle('opacity'),
                        "Opacity should be 0"
                    );
                }, 300);
            }, 300);
        },

        "opacity of technical infos should stay at 1 if the device is a touch device": function () {
            var header;

            this.view._isTouch = function () { return true; };
            this.view.render();

            header = this.view.get('container').one('header');
            header.simulate('mouseover');

            Y.assert(
                header.one('.ez-technical-infos').getStyle('opacity') == 1,
                "Opacity should be 1"
            );

            this.wait(function () {
                Y.Assert.areEqual(
                    1, header.one('.ez-technical-infos').getStyle('opacity'),
                    "Opacity should be 1"
                );
                header.simulate('mouseout');
                this.wait(function () {
                    Y.Assert.areEqual(
                        1, header.one('.ez-technical-infos').getStyle('opacity'),
                        "Opacity should be 1"
                    );
                }, 300);
            }, 300);
        },
    });

    titleTest = new Y.Test.Case({
        name: "View title test",

        setUp: function () {
            this.view = new Y.eZ.ContentEditView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should build the title with the content name": function () {
            var content = new Y.Mock(),
                contentName = 'Ryan Gosling';

            Y.Mock.expect(content, {
                method: 'get',
                args: ['name'],
                returns: contentName
            });
            this.view.set('content', content);
            Y.Assert.isTrue(
                this.view.getTitle().indexOf(contentName) != -1,
                "The title of the view should contain the content name"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(titleTest);

}, '0.0.1', {requires: ['test', 'node-event-simulate', 'ez-contenteditview']});

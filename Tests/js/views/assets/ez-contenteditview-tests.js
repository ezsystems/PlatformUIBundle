/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditview-tests', function (Y) {
    var viewTest, titleTest, eventTest, domEventTest, attrsToFormViewAndActionBarTest;

    viewTest = new Y.Test.Case({
        name: "eZ Content Edit View test",

        setUp: function () {
            var mockConf = {
                    method: 'toJSON',
                    returns: {}
                };

            Y.Array.each(['content', 'contentType', 'owner', 'mainLocation', 'version'], function (mock) {
                this[mock] = new Y.Mock();
                Y.Mock.expect(this[mock], mockConf);
            }, this);

            this.formView = new Y.Mock();
            this.formViewContents = '<form></form>';
            this.actionBar = new Y.Mock();
            this.actionBarContents = '<menu></menu>';
            this.languageCode = 'eng-GB';

            Y.Mock.expect(this.formView, {
                method: 'get',
                args: ['container'],
                returns: this.formViewContents
            });

            Y.Mock.expect(this.formView, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(this.formView, {
                method: 'render',
                returns: this.formView
            });
            Y.Mock.expect(this.formView, {
                method: 'destroy'
            });

            Y.Mock.expect(this.actionBar, {
                method: 'get',
                args: ['container'],
                returns: this.actionBarContents
            });

            Y.Mock.expect(this.actionBar, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(this.actionBar, {
                method: 'render',
                returns: this.actionBar
            });
            Y.Mock.expect(this.actionBar, {
                method: 'destroy'
            });

            this.view = new Y.eZ.ContentEditView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                mainLocation: this.mainLocation,
                version: this.version,
                owner: this.owner,
                formView: this.formView,
                actionBar: this.actionBar,
                languageCode: this.languageCode
            });
            Y.Mock.expect(this.actionBar, {
                method: 'removeTarget',
                args: [this.view]
            });
            Y.Mock.expect(this.formView, {
                method: 'removeTarget',
                args: [this.view]
            });

        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl,
                container = this.view.get('container');

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
            Y.Mock.verify(this.formView);
            Y.Mock.verify(this.actionBar);
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(6, Y.Object.keys(variables).length, "The template should receive 6 variables");
                Y.Assert.isObject(variables.content, "content should be available in the template and should be an object");
                Y.Assert.isObject(variables.contentType, "contentType should be available in the template and should be an object");
                Y.Assert.isObject(variables.mainLocation, "mainLocation should be available in the template and should be an object");
                Y.Assert.isObject(variables.owner, "owner should be available in the template and should be an object");
                Y.Assert.isObject(variables.version, "version should be available in the template and should be an object");
                Y.Assert.isString(variables.languageCode, "languageCode should be available in the template and should be a string");

                return  origTpl.call(this, variables);
            };
            this.view.render();
            this.view.destroy();
            Y.Mock.verify(this.formView);
            Y.Mock.verify(this.actionBar);
        },

        "Should render formView and actionBar in designated containers": function () {
            var container = this.view.get('container');

            this.view.render();

            Y.Assert.areEqual(
                this.formViewContents,
                container.one('.ez-contenteditformview-container').getHTML(),
                "mock formContents is not rendered in its container"
            );
            Y.Assert.areEqual(
                this.actionBarContents,
                container.one('.ez-editactionbar-container').getHTML(),
                "mock actionBarContents is not rendered in its container"
            );

            this.view.destroy();
            Y.Mock.verify(this.formView);
            Y.Mock.verify(this.actionBar);
        },

        "Should destroy formView and ActionBar when destroying itself": function () {
            Y.Mock.expect(this.formView, {
                method: 'destroy'
            });
            Y.Mock.expect(this.actionBar, {
                method: 'destroy'
            });

            this.view.render();
            this.view.destroy();
            Y.Mock.verify(this.formView);
            Y.Mock.verify(this.actionBar);
        },

        "Should receive events fired on it's child formView": function () {
            Y.Mock.expect(this.contentType, {
                method: 'get',
                args: ['fieldDefinitions']
            });
            // We need another (not as in "setUp") view initialization sequence to test that
            var testEventReceived = false,
                view = new Y.eZ.ContentEditView({
                    container: '.container',
                    content: this.content,
                    contentType: this.contentType,
                    mainLocation: this.mainLocation,
                    owner: this.owner,
                    actionBar: this.actionBar
                });

            view.on('contentEditFormView:testEvent', function () {
                testEventReceived = true;
            });

            view.get('formView').fire('testEvent');

            Y.assert(testEventReceived, "Should have received the 'testEvent' from child contentEditFormView");
        },

        "Should receive events fired on it's child actionBar": function () {
            // We need another (not as in "setUp") view initialization sequence to test that
            var view = new Y.eZ.ContentEditView({
                    container: '.container',
                    content: this.content,
                    contentType: this.contentType,
                    mainLocation: this.mainLocation,
                    owner: this.owner,
                    formView: this.formView
                }),
                testEventReceived = false;

            view.on('editActionBarView:testEvent', function () {
                testEventReceived = true;
            });

            view.get('actionBar').fire('testEvent');

            Y.assert(testEventReceived, "Should have received the 'testEvent' from child editActionBarView");
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
            var closeFired = false, container = this.view.get('container');

            this.view.on('closeView', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-main-content').simulate("keyup", { charCode: 27 }); // Sending "escape" key code
            Y.assert(closeFired, "The close event should have been fired");
        },

        "Should NOT fire a closeView event when any hotkey other than 'escape' is pressed": function () {
            var closeFired = false, container = this.view.get('container');

            this.view.on('closeView', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-main-content').simulate("keyup", { charCode: 28 }); // Sending some other key code
            Y.assert(!closeFired, "The close event should NOT have been fired");
        },

        "Should focus on the content element when the view becomes active": function () {
            var container = this.view.get('container');
            this.view.render().set('active', true);
            Y.Assert.areSame(
                Y.config.doc.activeElement,
                container.one('.ez-main-content').getDOMNode(),
                "The main content should get the focus"
            );
        },

        "Should show the infos when hover the header": function () {
            var header, container = this.view.get('container');

            this.view._isTouch = function () { return false; };
            this.view.render();

            header = container.one('.ez-page-header');
            header.simulate('mouseover');

            Y.Assert.isTrue(
                container.hasClass('is-showing-infos'),
                "The infos should be shown"
            );
        },

        "Should hide the infos when moving the mouse out of the header": function () {
            var container = this.view.get('container');

            this["Should show the infos when hover the header"]();
            container.one('header').simulate('mouseout');

            Y.Assert.isFalse(
                container.hasClass('is-showing-infos'),
                "The infos should be hidden"
            );
        },

        "Should add a class when detecting a touch device": function () {
            var header, container = this.view.get('container');

            this.view._isTouch = function () { return true; };
            this.view.render();

            header = container.one('.ez-page-header');
            header.simulate('mouseover');

            Y.Assert.isTrue(
                container.hasClass('is-using-touch-device'),
                "The container should have the 'is-using-touch-device' class"
            );
        },

        "Should show the infos when tap on the header": function () {
            var header, container = this.view.get('container'),
                that = this;

            this.view._isTouch = function () { return false; };
            this.view.render();

            header = container.one('.ez-page-header');

            header.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(
                        container.hasClass('is-showing-infos'),
                        "The infos should be shown"
                    );
                });
            });
            this.wait();
        },

        "Should hide the infos when clicking outside of the header": function () {
            var container = this.view.get('container');

            this["Should show the infos when tap on the header"]();
            container.one('.ez-contenteditformview-container').simulate('click');

            Y.Assert.isFalse(
                container.hasClass('is-showing-infos'),
                "The infos should be hidden"
            );
        },

        "Should hide the infos when clicking outside of the header in touch mode": function () {
            var container = this.view.get('container');

            this["Should show the infos when tap on the header"]();
            this.view._isTouch = function () { return true; };
            container.one('.ez-contenteditformview-container').simulate('click');

            Y.Assert.isFalse(
                container.hasClass('is-showing-infos'),
                "The infos should be hidden"
            );
        },
    });

    titleTest = new Y.Test.Case({
        name: "View title test",

        setUp: function () {
            var mockConf = {
                    method: 'toJSON',
                    returns: {}
                };

            Y.Array.each(['content', 'contentType', 'owner', 'mainLocation', 'version'], function (mock) {
                this[mock] = new Y.Mock();
                Y.Mock.expect(this[mock], mockConf);
            }, this);

            this.formView = new Y.Mock();
            this.formViewContents = '<form></form>';
            this.actionBar = new Y.Mock();
            this.actionBarContents = '<menu></menu>';

            Y.Mock.expect(this.formView, {
                method: 'get',
                args: ['container'],
                returns: this.formViewContents
            });

            Y.Mock.expect(this.formView, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(this.formView, {
                method: 'render',
                returns: this.formView
            });
            Y.Mock.expect(this.formView, {
                method: 'destroy'
            });

            Y.Mock.expect(this.actionBar, {
                method: 'get',
                args: ['container'],
                returns: this.actionBarContents
            });

            Y.Mock.expect(this.actionBar, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(this.actionBar, {
                method: 'render',
                returns: this.actionBar
            });
            Y.Mock.expect(this.actionBar, {
                method: 'destroy'
            });

            this.view = new Y.eZ.ContentEditView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                mainLocation: this.mainLocation,
                version: this.version,
                owner: this.owner,
                formView: this.formView,
                actionBar: this.actionBar
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should build the title with the content name": function () {
            var content = this.content,
                contentName = 'Ryan Gosling';

            Y.Mock.expect(content, {
                method: 'get',
                args: ['name'],
                returns: contentName
            });
            Y.Assert.isTrue(
                this.view.getTitle().indexOf(contentName) != -1,
                "The title of the view should contain the content name"
            );
        },
    });

    attrsToFormViewAndActionBarTest = new Y.Test.Case({
        name: "eZ Content Edit View event tests",

        setUp: function () {

            Y.eZ.ContentEditFormView = Y.Base.create('contentEditFormView', Y.View, [], {}, {
                ATTRS: {
                    content: {},
                    contentType: {},
                    config: {},
                    version: {},
                },
            });

            Y.eZ.ActionBarView = Y.Base.create('actionBarView', Y.View, [], {}, {
                ATTRS: {
                    content: {},
                    version: {},
                },
            });

            this.view = new Y.eZ.ContentEditView({
                container: '.container',
                content: {},
                contentType: {},
                mainLocation: {},
                version: {},
                config: {},
                owner: {},
            });
        },

        tearDown: function () {
            delete Y.eZ.ActionBarView;
            delete Y.eZ.ContentEditFormView;
            this.view.destroy();
        },

        "Should set the version of the action bar": function () {
            Y.Assert.areSame(
                this.view.get('version'),
                this.view.get('actionBar').get('version'),
                'The version should have been set to the actionBar'
            );
        },

        "Should set the content of the action bar": function () {
            Y.Assert.areSame(
                this.view.get('content'),
                this.view.get('actionBar').get('content'),
                'The content should have been set to the actionBar'
            );
        },

        "Should set the version of the contentEditFormView": function () {
            Y.Assert.areSame(
                this.view.get('version'),
                this.view.get('formView').get('version'),
                'The version should have been set to the contentEditFormView'
            );
        },

        "Should set the content of the contentEditFormView": function () {
            Y.Assert.areSame(
                this.view.get('content'),
                this.view.get('formView').get('content'),
                'The content should have been set to the contentEditFormView'
            );
        },

        "Should set the content type of the contentEditFormView": function () {
            Y.Assert.areSame(
                this.view.get('contentType'),
                this.view.get('formView').get('contentType'),
                'The content should have been set to the contentEditFormView'
            );
        },

        "Should set the config of the contentEditFormView": function () {
            Y.Assert.areSame(
                this.view.get('config'),
                this.view.get('formView').get('config'),
                'The content should have been set to the contentEditFormView'
            );
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Content Edit View event tests",

        setUp: function () {
            this.formView = new Y.Mock();
            this.actionBar = new Y.Mock();

            this._configureSubViewMock(this.formView);
            this._configureSubViewMock(this.actionBar);

            this.view = new Y.eZ.ContentEditView({
                actionBar: this.actionBar,
                formView: this.formView
            });
        },

        _configureSubViewMock: function (view) {
            Y.Mock.expect(view, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object]
            });
            Y.Mock.expect(view, {
                method: 'set',
                args: [Y.Mock.Value.String, Y.Mock.Value.Any]
            });
        },

        tearDown: function () {
            delete this.view;
        },

        _testAddDataActionEvent: function (evt) {
            var fields = [], valid = true;

            Y.Mock.expect(this.formView, {
                method: 'getFields',
                returns: fields
            });
            Y.Mock.expect(this.formView, {
                method: 'isValid',
                returns: valid
            });

            this.view.on('*:' + evt, function (e) {
                Y.Assert.areSame(
                    fields,
                    e.fields,
                    "The fields should be availabled in the event facade"
                );
                Y.Assert.areSame(
                    valid,
                    e.formIsValid,
                    "The form validity should be available in the event facade"
                );
            });
            this.view.fire('whatever:' + evt);
        },

        "Should add data to the saveAction event facade": function () {
            this._testAddDataActionEvent('saveAction');
        },

        "Should add data to the publishAction event facade": function () {
            this._testAddDataActionEvent('publishAction');
        }
    });

    domEventTest = new Y.Test.Case({
        name: "eZ Content Edit View DOM event tests",

        setUp: function () {
            var mockConf = {
                    method: 'toJSON',
                    returns: {}
                };

            Y.Array.each(['content', 'contentType', 'owner', 'mainLocation', 'version'], function (mock) {
                this[mock] = new Y.Mock();
                Y.Mock.expect(this[mock], mockConf);
            }, this);

            this.formView = new Y.Mock();
            this.formViewContents = '<form></form>';
            this.actionBar = new Y.Mock();
            this.actionBarContents = '<menu></menu>';
            this.languageCode = 'eng-GB';

            Y.Mock.expect(this.formView, {
                method: 'get',
                args: ['container'],
                returns: this.formViewContents
            });

            Y.Mock.expect(this.formView, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(this.formView, {
                method: 'render',
                returns: this.formView
            });
            Y.Mock.expect(this.formView, {
                method: 'destroy'
            });

            Y.Mock.expect(this.actionBar, {
                method: 'get',
                args: ['container'],
                returns: this.actionBarContents
            });

            Y.Mock.expect(this.actionBar, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(this.actionBar, {
                method: 'render',
                returns: this.actionBar
            });
            Y.Mock.expect(this.actionBar, {
                method: 'destroy'
            });

            this.view = new Y.eZ.ContentEditView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                mainLocation: this.mainLocation,
                version: this.version,
                owner: this.owner,
                formView: this.formView,
                actionBar: this.actionBar,
                languageCode: this.languageCode
            });
            Y.Mock.expect(this.actionBar, {
                method: 'removeTarget',
                args: [this.view]
            });
            Y.Mock.expect(this.formView, {
                method: 'removeTarget',
                args: [this.view]
            });

            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire `changeLanguage` event": function () {
            var changeLanguageFired = false,
                changeLanguageLink = this.view.get('container').one('.ez-change-content-language-link'),
                that = this;

            this.view.on('changeLanguage', function (e) {
                changeLanguageFired = true;
            });

            changeLanguageLink.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(
                        changeLanguageFired,
                        "The changeLanguage event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should update language indicator": function () {
            var changedLanguageCode = 'pol-PL',
                languageIndicator = this.view.get('container').one('.ez-content-current-language');

            this.view.set('active', true);
            this.view.set('languageCode', changedLanguageCode);
            
            Y.Assert.areEqual(
                languageIndicator.getHTML(),
                changedLanguageCode,
                "The language indicator should be updated"
            );
        }
    });

    Y.Test.Runner.setName("eZ Content Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(titleTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(domEventTest);
    Y.Test.Runner.add(attrsToFormViewAndActionBarTest);

}, '', {requires: ['test', 'node-event-simulate', 'ez-contenteditview']});

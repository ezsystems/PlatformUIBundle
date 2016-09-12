/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverycreateview-tests', function (Y) {
    var renderTest, resetTest, wizardTest, visibleChangeTest, defaultWizardTest,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Create render tests',

        setUp: function () {
            this.wizard = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryCreateView({
                wizardView: this.wizard,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.wizard.destroy();
        },

        "Should use the template": function () {
            var origTpl = this.view.template,
                templateCalled = false;

            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();

            Assert.isTrue(
                templateCalled, "The template should have been used to render the view"
            );
        },
    });

    resetTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Create render tests',

        setUp: function () {
            this.wizard = new Mock(new Y.View());
            this.view = new Y.eZ.UniversalDiscoveryCreateView({
                wizardView: this.wizard,
            });
            Y.eZ.Location = Y.Base; // TODO remove that when calling UDW from UDW works
        },

        tearDown: function () {
            this.view.destroy();
            this.wizard.destroy();
            delete this.wizard;
            delete Y.eZ.Location;
        },

        "Should reset the wizard view": function () {
            Mock.expect(this.wizard, {
                method: 'reset',
            });
            this.view.reset();

            Mock.verify(this.wizard);
        },

        "Should reset the properties": function () {
            this.view.render();
            this.view.set('contentTypeGroups', []);

            this.view.reset();

            Assert.isNull(
                this.view.get('contentTypeGroups'),
                "The attribute should be resetted to its default value"
            );
        },
    });

    wizardTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Create wizard tests',

        setUp: function () {
            this.wizard = new Mock(new Y.View());
            this.view = new Y.eZ.UniversalDiscoveryCreateView({
                wizardView: this.wizard,
            });
            Y.eZ.Location = Y.Base; // TODO remove that when calling UDW from UDW works
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.wizard.destroy();
            delete this.wizard;
            delete Y.eZ.Location;
        },

        "Should receive the content type group list": function () {
            var list = [];

            this.view.set('contentTypeGroups', list);

            Assert.areSame(
                list, this.wizard.get('contentTypeGroups'),
                "The wizard view should have received the content type groups"
            );
        },

        "Should render the wizard": function () {
            var wizardElement = this.view.get('container').one('.ez-wizard-container');

            Mock.expect(this.wizard, {
                method: 'render',
                returns: this.wizard,
            });
            this.view.set('contentTypeGroups', []);

            Mock.verify(this.wizard);
            Assert.isTrue(
                wizardElement.contains(this.wizard.get('container')),
                "The wizard should be added to the wizard element"
            );
        },

        "Should set the wizard as active": function () {
            this.view.set('contentTypeGroups', []);

            Assert.isTrue(
                this.wizard.get('active'),
                "The wizard should be active"
            );
        },
    });

    visibleChangeTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Create visible change tests',

        setUp: function () {
            this.wizard = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryCreateView({
                wizardView: this.wizard,
            });
            Y.eZ.Location = Y.Base; // TODO remove that when calling UDW from UDW works
        },

        tearDown: function () {
            this.view.destroy();
            this.wizard.destroy();
            delete Y.eZ.Location;
        },

        "Should fire the loadContentTypes event": function () {
            var loadContentTypes = false;

            this.view.on('loadContentTypes', function () {
                loadContentTypes = true;
            });
            this.view.set('visible', true);

            Assert.isTrue(
                loadContentTypes,
                "The loadContentTypes event should have been fired"
            );
        },

        "Should reset the view when getting invisible": function () {
            this.view.render();
            this.view.set('visible', true);
            this.view.set('contentTypeGroups', []);
            this.view.set('visible', false);

            Assert.isNull(
                this.view.get('contentTypeGroups'),
                "The view should have been resetted"
            );
        },
    });

    defaultWizardTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Create default wizard tests',

        setUp: function () {
            Y.eZ.ContentCreationWizardView = Y.View;
            this.view = new Y.eZ.UniversalDiscoveryCreateView();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.ContentCreationWizardView;
        },

        "Should instantiate the wizard": function () {
            Assert.isInstanceOf(
                Y.eZ.ContentCreationWizardView,
                this.view.get('wizardView'),
                "The wizard should be an instance of eZ.ContentCreationWizardView"
            );
        },

        "Should add the method as a bubble target of the wizard": function () {
            var evtName = 'whatever',
                bubble = false;

            this.view.on('*:' + evtName, function () {
                bubble = true;
            });
            this.view.get('wizardView').fire(evtName);

            Assert.isTrue(
                bubble,
                "The method should be bubble target of the wizard"
            );
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Create View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(wizardTest);
    Y.Test.Runner.add(visibleChangeTest);
    Y.Test.Runner.add(defaultWizardTest);
}, '', {requires: ['test', 'base', 'view', 'ez-universaldiscoverycreateview']});

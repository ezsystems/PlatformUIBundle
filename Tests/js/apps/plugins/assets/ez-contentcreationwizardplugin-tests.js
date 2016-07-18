/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardplugin-tests', function (Y) {
    var registerTest, eventsTest,
        Mock = Y.Mock;

    eventsTest = new Y.Test.Case({
        name: 'eZ Content Creation Wizard Plugin event tests',

        setUp: function () {
            this.app = new Mock(new Y.Base());
            this.plugin = new Y.eZ.Plugin.ContentCreationWizard({
                host: this.app,
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
            this.app.destroy();
            delete this.app;
        },

        "Should show the content creation wizard side view": function () {
            Mock.expect(this.app, {
                method: 'showSideView',
                args: ['contentCreationWizard'],
            });
            this.app.fire('whatever:contentCreationWizardOpen');
            Mock.verify(this.app);
        },

        _hideTest: function (eventName) {
            Mock.expect(this.app, {
                method: 'hideSideView',
                args: ['contentCreationWizard'],
            });
            this.app.fire(eventName);
            Mock.verify(this.app);

        },

        "Should hide the content creation wizard side view on contentCreationWizardClose": function () {
            this._hideTest('whatever:contentCreationWizardClose');
        },

        "Should hide the content creation wizard side view on contentCreationWizardEnding": function () {
            this._hideTest('whatever:contentCreationWizardEnding');
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentCreationWizard;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Content Creation Wizard Plugin tests");
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-contentcreationwizardplugin', 'ez-pluginregister-tests']});

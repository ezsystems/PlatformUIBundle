/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentpeekplugin-tests', function (Y) {
    var registerTest, eventsTest,
        Assert = Y.Assert, Mock = Y.Mock;

    eventsTest = new Y.Test.Case({
        name: 'eZ Content Peek Plugin events tests',

        setUp: function () {
            this.app = new Mock(new Y.Base());
            this.plugin = new Y.eZ.Plugin.ContentPeek({
                host: this.app,
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
            this.app.destroy();
            delete this.app;
        },

        "Should show the content peek side view": function () {
            var eventConfig = {
                    languageCode: 'fre-FR',
                };

            Mock.expect(this.app, {
                method: 'showSideView',
                args: ['contentPeek', eventConfig]
            });
            this.app.fire('whatever:contentPeekOpen', {config: eventConfig});
            Mock.verify(this.app);
        },

        "Should set the languageCode based on the content main language": function () {
            var content = new Y.Base(),
                mainLanguageCode = 'fre-FR',
                eventConfig = {
                    content: content,
                };
            
            content.set('mainLanguageCode', mainLanguageCode);
            Mock.expect(this.app, {
                method: 'showSideView',
                args: ['contentPeek', eventConfig],
                run: function (name, config) {
                    Assert.areEqual(
                        mainLanguageCode, config.languageCode,
                        "The languageCode should be set with the content main language code"
                    );
                },
            });
            this.app.fire('whatever:contentPeekOpen', {config: eventConfig});
            Mock.verify(this.app);
        },

        "Should hide the content peek side view": function () {
            Mock.expect(this.app, {
                method: 'hideSideView',
                args: ['contentPeek']
            });
            this.app.fire('whatever:contentPeekClose');
            Mock.verify(this.app);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentPeek;
    registerTest.components = ['platformuiApp'];

    Y.Test.Runner.setName("eZ Content Peek Plugin tests");
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-contentpeekplugin', 'ez-pluginregister-tests']});

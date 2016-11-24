/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageswitcherview-tests', function (Y) {
    var viewTest, viewTestWithoutOtherTranslations, eventTest, renderTest, hideTest,
        eventSwitchModeTest,
        Mock = Y.Mock, Assert = Y.Assert,
        currentVersion = {
            'languageCodes': 'eng-GB,pol-PL,ger-DE,fre-FR'
        };

    viewTest = new Y.Test.Case({
        name: "eZ Language Switcher View view test",

        setUp: function () {
            this.location = {
                id: 'zbigniew-boniek'
            };
            this.languageCode = 'eng-GB';
            this.versionMock = new Mock();
            this.contentMock = new Mock();
            this.locationMock = new Mock();

            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: this.location
            });
            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });
            Mock.expect(this.versionMock, {
                method: 'get',
                args: ['languageCodes'],
                returns: currentVersion.languageCodes
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                args: [],
                run: function () {
                    return currentVersion.languageCodes.split(',');
                }
            });

            this.view = new Y.eZ.LanguageSwitcherView({
                container: '.container',
                content: this.contentMock,
                location: this.locationMock,
                languageCode: this.languageCode,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should use a template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
        },

        "Should provide data to the template": function () {
            var origTpl, that = this;

            origTpl = this.view.template;
            this.view.template = function (vars) {
                Assert.isObject(vars.location, "The template should receive a location object");
                Assert.areSame(
                    that.location,
                    vars.location,
                    "The location object should be the result of toJSON"
                );
                Assert.isString(vars.currentTranslation, "The template should receive a currentTranslation");
                Assert.areEqual(
                    that.languageCode,
                    vars.currentTranslation,
                    "The currentTranslation should be the same as location's languageCode"
                );
                Assert.isArray(vars.otherTranslations, "The template should receive an array with other translations");
                Assert.areEqual(
                    currentVersion.languageCodes.split(',').length-1, // minus current language version
                    vars.otherTranslations.length,
                    "The number of other translations should be one less than number of content translations"
                );
                Assert.isTrue(
                    vars.otherTranslations.indexOf(that.languageCode) === -1,
                    "The other translations array should not contain current translation"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    viewTestWithoutOtherTranslations = new Y.Test.Case({
        name: "eZ Language Switcher View view test without other translations",

        setUp: function () {
            var currentVersionSingleTranslation = {
                    'languageCodes': 'eng-GB'
                };

            this.location = {
                id: 'zbigniew-boniek'
            };
            this.languageCode = 'eng-GB';
            this.versionMock = new Mock();
            this.contentMock = new Mock();
            this.locationMock = new Mock();

            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: this.location
            });
            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });
            Mock.expect(this.versionMock, {
                method: 'get',
                args: ['languageCodes'],
                returns: currentVersionSingleTranslation.languageCodes
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                args: [],
                run: function () {
                    return currentVersionSingleTranslation.languageCodes.split(',');
                }
            });

            this.view = new Y.eZ.LanguageSwitcherView({
                container: '.container',
                content: this.contentMock,
                location: this.locationMock,
                languageCode: this.languageCode,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should provide empty other translations array to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = function (vars) {
                Assert.isArray(vars.otherTranslations, "The template should receive an array with other translations");
                Assert.areEqual(
                    0, // minus current language version
                    vars.otherTranslations.length,
                    "The number of other translations should be one less than number of content translations"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Language Switcher View event test",

        setUp: function () {
            this.location = {
                id: 'kazimierz-deyna'
            };
            this.languageCode = 'eng-GB';
            this.versionMock = new Mock();
            this.contentMock = new Mock();
            this.locationMock = new Mock();

            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: this.location
            });
            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });
            Mock.expect(this.versionMock, {
                method: 'get',
                args: ['languageCodes'],
                returns: currentVersion.languageCodes
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                args: [],
                run: function () {
                    return currentVersion.languageCodes.split(',');
                }
            });

            this.view = new Y.eZ.LanguageSwitcherView({
                container: '.container',
                content: this.contentMock,
                location: this.locationMock,
                languageCode: this.languageCode,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should expand the view when language switcher link is tapped": function () {
            var container = this.view.get('container'),
                that = this,
                otherTranslationsLink;

            this.view.set('expanded',false);
            this.view.render();
            otherTranslationsLink = container.one('.ez-dropdown-list-indicator');

            otherTranslationsLink.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        this.view.get('expanded'),
                        'The expanded should state should be true'
                    );
                });
            });
            this.wait();
        },

        "Should hide the view when language switcher link is tapped": function () {
            var container = this.view.get('container'),
                that = this,
                otherTranslationsLink;

            this.view.set('expanded',true);
            this.view.render();
            otherTranslationsLink = container.one('.ez-dropdown-list-indicator');

            otherTranslationsLink.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isFalse(
                        this.view.get('expanded'),
                        'The expanded should state should be true'
                    );
                });
            });
            this.wait();
        },
    });

    hideTest = new Y.Test.Case({
        name: "eZ Language Switcher View hide test",

        setUp: function () {
            this.location = {
                id: 'kazimierz-deyna'
            };
            this.languageCode = 'eng-GB';
            this.versionMock = new Mock();
            this.contentMock = new Mock();
            this.locationMock = new Mock();

            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: this.location
            });
            Mock.expect(this.versionMock, {
                method: 'get',
                args: ['languageCodes'],
                returns: currentVersion.languageCodes
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
            });
            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });

            this.view = new Y.eZ.LanguageSwitcherView({
                container: '.container',
                content: this.contentMock,
                location: this.locationMock,
                languageCode: this.languageCode,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should hide the selector when clicking outside of the view": function () {
            this.view.render();
            this.view.set('expanded', true);
            Y.one('.click-somewhere').simulate('click');

            Assert.isFalse(this.view.get('expanded'), "The view should be hidden");
        },

        "Should leave the view when clicking outside of the view": function () {
            this.view.render();
            this.view.set('expanded', true);
            this.view.set('expanded', false);
            Y.one('.click-somewhere').simulate('click');

            Assert.isFalse(this.view.get('expanded'), "The view should be hidden");
        }
    });

    eventSwitchModeTest = new Y.Test.Case({
        name: "eZ Language Switcher View 'event' switch mode test",

        setUp: function () {
            this.languageCode = 'eng-GB';
            this.translationList = ['eng-GB', 'fre-FR'];
            this.versionMock = new Mock();
            this.contentMock = new Mock();
            this.locationMock = new Mock();

            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: this.location
            });
            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: this.translationList,
            });
            this.view = new Y.eZ.LanguageSwitcherView({
                container: '.container',
                switchMode: 'event',
                location: this.locationMock,
                content: this.contentMock,
                languageCode: this.languageCode,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the switchLanguage event": function () {
            var container = this.view.get('container'),
                link = container.one('.ez-language-switch-link');

            container.once('tap', function (e) {
                Assert.isTrue(
                    !!e.prevented,
                    "The tap event should have been prevented"
                );
            });

            this.view.set('expanded', true);
            this.view.after('switchLanguage', this.next(function (e) {
                Assert.areEqual(
                    link.getData('language-code'), e.languageCode,
                    "The new language code should be in the event facade"
                );
                Assert.areEqual(
                    this.languageCode, e.oldLanguageCode,
                    "The old language code should be in the event facade"
                );
                Assert.isFalse(
                    this.view.get('expanded'),
                    "The language list should be hidden"
                );
            }, this));
            link.simulateGesture('tap');
            this.wait();
        },

        "Should rerender the view": function () {
            var container = this.view.get('container'),
                link = container.one('.ez-language-switch-link');

            link.simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    link.getData('language-code'),
                    container.one('.ez-dropdown-list-indicator').get('text'),
                    "The view should have been rerendered"
                );
            }, this));
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Language Switcher View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(viewTestWithoutOtherTranslations);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(hideTest);
    Y.Test.Runner.add(eventSwitchModeTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-languageswitcherview']});

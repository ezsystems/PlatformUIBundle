/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageswitcherview-tests', function (Y) {
    var viewTest, viewTestWithoutOtherTranslations, eventTest, renderTest, hideTest,
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

    renderTest = new Y.Test.Case({
        name: "eZ Language Switcher View render test",

        setUp: function () {
            this.location = {
                id: 'grzegorz-lato'
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
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should render translations list when there are other translations": function () {
            var container,
                currentVersionMultiTranslations = {
                    'languageCodes': 'eng-GB,pol-PL,ger-DE,fre-FR'
                };

            Mock.expect(this.versionMock, {
                method: 'get',
                args: ['languageCodes'],
                returns: currentVersionMultiTranslations.languageCodes
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                run: function () {
                    return currentVersionMultiTranslations.languageCodes.split(',');
                }
            });

            this.view = new Y.eZ.LanguageSwitcherView({
                container: '.container',
                content: this.contentMock,
                location: this.locationMock,
                languageCode: this.languageCode,
            });
            this.view.render();

            container = this.view.get('container');

            Assert.isNotNull(
                container.one('.ez-expandable-area'),
                'Should render the translations list'
            );
        },

        "Should not render translations list when there is any other translation": function () {
            var container,
                currentVersionSingleTranslation = {
                    'languageCodes': 'eng-GB'
                };

            Mock.expect(this.versionMock, {
                method: 'get',
                args: ['languageCodes'],
                returns: currentVersionSingleTranslation.languageCodes
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
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
            this.view.render();

            container = this.view.get('container');

            Assert.isNull(
                container.one('.ez-expandable-area'),
                'Should not render the translations list'
            );
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

    Y.Test.Runner.setName("eZ Language Switcher View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(viewTestWithoutOtherTranslations);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(hideTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-languageswitcherview']});

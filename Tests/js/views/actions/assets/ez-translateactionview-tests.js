/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-translateactionview-tests', function (Y) {
    var viewTest, eventTest, renderTest, domEventTest, hideTest, hintTest,
        Mock = Y.Mock, Assert = Y.Assert;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            setUp: function () {
                this.actionId = 'translate';
                this.label = 'Translate test label';
                this.hint = 'eng-GB, pol-PL';
                this.translationsList = ['eng-GB', 'pol-PL'];
                this.disabled = false;
                this.templateVariablesCount = 7;
                this.contentMock = new Mock();
                this.locationMock = new Mock();
                this.versionMock = new Mock();

                Mock.expect(this.contentMock, {
                    method: 'get',
                    args: ['currentVersion'],
                    returns: this.versionMock
                });
                Mock.expect(this.versionMock, {
                    method: 'getTranslationsList',
                    returns: this.translationsList
                });
                Mock.expect(this.locationMock, {
                    method: 'toJSON',
                    returns: {}
                });
                Mock.expect(this.contentMock, {
                    method: 'toJSON',
                    returns: {}
                });

                this.view = new Y.eZ.TranslateActionView({
                    container: '.container',
                    actionId: this.actionId,
                    label: this.label,
                    hint: this.hint,
                    disabled: this.disabled,
                    content: this.contentMock,
                    location: this.locationMock
                });
            },

            tearDown: function () {
                this.view.destroy();
                delete this.view;
            },
        })
    );

    eventTest = new Y.Test.Case({
        name: 'eZ Translate Action View event test',

        setUp: function () {
            this.contentMock = new Mock();
            this.locationMock = new Mock();
            this.versionMock = new Mock();
            this.translationsList = ['eng-GB', 'pol-PL', 'ger-DE'];

            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: this.translationsList
            });
            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentMock, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.TranslateActionView({
                container: '.container',
                actionId: 'translate',
                label: 'Translations',
                disabled: false,
                content: this.contentMock,
                location: this.locationMock
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        'Should expand the view when receiving the translateAction event': function () {
            this.view.render();
            this.view.set('expanded', false);
            this.view.fire('translateAction');

            Assert.isTrue(this.view.get('expanded'), "The expanded state should be true");
        },

        'Should hide the view when receiving the translateAction event': function () {
            this.view.render();
            this.view.set('expanded', true);
            this.view.fire('translateAction');

            Assert.isFalse(this.view.get('expanded'), "The expanded state should be false");
        },
    });

    domEventTest = new Y.Test.Case({
        name: 'eZ Translate Action View DOM event test',

        setUp: function () {
            this.contentMock = new Mock();
            this.locationMock = new Mock();
            this.versionMock = new Mock();
            this.translationsList = ['eng-GB', 'pol-PL', 'ger-DE'];

            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: this.translationsList
            });
            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentMock, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.TranslateActionView({
                container: '.container',
                actionId: 'translate',
                label: 'Translations',
                disabled: false,
                content: this.contentMock,
                location: this.locationMock
            });

            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        'Should fire languageSelect event': function () {
            var that = this,
                newTranslationButton = this.view.get('container').one('.ez-newtranslation-button'),
                languageSelectFired = false;

            this.view.on('languageSelect', function (e) {
                languageSelectFired = true;

                Assert.areSame(
                    that.translationsList,
                    e.config.referenceLanguageList,
                    'The config should contain the proper list of languages'
                );
                Assert.isTrue(
                    e.config.canBaseTranslation,
                    'The canBaseTranslation in config should be set to true'
                );
            });

            newTranslationButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        languageSelectFired,
                        "The languageSelect event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should fire translateContent event": function () {
            var that = this,
                newTranslationButton = this.view.get('container').one('.ez-newtranslation-button'),
                translateContentFired = false,
                selectedLanguageCode = 'fre-FR',
                selectedBaseLanguageCode = 'eng-GB',
                baseTranslation = true;

            this.view.on('languageSelect', function (e) {
                var config = {
                    selectedLanguageCode: selectedLanguageCode,
                    selectedBaseLanguageCode: selectedBaseLanguageCode,
                    baseTranslation: baseTranslation,
                };

                e.config.languageSelectedHandler(config);
            });

            this.view.on('translateContent', function (e) {
                translateContentFired = true;

                Assert.areSame(
                    selectedLanguageCode,
                    e.toLanguageCode,
                    'The selectedLanguageCode should match toLanguageCode in event facade'
                );
                Assert.areSame(
                    selectedBaseLanguageCode,
                    e.baseLanguageCode,
                    'The selectedBaseLanguageCode should match baseLanguageCode in event facade'
                );
            });

            newTranslationButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        translateContentFired,
                        "The translateContent event should have been fired"
                    );
                });
            });
            this.wait();
        }
    });

    hideTest = new Y.Test.Case({
        name: 'eZ Translate Action View hide test',

        setUp: function () {
            this.contentMock = new Mock();
            this.locationMock = new Mock();
            this.versionMock = new Mock();
            this.translationsList = ['eng-GB', 'pol-PL'];

            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });
            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: this.translationsList
            });
            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentMock, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.TranslateActionView({
                container: '.container',
                actionId: 'translate',
                label: 'Translations',
                disabled: false,
                content: this.contentMock,
                location: this.locationMock
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should hide the view when clicking outside of the view": function () {
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

    hintTest = new Y.Test.Case({
        name: 'eZ Translate Action View hint test',

        setUp: function () {
            this.contentMock = new Mock();
            this.locationMock = new Mock();
            this.versionMock = new Mock();

            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });
            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentMock, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.TranslateActionView({
                container: '.container',
                actionId: 'translate',
                label: 'Translations',
                disabled: false,
                content: this.contentMock,
                location: this.locationMock
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should display all translations in button hint": function () {
            var translationsList = ['Diego Armando Maradona Franco', 'Dennis Nicolaas Maria Bergkamp'],
                hintExpected = 'Diego Armando Maradona Franco, Dennis Nicolaas Maria Bergkamp';

            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: translationsList
            });

            this.view.render();

            Assert.areEqual(
                hintExpected,
                this.view.get('hint'),
                'Should display hint in proper way'
            );
        },

        "Should display 2 translations and number of additional translations in button hint": function () {
            var translationsList = ['eng-GB','pol-PL','fre-FR','nno-NO','esl-ES'],
                hintExpected = 'eng-GB, pol-PL, +3';

            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: translationsList
            });

            this.view.render();

            Assert.areEqual(
                hintExpected,
                this.view.get('hint'),
                'Should display hint in proper way'
            );
        }
    });

    Y.Test.Runner.setName("eZ Translate Action View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(domEventTest);
    Y.Test.Runner.add(hideTest);
    Y.Test.Runner.add(hintTest);
}, '', {requires: ['test', 'ez-translateactionview', 'ez-genericbuttonactionview-tests', 'node-event-simulate']});

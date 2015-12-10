/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-translateactionview-tests', function (Y) {
    var viewTest, eventTest, renderTest, domEventTest, hideTest,
        Mock = Y.Mock, Assert = Y.Assert;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            setUp: function () {
                this.ommitHintTesting = true;
                this.actionId = 'translate';
                this.label = 'Translate test label';
                this.translationsList = ['eng-GB', 'pol-PL'];
                this.disabled = false;
                this.templateVariablesCount = 8;
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
                    disabled: this.disabled,
                    content: this.contentMock,
                    location: this.locationMock
                });
            },

            tearDown: function () {
                this.view.destroy();
                delete this.view;
            },

            _testVariablesInTemplate: function (translationsList, numberOfLanguagesInHint) {
                var origTpl = this.view.template,
                    numberOfAdditionalTranslations = translationsList.length - numberOfLanguagesInHint;

                this.view.template = function (variables) {
                    Y.Assert.isObject(variables, "The template should receive some variables");

                    Y.Assert.areEqual(
                        numberOfAdditionalTranslations,
                        variables.moreTranslationCount,
                        "label should be available"
                    );
                    Y.Assert.areEqual(
                        numberOfLanguagesInHint,
                        variables.firstLanguagesCode.length,
                        "label should be available"
                    );

                    for (var i=0; i<numberOfLanguagesInHint; i++) {
                        Y.Assert.isTrue(
                            variables.firstLanguagesCode[i] === translationsList[i],
                            "languageCode in firstLanguagesCode should be the same as contents translation"
                        );
                    }

                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            "Should pass firstLanguagesCode and moreTranslationCount variables to the template": function () {
                var translationsList = ['ger-DE', 'fre-FR', 'pol-PL', 'eng-GB'],
                    numberOfLanguagesInHint = 2;

                Mock.expect(this.versionMock, {
                    method: 'getTranslationsList',
                    returns: translationsList
                });

                this._testVariablesInTemplate(translationsList, numberOfLanguagesInHint);
            },

            "Should pass firstLanguagesCode and moreTranslationCount variables to the template 2": function () {
                var translationsList = ['ger-DE'],
                    numberOfLanguagesInHint = 1;

                Mock.expect(this.versionMock, {
                    method: 'getTranslationsList',
                    returns: translationsList
                });

                this._testVariablesInTemplate(translationsList, numberOfLanguagesInHint);
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

    Y.Test.Runner.setName("eZ Translate Action View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(domEventTest);
    Y.Test.Runner.add(hideTest);
}, '', {requires: ['test', 'ez-translateactionview', 'ez-genericbuttonactionview-tests', 'node-event-simulate']});

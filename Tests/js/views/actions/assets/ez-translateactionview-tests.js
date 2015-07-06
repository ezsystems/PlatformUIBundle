/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-translateactionview-tests', function (Y) {
    var viewTest, eventTest, renderTest, hideTest, hintTest,
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

    renderTest = new Y.Test.Case({
        name: 'eZ Translate Action View render test',

        setUp: function () {
            this.contentMock = new Mock();
            this.locationMock = new Mock();
            this.versionMock = new Mock();
            this.translationsList = ['eng-GB', 'pol-PL', 'ger-DE', 'fre-FR'];

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

        'Should render links': function () {
            var container = Y.one('.container'),
                translations = container.all('.ez-contenttranslation');

            Y.each(translations, function (translation) {
                Assert.isNotNull(
                    translation.one('.ez-contenttranslation-view-link'),
                    'Should contain link to view location'
                );
                Assert.isNotNull(
                    translation.one('.ez-contenttranslation-edit-link'),
                    'Should contain link to edit content'
                );
            });
        },
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

        _hintTextTest: function (hintExpected) {
            var hintDisplayed = Y.one('.action-hint').getContent();
            Assert.areEqual(
                hintExpected,
                hintDisplayed,
                'Should display hint in proper way'
            );
        },

        "Should display all translations in button hint": function () {
            var translationsList = ['Diego Armando Maradona Franco', 'Dennis Nicolaas Maria Bergkamp'],
                hintExpected = 'Diego Armando Maradona Franco, Dennis Nicolaas Maria Bergkamp';

            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: translationsList
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

            this._hintTextTest(hintExpected);
        },

        "Should display 2 translations and number of additional translations in button hint": function () {
            var translationsList = ['Phil Neville', 'Gary Neville', 'Fabien Barthez', 'Bixente Lizarazu'],
                hintExpected = 'Phil Neville, Gary Neville, +2';

            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: translationsList
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

            this._hintTextTest(hintExpected);
        }
    });

    Y.Test.Runner.setName("eZ Translate Action View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(hideTest);
    Y.Test.Runner.add(hintTest);
}, '', {requires: ['test', 'ez-translateactionview', 'ez-genericbuttonactionview-tests', 'node-event-simulate']});

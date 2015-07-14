/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageselectionboxview-tests', function (Y) {
    var renderTest, domEventTest, eventHandlersTest, confirmButtonStateTest, eventsTest,
        Assert = Y.Assert,
        systemLanguageList = {
            'eng-GB': {id: 2, languageCode: 'eng-GB', name: 'English (United Kingdom)', enabled: true},
            'nno-NO': {id: 4, languageCode: 'nno-NO', name: 'Norwegian (Nynorsk)', enabled: true},
            'fre-FR': {id: 128, languageCode: 'fre-FR', name: 'French (France)', enabled: true},
            'pol-PL': {id: 2048, languageCode: 'pol-PL', name: 'Polish', enabled: true},
            'ger-DE': {id: 4096, languageCode: 'ger-DE', name: 'German', enabled: true},
        };

    renderTest = new Y.Test.Case({
        name: "eZ Language Selection Box View render test",

        setUp: function () {
            this.title = 'Artur Boruc';
            this.referenceLanguageList = ['eng-GB', 'nno-NO'];
            this.expectedNewTranslations = ['fre-FR', 'pol-PL', 'ger-DE'];
            this.canBaseTranslation = true;
            this.view = new Y.eZ.LanguageSelectionBoxView({
                container: '.container',
                title: this.title,
                referenceLanguageList: this.referenceLanguageList,
                systemLanguageList: systemLanguageList,
                canBaseTranslation: this.canBaseTranslation
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
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Test available variables in the template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(4, Y.Object.keys(variables).length, "The template should receive 4 variables");
                Assert.areSame(
                    that.title, variables.title,
                    "The title should be available in the template"
                );
                Assert.isArray(
                    variables.languages,
                    "The array containing languages should be available in the template"
                );
                Assert.areSame(
                    that.referenceLanguageList, variables.referenceLanguageList,
                    "The array containing existing translations should be available in the template"
                );
                Assert.areSame(
                    that.canBaseTranslation, variables.canBaseTranslation,
                    "The canBaseTranslation should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    domEventTest = new Y.Test.Case({
        name: "eZ Language Selection Box View DOM event test",

        setUp: function () {
            this.title = 'Miroslav Klose';
            this.referenceLanguageList = ['eng-GB', 'nno-NO'];
            this.expectedNewTranslations = ['fre-FR', 'pol-PL', 'ger-DE'];
            this.canBaseTranslation = true;
            this.view = new Y.eZ.LanguageSelectionBoxView({
                container: '.container',
                title: this.title,
                referenceLanguageList: this.referenceLanguageList,
                systemLanguageList: systemLanguageList,
                canBaseTranslation: this.canBaseTranslation,
                translationMode: true
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the cancelLanguageSelection event": function () {
            var cancel = this.view.get('container').one('.ez-languageselectionbox-close'),
                that = this,
                cancelFired = false;

            this.view.on('cancelLanguageSelection', function (e) {
                cancelFired = true;
            });
            cancel.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        cancelFired,
                        "The cancelLanguageSelection event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should fire the languageSelected event": function () {
            var conf = this.view.get('container').one('.ez-languageselectionbox-confirm'),
                selectedLanguageCode = 'pol-PL',
                that = this,
                languageSelectedFired = false;

            this.view._set('selectedLanguageCode', selectedLanguageCode);
            this.view.on('languageSelected', function (e) {
                languageSelectedFired = true;
            });
            conf.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        languageSelectedFired,
                        "The languageSelected event should have been fired"
                    );
                });
            });
            this.wait();
        },

        _attributeChangeTest: function (element, attributeName, expectedAttributeValue) {
            var attributeChangeFired = false,
                that = this;

            this.view.on(attributeName + 'Change', function (e) {
                attributeChangeFired = true;
            });
            element.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        attributeChangeFired,
                        "The " + attributeName + "Change event should have been fired"
                    );
                    Assert.areSame(
                        that.view.get(attributeName),
                        expectedAttributeValue,
                        "The " + attributeName + " attribute should be the same which was selected"
                    );
                });
            });
            this.wait();
        },

        "Should set the selectedLanguageCode attribute": function () {
            var selector = '.ez-language-element',
                element = this.view.get('container').one(selector),
                attributeName = 'selectedLanguageCode',
                expectedAttributeValue = element.getAttribute('data-languagecode');

            this._attributeChangeTest(element, attributeName, expectedAttributeValue);
        },

        "Should set the selectedBaseLanguageCode attribute": function () {
            var selector = '.ez-base-language',
                element = this.view.get('container').one(selector),
                attributeName = 'selectedBaseLanguageCode',
                expectedAttributeValue = element.getAttribute('data-languagecode');

            this._attributeChangeTest(element, attributeName, expectedAttributeValue);
        },

        "Should set the baseTranslation attribute": function () {
            var attributeChangeFired = false,
                checkbox = this.view.get('container').one('.ez-base-translation-checkbox'),
                that = this;

            this.view.on('baseTranslationChange', function (e) {
                attributeChangeFired = true;
            });
            checkbox.simulateGesture('tap', function (e) {
                that.resume(function () {
                    Assert.isTrue(
                        attributeChangeFired,
                        "The baseTranslationChange event should have been fired"
                    );
                    Assert.areSame(
                        that.view.get('baseTranslation'),
                        checkbox.get('checked'),
                        "The baseTranslation attribute should be proper for checkbox state"
                    );
                });
            });
            this.wait();
        },
    });

    eventHandlersTest = new Y.Test.Case({
        name: "eZ Language Selection Box View event handlers tests",

        setUp: function () {
            this.title = 'Unforgiven';
            this.referenceLanguageList = ['eng-GB', 'nno-NO'];
            this.expectedNewTranslations = ['fre-FR', 'pol-PL', 'ger-DE'];
            this.canBaseTranslation = true;
            this.view = new Y.eZ.LanguageSelectionBoxView({
                container: '.container',
                title: this.title,
                referenceLanguageList: this.referenceLanguageList,
                systemLanguageList: systemLanguageList,
                canBaseTranslation: this.canBaseTranslation
            });
            this.handler1 = false;
            this.handler2 = false;
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _eventHandler1: function () {
            this.handler1 = true;
        },

        _eventHandler2: function () {
            this.handler2 = true;
        },

        "Should set the languageSelected event handler": function () {
            this.view.set('languageSelectedHandler', Y.bind(this._eventHandler1, this));
            this.view.fire('languageSelected');

            Assert.isTrue(
                this.handler1,
                "The languageSelectedHandler should have been called"
            );
        },

        "Should set the cancelLanguageSelection event handler": function () {
            this.view.set('cancelLanguageSelectionHandler', Y.bind(this._eventHandler1, this));
            this.view.fire('cancelLanguageSelection');

            Assert.isTrue(
                this.handler1,
                "The cancelLanguageSelectionHandler should have been called"
            );
        },

        "Should update the languageSelected event handler": function () {
            this.view.set('languageSelectedHandler', Y.bind(this._eventHandler1, this));
            this.view.set('languageSelectedHandler', Y.bind(this._eventHandler2, this));
            this.view.fire('languageSelected');

            Assert.isFalse(
                this.handler1,
                "The first languageSelectedHandler should not have been called"
            );
            Assert.isTrue(
                this.handler2,
                "The second languageSelectedHandler should have been called"
            );
        },

        "Should update the cancelLanguageSelection event handler": function () {
            this.view.set('cancelLanguageSelectionHandler', Y.bind(this._eventHandler1, this));
            this.view.set('cancelLanguageSelectionHandler', Y.bind(this._eventHandler2, this));
            this.view.fire('cancelLanguageSelection');

            Assert.isFalse(
                this.handler1,
                "The first cancelLanguageSelectionHandler should not have been called"
            );
            Assert.isTrue(
                this.handler2,
                "The second cancelLanguageSelectionHandler should have been called"
            );
        },
    });

    eventsTest = new Y.Test.Case({
        name: "eZ Language Selection Box View events tests",

        setUp: function () {
            this.title = 'Nothing Else Matters';
            this.referenceLanguageList = ['eng-GB', 'nno-NO'];
            this.expectedNewTranslations = ['fre-FR', 'pol-PL', 'ger-DE'];
            this.canBaseTranslation = true;
            this.view = new Y.eZ.LanguageSelectionBoxView({
                container: '.container',
                title: this.title,
                referenceLanguageList: this.referenceLanguageList,
                systemLanguageList: systemLanguageList,
                canBaseTranslation: this.canBaseTranslation,
                translationMode: true
            });
            this.defaultBaseTranslation = this.view.get('baseTranslation');
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should reset attributes and render the view": function () {
            this.view.set('baseTranslation', true);
            this.view.set('selectedLanguageCode', 'pol-PL');
            this.view.set('selectedBaseLanguageCode', 'eng-GB');

            this.view.set('active', true);

            Assert.areSame(
                this.defaultBaseTranslation,
                this.view.get('baseTranslation'),
                "The canBaseTranslation attribute should have been reseted"
            );
            Assert.isNull(
                this.view.get('selectedLanguageCode'),
                "The selectedLanguageCode attribute should have been reseted"
            );
            Assert.isNull(
                this.view.get('selectedBaseLanguageCode'),
                "The selectedBaseLanguageCode attribute should have been reseted"
            );
        },

        "Should not reset attributes nor render the view": function () {
            var baseTranslation = true,
                selectedLanguageCode = 'pol-PL',
                selectedBaseLanguageCode = 'eng-GB';

            this.view.set('baseTranslation', baseTranslation);
            this.view.set('selectedLanguageCode', selectedLanguageCode);
            this.view.set('selectedBaseLanguageCode', selectedBaseLanguageCode);

            this.view.set('active', false);

            Assert.areSame(
                baseTranslation,
                this.view.get('baseTranslation'),
                "The baseTranslation attribute should not have been reseted"
            );
            Assert.areSame(
                selectedLanguageCode,
                this.view.get('selectedLanguageCode'),
                "The selectedNewTranslation attribute should not have been reseted"
            );
            Assert.areSame(
                selectedBaseLanguageCode,
                this.view.get('selectedBaseLanguageCode'),
                "The selectedBaseTranslation attribute should not have been reseted"
            );
        },

        "Should show base translations section": function () {
            var c = this.view.get('container');

            this.view.set('canBaseTranslation', true);

            Assert.isTrue(
                c.hasClass('is-base-translation-allowed'),
                "The event should have been fired"
            );
        },

        "Should hide base translations section": function () {
            var c = this.view.get('container');

            this["Should show base translations section"]();

            this.view.set('canBaseTranslation', false);

            Assert.isFalse(
                c.hasClass('is-base-translation-allowed'),
                "The event should have been fired"
            );
        },

        _highlightSelectedLanguageTest: function (languageCode, baseLanguage) {
            var c = this.view.get('container'),
                highlightClass = 'is-language-selected',
                languageElementSelector;

            if (baseLanguage) {
                languageElementSelector = '.ez-base-language';
            } else {
                languageElementSelector = '.ez-language-element';
            }

            Assert.isTrue(
                c.one(languageElementSelector + '[data-languagecode="' + languageCode + '"]')
                    .hasClass(highlightClass),
                "The selected translation should have been highlighted"
            );
            Assert.areEqual(
                1,
                c.all(languageElementSelector + '.' + highlightClass).size(),
                'There should be only one translation highlighted'
            );
        },

        "Should highlight selected language": function () {
            var selectedLanguageCode1 = 'pol-PL',
                selectedLanguageCode2 = 'ger-DE';

            this.view.set('active', true);
            this.view.set('selectedLanguageCode', selectedLanguageCode1);
            this.view.set('selectedLanguageCode', selectedLanguageCode2);

            this._highlightSelectedLanguageTest(selectedLanguageCode2, false);
        },

        "Should highlight selected base translation": function () {
            var selectedBaseLanguageCode1 = 'nno-NO',
                selectedBaseLanguageCode2 = 'eng-GB';

            this.view.set('active', true);
            this.view.set('selectedBaseLanguageCode', selectedBaseLanguageCode1);
            this.view.set('selectedBaseLanguageCode', selectedBaseLanguageCode2);

            this._highlightSelectedLanguageTest(selectedBaseLanguageCode2, true);
        },

        "Should show list of base translations": function () {
            var c = this.view.get('container');

            this.view.set('active', true);
            this.view.set('baseTranslation', true);

            Assert.isTrue(
                c.hasClass('is-base-languages-list-visible'),
                "The list of base translations should be visible"
            );
        },

        "Should hide list of base translations": function () {
            var c = this.view.get('container');

            this["Should show list of base translations"]();
            this.view.set('baseTranslation', false);

            Assert.isFalse(
                c.hasClass('is-base-languages-list-visible'),
                "The list of base translations should not be visible"
            );
        },

        "Should render the view when translationMode attribute changes": function () {
            var renderTriggered = false;

            this.view.render = function () {
                renderTriggered = true;
            };

            this.view.set('translationMode', true);
            this.view.set('translationMode', false);

            Assert.isTrue(renderTriggered, "View should be rendered");
        }
    });

    confirmButtonStateTest = new Y.Test.Case({
        name: "eZ Language Selection Box View confirm button state test",

        setUp: function () {
            this.title = 'Robert Lewandowski';
            this.referenceLanguageList = ['eng-GB', 'nno-NO'];
            this.expectedNewTranslations = ['fre-FR', 'pol-PL', 'ger-DE'];
            this.canBaseTranslation = true;
            this.view = new Y.eZ.LanguageSelectionBoxView({
                container: '.container',
                title: this.title,
                referenceLanguageList: this.referenceLanguageList,
                systemLanguageList: systemLanguageList,
                canBaseTranslation: this.canBaseTranslation
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should enable the confirm button": function () {
            this.view._set('selectedLanguageCode', 'Kamil Glik');

            Assert.isFalse(
                this.view.get('container').one('.ez-languageselectionbox-confirm').get('disabled'),
                "The confirm button should be enabled"
            );
        },

        "Should disabled the confirm button": function () {
            this["Should enable the confirm button"]();
            this.view._set('selectedLanguageCode', null);

            Assert.isTrue(
                this.view.get('container').one('.ez-languageselectionbox-confirm').get('disabled'),
                "The confirm button should be disabled"
            );
        }
    });

    Y.Test.Runner.setName("eZ Language Selection Box View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(domEventTest);
    Y.Test.Runner.add(eventHandlersTest);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(confirmButtonStateTest);
}, '', {requires: ['test', 'base', 'view', 'node-event-simulate', 'ez-languageselectionboxview']});

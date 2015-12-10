/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-genericbuttonactionview-tests', function (Y) {

    Y.namespace('eZ.Test');

    // generic tests to apply to any button action view
    // to work, those tests expect the test case to have the following
    // properties:
    // * this.view refers to the tested view
    // * this.templateVariablesCount contains the number of variables available
    // in the template
    // * this.actionId the action id (string) passed to the view
    // * this.hint the action hint passed to the view
    // * this.label the label passed to the view
    // * this.disabled the disabled state
    Y.eZ.Test.ButtonActionViewTestCases = {
        name: "eZ Generic Button Action View test",

        "Test render": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have been used to render the view");
        },

        "Test available variables in template": function () {
            var that = this,
                origTpl = this.view.template;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(
                    that.templateVariablesCount,
                    Y.Object.keys(variables).length,
                    "The template should receive " + that.templateVariablesCount + " variables"
                );

                Y.Assert.areSame(
                    that.disabled,
                    variables.disabled,
                    "disabled should be available"
                );
                Y.Assert.areSame(
                    that.actionId,
                    variables.actionId,
                    "actionId should be available"
                );
                Y.Assert.areSame(
                    that.label,
                    variables.label,
                    "label should be available"
                );
                if (!that.ommitHintTesting) {
                    Y.Assert.areSame(
                        that.hint,
                        variables.hint,
                        "hint should be available"
                    );
                }

                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Should fire an action once the action button is tapped": function () {
            var that = this,
                actionFired = false;

            this.view.get('container').once('tap', function (e) {
                Y.Assert.isTrue(
                    !!e.prevented,
                    "The tap event should have been prevented"
                );
            });
            this.view.on(this.actionId + 'Action', function (e) {
                actionFired = true;
                Y.Assert.areSame(
                    that.view.get('content'), e.content,
                    "The event facade object should provide the content"
                );
            });

            this.view.render();

            this.view.get('container').one('[data-action="' + this.actionId +'"]').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.assert(actionFired, "Action event should have been fired");
                });
            });
            this.wait();
        },

        'Should disable the button': function () {
            var view = this.view;

            view.render();
            view.set('disabled', true);

            Y.Assert.isTrue(view.get('container').one('.action-trigger').hasAttribute('disabled'), 'The button should be disabled');
        },

        'Should enable the button': function () {
            var view = this.view;

            view.render();
            view.set('disabled', true);
            view.set('disabled', false);
            Y.Assert.isFalse(view.get('container').one('.action-trigger').hasAttribute('disabled'), 'The button should be enabled');
        }
    };
}, '', {requires: ['test', 'node-event-simulate']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-createcontentactionview-tests', function (Y) {
    var viewTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            _should: {
                ignore: {
                    "Should fire an action once the action button is tapped": true,
                }
            },

            setUp: function () {
                this.actionId = 'createContent';
                this.label = 'Create Content test label';
                this.hint = '';
                this.disabled = false;
                this.templateVariablesCount = 4;

                this.view = new Y.eZ.CreateContentActionView({
                    container: '.container',
                    actionId: this.actionId,
                    label: this.label,
                    hint: this.hint,
                    disabled: this.disabled
                });
            },

            tearDown: function () {
                this.view.destroy();
                delete this.view;
            },

            'Should toggle/expand the view': function () {
                var isExpanded = this.view.get('expanded');

                this.view.set('expanded', true);
                Y.Assert.areEqual(!isExpanded, this.view.get('expanded'), 'The value of expanded attribute has changed correctly.');

                this.view._toggleExpanded();
                Y.Assert.isFalse(this.view.get('expanded'), 'The filter view is hidden');
                this.view._toggleExpanded();
                Y.Assert.isTrue(this.view.get('expanded'), 'The filter view is expanded');
            },

            'Should hide the filter view when user clicks outside the button view container': function () {
                this.view.fire('clickoutside');
                Y.Assert.isFalse(this.view.get('expanded'), 'The filter view is hidden');

                this.view._toggleExpanded();
                this.view._hideView();
                Y.Assert.isFalse(this.view.get('expanded'), 'The filter view is hidden');
            },

            'Should update settings of the filter view': function () {
                var newValues = {
                        groups: [
                            {id: 2, name: 'Users'},
                            {id: 3, name: 'Media'}
                        ],
                        source: ['User', 'User group', 'Video'],
                        types: {
                            'User': {
                                groupId: 2,
                                id: 4,
                                identifier: 'user',
                                name: 'User'
                            },
                            'User group': {
                                groupId: 2,
                                id: 3,
                                identifier: 'user group',
                                name: 'User group'
                            },
                            'Video': {
                                groupId: 3,
                                id: 37,
                                identifier: 'video',
                                name: 'Video'
                            }
                        }
                    },
                    contentFilter;

                this.view.fire('activeChange');
                this.view.set('contentGroupsList', newValues);

                contentFilter = this.view.get('contentFilter');

                Y.Assert.areEqual(
                    newValues.groups,
                    contentFilter.get('groups'),
                    'groups property has updated correctly'
                );
                Y.Assert.isObject(
                    contentFilter.get('source'),
                    'source property has updated correctly'
                );
                Y.Assert.areEqual(
                    newValues.types,
                    contentFilter.get('extendedSource'),
                    'extendedSource property has updated correctly'
                );
            }
        })
    );

    Y.Test.Runner.setName("eZ Create Content Action View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-createcontentactionview', 'ez-createcontentfilterview', 'ez-genericbuttonactionview-tests', 'node-event-simulate']});

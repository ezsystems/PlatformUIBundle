/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-selection-table-tests', function (Y) {
    var selectionTableTest;

    selectionTableTest = new Y.Test.Case({
        name: "eZ Selection Table extension test",

        setUp: function () {
            this.selector = '.selection-test-container';
            this.initialContent = Y.one(this.selector).getHTML();
            this.View = Y.Base.create('testView', Y.View, [Y.eZ.SelectionTable], {
                events: {
                    '.in-the-end': {
                        'click': 'itDoesNotEventMatter',
                    },
                },
            });
            this.view = new this.View({
                container: this.selector,
            });
        },

        "Should not override the view dom handlers": function () {
            Y.Assert.isString(
                this.view.events['.in-the-end'].click,
                "The original event handlers should be kept"
            );
        },

        "Should enable the button when a checkbox is checked": function () {
            var container = this.view.get('container'),
                checkbox = Y.one('#c1');

            this.view.render();
            checkbox.set('checked', true);
            checkbox.simulate('change');

            Y.Assert.isTrue(
                checkbox.ancestor('tr').hasClass('is-row-selected'),
                "The row should get the selected class"
            );
            Y.Assert.isFalse(
                container.one('.selection-button').get('disabled'),
                "The button should be enabled"
            );
        },

        "Should keep the button enabled when several checkboxes are checked": function () {
            var container = this.view.get('container'),
                checkbox = Y.one('#c2');

            this["Should enable the button when a checkbox is checked"].apply(this);
            checkbox.set('checked', true);
            checkbox.simulate('change');

            Y.Assert.isTrue(
                checkbox.ancestor('tr').hasClass('is-row-selected'),
                "The row should get the selected class"
            );

            Y.Assert.isFalse(
                container.one('.selection-button').get('disabled'),
                "The button should be enabled"
            );
        },

        "Should disable the button when no checkbox is checked": function () {
            var container = this.view.get('container'),
                checkbox = Y.one('#c1');

            this["Should enable the button when a checkbox is checked"].apply(this);

            checkbox.set('checked', false);
            checkbox.simulate('change');

            Y.Assert.isFalse(
                checkbox.ancestor('tr').hasClass('is-row-selected'),
                "The row should get the selected class"
            );

            Y.Assert.isTrue(
                container.one('.selection-button').get('disabled'),
                "The button should be disabled"
            );

        },

        tearDown: function () {
            this.view.destroy();
            Y.one(this.selector).setHTML(this.initialContent);
            delete this.view;
        },
    });

    Y.Test.Runner.setName("eZ Selection Table extension tests");
    Y.Test.Runner.add(selectionTableTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-selection-table', 'view']});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-createcontentfilterview-tests', function (Y) {
    var viewTest,
        source = ['User', 'User group', 'Video'];

    viewTest = new Y.Test.Case({
        name: "eZ Create Content Filter View test",

        setUp: function () {
            Y.config.doc.documentElement.focus();

            this.view = new Y.eZ.CreateContentFilterView({
                container: '.container',
                inputNode: '.autocomplete-filter',
                listNode: '.autocomplete-list',
                source: source,
                extendedSource: {
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
                },
                groups: [
                    {id: 2, name: 'Users'},
                    {id: 3, name: 'Media'}
                ]
            });
        },

        _getListNodes: function () {
            return this.view.get('listNode').all(this.view.ITEM_TAG);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        'render should display the list of options': function () {
            this.view.render();

            Y.Assert.areEqual(
                source.length,
                this._getListNodes().size(),
                'The list should contain equal amount of items as in the source'
            );

            Y.Array.each(source, function (val) {
                var item = this.view.get('listNode').one('[data-text="' + val + '"]');

                Y.Assert.isObject(item, "The item for '" + val + "' is missing");
                Y.Assert.areEqual(val, item.getContent());
            }, this);
        },

        'Should render a list based on initialListState attribute value': function () {
            var list = [{text:'Video'}];

            this.view.set('initialListState', list).render();

            Y.Assert.areEqual(
                list.length,
                this._getListNodes().size(),
                'The list should contain equal amount of items as in the initialListState attribute'
            );
        },

        'Should render a list based on selectedGroups attribute value': function () {
            this.view.set('selectedGroups', [2]).render();

            Y.Assert.areEqual(
                2,
                this._getListNodes().size(),
                'The list has been filtered correctly based on selectedGroups attribute value and contains a correct number of items'
            );
        },

        '_uiSetList() should create a new list of items': function () {
            var newList = [{text: 'User group'}, {text:'Video'}];

            this.view._uiSetList(newList);

            Y.Assert.areEqual(
                newList.length,
                this._getListNodes().size(),
                '_uiSetList() method has rendered expected amount of list items'
            );
        },

        '_uiCreateTypeNode() should create a list item node': function () {
            var itemValues = {
                    content: 'Test',
                    text: 'test',
                    groupId: 2
                },
                item = this.view._uiCreateTypeNode(
                    itemValues.content,
                    itemValues.text,
                    itemValues.groupId
                );

            Y.Assert.isNotUndefined(item, 'An item has been created correctly and it\'s not undefined');
            Y.Assert.areEqual(
                itemValues.content,
                item.get('text'),
                'Text of the item is set correctly'
            );
            Y.Assert.areEqual(
                itemValues.text,
                item.getAttribute('data-text'),
                'Item\'s attribute: data-text, is set correctly'
            );
            Y.Assert.areEqual(
                itemValues.groupId,
                item.getAttribute('data-group-id'),
                'Item\'s attribute: data-group-id, is set correctly'
            );
        },

        '_uiCreateGroupNode() should create a list of content types groups with checkboxes': function () {
            var itemValues = {
                    id: 25,
                    content: 'Test group'
                },
                item = this.view._uiCreateGroupNode(itemValues.id, itemValues.content);

            Y.Assert.isNotUndefined(item, 'An item has been created correctly and it\'s not undefined');
            Y.Assert.areEqual(
                itemValues.content,
                item.get('text'),
                'Text of the item is set correctly'
            );
            Y.Assert.areEqual(
                itemValues.id,
                item.getAttribute('data-group-id'),
                'Item\'s attribute: data-group-id, is set correctly'
            );
            Y.Assert.areEqual(
                1,
                item.all('[type="checkbox"]').size(),
                'There is exactly one checkbox inside the item'
            );
        },

        '_uiRenderGroupItems() should create a list of content type groups': function () {
            this.view._uiRenderGroupItems();

            Y.Assert.areEqual(
                this.view.get('groups').length,
                this.view.get('container').one('.groups').all('.ez-createcontent-filter-group').size(),
                'All group items are available on rendered list'
            );
        },

        'Should add a selected group to the list of groups that results are filtered with': function () {
            var that = this,
                groupItem;

            that.view.render();
            groupItem = that.view.get('container').one('.ez-createcontent-filter-group');

            groupItem.simulateGesture('tap', function () {
                that.resume(function () {
                    var index = parseInt(groupItem.getAttribute('data-group-id'), 10);

                    Y.Assert.isTrue(
                        groupItem.one('[type="checkbox"]').get('checked'),
                        'The group item\'s checkbox is checked'
                    );

                    Y.Assert.isTrue(
                        (that.view.get('selectedGroups').indexOf(index) !== -1),
                        'A selected group\'s id has been succesfully added to the list of selected groups'
                    );
                });
            });

            this.wait();
        },

        'Should remove an unchecked group from the list of groups that results are filtered with': function () {
            var that = this,
                groupItem,
                groupCheckbox;

            that.view.render();

            groupItem = that.view.get('container').one('.ez-createcontent-filter-group');
            groupCheckbox = groupItem.one('[type="checkbox"]');

            groupCheckbox.set('checked', true);

            groupItem.simulateGesture('tap', function () {
                that.resume(function () {
                    var index = parseInt(groupItem.getAttribute('data-group-id'), 10);

                    Y.Assert.isFalse(
                        groupCheckbox.get('checked'),
                        'The group item\'s checkbox is unchecked'
                    );

                    Y.Assert.isTrue(
                        (that.view.get('selectedGroups').indexOf(index) === -1),
                        'A group id has been succesfully removed from the selected groups list'
                    );
                });
            });
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Create Content Filter View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-createcontentfilterview']});

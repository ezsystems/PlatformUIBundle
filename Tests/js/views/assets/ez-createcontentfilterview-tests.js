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

        'Should selection start preparation for displaying a form to create a new content': function () {
            var view = this.view,
                text = 'User',
                selectedType = view.get('extendedSource')[text];

            view.on('createContent', function (event) {
                Y.Assert.areEqual(selectedType.identifier, event.contentTypeIdentifier, 'Content type identifier is correct');
                Y.Assert.areEqual(selectedType.lang, event.contentTypeLang, 'Content type language is correct');
            });

            view.render();
            view.fire('select', {text: 'User'});
        },

        'Should correctly update a results list on results event': function () {
            var results = [{
                    "display":"<b class='yui3-highlight'>U</b><b class='yui3-highlight'>s</b>er gro<b class='yui3-highlight'>u</b>p",
                    "raw":"User group",
                    "text":"User group",
                    "highlighted":"<b class='yui3-highlight'>U</b><b class='yui3-highlight'>s</b>er gro<b class='yui3-highlight'>u</b>p"
                },{
                    "display":"<b class='yui3-highlight'>U</b><b class='yui3-highlight'>s</b>er",
                    "raw":"User",
                    "text":"User",
                    "highlighted":"<b class='yui3-highlight'>U</b><b class='yui3-highlight'>s</b>er"
                }],
                query = 'us',
                view = this.view;

            view.after('lastQueryChange', function () {
                Y.Assert.areEqual(query, view.get('lastQuery'), 'Last query value is set correctly');
            });

            view.fire('results', {
                results: results,
                query: query
            });
        },

        'Should remove unchecked group from selectedGroups attribute': function () {
            var view = this.view,
                that = this,
                container,
                groupItem,
                groupItemCheckbox;

            view.set('selectedGroups', [2, 3]);
            view.render();
            container = view.get('container');
            container.all('[type="checkbox"]').set('checked', true);

            groupItem = that.view.get('container').one('.ez-createcontent-filter-group');
            groupItemCheckbox = groupItem.one('[type="checkbox"]');
            groupItemCheckbox.simulateGesture('tap', function () {
                that.resume(function () {
                    var index = parseInt(groupItem.getAttribute('data-group-id'), 10);

                    Y.Assert.isFalse(
                        groupItemCheckbox.get('checked'),
                        'The group item\'s checkbox is unchecked'
                    );

                    Y.Assert.isTrue(
                        (view.get('selectedGroups').indexOf(index) === -1),
                        'A group id has been succesfully removed from the selected groups list'
                    );
                });
            });
            this.wait();
        }
    });

    Y.Test.Runner.setName("eZ Create Content Filter View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-createcontentfilterview']});

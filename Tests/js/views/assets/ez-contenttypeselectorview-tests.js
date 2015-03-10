/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypeselectorview-tests', function (Y) {
    var viewTest, destroyTest,
        Mock = Y.Mock, Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: 'eZ Content Type Selector view test',

        setUp: function () {
            this.selectedIds = ["id/2"];
            this.groups = this._generateGroups();
            this.view = new Y.eZ.ContentTypeSelectorView({
                container: '.container',
                selectedGroupIds: this.selectedIds,
                contentTypeGroups: this.groups,
            });
        },

        _generateGroups: function () {
            var groups = [];

            this.groupsData = [{
                id: 'id/1',
                identifier: 'Content',
                types: [{
                    id: 't/1',
                    names: {'eng-GB': 'Article'},
                }, {
                    id: 't/2',
                    names: {'eng-GB': 'Blog post'},
                }],
            }, {
                id: 'id/2',
                identifier: 'Media',
                types: [{
                    id: 't/3',
                    names: {'eng-GB': 'Video'},
                }, {
                    id: 't/4',
                    names: {'eng-GB': 'Image'},
                }, {
                    id: 't/5',
                    names: {'eng-GB': 'Article'},
                }],
            }, {
                id: 'id/3',
                identifier: 'User',
                types: [{
                    id: 't/6',
                    names: {'eng-GB': 'User'},
                }],
            }];

            this.types = {};
            Y.Array.each(this.groupsData, function (g) {
                groups.push(this._generateGroup(g));
            }, this);

            return groups;
        },

        _generateGroup: function (g) {
            var group = new Mock(), that = this;

            Mock.expect(group, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'id' ) {
                        return g.id;
                    } else if ( attr === 'contentTypes' ) {
                        return that._generateTypes(g.types);
                    }
                    Assert.fail('Unexpected call to get ' + attr);
                },
            });
            Mock.expect(group, {
                method: 'toJSON',
                returns: g,
            });
            return group;
        },

        _generateTypes: function (types) {
            var res = [];

            Y.Array.each(types, function (t) {
                var type = new Mock();

                Mock.expect(type, {
                    method: 'get',
                    args: [Mock.Value.String],
                    run: function (attr) {
                        if ( attr === 'id' ) {
                            return t.id;
                        } else if ( attr === 'names' ) {
                            return t.names;
                        }
                        Assert.fail('Unexpected call to get ' + attr);
                    }
                });
                res.push(type);
            });
            return res;
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.groups;
            delete this.groupsJson;
        },

        "Should provide the groups to the template": function () {
            var origTpl = this.view.template,
                that = this,
                templateCalled = false;

            this.view.template = function (variables) {
                templateCalled = true;
                Assert.isArray(
                    variables.contentTypeGroups,
                    "The template should receive the group list"
                );
                Assert.areEqual(
                    that.groupsData.length,
                    variables.contentTypeGroups.length,
                    "The complete list of group should be available"
                );
                Y.Array.each(variables.contentTypeGroups, function (g) {
                    if ( that.selectedIds.indexOf(g.id) !== -1 ) {
                        Assert.isTrue(
                            g.checked,
                            "The selected groups should have the checked property"
                        );
                    } else {
                        Assert.isUndefined(
                            g.checked,
                            "The not selected groups should not have the checked property"
                        );
                    }

                    Assert.isTrue(
                        that.groupsData.indexOf(g) !== -1,
                        "The groups should be the result of the toJSON call"
                    );
                });
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The view template should have been called");
        },

        "Should render the filter view using the same container as the selector view": function () {
            var filter;

            this.view.render();
            filter = this.view.get('filterView');

            Assert.areSame(
                this.view.get('container'),
                filter.get('container'),
                "The filter view should have the selector view's container as its container"
            );
        },

        "Should fire the createContent event when picking a content type": function () {
            var that = this,
                createContentFired = false,
                selected,
                typeId = '';

            this.view.on('createContent', function (e) {
                createContentFired = true;
                Assert.isObject(e.contentType, "The content type should be provided in the event facade");
                typeId = e.contentType.get('id');
            });
            this.view.render();

            selected = this.view.get('container').one('.ez-selection-filter-item');
            selected.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(createContentFired, "The createContent event should have been fired");
                    Assert.areEqual(
                        selected.getAttribute('data-id'), typeId,
                        "The content type provided in the event facade should be the picked one"
                    );
                });
            });
            this.wait();
        },

        "Should disable the content type group checkbox if one is selected": function () {
            this.view.render();

            Assert.isTrue(
                this.view.get('container').one('.ez-contenttypeselector-group-checkbox:checked').get('disabled'),
                "The checkbox should be disabled"
            );
        },

        "Should enable the content type group checkbox if two are selected": function () {
            var container = this.view.get('container');

            this.view.render();

            container.one('.ez-contenttypeselector-group-checkbox[value="id/3"]').simulate('click');
            container.all('.ez-contenttypeselector-group-checkbox').each(function (checkbox) {
                Assert.isFalse(checkbox.get('disabled'), "The checkboxes should be enabled");
            });
        },

        "Should update the content type list when choosing a content type groups": function () {
            var container = this.view.get('container'),
                totalTypesLength = this.groupsData[0].types.length + this.groupsData[1].types.length + this.groupsData[2].types.length,
                newTypeList, prev;

            this.view.render();
            container.all('.ez-contenttypeselector-group-checkbox:not(:checked)').each(function (c) {
                c.simulate('click');
            });

            newTypeList = container.all('.ez-selection-filter-item');
            Assert.areEqual(
                totalTypesLength,
                newTypeList.size(),
                "The list should contain the complete list of types"
            );

            newTypeList.each(function (item) {
                if ( prev ) {
                    Assert.isTrue(
                        item.getContent() >= prev.getContent(),
                        "The list should be sorted alphabetically"
                    );
                }
                prev = item;
            });
        },
    });

    destroyTest = new Y.Test.Case({
        name: 'eZ Content Type Selector view destructor test',

        setUp: function () {
            this.view = new Y.eZ.ContentTypeSelectorView({
                container: '.container',
                contentTypeGroups: [],
                selectedGroupIds: [],
            });
        },

        tearDown: function () {
            delete this.view;
        },

        "Should destroy the filter view": function () {
            this.view.render();
            this.view.destroy();

            Assert.isUndefined(this.view.get('filterView'), "The filter view should be unset");
        },

        "Should handle the case where the filter view is not there": function () {
            this.view.destroy();
        },
    });

    Y.Test.Runner.setName("eZ Content Type Selector View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(destroyTest);
}, '', {requires: ['test', 'ez-contenttypeselectorview', 'node-event-simulate']});

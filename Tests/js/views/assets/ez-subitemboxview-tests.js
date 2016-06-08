/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemboxview-tests', function (Y) {
    var renderTest, addSubitemViewTest, forwardActiveTest, subitemViewChangeTest,
        switchViewTest, subitemViewsDefaultTest, expandTest, collapseClassTest,
        subitemViewIdentifierTest,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ Subitem Box View render test",

        setUp: function () {
            this.location = new Mock();
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            this.content = new Mock();
            this.contentType = new Mock();
            this.subitemView1 = new Y.View({identifier: 'view1', name: 'View1'});
            this.subitemView2 = new Y.View({identifier: 'view2', name: 'View2'});
            this.view = new Y.eZ.SubitemBoxView({
                container: '.container',
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                subitemViews: [this.subitemView1, this.subitemView2],
                subitemViewIdentifier: this.subitemView2.get('identifier'),
            });
        },

        tearDown: function () {
            this.view.get('container').setAttribute('class', 'container');
            this.view.destroy();
            this.subitemView1.destroy();
            this.subitemView2.destroy();
        },

        "Should render the view with the template": function () {
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

        "Should pass the jsonified location and view infos to the template": function () {
            var origTpl, view = this.view;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    2, Y.Object.size(vars),
                    "The template should receive 2 variables"
                );
                Assert.areSame(
                    this.locationJSON, vars.location,
                    "The template should receive the jsonified location"
                );
                Assert.isArray(vars.viewsInfo, "The template should receive the view info array");
                Assert.areEqual(
                    view.get('subitemViews').length, vars.viewsInfo.length,
                    "The view info should list the available subitem views"
                );
                Assert.areEqual(
                    this.subitemView1.get('identifier'), vars.viewsInfo[0].identifier,
                    "The view info should contain the view identifier"
                );
                Assert.areEqual(
                    this.subitemView2.get('identifier'), vars.viewsInfo[1].identifier,
                    "The view info should contain the view identifier"
                );
                Assert.areEqual(
                    this.subitemView1.get('name'), vars.viewsInfo[0].name,
                    "The view info should contain the view name"
                );
                Assert.areEqual(
                    this.subitemView2.get('name'), vars.viewsInfo[1].name,
                    "The view info should contain the view name"
                );
                Assert.isTrue(
                    vars.viewsInfo[1].selected,
                    "The selected flag should be true for the displayed subitem view"
                );
                Assert.isFalse(
                    vars.viewsInfo[0].selected,
                    "The selected flag should be false for the hidden subitem view"
                );

                return origTpl.apply(view, arguments);
            }, this);
            this.view.render();
        },

        "Should render the subitem view ": function () {
            var container = this.view.get('container'),
                subviewContainer;

            this.view.render();
            subviewContainer = container.one('.ez-subitembox-content div');

            Assert.areSame(
                this.subitemView2.get('container'), subviewContainer,
                "The subitem view should be rendered in the subitembox content element"
            );
        },
    });

    addSubitemViewTest = new Y.Test.Case({
        name: "eZ Subitem Box View addSubitemView test",

        setUp: function () {
            this.location = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.contentType, {
                method: 'belongTo',
                args: [Mock.Value.String],
                returns: false,
            });
            this.view = new Y.eZ.SubitemBoxView({
                container: '.container',
                location: this.location,
                contentType: this.contentType,
                subitemViews: [],
            });
        },

        tearDown: function () {
            this.view.get('container').setAttribute('class', 'container');
            this.view.destroy();
        },

        "Should add the view to the subitem view list": function () {
            var view = new Y.View(),
                views;

            this.view.addSubitemView(view);

            views = this.view.get('subitemViews');

            Assert.areEqual(
                1, views.length,
                "The view should have been added to the list"
            );
        },

        "Should make the box view a bubble target of the added view": function () {
            var view = new Y.View(),
                bubble = false;

            this.view.addSubitemView(view);

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            view.fire('whatever');

            Assert.isTrue(bubble, "The event should bubble to the box view");
        },
    });

    forwardActiveTest = new Y.Test.Case({
        name: "eZ Subitem Box View forward active flag test",

        setUp: function () {
            this.location = new Mock();
            this.subitemView1 = new Y.View({identifier: 'view1', active: false});
            this.subitemView2 = new Y.View({identifier: 'view2', active: false});
            this.view = new Y.eZ.SubitemBoxView({
                container: '.container',
                location: this.location,
                subitemViews: [this.subitemView1, this.subitemView2],
                subitemViewIdentifier: this.subitemView2.get('identifier'),
            });
        },

        tearDown: function () {
            this.view.get('container').setAttribute('class', 'container');
            this.view.destroy();
            this.subitemView1.destroy();
            this.subitemView2.destroy();
        },
        
        "Should forward the active value to the selected subitem view": function () {
            this.view.set('active', true);

            Assert.isTrue(
                this.subitemView2.get('active'),
                "The active flag should be set on the subitem view"
            );
            Assert.isFalse(
                this.subitemView1.get('active'),
                "The active flag should be set false on inactive subitem view"
            );
        }
    });

    subitemViewChangeTest = new Y.Test.Case({
        name: "eZ Subitem Box View subitem view change test",

        setUp: function () {
            this.location = new Mock();
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            this.content = new Mock();
            this.contentType = new Mock();
            this.subitemView1 = new Y.View({identifier: 'view1', active: false});
            this.subitemView2 = new Y.View({identifier: 'view2', active: false});
            this.view = new Y.eZ.SubitemBoxView({
                container: '.container',
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                subitemViews: [this.subitemView1, this.subitemView2],
                subitemViewIdentifier: this.subitemView2.get('identifier'),
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.destroy();
            this.subitemView1.destroy();
            this.subitemView2.destroy();
        },

        "Should set the active to false on the previous view": function () {
            this.view.set('subitemViewIdentifier', this.subitemView1.get('identifier'));

            Assert.isFalse(
                this.subitemView2.get('active'),
                "The old subitem view should have active=false"
            );
        },

        "Should render the newly active subitem view": function () {
            var subviewContainerChildren;

            this.view.set('subitemViewIdentifier', this.subitemView1.get('identifier'));
            subviewContainerChildren = this.view.get('container').all('.ez-subitembox-content *');

            Assert.areEqual(
                1, subviewContainerChildren.size(),
                "The subitem box content element should contain one element"
            );
            Assert.areSame(
                this.subitemView1.get('container'), subviewContainerChildren.item(0),
                "The subitem view should be rendered in the subitembox content element"
            );
        },

        "Should set the active flag to true on the subitem view": function () {
            this.view.set('subitemViewIdentifier', this.subitemView1.get('identifier'));

            Assert.isTrue(
                this.subitemView1.get('active'),
                "The new subitem view should have active=true"
            );
        },

        "Should update the highlighed switch view item": function () {
            var identifier = this.subitemView1.get('identifier'),
                container = this.view.get('container');

            this.view.set('subitemViewIdentifier', identifier);
            Assert.areEqual(
                identifier,
                container.one('.is-view-selected .ez-switch-subitemview').getData('view-identifier'),
                "The link to the selected view should be highlighed"
            );
        }
    });

    switchViewTest = new Y.Test.Case({
        name: "eZ Subitem Box View switch view test",

        setUp: function () {
            this.location = new Mock();
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            this.content = new Mock();
            this.contentType = new Mock();
            this.subitemView1 = new Y.View({identifier: 'view1', active: false});
            this.subitemView2 = new Y.View({identifier: 'view2', active: false});
            this.view = new Y.eZ.SubitemBoxView({
                container: '.container',
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                subitemViews: [this.subitemView1, this.subitemView2],
                subitemViewIdentifier: this.subitemView2.get('identifier'),
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.get('container').setAttribute('class', 'container');
            this.view.destroy();
            this.subitemView1.destroy();
            this.subitemView2.destroy();
        },

        "Should switch the subitem view": function () {
            var view = this.view;

            view.get('container').one('.ez-switch-subitemview').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    this.subitemView1.get('identifier'), view.get('subitemViewIdentifier'),
                    "The view1 subitem view should be the active one"
                );
            }, this));
            this.wait();
        },

        "Should expand the view while switching the subitem view": function () {
            var view = this.view;

            view.set('expanded', false);
            view.get('container').one('.ez-switch-subitemview').simulateGesture('tap', this.next(function () {
                Assert.isTrue(
                    view.get('expanded'),
                    "The view should have been expanded"
                );
            }, this));
            this.wait();
        },
    });

    subitemViewsDefaultTest = new Y.Test.Case({
        name: "eZ Subitem Box View subitemViews attribute default value test",

        setUp: function () {
            Y.eZ.SubitemListMoreView = Y.View;
            Y.eZ.SubitemGridView = Y.View;
            this.contentType = new Mock();
            Mock.expect(this.contentType, {
                method: 'belongTo',
                args: [Mock.Value.String],
                returns: false,
            });

            this.view = new Y.eZ.SubitemBoxView({
                container: '.container',
                location: {},
                content: {},
                contentType: this.contentType,
                config: {},
            });
        },

        tearDown: function () {
            this.view.get('container').setAttribute('class', 'container');
            this.view.destroy();
            delete Y.eZ.SubitemListMoreView;
            delete Y.eZ.SubitemGridView;
        },

        "Should return an array": function () {
            Assert.isArray(
                this.view.get('subitemViews'),
                "The subitemViews default value should be an array"
            );
        },

        "Should contain a subitem list view instance": function () {
            Assert.isInstanceOf(
                Y.eZ.SubitemListMoreView, this.view.get('subitemViews')[0],
                "The subitemViews value should contain an instance Y.eZ.SubitemListMoreView"
            );
        },

        "Should contain a subitem grid view instance": function () {
            Assert.isInstanceOf(
                Y.eZ.SubitemGridView, this.view.get('subitemViews')[1],
                "The subitemViews value should contain an instance Y.eZ.SubitemGridView"
            );
        },

        "Should pass the parameters to the subitem list view constructor": function () {
            var subitem = this.view.get('subitemViews')[0];

            Assert.areSame(
                this.view.get('location'), subitem.get('location'),
                "The subitem view should have received the location"
            );
            Assert.areSame(
                this.view.get('content'), subitem.get('content'),
                "The subitem view should have received the content"
            );
            Assert.areSame(
                this.view.get('contentType'), subitem.get('contentType'),
                "The subitem view should have received the contentType"
            );
            Assert.areSame(
                this.view.get('config'), subitem.get('config'),
                "The subitem view should have received the config"
            );
        },
    });

    expandTest = new Y.Test.Case({
        name: "eZ Subitem Box View expand test",

        setUp: function () {
            this.location = new Mock();
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            this.content = new Mock();
            this.contentType = new Mock();
            this.subitemView1 = new Y.View({identifier: 'view1', active: false});
            this.view = new Y.eZ.SubitemBoxView({
                container: '.container-expand-test',
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                subitemViews: [this.subitemView1],
                subitemViewIdentifier: this.subitemView1.get('identifier'),
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.destroy();
            this.subitemView1.destroy();
        },

        "Should expand the view": function () {
            var view = this.view;

            view.set('expanded', false);
            view.get('container').one('.ez-collapse-toggle').simulateGesture('tap', this.next(function () {
                Assert.isTrue(
                    view.get('expanded'),
                    "The expanded attribute should be true"
                );
            }));
            this.wait();
        },

        "Should collapse the view": function () {
            var view = this.view;

            view.set('expanded', true);
            view.get('container').one('.ez-collapse-toggle').simulateGesture('tap', this.next(function () {
                Assert.isFalse(
                    view.get('expanded'),
                    "The expanded attribute should be false"
                );
            }));
            this.wait();
        },
    });

    collapseClassTest = new Y.Test.Case({
        name: "eZ Subitem Box View collapsed class test",

        setUp: function () {
            this.location = new Mock();
            this.locationJSON = {};
            Mock.expect(this.location, {
                method: 'toJSON',
                returns: this.locationJSON,
            });
            this.content = new Mock();
            this.contentType = new Mock();
            this.subitemView1 = new Y.View({identifier: 'view1', active: false});
            this.view = new Y.eZ.SubitemBoxView({
                container: '.container-collapse-test',
                location: this.location,
                content: this.content,
                contentType: this.contentType,
                subitemViews: [this.subitemView1],
                subitemViewIdentifier: this.subitemView1.get('identifier'),
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.get('container').setAttribute('class', 'container');
            this.view.destroy();
            this.subitemView1.destroy();
        },

        _collapseTest: function (callback) {
            var view = this.view;

            view.set('expanded', false);

            this.wait(function () {
                return callback && callback.call(this);
            }, 400);
        },

        "Should add the collapsed class": function () {
            var view = this.view;

            this._collapseTest(function () {
                Assert.isTrue(
                    view.get('container').hasClass('is-subitembox-collapsed'),
                    "The collapsed class should have been added"
                );
            });
        },

        "Should remove the collapsed class": function () {
            var view = this.view;

            this._collapseTest(function () {
                view.set('expanded', true);

                this.wait(function () {
                    Assert.isFalse(
                        view.get('container').hasClass('is-subitembox-collapsed'),
                        "The collapsed class should have been removed"
                    );
                }, 400);
            });
        },
    });

    subitemViewIdentifierTest = new Y.Test.Case({
        name: "eZ Subitem Box View subitemViewIdentifier  test",

        setUp: function () {
            this.contentType = new Mock();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should use the 'listmore' view": function () {
            Mock.expect(this.contentType, {
                method: 'belongTo',
                args: ['/api/ezp/v2/content/typegroups/3'],
                returns: false,
            });
            this.view = new Y.eZ.SubitemBoxView({
                subitemViews: [],
                contentType: this.contentType,
            });

            Assert.areEqual(
                'listmore', this.view.get('subitemViewIdentifier'),
                "The 'listmore' view should be used by default"
            );
        },

        "Should use the 'grid' view": function () {
            Mock.expect(this.contentType, {
                method: 'belongTo',
                args: ['/api/ezp/v2/content/typegroups/3'],
                returns: true,
            });
            this.view = new Y.eZ.SubitemBoxView({
                subitemViews: [],
                contentType: this.contentType,
            });

            Assert.areEqual(
                'grid', this.view.get('subitemViewIdentifier'),
                "The 'grid' view should be used by default"
            );
        },
    });

    Y.Test.Runner.setName("eZ Subitem Box View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(addSubitemViewTest);
    Y.Test.Runner.add(forwardActiveTest);
    Y.Test.Runner.add(subitemViewChangeTest);
    Y.Test.Runner.add(switchViewTest);
    Y.Test.Runner.add(subitemViewsDefaultTest);
    Y.Test.Runner.add(expandTest);
    Y.Test.Runner.add(collapseClassTest);
    Y.Test.Runner.add(subitemViewIdentifierTest);
}, '', {requires: ['view', 'test', 'node-event-simulate', 'ez-subitemboxview']});

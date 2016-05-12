/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblocksview-tests', function (Y) {
    'use strict';

    var renderTest,
        forwardActiveTest,
        addBlockTest,
        removeBlockTest,
        VIEW_CONFIG = {container: '.container'},
        SELECTOR_CONTENT = '.ez-dashboard-content',
        View = Y.eZ.DashboardBlocksView;

    Y.eZ.DashboardBlockBaseView = Y.Base.create('dashboardBlockBaseView', Y.View, [], {}, {
        ATTRS: {
           priority: {},
            identifier: {}
        }
    });

    renderTest = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View render test',

        setUp: function () {
            this.view = new View(VIEW_CONFIG);
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should render view correctly': function () {
            var view = this.view,
                templateCalled = false,
                origTpl = view.template;

            view.template = function () {
                templateCalled = true;

                return origTpl.apply(this, arguments);
            };

            view.addBlock(new Y.eZ.DashboardBlockBaseView({
                priority: 1,
                identifier: 'A'
            }));
            this.view.render();

            Y.Assert.isTrue(templateCalled, 'The template should have been used to render view');
            Y.Assert.areSame(1, view.get('container').one(SELECTOR_CONTENT).get('children').size(), 'Should render one block inside');
        }
    });

    addBlockTest = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View add block tests',

        setUp: function () {
            this.view = new View(VIEW_CONFIG);
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should add a new block to the dashboard': function () {
            var view = this.view,
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config),
                blocks;

            view.addBlock(block1);

            blocks = view.get('blocks');

            Y.Assert.areSame(view, block1.getTargets()[0], 'The dashboard view should be a target of a block');
            Y.Assert.areSame(1, blocks.length, 'There should be 1 block view instance available');
        },

        'Should store only one block when adding 2 blocks with the same identifier': function () {
            var view = this.view,
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config),
                block2 = new Y.eZ.DashboardBlockBaseView(block1Config),
                blocks;

            view.addBlock(block1);
            view.addBlock(block2);

            blocks = view.get('blocks');

            Y.Assert.areSame(0, block1.getTargets().length, 'The dashboard view should not be a target of a first block');
            Y.Assert.areSame(view, block2.getTargets()[0], 'The dashboard view should be a target of a second block');
            Y.Assert.areSame(1, blocks.length, 'There should be 1 block view instance available');
        },

        'Should store blocks in correct order': function () {
            var view = this.view,
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block2Config = {
                    priority: 2,
                    identifier: 'B'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config),
                block2 = new Y.eZ.DashboardBlockBaseView(block2Config),
                viewActiveState = view.get('active'),
                blocks;

            view.addBlock(block1);
            view.addBlock(block2);

            blocks = view.get('blocks');

            Y.Assert.areSame(view, block1.getTargets()[0], 'The dashboard view should be a target of a first block');
            Y.Assert.areSame(view, block2.getTargets()[0], 'The dashboard view should be a target of a second block');
            Y.Assert.areSame(viewActiveState, block1.get('active'), 'A first block should have the same active state as dashbaord view');
            Y.Assert.areSame(viewActiveState, block2.get('active'), 'A second block should have the same active state as dashbaord view');
            Y.Assert.areSame(2, blocks.length, 'There should be 2 block view instances available');
            Y.Assert.areSame(block1Config.identifier, blocks[1].get('identifier'), 'Should order blocks correctly');
        }
    });

    removeBlockTest = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View remove block tests',

        setUp: function () {
            this.view = new View(VIEW_CONFIG);
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should remove a block from the dashboard': function () {
            var view = this.view,
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config);

            view.addBlock(block1);
            view.removeBlock(block1Config.identifier);

            Y.Assert.areSame(0, view.get('blocks').length, 'There should be no blocks defined');
            Y.Assert.areSame(0, block1.getTargets().length, 'A block view should have no targets defined');
        }
    });

    forwardActiveTest = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View forward active test',

        setUp: function () {
            this.view = new View(VIEW_CONFIG);
        },

        tearDown: function () {
            this.view.destroy();
        },

        'Should pass the active state to blocks': function () {
            var view = this.view,
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config);

            view.addBlock(block1);

            view.set('active', true);
            view.set('active', false);

            Y.Assert.isFalse(block1.get('active'), 'A block view instance should get inactive');
        }
    });

    Y.Test.Runner.setName('eZ Dashboard Blocks View tests');
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(addBlockTest);
    Y.Test.Runner.add(removeBlockTest);
    Y.Test.Runner.add(forwardActiveTest);
}, '', {requires: [
    'test',
    'base',
    'view',
    'ez-dashboardblocksview'
]});

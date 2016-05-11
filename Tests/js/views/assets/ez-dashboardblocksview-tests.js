/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblocksview-tests', function (Y) {
    var renderTest,
        forwardActiveTest,
        addBlockTest,
        removeBlockTest,
        VIEW_CONFIG = {container: '.container'},
        SELECTOR_CONTENT = '.dashboard-content',
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

        'Should render view correctly without blocks inside': function () {
            var templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function () {
                templateCalled = true;

                return origTpl.apply(this, arguments);
            };

            this.view.render();

            Y.Assert.isTrue(templateCalled, 'The template should have been used to render view');
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

        'Should render a new block after adding it to the dashboard': function () {
            var view = this.view.render(),
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config),
                blocks;

            view.set('active', true);
            blocks = view.addBlock(block1);

            Y.Assert.areSame(view, block1.getTargets()[0], 'The dashboard view should be a target of a block');
            Y.Assert.areSame(1, view.get('container').one(SELECTOR_CONTENT).get('children').size(), 'Should render one block inside');
            Y.Assert.isArray(blocks, 'The `addBlock` method should return an array of blocks');
            Y.Assert.areSame(1, blocks.length, 'The `addBlock` method should return an array of blocks containing only 1 block');
        },

        'Should render only one block when adding blocks with the same identifier': function () {
            var view = this.view.render(),
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config),
                block2 = new Y.eZ.DashboardBlockBaseView(block1Config),
                blocks;

            view.set('active', true);
            blocks = view.addBlock(block1);
            blocks = view.addBlock(block2);

            Y.Assert.areSame(view, block2.getTargets()[0], 'The dashboard view should be a target of a block');
            Y.Assert.areSame(1, view.get('container').one(SELECTOR_CONTENT).get('children').size(), 'Should render one block inside');
            Y.Assert.isArray(blocks, 'The `addBlock` method should return an array of blocks');
            Y.Assert.areSame(1, blocks.length, 'The `addBlock` method should return an array of blocks containing only 1 block');
        },

        'Should render 2 blocks in the dashboard with correct order': function () {
            var view = this.view.render(),
                block1Config = {
                    priority: 2,
                    identifier: 'A'
                },
                block2Config = {
                    priority: 1,
                    identifier: 'B'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config),
                block2 = new Y.eZ.DashboardBlockBaseView(block2Config),
                blocks;

            view.set('active', true);
            blocks = view.addBlock(block1);
            blocks = view.addBlock(block2);

            Y.Assert.areSame(view, block1.getTargets()[0], 'The dashboard view should be a target of a first block');
            Y.Assert.areSame(view, block2.getTargets()[0], 'The dashboard view should be a target of a second block');
            Y.Assert.isTrue(block1.get('active'), 'A first block should be active');
            Y.Assert.isTrue(block2.get('active'), 'A second block should be active');
            Y.Assert.areSame(2, view.get('container').one(SELECTOR_CONTENT).get('children').size(), 'Should render one block inside');
            Y.Assert.isArray(blocks, 'The `addBlock` method should return an array of blocks');
            Y.Assert.areSame(2, blocks.length, 'The `addBlock` method should return an array of blocks containing 2 blocks');

            // PhantomJS 1.9.8 swap params in `sort` function of Array.
            // This is fixed in PhantomJS 2.0
            // See: https://github.com/ariya/phantomjs/issues/11090
            if (!Y.UA.phantomjs) {
                Y.Assert.areSame(block1Config.identifier, blocks[1].get('identifier'), 'Should order blocks correctly');
            }
        },

        'Should not render a block when providing incorrect view instance': function () {
            var view = this.view.render(),
                block1Config = {
                    priority: 2,
                    identifier: 'A'
                },
                block1 = new Y.View(block1Config),
                blocks;

            view.set('active', true);
            blocks = view.addBlock(block1);

            Y.Assert.areNotSame(view, block1.getTargets()[0], 'The dashboard view should be a target of a first block');
            Y.Assert.areSame(0, view.get('container').one(SELECTOR_CONTENT).get('children').size(), 'Should render one block inside');
            Y.Assert.isArray(blocks, 'The `addBlock` method should return an array of blocks');
            Y.Assert.areSame(0, blocks.length, 'The `addBlock` method should return an array of blocks containing 2 blocks');
        },
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
            var view = this.view.render(),
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config),
                blocks;

            view.set('active', true);
            blocks = view.addBlock(block1);
            blocks = view.removeBlock(block1Config.identifier);

            Y.Assert.areSame(0, view.get('container').one(SELECTOR_CONTENT).get('children').size(), 'There should be no blocks rendered');
            Y.Assert.isArray(blocks, 'The `addBlock` method should return an array of blocks');
            Y.Assert.areSame(0, blocks.length, 'The `addBlock` method should return an array of blocks containing no blocks');
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
            var view = this.view.render(),
                block1Config = {
                    priority: 1,
                    identifier: 'A'
                },
                block1 = new Y.eZ.DashboardBlockBaseView(block1Config);

            view.set('active', true);
            view.addBlock(block1);
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

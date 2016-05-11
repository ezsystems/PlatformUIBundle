/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockbaseviewplugin-tests', function (Y) {
    Y.eZ.DashboardBlockBaseView = Y.View;

    var pluginTest = new Y.Test.Case({
        name: 'eZ Dashboard Block Base View plugin tests',

        setUp: function () {
            this.plugin = new Y.eZ.Plugin.DashboardBlockBaseView();
        },

        tearDown: function () {
            this.plugin.destroy();
        },

        'Should add a block to the host (the block based view instance)': function () {
            var host = new Y.Mock(),
                block = this.plugin.get('block');

            Y.Mock.expect(host, {
                method: 'addBlock',
                args: [block]
            });

            this.plugin.set('host', host);

            Y.Mock.verify(host);
        }
    });

    Y.Test.Runner.setName('eZ Dashboard Block Base View plugin tests');
    Y.Test.Runner.add(pluginTest);
}, '', {requires: [
    'test',
    'view',
    'ez-dashboardblockbaseviewplugin'
]});

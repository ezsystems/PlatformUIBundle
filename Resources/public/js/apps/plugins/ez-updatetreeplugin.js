/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-updatetreeplugin', function (Y) {
    "use strict";
    /**
     * Provides the update tree plugin
     *
     * @module ez-updatetreeplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The update tree plugin for the application. It will update the discoveryBar tree
     * after catching an associated event. Events can be send by actions like DELETE/MOVE/COPY/EDIT/CREATE
     *
     * @namespace eZ.Plugin
     * @class UpdateTree
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.UpdateTree = Y.Base.create('updateTreePlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host'),
                events = ['*:sentToTrash', '*:copiedContent', '*:movedContent', '*:publishedDraft', '*:savedDraft'];

            app.on(events, Y.bind(this._clearTree, this));
        },

        /**
         * Clear the tree if it is already loaded
         *
         * @method _clearTree
         * @protected
         */
        _clearTree: function () {
            var discoveryBarView = this.get('host').sideViews.discoveryBar.instance,
                tree = discoveryBarView ? discoveryBarView.getAction('tree').get('tree') : null;

            if (tree) {
                tree.clear();
            }
        },
    }, {
        NS: 'updateTree',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.UpdateTree, ['platformuiApp']
    );
});

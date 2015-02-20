/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverybrowseview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery browse method
     *
     * @module ez-universaldiscoverybrowseview
     */
    Y.namespace('eZ');

    /**
     * The universal discovery browse method view. It allows the user to pick a
     * content in the repository by browsing using a tree.
     *
     * @namespace eZ
     * @class UniversalDiscoveryBrowseView
     * @constructor
     * @extends eZ.UniversalDiscoveryMethodBaseView
     */
    Y.eZ.UniversalDiscoveryBrowseView = Y.Base.create('universalDiscoveryBrowseView', Y.eZ.UniversalDiscoveryMethodBaseView, [], {
        initializer: function () {
            this.on('*:treeNavigate', this._selectContent);
        },

        /**
         * Custom reset implementation to explicitely reset the sub views.
         *
         * @method reset
         * @param {String} [name]
         */
        reset: function (name) {
            if ( name === 'treeView' ) {
                this.get('treeView').reset();
                return;
            }
            if ( name === 'selectedView' ) {
                this.get('selectedView').reset();
                return;
            }
            this.constructor.superclass.reset.apply(this, arguments);
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template());
            container.one('.ez-ud-browse-tree').append(
                this.get('treeView').render().get('container')
            );
            container.one('.ez-ud-browse-selected').append(
                this.get('selectedView').render().get('container')
            );
            return this;
        },

        /**
         * `treeNavigate` event handler. It fires the `selectedContent` event
         * and set the content structure on the selected view so that it is
         * displayed.
         *
         * @method _selectContent
         * @protected
         * @param {EventFacade} e
         */
        _selectContent: function (e) {
            var node = e.tree.getNodeById(e.nodeId);

            e.preventDefault();
            /**
             * Fired when a content is selected. The event facade provides the
             * content structure (the content, location and content type models)
             *
             * @event selectContent
             * @param selection {Object}
             * @param selection.content {eZ.Content}
             * @param selection.location {eZ.Location}
             * @param selection.contentType {eZ.ContentType}
             */
            this.fire('selectContent', {
                selection: node.data,
            });
            this.get('selectedView').set('contentStruct', node.data);
        },
    }, {
        ATTRS: {
            /**
             * @attribute title
             * @default 'Browse'
             */
            title: {
                value: 'Browse',
                readOnly: true,
            },

            /**
             * @attribute identifier
             * @default 'browse'
             */
            identifier: {
                value: 'browse',
                readOnly: true,
            },

            /**
             * Holds the tree view
             *
             * @attribute treeView
             * @type {eZ.TreeView}
             */
            treeView: {
                valueFn: function () {
                    return new Y.eZ.TreeView({
                        bubbleTargets: this,
                    });
                },
            },

            /**
             * Holds the selected view that displays the currently selected
             * content (if any)
             *
             * @attribute selectedView
             * @type {eZ.UniversalDiscoverySelectedView}
             */
            selectedView: {
                valueFn: function () {
                    return new Y.eZ.UniversalDiscoverySelectedView({
                        bubbleTargets: this,
                    });
                },
            },
        },
    });
});

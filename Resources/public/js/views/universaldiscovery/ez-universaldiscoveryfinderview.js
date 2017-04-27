/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery finder method
     *
     * @module ez-universaldiscoveryfinderview
     */
    Y.namespace('eZ');

    /**
     * The universal discovery finder method view. It allows the user to pick a
     * content in the repository with the explorer.
     *
     * @namespace eZ
     * @class UniversalDiscoveryFinderView
     * @constructor
     * @extends eZ.UniversalDiscoveryMethodBaseView
     */
    Y.eZ.UniversalDiscoveryFinderView = Y.Base.create('universalDiscoveryFinderView', Y.eZ.UniversalDiscoveryMethodBaseView, [], {
        initializer: function () {
            this.after(['multipleChange', 'isSelectableChange'], this._setSelectedViewAttrs);
            this.after('visibleChange', this._unselectContent);
            this.on('*:explorerNavigate', this.selectContent);
        },

        /**
         * Custom reset implementation to explicitely reset the sub views.
         *
         * @method reset
         * @param {String} [name]
         */
        reset: function (name) {
            if ( name === 'selectedView' ) {
                this.get('selectedView').reset();
                return;
            }
            if ( name === 'finderExplorerView' ) {
                this.get('finderExplorerView').reset();
                return;
            }
            this.constructor.superclass.reset.apply(this, arguments);
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template());
            container.one('.ez-ud-finder-selected').append(
                this.get('selectedView').render().get('container')
            );
            container.one('.ez-ud-finder-explorer').append(
                this.get('finderExplorerView').render().get('container')
            );
            return this;
        },

        onUnselectContent: function (contentId) {
            var selectedViewStruct = this.get('selectedView').get('contentStruct');

            if ( selectedViewStruct && selectedViewStruct.contentInfo.get('id') === contentId ) {
                this.get('selectedView').set('confirmButtonEnabled', true);
            }
        },

        /**
         * `multipleChange` and `isSelectableChange` events handler. It sets the selected view
         * `addConfirmButton` flag according to the new `multiple` attribute value and passes
         * new `isSelectable` function to the selected view.
         *
         * @method _setSelectedViewAttrs
         * @protected
         */
        _setSelectedViewAttrs: function () {
            this.get('selectedView').setAttrs({
                'addConfirmButton': this.get('multiple'),
                'isSelectable': this.get('isSelectable')
            });
        },

        /**
         * Public method to select a content
         *
         * @method selectContent
         * @param {eventFacade} e
         * @param {eventFacade} e.data the node data
         */
        selectContent: function (e) {
            this._fireSelectContent(e.data);
            this.get('selectedView').set('contentStruct', e.data);
        },

        /**
         * `visibleChange` event handler. It makes to reset the current
         * selection when the explorer method is hidden/showed
         *
         * @method _unselectContent
         * @protected
         */
        _unselectContent: function () {
            this._fireSelectContent(null);
            this.get('selectedView').set('contentStruct', null);
            if (this.get('visible')) {
                this.get('finderExplorerView').wakeUp();
            }
        },

        /**
         * Fires the `selectContent` event for the given `selection`
         *
         * @method _fireSelectContent
         * @param {Object|Null} selection
         * @protected
         */
        _fireSelectContent: function (selection) {
            /**
             * Fired when a content is selected or unselected. The event facade
             * provides the content structure (the contentInfo, location and content
             * type models) if a selection was made.
             *
             * @event selectContent
             * @param selection {Object|Null}
             * @param selection.contentInfo {eZ.ContentInfo}
             * @param selection.location {eZ.Location}
             * @param selection.contentType {eZ.ContentType}
             */
            this.fire('selectContent', {
                selection: selection,
            });
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
             * @default 'finder'
             */
            identifier: {
                value: 'finder',
                readOnly: true,
            },

            /**
             * The starting Location if the UDW is configured with one. It is
             * directly set on the finder explorer view.
             *
             * @attribute startingLocation
             * @type {eZ.Location|false}
             */
            startingLocation: {
                setter: function (startingLocation) {
                    this.get('finderExplorerView').set('startingLocation', startingLocation);
                    return startingLocation;
                }
            },

            /**
             * The discover root depth if the UDW is configured with one. It is 
             * directly set on the finder explorer view.
             *
             * @attribute minDiscoverDepth
             * @type {Number|false}
             */
            minDiscoverDepth: {
                setter: function (minDiscoverDepth) {
                    this.get('finderExplorerView').set('minDiscoverDepth', minDiscoverDepth);
                    return minDiscoverDepth;
                }
            },
            
            /**
             * The virtual root Location object. It is directly set on the
             * finder explorer view.
             *
             * @attribute virtualRootLocation
             * @type {eZ.Location}
             * @required
             */
            virtualRootLocation: {
                setter: function (virtualRootLocation) {
                    this.get('finderExplorerView').set('virtualRootLocation', virtualRootLocation);
                    return virtualRootLocation;
                }
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
                        addConfirmButton: this.get('multiple'),
                        isAlreadySelected: this.get('isAlreadySelected'),
                    });
                },
            },

            /**
             * Holds the finder explorer view that allows the user to explore contents
             *
             * @attribute finderExplorerView
             * @type {eZ.UniversalDiscoveryFinderExplorerView}
             */
            finderExplorerView: {
                valueFn: function () {
                    return new Y.eZ.UniversalDiscoveryFinderExplorerView({
                        bubbleTargets: this,
                    });
                },
            },
        },
    });
});

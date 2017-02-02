/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderexplorerview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery finder explorer view
     *
     * @module ez-universaldiscoveryfinderexplorerview
     */
    Y.namespace('eZ');

    /**
     * The universal discovery finder method view. It allows the user to pick a
     * content in the repository with the explorer.
     *
     * @namespace eZ
     * @class UniversalDiscoveryFinderExplorerView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoveryFinderExplorerView = Y.Base.create('universalDiscoveryFinderExplorerView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {
            this.after('activeChange', function () {
                console.log('aaaaaa', this.get('startingLocation').get('path'))
                if (this.get('active') && this.get('startingLocation') ) {

                    this.wakeUp();
                }
            });
            this.on('*:explorerNavigate', function(e) {
                this._handleLevelViews(e.target, e.depth, e.location);
            });
            this.on('startingLocationChange', function(e) {
                var LevelView = this.get('levelViewConstructor'),
                    levelView = new LevelView({
                        parentLocation: this.get('startingLocation'),
                        depth: 1,
                    });
                levelView.addTarget(this);
                this._renderLevelView(levelView);
                this._activateLevelView(levelView);
                levelView.displayLevelView();
                this.get('levelViews').push(levelView);
            });
        },

        /**
         * Custom reset implementation to explicitly reset the explorer level views.
         *
         * @method reset
         */
        reset: function (name) {
            var count;
            
            if (name == 'levelViews') {
                count = this.get('levelViews').length - 1;

                this._removeLevels(count);
                this.get('levelViews')[0].reset();
            } else  {
                this.constructor.superclass.reset.apply(this, arguments);
            }
        },

        /**
         * Activates every level views
         *
         * @method wakeUp
         */
        wakeUp: function () {
            Y.Array.each(this.get('levelViews'), function (levelView) {
                this._activateLevelView(levelView);
            }, this);
        },

        /**
         * explorerNavigates event handler. Handles the levelViews by removing and/or adding levels if necessary
         *
         * @method _handleLevelViews
         * @param {Y.eZ.UniversalDiscoveryFinderExplorerLevelView} levelView
         * @param {Number} depth
         * @param {eZ.Location} location
         * @protected
         */
        _handleLevelViews: function (levelView, depth, location) {
            var count;
            
            if (depth < this.get('levelViews').length) {
                count = this.get('levelViews').length - depth;
                this._removeLevels(count);
            }
            if (this.get('levelViews').length > 1) {
                this.get('levelViews')[this.get('levelViews').length - 2].set('ownSelectedItem', false);
            }
            levelView.set('ownSelectedItem', true);
            this._renderLevelView(levelView);

            if (location.get('childCount')) {
                this._addLevel(location);
            }
        },

        /**
         * Activates the given levelView
         *
         * @method _activateLevelView
         * @param {Y.eZ.UniversalDiscoveryFinderExplorerLevelView} levelView
         * @protected
         */
        _activateLevelView: function (levelView) {

            levelView.set('active', this.get('active'));
        },

        /**
         * Renders the given levelView
         *
         * @method _renderLevelView
         * @param {Y.eZ.UniversalDiscoveryFinderExplorerLevelView} levelView
         * @protected
         */
        _renderLevelView: function (levelView) {
            this.get('container').one('.ez-ud-finder-explorerlevel').append(levelView.render().get('container'));
        },

        render: function () {
            var container = this.get('container');
            container.setHTML(this.template());
           
            if (this.get('startingLocation')) {
                Y.Array.each(this.get('levelViews'), function (levelView) {
                    this._renderLevelView(levelView);
                }, this);
            } else {

            }

            return this;
        },

        /**
         * Removes and destroy the last level views from the levelViews attribute.
         *
         * @method _removeLevels
         * @param {Number} count the number of levelviews to remove.
         */
        _removeLevels: function (count) {
            for (var i=0; i < count; i++) {
                this.get('levelViews').pop().destroy({remove: true});
            }
        },

        /**
         * Creates and add an explorer level view to the levelViews.
         * Then renders, activates and display it.
         *
         * @method _addLevel
         * @param {Y.eZ.Location} location the parent location
         */
        _addLevel: function (location) {
            var LevelView = this.get('levelViewConstructor'),
                levelView = new LevelView({
                    parentLocation: location,
                    depth: this.get('levelViews').length + 1,
                });

            levelView.addTarget(this);
            this._renderLevelView(levelView);
            this._activateLevelView(levelView);
            levelView.displayLevelView();
            this.get('levelViews').push(levelView);
        },

    }, {
        ATTRS: {
            /**
             * The constructor function to use to instance the item view
             * instances.
             *
             * @attribute levelViewConstructor
             * @type {Function}
             * @default {Y.eZ.UniversalDiscoveryFinderExplorerLevelView}
             */
            levelViewConstructor: {
                valueFn: function () {
                    return Y.eZ.UniversalDiscoveryFinderExplorerLevelView;
                },
            },

            /**
             * The tab containing the universalDiscoveryFinderExplorerLevelViews to explore.
             *
             * @attribute levelViews
             * @type Array
             */
            levelViews: {
                valueFn: function () {
                    
                    // this.
                    // console.log(this.get('startingLocation'), 'aaa')
                    // return [new Y.eZ.UniversalDiscoveryFinderExplorerLevelView({
                    //     parentLocation: this.get('startingLocation'),
                    //     depth:  1,
                    //     bubbleTargets: this,
                    // })];
                }
            },
        },
    });
});

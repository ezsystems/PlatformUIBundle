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
                if ( this.get('active') ) {
                    this.wakeUp();
                }
            });
            this.on('*:explorerNavigate', function(e) {
                this._handleLevelViews(e.target, e.depth, e.location);
            });
            this.after('startingLocationChange', function (e) {
                if ( e.newVal === e.prevVal ) {
                    // This is to avoid rebuilding the level views when a
                    // starting location is set and when switching to another
                    // method and getting back to the finder. In that, case
                    // `startingLocationChange` is fired even if the very same
                    // Location object is set...
                    return;
                }
                this._removeLevels();
                this._getLevelViewPath().forEach(function (location, index, path) {
                    var next = path[index + 1],
                        disabled = this.get('minDiscoverDepth') > index;

                    if ( next ) {
                        this._addLevel(location, next.get('locationId'), disabled);
                    } else if ( location.get('childCount') !== 0 ) {
                        this._addLevel(location, undefined, disabled);
                    }
                }, this);
            });
        },

        /**
         * Returns a Location array representing the path to display. This path
         * includes the virtual root Location, the starting Location path and
         * the starting Location (if there's a starting Location).
         *
         * @method _getLevelViewPath
         * @protected
         * @return {Array} of Location.
         */
        _getLevelViewPath: function () {
            var startingLocation = this.get('startingLocation'),
                path = [];

            if ( startingLocation ) {
                path = startingLocation.get('path').concat();
                path.push(startingLocation);
            }

            path.unshift(this.get('virtualRootLocation'));
            return path;
        },

        /**
         * Custom reset implementation to explicitly reset the explorer level views.
         *
         * @method reset
         */
        reset: function (name) {
            if (name == 'levelViews') {
                this._removeLevels();
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
                levelView.set('ownSelectedItem', false);
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
            Y.Array.each(this.get('levelViews'), function (levelView) {
                this._renderLevelView(levelView);
            }, this);
            return this;
        },

        /**
         * Removes and destroy level views.
         *
         * @method _removeLevels
         * @param {Number} [count] the number of level views to remove. If
         * omitted, the complete list is removed.
         * @protected
         */
        _removeLevels: function (count) {
            count = count || this.get('levelViews').length;
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
         * @param {Number} selectedLocationId the location id that should be
         * selected in the level view
         * @param {Boolean} disabled the boolean determining if the level view can be used by the user
         * @protected
         */
        _addLevel: function (location, selectedLocationId, disabled) {
            var LevelView = this.get('levelViewConstructor'),
                levelView = new LevelView({
                    parentLocation: location,
                    selectLocationId: selectedLocationId,
                    depth: this.get('levelViews').length + 1,
                    disabled: disabled,
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
             * The minimum discover root depth if the UDW is configured with one.
             *
             * @attribute minDiscoverDepth
             * @type {Number|false}
             * @default {false}
             */
            minDiscoverDepth: {
                value: false,
            },
            
            /**
             * The starting Location if the UDW is configured with one.
             *
             * @attribute startingLocation
             * @type {eZ.Location|false|Null}
             * @default {Null}
             */
            startingLocation: {
                value: null,
            },

            /**
             * The virtual root Location object
             *
             * @attribute virtualRootLocation
             * @type {eZ.Location}
             * @required
             */
            virtualRootLocation: {},

            /**
             * The tab containing the universalDiscoveryFinderExplorerLevelViews to explore.
             *
             * @attribute levelViews
             * @type Array
             */
            levelViews: {
                value: [],
            },
        },
    });
});

/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-barview', function (Y) {
    "use strict";
    /**
     * Provides the base Bar view class
     *
     * @module ez-barview
     */
    Y.namespace('eZ');

    var BAR_VIEW_NAME = 'barView',
        IS_HIDDEN_CLASS = "is-hidden",
        ACTIVE_MENU_CLASS = ".active-actions",
        VIEW_MORE_MENU_CLASS = ".view-more-actions",
        VIEW_MORE_BUTTON_CLASS = ".view-more-button";

    /**
     * The base bar view
     *
     * @namespace eZ
     * @class BarView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.BarView = Y.Base.create(BAR_VIEW_NAME, Y.eZ.TemplateBasedView, [], {
        events: {
            '.view-more-button': {
                'tap': '_toggleViewMore'
            }
        },

        /**
         * Overrides the default implementation from Y.eZ.TemplateBasedView so
         * that all bar views use the same template
         *
         * @method _getName
         * @protected
         * @return String
         */
        _getName: function () {
            return BAR_VIEW_NAME;
        },

        /**
         * Initializer is called upon view's init
         * Creating actions lookup object, misc init workflow
         *
         * @method initializer
         */
        initializer: function () {
            var that = this;

            this._sortActions();
            Y.Array.each(this.get('actionsList'), function (action) {
                action.addTarget(that);
            });
            this.after('activeChange', function (e) {
                Y.Array.each(this.get('actionsList'), function (actionView) {
                    actionView.set('active', e.newVal);
                });
                if ( e.newVal ) {
                    this._handleHeightUpdate();
                }
            });
        },

        /**
         * Renders the edit action bar (non-height-responsive version).
         *
         * @method render
         * @return {eZ.EditActionBarView} the view itself
         */
        render: function () {
            var container = this.get('container'),
                activeMenu,
                viewMoreTrigger;

            container.setHTML(this.template({
                viewMoreText: this.get('viewMoreText')
            }));

            this._attachedViewEvents.push(Y.on("windowresize", Y.bind(this._handleHeightUpdate, this)));

            activeMenu = container.one(ACTIVE_MENU_CLASS);
            viewMoreTrigger = container.one(VIEW_MORE_BUTTON_CLASS);
            viewMoreTrigger.addClass(IS_HIDDEN_CLASS);

            Y.Array.each(this.get('actionsList'), function (actionView) {
                activeMenu.append(actionView.render().get('container'));
            });

            return this;
        },

        /**
         * Add the action to the main actions list
         *
         * @method addAction
         * @param action {eZ.ButtonActionView} instance of an action view
         */
        addAction: function (action) {
            var actionsList = this.get('actionsList');

            action.addTarget(this);
            actionsList.push(action);
            this.set('actionsList', actionsList);
            this._sortActions();
        },

        /**
         * Remove an action from the main actions list
         *
         * @method removeAction
         * @param actionId {String} Unique action identifier
         * @return {boolean} True, if action was found and removed, false otherwise
         */
        removeAction: function (actionId) {
            var actionsList = this.get('actionsList'),
                index,
                length;

            for (index = 0, length = actionsList.length; index < length; index++) {
                if (actionsList[index].get('actionId') == actionId) {
                    actionsList[index].removeTarget(this);
                    actionsList.splice(index, 1);
                    return true;
                }
            }

            return false;
        },

        /**
         * Get an action view with the actionId
         *
         * @method getAction
         * @param actionId {String}
         * @return {eZ.ButtonActionView}
         */
        getAction: function (actionId) {
            var actionsList = this.get('actionsList');

            return Y.Array.find(actionsList, function (t) {
                return t.get('actionId') === actionId;
            });
        },

        /**
         * Handles container height update by rearranging the actions between
         * menus. We are filling-in the active menu, until the container becomes
         * higher than the available height, after that we are filling the
         * hidden menu.
         *
         * @method _handleHeightUpdate
         * @protected
         * @param {Object} e event facade of the resize event
         */
        _handleHeightUpdate: function (e) {
            var availHeight = this.get('container').get('winHeight') - this.get('container').getY();

            if (this._getHeight() > availHeight) {
                // push actions into view more menu until the main menu is not
                // overflowed any more or we are out of actions in the main menu
                while (this._getHeight() > availHeight && this._hasActiveActions()) {
                    this._pushLastActionToViewMore();
                }

            } else {
                // Do we have to pull some actions from view more menu back to active menu?
                if (this._hasViewMoreActions()) {
                    // pull actions from view more menu until the main menu is
                    // overflowed or we are out of actions in view more menu
                    while ( this._hasViewMoreActions() && (this._getHeight() + this._getFirstViewMoreActionHeight() <= availHeight) ) {
                        this._pullFirstActionFromViewMore();
                    }
                }
            }
        },

        /**
         * Push last action from the ACTIVE_MENU_CLASS menu to the VIEW_MORE_MENU_CLASS menu
         *
         * @method _pushLastActionToViewMore
         * @private
         */
        _pushLastActionToViewMore: function () {
            var container = this.get('container'),
                activeMenu = container.one(ACTIVE_MENU_CLASS),
                viewMoreMenu = container.one(VIEW_MORE_MENU_CLASS),
                actionViewNode = activeMenu.get('children').slice(-1).item(0);

            if (actionViewNode) {
                actionViewNode.remove();
                viewMoreMenu.append(actionViewNode);
                this._checkViewMoreTrigger();
            }
        },

        /**
         * Pull first available action from the VIEW_MORE_MENU_CLASS menu to the ACTIVE_MENU_CLASS menu
         *
         * @method _pullFirstActionFromViewMore
         * @private
         */
        _pullFirstActionFromViewMore: function () {
            var container = this.get('container'),
                activeMenu = container.one(ACTIVE_MENU_CLASS),
                viewMoreMenu = container.one(VIEW_MORE_MENU_CLASS),
                actionViewNode = viewMoreMenu.get('children').slice(-1).item(0);

            if (actionViewNode) {
                actionViewNode.remove();
                activeMenu.append(actionViewNode);
                this._checkViewMoreTrigger();
            }
        },

        /**
         * Check do we need to show "View More" link. Do it, if needed.
         *
         * @method _checkViewMoreTrigger
         * @private
         */
        _checkViewMoreTrigger: function () {
            var container = this.get('container'),
                viewMoreTrigger = container.one(VIEW_MORE_BUTTON_CLASS),
                viewMoreMenu = container.one(VIEW_MORE_MENU_CLASS);

            if (viewMoreMenu.get('children').isEmpty()) {
                viewMoreTrigger.addClass(IS_HIDDEN_CLASS);
            } else {
                viewMoreTrigger.removeClass(IS_HIDDEN_CLASS);
            }
        },

        /**
         * Returns scroll height of the action bar view container
         *
         * @method _getHeight
         * @return {Int} Scroll height of the action bar view container
         * @private
         */
        _getHeight: function () {
            return this.get('container').get('scrollHeight');
        },

        /**
         * Returns scroll height of the first action in VIEW_MORE_MENU_CLASS menu
         *
         * @method _getFirstViewMoreActionHeight
         * @return {Int} Scroll height of the action
         * @private
         */
        _getFirstViewMoreActionHeight: function () {
            return this.get('container').one(VIEW_MORE_MENU_CLASS).get('children').slice(-1).item(0).get('scrollHeight');
        },

        /**
         * Indicates if there are some actions in ACTIVE_MENU_CLASS menu
         *
         * @method _hasActiveActions
         * @return {boolean} true if there are some actions in ACTIVE_MENU_CLASS menu, false otherwise.
         * @private
         */
        _hasActiveActions: function () {
            return !this.get('container').one(ACTIVE_MENU_CLASS).get('children').isEmpty();
        },

        /**
         * Indicates if there are some actions in VIEW_MORE_MENU_CLASS menu
         *
         * @method _hasViewMoreActions
         * @return {boolean} true if there are some actions in VIEW_MORE_MENU_CLASS menu, false otherwise.
         * @private
         */
        _hasViewMoreActions: function () {
            return !this.get('container').one(VIEW_MORE_MENU_CLASS).get('children').isEmpty();
        },

        /**
         * Sorts the actions list by priority
         *
         * @method _sortActions
         * @protected
         */
        _sortActions: function () {
            var actionsList = this.get('actionsList');

            actionsList.sort(function (a, b) {
                return b.get('priority') - a.get('priority');
            });
            this.set('actionsList', actionsList);
        },

        destructor: function () {
            Y.Array.each(this.get('actionsList'), function (view) {
                view.removeTarget(this);
                view.destroy();
            }, this);
        },

        /**
         * Event event handler for clicks on "View More" link
         *
         * @method _toggleViewMore
         * @protected
         * @param {Object} e event facade of the click event
         */
        _toggleViewMore: function (e) {
            var container = this.get('container'),
                viewMoreTrigger = container.one(VIEW_MORE_BUTTON_CLASS),
                viewMoreActionsNode = container.one(VIEW_MORE_MENU_CLASS);

            viewMoreActionsNode.toggleClass(IS_HIDDEN_CLASS);

            if (!viewMoreActionsNode.hasClass(IS_HIDDEN_CLASS)) {
                viewMoreTrigger.setHTML(this.get('viewLessText'));
            } else {
                viewMoreTrigger.setHTML(this.get('viewMoreText'));
            }
        }

    }, {
        ATTRS: {
            /**
             * The actions list
             *
             * @attribute actionsList
             * @type Array
             * @default []
             */
            actionsList: {
                value: []
            },

            /**
             * Text on the "View more" action (shown when second part of the menu is hidden)
             *
             * @attribute viewMoreText
             * @default "View more"
             */
            viewMoreText: {
                value: "View more"
            },

            /**
             * Text on the "View less" action (shown when second part of the menu is shown)
             *
             * @attribute viewLessText
             * @default "View less"
             */
            viewLessText: {
                value: "View less"
            },

            /**
             * Content which is currently loaded in content edit view
             *
             * @attribute content
             * @type Y.eZ.Content
             * @default {}
             * @required
             */
            content: {
                value: {},
                setter: function (val, name) {
                    Y.Array.each(this.get('actionsList'), function (actionView) {
                        actionView.set('content', val);
                    });

                    return val;
                }
            }
        }
    });
});

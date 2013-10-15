YUI.add('ez-editactionbarview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Action Bar class
     *
     * @module ez-editactionbarview
     */

    Y.namespace('eZ');

    var IS_HIDDEN_CLASS = "is-hidden",
        ACTIVE_MENU_CLASS = ".active-actions",
        VIEW_MORE_MENU_CLASS = ".view-more-actions",
        VIEW_MORE_BUTTON_CLASS = ".view-more-button";

    /**
     * The edit action bar
     *
     * @namespace eZ
     * @class EditActionBar
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.EditActionBarView = Y.Base.create('editActionBarView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.view-more-button': {
                'tap': '_toggleViewMore'
            }
        },

        /**
         * Initializer is called upon view's init
         * Creating actions lookup object, misc init workflow
         *
         * @method initializer
         */
        initializer: function () {
            this._sortActions();
            Y.on("windowresize", Y.bind(this.handleHeightUpdate, this));
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
                viewMoreText : this.get('viewMoreText')
            }));

            activeMenu = container.one(ACTIVE_MENU_CLASS);
            viewMoreTrigger = container.one(VIEW_MORE_BUTTON_CLASS);
            viewMoreTrigger.addClass(IS_HIDDEN_CLASS);

            Y.Array.each(this.get('actionsList'), function(actionView){
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
                    actionsList.splice(index, 1);
                    return true;
                }
            }

            return false;
        },

        /**
         * Handles container height update by rearranging the actions between menus
         * We are filling-in main (ACTIVE_MENU_CLASS) menu, until container becomes higher than the screen bounds,
         * after that we are filling hidden (VIEW_MORE_MENU_CLASS) menu.
         *
         * @method handleHeightUpdate
         * @param {Object} e event facade of the resize event
         */
        handleHeightUpdate: function (e) {
            var container = this.get('container'),
                screenHeight = container.get('winHeight'),
                barHeight,
                activeMenuHasActions,
                viewMoreMenuHasActions;

            barHeight = this._getHeight();
            if (barHeight > screenHeight) {

                activeMenuHasActions = this._hasActiveActions();
                if (activeMenuHasActions) {
                    // push actions into view more menu until the main menu is not overflowed any more or we are out of actions in the main menu
                    while (barHeight > screenHeight && activeMenuHasActions) {
                        this._pushLastActionToViewMore();
                        barHeight = this._getHeight();
                        activeMenuHasActions = this._hasActiveActions();
                    }
                }

            } else {
                // Do we have to pull some actions from view more menu back to active menu?
                viewMoreMenuHasActions = this._hasViewMoreActions();
                if (viewMoreMenuHasActions) {
                    // pull actions from view more menu until the main menu is overflowed or we are out of actions in view more menu
                    while ( (barHeight <= screenHeight) && viewMoreMenuHasActions ) {
                        this._pullFirstActionFromViewMore();
                        barHeight = this._getHeight();
                        viewMoreMenuHasActions = this._hasViewMoreActions();
                    }
                    // if we stopped because the main menu is overflowed, then return last action back to view more menu.
                    if (barHeight > screenHeight) {
                        this._pushLastActionToViewMore();
                    }
                }
            }

        },


        /**
         * Push last action from the ACTIVE_MENU_CLASS menu to the VIEW_MORE_MENU_CLASS menu
         *
         * @method _pushLastActionToViewMore
         * @protected
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
         * @protected
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
         * @protected
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
         * @return {Int} Scroll height of the action bar view container
         * @protected
         */
        _getHeight: function () {
            return this.get('container').get('scrollHeight');
        },

        /**
         * Indicates if there are some actions in ACTIVE_MENU_CLASS menu
         *
         * @return {boolean} true if there are some actions in ACTIVE_MENU_CLASS menu, false otherwise.
         * @protected
         */
        _hasActiveActions: function () {
            return !this.get('container').one(ACTIVE_MENU_CLASS).get('children').isEmpty();
        },

        /**
         * Indicates if there are some actions in VIEW_MORE_MENU_CLASS menu
         *
         * @return {boolean} true if there are some actions in VIEW_MORE_MENU_CLASS menu, false otherwise.
         * @protected
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
             * @default Preset array of action views
             * @required
             */

            actionsList: {
                cloneDefaultValue: false,
                value: [
                    new Y.eZ.ButtonActionView({
                        actionId : "publish",
                        disabled : true,
                        label : "Publish",
                        priority : 200
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "save",
                        disabled : true,
                        label : "Save",
                        priority : 190
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "discard",
                        disabled : true,
                        label : "Discard changes",
                        priority : 180
                    }),
                    new Y.eZ.PreviewActionView({
                        actionId : "preview",
                        label : "Preview",
                        priority : 170,
                        buttons : [
                            {
                                option : "desktop"
                            }, {
                                option : "tablet"
                            }, {
                                option : "mobile"
                            }
                        ]
                    })
                ]
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
                    Y.Array.each(this.get('actionsList'), function(actionView){
                        actionView.set('content', val);
                    });

                    return val;
                }
            }

        }
    });

});

YUI.add('ez-editactionbarview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Action Bar class
     *
     * @module ez-editactionbarview
     */

    Y.namespace('eZ');

    var VIEW_MORE_HEIGHT = 30,
        IS_SHOWN_CLASS = "is-shown",
        IS_SELECTED_CLASS = "is-selected";

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
            '.action-trigger': {
                'tap': '_handleActionClick'
            },
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
            var actionsList, index, length;

            this._sortActions();
            actionsList = this.get('actionsList');

            // Creating lookup object for easy actions search
            this.actionsSearch = {};
            for (index = 0, length = actionsList.length; index < length; index++) {
                this.actionsSearch[actionsList[index].get('actionId')] = actionsList[index];
            }

            // By default all the actions are visible
            this.set('activeActionsList', actionsList);

            Y.on("windowresize", Y.bind(this.handleWindowResize, this));
            this.on('*:editPreviewHide', this.handleEditPreviewHide, this);

        },

        /**
         * Renders the edit action bar
         *
         * @method render
         * @return {eZ.EditActionBarView} the view itself
         */
        render: function () {
            var container = this.get('container'),
                actions = Y.Node.create('<div></div>'),
                viewMoreActions = Y.Node.create('<div></div>');

            Y.Array.each(this.get('activeActionsList'), function(actionView){
                actions.append(actionView.render().get('container'));
            });

            Y.Array.each(this.get('viewMoreActionsList'), function(actionView){
                viewMoreActions.append(actionView.render().get('container'));
            });

            container.setHTML(this.template({
                actions : actions.getHTML(),
                viewMoreActions : viewMoreActions.getHTML(),
                viewMoreText : this.get('viewMoreText')
            }));

            return this;
        },

        /**
         * Makes changes to UI once editPreview is hidden (removes preview selection)
         *
         * @method render
         * @return {eZ.EditActionBar} the view itself
         */
        handleEditPreviewHide : function () {
            this.get('container').all('[data-action="preview"]').removeClass(IS_SELECTED_CLASS);
        },

        /**
         * Event event handler for window resize
         * (Public, until we can find a way to fire it after ACTUAL rendering of the EditActionBar)
         *
         * @method handleWindowResize
         * @param {Object} e event facade of the resize event
         */
        handleWindowResize: function (e) {
            var container = this.get('container'),
                barHeight,
                screenHeight,
                actionNodesList,
                barDynamicHeight = 0,
                activeActionsList = [],
                viewMoreActionsList = [];

            //Rendering the full version of edit action bar
            this._renderFull();

            barHeight = container.get('scrollHeight');
            screenHeight = container.get('winHeight');

            if (barHeight > screenHeight) {
                actionNodesList = container.all('.action');

                actionNodesList.each(function (actionNode) {
                    barDynamicHeight += actionNode.get('scrollHeight');

                    if (barDynamicHeight + VIEW_MORE_HEIGHT < screenHeight) {
                        activeActionsList.push(this.actionsSearch[actionNode.getAttribute('data-action')]);
                    } else {
                        viewMoreActionsList.push(this.actionsSearch[actionNode.getAttribute('data-action')]);
                    }

                }, this);

                this.set('activeActionsList', activeActionsList);
                this.set('viewMoreActionsList', viewMoreActionsList);

                // Rendering "height responsive" version
                this.render();

            }
        },

        /**
         * Add the action to the main actions list
         *
         * @method addAction
         * @param action {Object} Instance of one of the ...ActionView objects (e.g.  new Y.eZ.ButtonActionView({...}) )
         */
        addAction: function (action) {
            var actionsList = this.get('actionsList'),
                index, length;

            actionsList.push(action);
            this.set('actionsList', actionsList);
            this._sortActions();

            // Updating lookup object for easy actions search
            this.actionsSearch = {};
            for (index = 0, length = actionsList.length; index < length; index++) {
                this.actionsSearch[actionsList[index].get('actionId')] = actionsList[index];
            }

        },


        /**
         * Remove an action from the main actions list
         *
         * @method removeAction
         * @param actionId {String} Unique action identifier
         */
        removeAction: function (actionId) {
            var actionsList = this.get('actionsList'),
                targetAction = this.actionsSearch[actionId],
                index = actionsList.indexOf(targetAction);

            if (index > -1) {
                actionsList.splice(index, 1);
            }
        },

        /**
         * Sorts the main actions list by the actions priority (desc)
         *
         * @method _sortActions
         * @protected
         */
        _sortActions: function () {
            var actionsList = this.get('actionsList');

            actionsList.sort(function(a,b) {
                return b.get('priority') - a.get('priority');
            });
            this.set('actionsList', actionsList);
        },

        /**
         * Renders the full version of edit action bar (no actions are hidden)
         * Necessary when we want to recalculate heights after resize
         *
         * @method _renderFull
         * @protected
         * @return {eZ.EditActionBarView} the view itself
         */
        _renderFull: function () {
            var actions = Y.Node.create('<div></div>');

            Y.Array.each(this.get('actionsList'), function(actionView){
                actions.append(actionView.render().get('container'));
            });

            this.get('container').setHTML(this.template({
                actions : actions.getHTML(),
                viewMoreText : this.get('viewMoreText')
            }));
        },

        /**
         * Event event handler for clicks on any of the action-trigger nodes.
         *
         * @method _handleActionClick
         * @protected
         * @param {Object} e event facade of the click event
         */
        _handleActionClick: function (e) {
            var actionTrigger = e.currentTarget,
                action = actionTrigger.getAttribute('data-action'),
                option = actionTrigger.getAttribute('data-action-option');

            this.fire('action', {
                action: action,
                option: option
            });

            //changes to UI
            if (action == "preview") {
                this.get('container').all('[data-action="preview"]').removeClass(IS_SELECTED_CLASS);
                actionTrigger.addClass(IS_SELECTED_CLASS);
            }
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
                viewMoreTrigger = container.one('.view-more-button'),
                viewMoreActionsNode = container.one('.view-more-actions');

            viewMoreActionsNode.toggleClass(IS_SHOWN_CLASS);

            if (viewMoreActionsNode.hasClass(IS_SHOWN_CLASS)) {
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
             * @default []
             * @required
             */

            actionsList: {
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
                        priority : 190,
                        hint : "the test hint"
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "discard",
                        disabled : true,
                        label : "Discard changes",
                        priority : 180
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "collaborate",
                        label : "Collaborate",
                        hint : "Jill is a contributor",
                        priority : 160
                    }),

                    new Y.eZ.PreviewActionView({
                        actionId : "preview",
                        label : "Preview",
                        buttons : [
                            {
                                option : "desktop"
                            }, {
                                option : "tablet"
                            }, {
                                option : "mobile"
                            }
                        ],
                        priority : 170
                    }),

                    new Y.eZ.ButtonActionView({
                        actionId : "collaborate1",
                        label : "Collaborate",
                        hint : "Jill is a contributor",
                        priority : 100
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "collaborate2",
                        label : "Collaborate",
                        hint : "Jill is a contributor",
                        priority : 100
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "collaborate3",
                        label : "Collaborate",
                        hint : "Jill is a contributor",
                        priority : 100
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "collaborate4",
                        label : "Collaborate",
                        hint : "Jill is a contributor",
                        priority : 100
                    })

                ]
            },

            /**
             * The active actions list (which should be rendered at any time)
             *
             * @attribute activeActionsList
             * @default []
             * @required
             */
            activeActionsList: {
                value: []
            },

            /**
             * The list of actions which should be hidden until "view more" link is clicked
             *
             * @attribute viewMoreActionsList
             * @default []
             * @required
             */
            viewMoreActionsList: {
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
            }


        }
    });

});

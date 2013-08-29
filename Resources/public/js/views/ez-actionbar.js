YUI.add('ez-editactionbar', function (Y) {
    "use strict";
    /**
     * Provides the Edit Action Bar class
     *
     * @module ez-editactionbar
     */

    Y.namespace('eZ');

    var MENU_SEL = '.ez-edit-actions',
        VIEW_MORE_HEIGHT = 30,
        IS_SHOWN_CLASS = "is-shown",
        IS_SELECTED_CLASS = "is-selected",
        VIEW_LESS_TEXT = "View less",
        VIEW_MORE_TEXT = "View more";

    /**
     * The edit action bar
     *
     * @namespace eZ
     * @class EditActionBar
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.EditActionBar = Y.Base.create('editActionBar', Y.eZ.TemplateBasedView, [], {
        events: {
            '[data-action]': {
                'tap': '_handleActionClick'
            },
            '.view-more': {
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

            var actionsList = this.get('actionsList'),
                index, length;

            // Creating lookup object for easy actions search
            this.actionsSearch = {};

            for (index = 0, length = actionsList.length; index < length; index++) {
                this.actionsSearch[actionsList[index].id] = actionsList[index];
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
         * @return {eZ.EditActionBar} the view itself
         */
        render: function () {

            this.get('container').setHTML(this.template({
                activeActionsList: this.get('activeActionsList'),
                viewMoreActionsList : this.get('viewMoreActionsList')
            }));

            return this;
        },

        /**
         * Renders the full version of edit action bar (no actions are hidden)
         * Necessary when we want to recalculate heights after resize
         *
         * @method render
         * @return {eZ.EditActionBar} the view itself
         */
        renderFull: function () {
            this.get('container').setHTML(this.template({
                activeActionsList: this.get('actionsList'),
                viewMoreActionsList : []
            }));
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
            this.renderFull();

            barHeight = container.get('scrollHeight');
            screenHeight = container.get('winHeight');
            actionNodesList = container.all('.action');

            if (barHeight > screenHeight) {

                actionNodesList.each(function (actionNode) {
                    barDynamicHeight += actionNode.get('scrollHeight');

                    if (barDynamicHeight + VIEW_MORE_HEIGHT < screenHeight) {
                        activeActionsList.push(this.actionsSearch[actionNode.getAttribute('data-action-id')]);
                    } else {
                        viewMoreActionsList.push(this.actionsSearch[actionNode.getAttribute('data-action-id')]);
                    }
                }, this);

                this.set('activeActionsList', activeActionsList);
                this.set('viewMoreActionsList', viewMoreActionsList);

                // Rendering "height responsive" version
                this.render();

            }
        },

        /**
         * Event event handler for clicks on any of the action-trigger nodes.
         *
         * @method _handleKeyboard
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
                viewMoreTrigger = container.one('.view-more'),
                viewMoreActionsNode = container.one('.view-more-actions');

            viewMoreActionsNode.toggleClass(IS_SHOWN_CLASS);

            if (viewMoreActionsNode.hasClass(IS_SHOWN_CLASS)) {
                viewMoreTrigger.setHTML(VIEW_LESS_TEXT);
            } else {
                viewMoreTrigger.setHTML(VIEW_MORE_TEXT);
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
                    {
                        id : 1,
                        icon : "&#xe00c;",
                        label : "Publish",
                        action : "publish",
                        disabled: 1
                    },
                    {
                        id : 2,
                        icon : "&#xe00e;",
                        label : "Save",
                        action : "save",
                        disabled: 1
                    },
                    {
                        id : 13,
                        icon : "&#xe000;",
                        label : "Discard changes",
                        action : "discard",
                        disabled: 1
                    },
                    {
                        id : 3,
                        icon : "&#xe007;",
                        label : "Preview",
                        widget : {
                            buttons : [{
                                    icon : "&#xe008;",
                                    action : "preview",
                                    option : "desktop"
                                }, {
                                    icon : "&#xe009;",
                                    action : "preview",
                                    option : "tablet"
                                }, {
                                    icon : "&#xe00a;",
                                    action : "preview",
                                    option : "mobile"
                                }
                            ]
                        }
                    },
                    {
                        id : 4,
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "Jack is a contributor",
                        action : "collaborate"
                    },
                    {
                        id : 5,
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "Jill is a contributor",
                        action : "collaborate"
                    },
                    {
                        id : 6,
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "I'm a contributor",
                        action : "collaborate"
                    },
                    {
                        id : 7,
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "Miss Muffet is a contributor",
                        action : "collaborate"
                    },
                    {
                        id : 8,
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "Bo Peep is a contributor",
                        action : "collaborate"
                    }
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
            }

        }
    });

});

YUI.add('ez-editactionbarview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Action Bar class
     *
     * @module ez-editactionbarview
     */

    Y.namespace('eZ');

    var IS_SHOWN_CLASS = "is-shown",
        ACTIVE_MENU_CLASS = ".active-actions",
        VIEW_MORE_MENU_CLASS = ".view-more-actions";

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
            Y.on("windowresize", Y.bind(this.render, this));
        },

        /**
         * Renders the edit action bar.
         * Height responsive - we are filling-in main (ACTIVE_MENU_CLASS) menu, until container becomes higher than the screen bounds,
         * after that we are filling hidden (VIEW_MORE_MENU_CLASS) menu.
         *
         * @method render
         * @return {eZ.EditActionBarView} the view itself
         */
        render: function () {
            var container = this.get('container'),
                screenHeight = container.get('winHeight'),
                viewMoreTrigger,
                barHeight,
                showViewMore = false;

            container.setHTML(this.template({
                viewMoreText : this.get('viewMoreText')
            }));

            viewMoreTrigger = container.one('.view-more-button');
            viewMoreTrigger.removeClass(IS_SHOWN_CLASS);

            Y.Array.each(this.get('actionsList'), function(actionView){

                if (!showViewMore) {

                    container.one(ACTIVE_MENU_CLASS).append(actionView.render().get('container'));
                    barHeight = container.get('scrollHeight');

                    if (barHeight > screenHeight) {
                        // set a flag, that .view-more-actions menu should be filled from now on, until the end of the actionsList
                        showViewMore = true;
                        viewMoreTrigger.addClass(IS_SHOWN_CLASS);

                        // move the last actionView into .view-more-actions menu
                        actionView.get('container').remove();
                        container.one(VIEW_MORE_MENU_CLASS).append(actionView.render().get('container'));
                    }

                } else {
                    container.one(VIEW_MORE_MENU_CLASS).prepend(actionView.render().get('container'));
                }

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
         * Sorts the main actions list by the actions priority (desc)
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
             * @default Preset array on ActionViews
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

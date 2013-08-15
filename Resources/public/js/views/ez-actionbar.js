YUI.add('ez-editactionbar', function (Y) {
    "use strict";
    /**
     * Provides the Edit Action Bar class
     *
     * @module ez-editactionbar
     */

    Y.namespace('eZ');

    var MENU_SEL = '.ez-edit-actions';

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
            '.ez-edit-actions': {
                'tap': '_handleClick'
            }
        },

        /**
         * Renders the edit action bar
         *
         * @method render
         * @return {eZ.EditActionBar} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template({
                actionsList: this.get('actionsList')
            }));
            return this;
        },

        /**
         * Event event handler for clicks on any of the items
         *
         * @method _handleKeyboard
         * @protected
         * @param {Object} e event facade of the click event
         */
        _handleClick: function (e) {

            console.log(e.currentTarget);

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
                        icon : "&#xe00d;",
                        label : "Minimize",
                        action : "min"
                    },
                    {
                        icon : "&#xe006;",
                        label : "Edit",
                        hint : "Continue work on the draft",
                        action : "edit"
                    },
                    {
                        icon : "&#xe007;",
                        label : "Preview",
                        widget : {
                            buttons : [{
                                    icon : "&#xe008;",
                                    action : "previewDesktop"
                                }, {
                                    icon : "&#xe009;",
                                    action : "previewTablet"
                                }, {
                                    icon : "&#xe00a;",
                                    action : "previewMobile"
                                }
                            ]
                        }
                    },
                    {
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "Jack is a contributor",
                        action : "collaborate"
                    },
                    {
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "Jill is a contributor",
                        action : "collaborate"
                    },
                    {
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "I'm a contributor",
                        action : "collaborate"
                    },
                    {
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "Miss Muffet is a contributor",
                        action : "collaborate"
                    },
                    {
                        icon : "&#xe00b;",
                        label : "Collaborate",
                        hint : "Bo Peep is a contributor",
                        action : "collaborate"
                    }
                ]
            }
        }
    });

});

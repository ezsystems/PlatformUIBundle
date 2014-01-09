YUI.add('ez-editactionbarview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Action Bar class
     *
     * @module ez-editactionbarview
     */

    Y.namespace('eZ');

    /**
     * The edit action bar
     *
     * @namespace eZ
     * @class EditActionBarView
     * @constructor
     * @extends eZ.BarView
     */
    Y.eZ.EditActionBarView = Y.Base.create('editActionBarView', Y.eZ.BarView, [], {
    }, {
        ATTRS: {
            /**
             * The edit bar action list filled with the default button action
             * view list
             *
             * @attribute actionsList
             * @type Array
             */
            actionsList: {
                cloneDefaultValue: false,
                value: [
                    new Y.eZ.ButtonActionView({
                        actionId: "publish",
                        disabled: true,
                        label: "Publish",
                        priority: 200
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId: "save",
                        disabled: true,
                        label: "Save",
                        priority: 190
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId: "discard",
                        disabled: true,
                        label: "Discard changes",
                        priority: 180
                    }),
                    new Y.eZ.PreviewActionView({
                        actionId: "preview",
                        label: "Preview",
                        priority: 170,
                        buttons: [
                            {option: "desktop"},
                            {option: "tablet"},
                            {option: "mobile"}
                        ]
                    })
                ]
            },
        }
    });
});

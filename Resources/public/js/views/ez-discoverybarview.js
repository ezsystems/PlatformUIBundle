YUI.add('ez-discoverybarview', function (Y) {
    "use strict";
    /**
     * Provides the Discovery Bar class
     *
     * @module ez-discoverybarview
     */

    Y.namespace('eZ');

    /**
     * The discovery bar
     *
     * @namespace eZ
     * @class DiscoveryBarView
     * @constructor
     * @extends eZ.BarView
     */
    Y.eZ.DiscoveryBarView = Y.Base.create('discoveryBarView', Y.eZ.BarView, [], {
    }, {
        ATTRS: {
            /**
             * An array of {{#crossLink
             * "eZ.ButtonActionView"}}eZ.ButtonActionView{{/crossLink}}
             *
             * @attribute actionsList
             * @type Array
             */
            actionsList: {
                cloneDefaultValue: false,
                value: [
                    new Y.eZ.ButtonActionView({
                        actionId: "minimizeDiscoveryBar",
                        disabled: false,
                        label: "Minimize",
                        priority: 1000
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId: "doSomething",
                        disabled: false,
                        label: "Do something",
                        hint: "And that's useful",
                        priority: 200
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId: "doSomethingElse",
                        disabled: false,
                        label: "Do something else",
                        priority: 200
                    }),
                ]
            },
        }
    });
});

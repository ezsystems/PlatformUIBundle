YUI.add('ez-navigationhubview', function (Y) {
    "use strict";
    /**
     * Provides the navigation hub view
     *
     * @module ez-navigationhubview
     */
    Y.namespace('eZ');

    /**
     * The navigation hub view
     *
     * @namespace eZ
     * @class NavigationHubView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.NavigationHubView = Y.Base.create('navigationHubView', Y.eZ.TemplateBasedView, [], {
        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        },
    });
});

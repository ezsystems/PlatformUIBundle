YUI.add('ez-dashboardview', function (Y) {
    "use strict";
    /**
     * Provides the Dashboard View class
     *
     * @module ez-dashboardview
     */
    Y.namespace('eZ');

    /**
     * The dashboard view
     *
     * @namespace eZ
     * @class DashboardView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.DashboardView = Y.Base.create('dashboardView', Y.eZ.TemplateBasedView, [], {
        /**
         * Renders the dashboard view
         *
         * @method render
         * @return {eZ.DashboardView} the view itself
         */
        render : function () {
            this.get('container').setHTML(this.template());
            this._renderMyContentBlock();

            this.after('activeChange', function () {
                this.on('update:userdrafts', function () {
                    console.log('ez:dashboardView - update:userdrafts');
                });
            });
            
            return this;
        },
        /**
         * Renders the My Content block view in the dashboard view
         *
         * @method _renderMyContentBlock
         * @return {eZ.DashboardView} the view itself
         */
        _renderMyContentBlock : function () {
            var myContentBlock = this.get('myContentBlock');

            myContentBlock.addTarget(this);
            this.get('container').append(myContentBlock.render().get('container'));

            return this;
        }
    }, {
        ATTRS : {
            myContentBlock : {
                valueFn : function () {
                    return new Y.eZ.MyContentBlockView();
                }
            }
        }
    });
});

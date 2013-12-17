YUI.add('ez-locationviewview', function (Y) {
    "use strict";
    /**
     * Provides the Location view View class
     *
     * @module ez-locationviewview
     */
    Y.namespace('eZ');

    Y.eZ.LocationViewView = Y.Base.create('locationViewView', Y.eZ.TemplateBasedView, [], {
        /**
         * Renders the location view
         *
         * @method render
         * @return {eZ.LocationViewView} the view itself
         */
        render: function () {
            var path = [];

            Y.Array.each(this.get('path'), function (struct, key) {
                path[key] = {
                    location: struct.location.toJSON(),
                    content: struct.content.toJSON()
                };
            });
            this.get('container').setHTML(this.template({
                location: this.get('location').toJSON(),
                content: this.get('content').toJSON(),
                path: path
            }));
            return this;
        }
    }, {
        ATTRS: {
            /**
             * The location being rendered
             *
             * @attribute location
             * @type Y.eZ.Location
             */
            location: {},

            /**
             * The content associated the current location
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {},

            /**
             * The path from the root location to the current location. Each
             * entry of the path consists of the location and its content under
             * the `location` and `content` keys.
             *
             * @attribute path
             * @type Array
             */
            path: {}
        }
    });
});

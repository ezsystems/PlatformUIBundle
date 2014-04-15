YUI.add('ez-serversideview', function (Y) {
    "use strict";
    /**
     * Provides the generic server side view class
     *
     * @module ez-serversideview
     */
    Y.namespace('eZ');

    /**
     * The server side view
     *
     * @namespace eZ
     * @class ServerSideView
     * @constructor
     * @extends eZ.View
     */
    Y.eZ.ServerSideView = Y.Base.create('serverSideView', Y.eZ.View, [Y.eZ.Tabs], {
        events: {
            '.ez-tabs .ez-tabs-label a': {
                'tap': '_uiTab'
            }
        },

        /**
         * tap event handler on a tab label
         *
         * @method _uiTab
         * @protected
         * @param {Object} e tap event facade
         */
        _uiTab: function (e) {
            e.preventDefault();
            this._selectTab(
                e.currentTarget.ancestor('.ez-tabs-label'),
                e.currentTarget.getAttribute('href'),
                this.get('container')
            );
        },

        /**
         * Initializes the view to make sure the container will get the
         * ez-view-serversideview class
         *
         * @method initializer
         */
        initializer: function () {
            this.containerTemplate = '<div class="ez-view-serversideview"/>';
        },

        /**
         * Renders the view in its container. It just puts the html attibute
         * content as the content of the view container
         *
         * @method render
         * @return {eZ.ServerSideView} the view it self
         */
        render: function () {
            this.get('container').setContent(this.get('html'));
            return this;
        },

        /**
         * Returns the string to use as the page title
         *
         * @method getTitle
         * @return {String}
         */
        getTitle: function () {
            return this.get('title');
        },
    }, {
        ATTRS: {
            /**
             * The title of the view
             *
             * @attribute title
             * @default ""
             * @type String
             */
            title: {
                value: ""
            },

            /**
             * The HTML content of the view
             *
             * @attribute html
             * @default ""
             * @type String
             */
            html: {
                value: ""
            },
        }
    });
});

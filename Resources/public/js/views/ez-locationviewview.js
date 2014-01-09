YUI.add('ez-locationviewview', function (Y) {
    "use strict";
    /**
     * Provides the Location view View class
     *
     * @module ez-locationviewview
     */
    Y.namespace('eZ');

    var TAB_IS_SELECTED = 'is-tab-selected';

    /**
     * The location view view
     *
     * @namespace eZ
     * @class LocationViewView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.LocationViewView = Y.Base.create('locationViewView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-tabs .ez-tabs-label a': {
                'tap': '_selectTab'
            }
        },

        /**
         * tap event handler on a tab label
         *
         * @method _selectTab
         * @protected
         * @param {Object} e tap event facade
         */
        _selectTab: function (e) {
            var targetId,
                tabLabel = e.currentTarget.ancestor('.ez-tabs-label');

            e.preventDefault();
            if ( tabLabel.hasClass(TAB_IS_SELECTED) ) {
                return;
            }
            targetId = e.currentTarget.getAttribute('href');

            this.get('container').all('.' + TAB_IS_SELECTED).removeClass(TAB_IS_SELECTED);
            this.get('container').one(targetId).addClass(TAB_IS_SELECTED);
            tabLabel.addClass(TAB_IS_SELECTED);
        },

        /**
         * Converts each location and content model in the path to a plain
         * object representation
         *
         * @method _pathToJSON
         * @private
         * @return Array
         */
        _pathToJSON: function () {
            var path = [];

            Y.Array.each(this.get('path'), function (struct, key) {
                path[key] = {
                    location: struct.location.toJSON(),
                    content: struct.content.toJSON()
                };
            });
            return path;
        },

        /**
         * Renders the location view
         *
         * @method render
         * @return {eZ.LocationViewView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                location: this.get('location').toJSON(),
                content: this.get('content').toJSON(),
                path: this._pathToJSON()
            }));

            container.one('.ez-actionbar-container').append(
                this.get('actionBar').render().get('container')
            );
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
            content: {
                setter: function (val, name) {
                    this.get('actionBar').set('content', val);
                    return val;
                }
            },

            /**
             * The path from the root location to the current location. Each
             * entry of the path consists of the location and its content under
             * the `location` and `content` keys.
             *
             * @attribute path
             * @type Array
             */
            path: {},

            /**
             * The action bar instance, by default an instance {{#crossLink
             * "eZ.ActionBarView"}}eZ.ActionBarView{{/crossLink}}
             *
             * @attribute actionBar
             * @type eZ.BarView
             */
            actionBar: {
                value: new Y.eZ.ActionBarView()
            }
        }
    });
});

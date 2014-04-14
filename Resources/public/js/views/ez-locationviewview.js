YUI.add('ez-locationviewview', function (Y) {
    "use strict";
    /**
     * Provides the Location view View class
     *
     * @module ez-locationviewview
     */
    Y.namespace('eZ');

    var MINIMIZE_ACTION_BAR_CLASS = 'is-actionbar-minimized';

    /**
     * The location view view
     *
     * @namespace eZ
     * @class LocationViewView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.LocationViewView = Y.Base.create('locationViewView', Y.eZ.TemplateBasedView, [Y.eZ.Tabs], {
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

        initializer: function () {
            this.get('actionBar').addTarget(this);

            this.on('*:minimizeActionBarAction', this._handleMinimizeActionBar);
        },

        /**
         * Event handler for the minimizeActionBarAction event
         *
         * @protected
         * @method _handleMinimizeActionBar
         */
        _handleMinimizeActionBar: function () {
            this.get('container').toggleClass(MINIMIZE_ACTION_BAR_CLASS);
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

            container.one('.ez-tabs-panel').append(
                this.get('rawContentView').render().get('container')
            );

            container.one('.ez-actionbar-container').append(
                this.get('actionBar').render().get('container')
            );

            this._uiSetMinHeight();
            return this;
        },

        /**
         * Returns the title of the page when the location view is the active
         * view.
         *
         * @method getTitle
         * @return String
         */
        getTitle: function () {
            var title = this.get('content').get('name');

            return Y.Array.reduce(this.get('path'), title, function (title, val) {
                return title + ' / ' + val.content.get('name');
            });
        },

        /**
         * Sets the minimum height of the view
         *
         * @private
         * @method _uiSetMinHeight
         */
        _uiSetMinHeight: function () {
            var container = this.get('container');

            container.one('.ez-locationview-content').setStyle(
                'minHeight', container.get('winHeight') + 'px'
            );
        },

        destructor: function () {
            var bar = this.get('actionBar');

            this.get('rawContentView').destroy();
            bar.removeTarget(this);
            bar.destroy();
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
                lazyAdd: false,
                setter: function (val, name) {
                    this.get('actionBar').set('content', val);
                    this.get('rawContentView').set('content', val);
                    return val;
                }
            },

            /**
             * The content type of the content at the current location
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             */
            contentType: {
                lazyAdd: false,
                setter: function (val, name) {
                    this.get('rawContentView').set('contentType', val);
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
                valueFn: function () {
                    return new Y.eZ.ActionBarView();
                }
            },

            /**
             * The raw content view instance
             *
             * @attribute rawContentView
             * @type eZ.RawContentView
             */
            rawContentView: {
                valueFn: function () {
                    return new Y.eZ.RawContentView();
                }
            }
        }
    });
});

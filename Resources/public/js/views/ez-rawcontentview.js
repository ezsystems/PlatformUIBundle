YUI.add('ez-rawcontentview', function (Y) {
    "use strict";
    /**
     * Provides the Raw Content View class
     *
     * @module ez-rawcontentview
     */
    Y.namespace('eZ');

    var COLLAPSED_RAW_VIEW = 'is-raw-content-view-collapsed',
        COLLAPSED_GROUP = 'is-field-group-collapsed',
        COLLAPSED_GROUP_HEIGHT = '1em',
        COLLAPSED_GROUPS_HEIGHT = 0,
        TRANSITION_DURATION = 0.3,
        TRANSITION_EASING = 'ease';

    /**
     * The raw content view
     *
     * @namespace eZ
     * @class RawContentView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.RawContentView = Y.Base.create('rawContentView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-raw-content-title': {
                'tap': '_collapseView'
            },
            '.ez-fieldgroup-name': {
                'tap': '_collapseFieldGroup'
            }
        },

        initializer: function () {
            this.after('contentTypeChange', this._setFieldViews);
            if ( this.get('contentType') ) {
                this._setFieldViews();
            }
        },

        /**
         * Collapses the `collapseElt` element  with a nice transition on its height.
         * To detect the state, the `collapsedClass` is checked against the
         * `collapsedClassElt`. Once the transition is finished, the callback is
         * called.
         *
         * @method _collapse
         * @private
         * @param {String} collapsedClass the class to check to get the current
         * state
         * @param {String} collapsedHeight the height when in collapsed state
         * @param {Node} collapsedClassElt the node on which to check the state
         * @param {collapseElt} the node to collapse
         * @param {Function} [callback] an optionnal callback
         */
        _collapse: function (collapsedClass, collapsedHeight, collapsedClassElt, collapseElt, callback) {
            var collapsed = collapsedClassElt.hasClass(collapsedClass);

            collapseElt.transition({
                height: function () {
                    if ( collapsed ) {
                        return collapseElt.get('scrollHeight') + 'px';
                    } else {
                        return collapsedHeight;
                    }
                },
                duration: TRANSITION_DURATION,
                easing: TRANSITION_EASING,
            }, function () {
                if ( collapsed ) {
                    collapseElt.removeAttribute('style');
                }
                collapsedClassElt.toggleClass(collapsedClass);
                if ( callback ) {
                    callback();
                }
            });
        },

        /**
         * Tap event handler to collapse/uncollapse the raw content view
         *
         * @method _collapseView
         * @protected
         * @param {Object} event face of the tap event
         */
        _collapseView: function (e) {
            var container = this.get('container');

            e.preventDefault();
            this._collapse(
                COLLAPSED_RAW_VIEW, COLLAPSED_GROUPS_HEIGHT,
                container, container.one('.ez-fieldgroups')
            );
        },

        /**
         * Tap event handler to collapse/uncollapse the field group
         *
         * @method _collapseFieldGroup
         * @protected
         * @param {Object} event facade of the tap event
         */
        _collapseFieldGroup: function (e) {
            var group = e.currentTarget.next('.ez-fieldgroup');

            e.preventDefault();
            this._collapse(
                COLLAPSED_GROUP, COLLAPSED_GROUP_HEIGHT,
                group, group, function () {
                    e.currentTarget.toggleClass(COLLAPSED_GROUP);
                }
            );
        },

        /**
         * Sets the field views for the current content
         *
         * @method _setFieldViews
         * @protected
         */
        _setFieldViews: function () {
            var definitions = this.get('contentType').get('fieldDefinitions'),
                content = this.get('content'),
                views = [];

            Y.Object.each(definitions, function (def) {
                var View;

                View = Y.eZ.FieldView.getFieldView(def.fieldType);
                views.push(
                    new View({
                        fieldDefinition: def,
                        field: content.getField(def.identifier)
                    })
                );
            });

            /**
             * The field views instances for the current content
             *
             * @property _fieldViews
             * @default []
             * @type Array of {eZ.FieldView}
             */
            this._fieldViews = views;
        },

        /**
         * Renders the raw content view
         *
         * @method render
         * @return {eZ.RawContentView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                content: this.get('content').toJSON(),
                fieldGroups: this.get('contentType').getFieldGroups(),
            }));

            this._renderFieldViews();
            return this;
        },

        /**
         * Renders the field views in the correct field group
         *
         * @protected
         * @method _renderFieldViews
         */
        _renderFieldViews: function () {
            var container = this.get('container');

            Y.Array.each(this._fieldViews, function (view) {
                var def = view.get('fieldDefinition');

                container.one('.ez-fieldgroup-' + def.fieldGroup).append(
                    view.render().get('container')
                );
            });
        },
    }, {
        ATTRS: {
            /**
             * The content associated the current location
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {},

            /**
             * The content type of the content at the current location
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             */
            contentType: {}
        }
    });
});

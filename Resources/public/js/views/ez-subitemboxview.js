/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemboxview', function (Y) {
    "use strict";
    /**
     * Provides the subitem box view.
     *
     * @module ez-subitemboxview
     */
    Y.namespace('eZ');

    /**
     * The subitem box view. It allows the user to choose how the subitems are
     * displayed.
     *
     * @namespace eZ
     * @class SubitemBoxView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.SubitemBoxView = Y.Base.create('subitemBoxView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-switch-subitemview': {
                'tap': '_switchSubitemView',
            },
        },

        initializer: function () {
            this.after('activeChange', this._activeSubitemView);
            this.after('subitemViewIdentifierChange', this._uiChangeSubitemView);
        },

        /**
         * tap event handler on switch subitem view link. It sswitches the
         * subitem view to the one indicated in the `data-view-identifier`
         * attribute.
         *
         * @protected
         * @method _switchSubitemView
         * @param {EventFacade} e
         */
        _switchSubitemView: function (e) {
            e.preventDefault();
            this.set('subitemViewIdentifier', e.target.getData('view-identifier'));
        },

        /**
         * `subitemViewIdentifierChange` event handler. It renders the newly
         * selected subitem view.
         *
         * @method _uiChangeSubitemView
         * @protected
         * @param {EventFacade} e
         */
        _uiChangeSubitemView: function (e) {
            var previous = this._getSubitemView(e.prevVal),
                view = this._getSubitemView(e.newVal);

            previous.set('active', false);
            this._renderSubitemView(view);
            view.set('active', true);
        },

        /**
         * Returns the subitem view with the given `identifier`.
         *
         * @method _getSubitemView
         * @protected
         * @return {eZ.SubitemBaseView}
         */
        _getSubitemView: function (identifier) {
            return Y.Array.find(this.get('subitemViews'), function (view) {
                return view.get('identifier') === identifier;
            });
        },

        /**
         * `activeChange` event hanlder. It forwards the `active` value to the
         * currently selected subitem view.
         *
         * @method _activeSubitemView
         * @protected
         * @param {EventFacade} e
         */
        _activeSubitemView: function (e) {
            this._getSubitemView(this.get('subitemViewIdentifier')).set('active', e.newVal);
        },

        render: function () {
            this.get('container').setHTML(this.template({
                location: this.get('location').toJSON(),
                viewsInfo: this._getSubitemViewsInfo(),
            }));

            this._renderSubitemView(this._getSubitemView(this.get('subitemViewIdentifier')));
            return this;
        },

        /**
         * Renders the subitem view `view`
         *
         * @method _renderSubitemView
         * @protected
         * @param {eZ.SubitemBaseView} view
         */
        _renderSubitemView: function (view) {
            this.get('container').one('.ez-subitembox-content').setHTML(
                view.render().get('container')
            );
        },

        /**
         * Returns the subitem view infos for the available subitem view
         * implementation.
         *
         * @method _getSubitemViewsInfo
         * @return Array
         */
        _getSubitemViewsInfo: function () {
            return this.get('subitemViews').map(function (view) {
                return {
                    identifier: view.get('identifier'),
                    name: view.get('name'),
                    selected: (view.get('identifier') === this.get('subitemViewIdentifier'))
                };
            }, this);
        },

        /**
         * Adds a subitem view implementation to the `subitemViews` attribute.
         * The subitem box view is added to the bubble targets of the `view`.
         *
         * @method addSubitemView
         * @param {eZ.SubitemBaseView} view
         */
        addSubitemView: function (view) {
            this.get('subitemViews').push(view);
            view.addTarget(this);
        },
    }, {
        ATTRS: {
            /**
             * The location being rendered
             *
             * @attribute location
             * @type Y.eZ.Location
             * @writeOnce
             * @required
             */
            location: {
                writeOnce: "initOnly",
            },

            /**
             * The content associated the current location
             *
             * @attribute content
             * @type Y.eZ.Content
             * @writeOnce
             * @required
             */
            content: {
                writeOnce: "initOnly",
            },

            /**
             * The content type of the content at the current location
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             * @writeOnce
             * @required
             */
            contentType: {
                writeOnce: "initOnly",
            },

            /**
             * The list of available subitem views implementation. Do not
             * manipulate directly this attribute, use `addSubitemView` to add
             * a new implementation.
             *
             * @attribute subitemViews
             * @writeOnce
             * @type Array<eZ.SubitemBaseView>
             */
            subitemViews: {
                writeOnce: 'initOnly',
                valueFn: function () {
                    return [
                        new Y.eZ.SubitemListView({
                            location: this.get('location'),
                            content: this.get('content'),
                            contentType: this.get('contentType'),
                            config: this.get('config'),
                            bubbleTargets: this,
                        }),
                    ];
                },
            },

            /**
             * The identifier of the currently displayed subitem view
             * implementation.
             *
             * @attribute subitemViewIdentifier
             * @type {String}
             * @default 'list'
             */
            subitemViewIdentifier: {
                value: 'list',
            },
        }
    });
});

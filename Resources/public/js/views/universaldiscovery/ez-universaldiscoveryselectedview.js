/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryselectedview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery selected view
     *
     * @module ez-universaldiscoveryselectedview
     */
    Y.namespace('eZ');

    /**
     * Universal Discovery Selected View. It's a view meant to display the
     * currently selected content in the different discovery method.
     *
     * @namespace eZ
     * @class UniversalDiscoverySelectedView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('universalDiscoverySelectedView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {
            this.after('contentStructChange', function (e) {
                this.render();
            });
        },

        render: function () {
            this.get('container').setHTML(this.template({
                content: this._modelJson('content'),
                location: this._modelJson('location'),
                contentType: this._modelJson('contentType'),
            }));
            return this;
        },

        /**
         * 'jsonifies' the model available under the identifier in the
         * `contentStruct` attribute
         *
         * @method _modelJson
         * @protected
         * @param {String} identifier the identifier of the model in the
         * `contentStruct` attribute
         * @return {Object|false}
         */
        _modelJson: function (identifier) {
            var struct = this.get('contentStruct');

            if ( struct && struct[identifier] ) {
                return struct[identifier].toJSON();
            }
            return false;
        },
    }, {
        ATTRS: {
            /**
             * The content structure representing the content to display. It
             * should contain the content, the location and the content type
             * models under the key `content`, `location` and `contentType`.
             *
             * @attribute contentStruct
             * @type {null|Object}
             * @default null
             */
            contentStruct: {
                value: null,
            }
        }
    });
});

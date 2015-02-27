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
        events: {
            '.ez-ud-selected-confirm': {
                'tap': '_confirmSelected',
            }
        },

        initializer: function () {
            this.after('contentStructChange', function (e) {
                this.render();
            });
        },

        /**
         * tap event handler on the confirm button. It fires the
         * `confirmSelectedContent` event meaning that the user wants the
         * content to be added to his confirmed content list.
         *
         * @method _confirmSelected
         * @protected
         * @param {EventFacade} e
         */
        _confirmSelected: function (e) {
            /**
             * Fired when the user has confirmed that he wants the content to be
             * added in the confirmed list. This event will be fired/used only
             * when the universal discovery widget is configured to allow
             * several contents to be selected.
             *
             * @event confirmSelectedContent
             * @param selection {Object} the content structure for the content
             * which is selected
             */
            this.fire('confirmSelectedContent', {
                selection: this.get('contentStruct'),
            });
        },

        render: function () {
            this.get('container').setHTML(this.template({
                content: this._modelJson('content'),
                location: this._modelJson('location'),
                contentType: this._modelJson('contentType'),
                confirmButton: this.get('confirmButton'),
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
            },

            /**
             * Flag indicating whether a confirm button is needed or not.
             *
             * @attribute confirmButton
             * @type {Boolean}
             * @default false
             */
            confirmButton: {
                value: false,
            },
        }
    });
});

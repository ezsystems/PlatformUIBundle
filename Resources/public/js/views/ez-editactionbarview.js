/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editactionbarview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Action Bar class
     *
     * @module ez-editactionbarview
     */
    Y.namespace('eZ');

    /**
     * The edit action bar
     *
     * @namespace eZ
     * @class EditActionBarView
     * @constructor
     * @extends eZ.BarView
     */
    Y.eZ.EditActionBarView = Y.Base.create('editActionBarView', Y.eZ.BarView, [], {
        /**
         * Makes sure for that new action gets and updated version of the version
         *
         * @method initializer
         */
        initializer: function () {
            this.after('actionsListChange', function (e) {
                this._setVersion(this.get('version'));
                this._setLanguageCode(this.get('languageCode'));
            });
        },

        /**
         * Sets the version on all the action list
         *
         * @protected
         * @method _setVersion
         * @param {eZ.Version} version
         */
        _setVersion: function (version) {
            Y.Array.each(this.get('actionsList'), function (action) {
                action.set('version', version);
            });
        },

        /**
         * Sets the languageCode on all the action list
         *
         * @protected
         * @method _setLanguageCode
         * @param {String} languageCode
         */
        _setLanguageCode: function (languageCode) {
            Y.Array.each(this.get('actionsList'), function (action) {
                action.set('languageCode', languageCode);
            });
        },
    }, {
        ATTRS: {
            /**
             * The edit bar action list filled with the default button action
             * view list
             *
             * @attribute actionsList
             * @type Array
             */
            actionsList: {
                valueFn: function () {
                    var list = [
                            new Y.eZ.ButtonActionView({
                                actionId: "publish",
                                disabled: false,
                                label: "Publish",
                                priority: 200
                            }),
                            new Y.eZ.ButtonActionView({
                                actionId: "discard",
                                disabled: false,
                                label: "Discard changes",
                                priority: 180
                            }),
                        ];

                    if ( !this.get('contentType').hasFieldType('ezuser') ) {
                        // for now users are considered as "normal" Content but
                        // the UserService does not support "user draft"
                        // see https://jira.ez.no/browse/EZP-24908
                        list.push(
                            new Y.eZ.ButtonActionView({
                                actionId: "save",
                                disabled: false,
                                label: "Save",
                                priority: 190
                            })
                        );
                        list.push(
                            new Y.eZ.PreviewActionView({
                                actionId: "preview",
                                label: "Preview",
                                priority: 170,
                                buttons: [
                                    {option: "desktop"},
                                    {option: "tablet"},
                                    {option: "mobile"}
                                ],
                            })
                        );
                    }
                    return list;
                }
            },

            /**
             * The content type of the content being edited
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             * @required
             */
            contentType: {},

            /**
             * The version currently being edited
             *
             * @attribute version
             * @type {eZ.Version}
             * @default {}
             */
            version: {
                value: {},
                setter: function (val, name) {
                    this._setVersion(val);
                }
            },

            /**
             * The language code of the content currently edited
             *
             * @attribute languageCode
             * @type {String}
             */
            languageCode: {
                value: '',
                setter: function (val, name) {
                    this._setLanguageCode(val);
                }
            }

        }
    });
});

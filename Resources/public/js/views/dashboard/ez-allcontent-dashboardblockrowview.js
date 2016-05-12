/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-allcontent-dashboardblockrowview', function (Y) {
    'use strict';

    /**
     * Provides the All Content Dashboard Block Row View class
     *
     * @module ez-allcontent-dashboardblockrowview
     */
    Y.namespace('eZ');

    var CLASS_SELECTED = 'is-row-selected',
        CLASS_ROW = 'ez-dashboard-block-row',
        SELECTOR_OPTIONS = '.ez-dashboard-block-row-options';

    /**
     * The all content dashboard block row view
     *
     * @namespace eZ
     * @class AllContentDashboardBlockRowView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.AllContentDashboardBlockRowView = Y.Base.create('allContentDashboardBlockRowView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {
            this._clickOutsideHandler = null;

            this.on('*:editAction', this._uiGoToContentEdit);
            this.on('*:previewAction', this._uiGoToContentPreview);
        },

        /**
         * Renders the dashboard row view
         *
         * @method render
         * @return {eZ.AllContentDashboardBlockRowView} the view itself
         */
        render: function () {
            var model = this.get('model'),
                contentTypeName = model.ContentType.names.filter(function (name) {
                    return model.ContentType.mainLanguageCode === name._languageCode;
                })[0]['#text'],
                container = this.get('container'),
                optionsFragment = Y.one(document.createDocumentFragment());

            container.setHTML(this.template({
                title: model.Name,
                contentType: contentTypeName,
                version: model.CurrentVersion.Version.VersionInfo.versionNo,
                modified: model.CurrentVersion.Version.VersionInfo.modificationDate
            }));

            this.get('options').forEach(Y.bind(function (option) {
                option.addTarget(this);

                optionsFragment.append(option.render().get('container'));
            }, this));

            container.addClass(CLASS_ROW);
            container.one(SELECTOR_OPTIONS).setHTML(optionsFragment);
            container.on('tap', Y.bind(this._uiShowOptions, this));

            return this;
        },

        /**
         * Shows the row options
         *
         * @method _uiShowOptions
         * @protected
         */
        _uiShowOptions: function () {
            var container = this.get('container');

            container.addClass(CLASS_SELECTED);
            this._clickOutsideHandler = container.on('clickoutside', Y.bind(this._uiHideOptions, this));
        },

        /**
         * Hides the row options
         *
         * @method _uiHideOptions
         * @protected
         */
        _uiHideOptions: function () {
            this.get('container').removeClass(CLASS_SELECTED);
            this._clickOutsideHandler.detach();
        },

        /**
         * Tries to redirect a user to selected content edit
         *
         * @method _uiGoToContentEdit
         * @protected
         * @param event {Object} event facade
         */
        _uiGoToContentEdit: function (event) {
            var model = this.get('model');

            event.stopPropagation();

            /**
             * Makes request to redirect a user to content edit
             *
             * @event gotoContentEdit
             * @param contentId {String} REST content id
             * @param languageCode {String} content main language code
             */
            this.fire('gotoContentEdit', {
                contentId: model._href,
                languageCode: model.mainLanguageCode
            });
        },

        /**
         * Tries to redirect a user to selected content location preview
         *
         * @method _uiGoToContentPreview
         * @protected
         * @param event {Object} event facade
         */
        _uiGoToContentPreview: function (event) {
            var model = this.get('model');

            event.stopPropagation();

            /**
             * Makes request to redirect a user to content main location preview
             *
             * @event gotoContentPreview
             * @param locationId {String} REST main location id
             * @param languageCode {String} content main language code
             */
            this.fire('gotoContentPreview', {
                locationId: model.MainLocation._href,
                languageCode: model.mainLanguageCode
            });
        },

        destructor: function () {
            if (this._clickOutsideHandler) {
                this._clickOutsideHandler.detach();
            }
        }
    }, {
        ATTRS: {
            /**
             * The row model hash
             *
             * @attribute model
             * @type Object
             */
            model: {},

            /**
             * The row options.
             * Contains a list of button action view instances:
             * - edit button,
             * - preview button.
             *
             * @attribute options
             * @type Array
             */
            options: {
                valueFn: function () {
                    return [
                        new Y.eZ.ButtonActionView({
                            actionId: 'edit',
                            label: 'Edit'
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: 'preview',
                            label: 'Preview'
                        })
                    ];
                }
            }
        }
    });
});

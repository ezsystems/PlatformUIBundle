/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-media-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Media (ezmedia) fields
     *
     * @module ez-media-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezmedia',
        L = Y.Lang,
        IS_BEING_UPDATED = 'is-media-being-updated',
        IS_UNSUPPORTED = 'is-media-unsupported',
        events = {
            'input[type=checkbox]': {
                'change': '_updateSetting',
            },
            'input[type=number]': {
                'valuechange': '_updateSize',
            },
        };

    /**
     * The Media edit view
     *
     * @namespace eZ
     * @class MediaEditView
     * @constructor
     * @extends eZ.BinaryBaseEditView
     */
    Y.eZ.MediaEditView = Y.Base.create('mediaEditView', Y.eZ.BinaryBaseEditView, [], {
        initializer: function () {
            var fieldValue = this.get('field').fieldValue,
                updatedEvents = [
                    'loopChange', 'autoplayChange', 'hasControllerChange',
                    'widthChange', 'heightChange'
                ];

            this._handleFieldDescriptionVisibility = false;
            this.events = Y.merge(this.events, events);
            if ( fieldValue ) {
                this._set('autoplay', fieldValue.autoplay);
                this._set('hasController', fieldValue.hasController);
                this._set('loop', fieldValue.loop);
                this._set('width', fieldValue.width);
                this._set('height', fieldValue.height);
            }
            this.after('fileChange', this._uiMediaFileChange);
            this.after(updatedEvents, function () {
                this._set('updated', true);
            });
        },

        _afterRender: function () {
            this._watchPlayerEvents();
        },

        /**
         * Sets the event handler on the video/audio element to handle the
         * *being updated* state, the width/height placeholder and a potential
         * file format error
         *
         * @method _watchPlayerEvents
         * @protected
         */
        _watchPlayerEvents: function () {
            var that = this,
                container = this.get('container'),
                player = this._getPlayerNode();

            this._attachedViewEvents.push(player.on('loadedmetadata', function () {
                container.removeClass(IS_BEING_UPDATED);
                that._updateWidthHeightPlaceholder(player.get('videoWidth'), player.get('videoHeight'));
            }));
            this._attachedViewEvents.push(player.on('error', function () {
                container.removeClass(IS_BEING_UPDATED);
                that._mediaError(player);
            }));
        },

        /**
         * Sets the placeholder attribute on the width and height input with the
         * given values
         *
         * @method _updateWidthHeightPlaceholder
         * @param {String|Number} widthValue
         * @param {String|Number} heightValue
         */
        _updateWidthHeightPlaceholder: function (widthValue, heightValue) {
            var container = this.get('container'),
                width = container.one('input[name=width]'),
                height = container.one('input[name=height]');

            if ( width && height ) {
                width.setAttribute('placeholder', widthValue);
                height.setAttribute('placeholder', heightValue);
            }
        },

        /**
         * Adds the unsupported class and resets the width/height placeholder
         * when the file can not read by the browser
         *
         * @method _mediaError
         * @param {Node} player the video/audio node
         */
        _mediaError: function (player) {
            var error = player.get('error');

            if ( error && error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED ) {
                this._updateWidthHeightPlaceholder("", "");
                this.get('container').addClass(IS_UNSUPPORTED);
            }
        },

        /**
         * Event handler for the DOM change event on the controller, autoplay
         * and loop checkboxes.
         *
         * @method _updateSetting
         * @param {EventFacade} e
         */
        _updateSetting: function (e) {
            var input = e.target;

            this._set(input.getAttribute('name'), input.get('checked'));
        },

        /**
         * Event handler the valuechange event on the width and height input
         *
         * @method _updateSize
         * @param {EventFacade} e
         */
        _updateSize: function (e) {
            var input = e.target,
                attrName = input.getAttribute('name');

            this._set(attrName, input.get('valueAsNumber'));
        },

        /**
         * Removes the *being updated* and *unsupported* class before reading
         * the content of the file
         *
         * @method _beforeReadFile
         * @protected
         */
        _beforeReadFile: function () {
            this.get('container').addClass(IS_BEING_UPDATED).removeClass(IS_UNSUPPORTED);
        },

        /**
         * Reflects the new binaryfile object in the generated UI
         *
         * @method _uiBinaryFileChange
         * @param {EventFacade} e the binaryfile change event facade
         * @protected
         */
        _uiMediaFileChange: function (e) {
            var media = this.get('file'),
                container = this.get('container'),
                removeButton = container.one('.ez-button-delete');

            if ( media ) {
                container.one('.ez-media-properties-name').setContent(media.name);
                container.one('.ez-media-properties-size').setContent(media.size);
                container.one('.ez-media-properties-type').setContent(media.type);
                container.one('.ez-media-link').setAttribute('href', media.uri);
                removeButton.set('disabled', false);
                this._getPlayerNode().setAttribute('src', media.uri);
            } else {
                // no need to update the DOM, the media is hidden by CSS
                removeButton.set('disabled', true);
            }
            this._setStateClasses();
            this.validate();
        },

        /**
         * Returns the video/audio node
         *
         * @method _getPlayerNode
         * @private
         * @return {Node}
         */
        _getPlayerNode: function () {
            return this.get('container').one('.ez-media-player');
        },

        /**
         * Defines the variables to be imported in the field edit template.
         *
         * @protected
         * @method _variables
         * @return {Object}
         */
        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired,
                "media": this.get('file'),
                "hasController": this.get('hasController'),
                "autoplay": this.get('autoplay'),
                "loop": this.get('loop'),
                "width": this.get('width'),
                "height": this.get('height'),
                "isAudio": this.get('fieldDefinition').fieldSettings.mediaType === "TYPE_HTML5_AUDIO",
            };
        },

        /**
         * Completes the field value with the player settings
         *
         * @protected
         * @method _completeFieldValue
         * @param {Object} fieldValue
         * @return {Object}
         */
        _completeFieldValue: function (fieldValue) {
            fieldValue.autoplay = this.get('autoplay');
            fieldValue.loop = this.get('loop');
            fieldValue.hasController = this.get('hasController');

            fieldValue.width = this.get('width');
            fieldValue.height = this.get('height');

            return fieldValue;
        }
    }, {
        ATTRS: {
            /**
             * Stores the autoplay setting
             *
             * @attribute autoplay
             * @type Boolean
             * @default false
             * @readOnly
             */
            autoplay: {
                value: false,
                readOnly: true,
            },

            /**
             * Stores the hasController setting
             *
             * @attribute hasController
             * @type Boolean
             * @default false
             * @readOnly
             */
            hasController: {
                value: false,
                readOnly: true,
            },

            /**
             * Stores the loop setting
             *
             * @attribute loop
             * @type Boolean
             * @default false
             * @readOnly
             */
            loop: {
                value: false,
                readOnly: true,
            },

            /**
             * Stores the width setting
             *
             * @attribute width
             * @type Number
             * @readOnly
             */
            width: {
                validator: L.isNumber,
                readOnly: true,
            },

            /**
             * Stores the height setting
             *
             * @attribute height
             * @type Number
             * @readOnly
             */
            height: {
                validator: L.isNumber,
                readOnly: true,
            },
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.MediaEditView
    );
});

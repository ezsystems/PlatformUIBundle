YUI.add('ez-contenteditview', function (Y) {
    "use strict";
    /**
     * Provides the Content Edit View class
     *
     * @module ez-contenteditview
     */

    Y.namespace('eZ');

    var DETAILS_SEL = '.ez-technical-infos',
        CONTENT_SEL = '.ez-main-content',
        ESCAPE_KEY = 27,
        FORM_CONTAINER = '.ez-contenteditformview-container',
        ACTION_BAR_CONTAINER = '.ez-editactionbar-container',
        EDIT_PREVIEW_CONTAINER = '.ez-editpreview-container';

    /**
     * The content edit view
     *
     * @namespace eZ
     * @class ContentEditView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentEditView = Y.Base.create('contentEditView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-view-close': {'tap': '_closeView'},
            'header': {
                'mouseover': '_showDetails',
                'mouseout': '_hideDetails'
            },
            '.ez-main-content': {
                'keyup': '_handleKeyboard'
            }
        },

        /**
         * Initializer is called upon view's init
         * Creating and managing child views inside it
         * Also setting event dispatchers
         *
         * @method initializer
         */
        initializer: function () {
            this.get('formView').addTarget(this);
            this.get('actionBar').addTarget(this);
            this.get('editPreview').addTarget(this);

            this.on('*:action', this._dispatchAction, this);

        },

        /**
         * Destructor is called upon view's destruction
         * Destroying and cleaning up child views
         *
         * @method destructor
         */
        destructor: function () {
            this.get('formView').destroy();
            this.get('actionBar').destroy();
        },

        /**
         * Renders the content edit view
         *
         * @method render
         * @return {eZ.ContentEditView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                isTouch: this._isTouch(),
                content: this.get('content').toJSON(),
                mainLocation: this.get('mainLocation').toJSON(),
                contentType: this.get('contentType').toJSON(),
                owner: this.get('owner').toJSON()
            }));

            container.one(FORM_CONTAINER).append(this.get('formView').render().get('container'));
            container.one(ACTION_BAR_CONTAINER).append(this.get('actionBar').render().get('container'));

            //Do NOT render preview yet (to reduce load)
            container.one(EDIT_PREVIEW_CONTAINER).append(this.get('editPreview').get('container'));

            return this;
        },

        /**
         * Dispatching actions coming from editActionBar, and wherever else
         *
         * @method _dispatchAction
         * @protected
         * @param e {Object} object sent along with the the action
         */
        _dispatchAction: function (e){

            if (e.action == "preview"){
                this.get('editPreview').set('currentMode', e.option);
                this.get('editPreview').show();
            }

        },

        /**
         * Set current input focus on the view
         *
         * @method setFocus
         */
        setFocus: function () {
            this.get('container').one(CONTENT_SEL).focus();
        },

        /**
         * Shows the technical infos of the content. If the device is detected
         * as a touch device, it does nothing as the technical infos are always
         * visible in this case.
         *
         * @method _showDetails
         * @protected
         */
        _showDetails: function () {
            if ( !this._isTouch() ) {
                this.get('container')
                    .all(DETAILS_SEL)
                    .show('fadeIn', {duration: 0.2});
            }
        },

        /**
         * Hides the technical infos of the content. If the device is detected
         * as a touch device, it odes nothing as the technical infos are always
         * visible in this case.
         *
         * @method _hideDetails
         * @protected
         */
        _hideDetails: function () {
            if ( !this._isTouch() ) {
                this.get('container')
                    .all(DETAILS_SEL)
                    .hide('fadeOut', {duration: 0.2});
            }
        },

        /**
         * Event event handler for the close link in the content edit view
         *
         * @method _closeView
         * @protected
         * @param {Object} e event facade of the tap event
         */
        _closeView: function (e) {
            /**
             * Fired when the close link is clicked
             *
             * @event close
             */
            this.fire('close');
            e.preventDefault();
        },

        /**
         * Event event handler for any key pressed within the content edit view
         *
         * @method _handleKeyboard
         * @protected
         * @param {Object} e event facade of the keyboard event
         */
        _handleKeyboard: function (e) {

            if (e.keyCode === ESCAPE_KEY) {
                this._closeView(e);
            }

        },

        /**
         * Returns whether the current browser is a touch device or not
         *
         * @method _isTouch
         * @private
         * @return {Boolean}
         */
        _isTouch: function () {
            return Y.UA.touchEnabled;
        }
    }, {
        ATTRS: {
            /**
             * The content being edited
             *
             * @attribute content
             * @default {}
             * @required
             */
            content: {
                value: {},
                setter: function (val, name) {
                    this.get('formView').set('content', val);
                    return val;
                }
            },

            /**
             * The content type of the content being edited
             *
             * @attribute contentType
             * @default {}
             * @required
             */
            contentType: {
                value: {},
                setter: function (val, name) {
                    this.get('formView').set('contentType', val);
                    return val;
                }
            },

            /**
             * The main location of the content being edited
             *
             * @attribute mainLocation
             * @default {}
             * @required
             */
            mainLocation: {
                value: {}
            },

            /**
             * The owner of the content being edited
             *
             * @attribute owner
             * @default {}
             * @required
             */
            owner: {
                value: {}
            },

            /**
             * The ContentEditFormView (by default) instance which will be used to render form
             *
             * @attribute formView
             * @default {}
             * @type {eZ.ContentEditFormView}
             * @required
             */
            formView: {
                value: new Y.eZ.ContentEditFormView()
            },

            /**
             * The EditActionBar (by default) instance which will be used to render form
             *
             * @attribute actionBar
             * @default {}
             * @type {eZ.EditActionBar}
             * @required
             */
            actionBar: {
                value: new Y.eZ.EditActionBar()
            },

            /**
             * The EditPreview (by default) instance
             *
             * @attribute editPreview
             * @default {}
             * @type {eZ.EditPreview}
             * @required
             */
            editPreview: {
                value: new Y.eZ.EditPreview({})
            }
        }
    });
});

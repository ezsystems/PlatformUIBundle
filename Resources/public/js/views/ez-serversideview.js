/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversideview', function (Y) {
    "use strict";
    /**
     * Provides the generic server side view class
     *
     * @module ez-serversideview
     */
    Y.namespace('eZ');

    /**
     * The server side view
     *
     * @namespace eZ
     * @class ServerSideView
     * @constructor
     * @extends eZ.View
     */
    Y.eZ.ServerSideView = Y.Base.create('serverSideView', Y.eZ.View, [Y.eZ.Tabs, Y.eZ.SelectionTable], {
        events: {
            'form': {
                'submit': '_submitForm'
            },
        },

        /**
         * Form handling. The DOM submit is transformed into an application
         * level event `submitForm` so that the server side view service can
         * handle it.
         *
         * @method _submitForm
         * @protected
         * @param {EventFacade} e
         */
        _submitForm: function (e) {
            /**
             * Fired when a form is submitted in the browser
             *
             * @event submitForm
             * @param {Node} form the Node object of the submitted form
             * @param {Object} formData the serialzed form data including the
             * used button to validate the form
             * @param {Event} originalEvent the original DOM submit event
             */
            this.fire('submitForm', {
                form: e.target,
                formData: this._serializeForm(e.target),
                originalEvent: e,
            });
        },

        /**
         * Serializes the form data so that it can be send with an AJAX request.
         * It also checks which button was used (if any) to include it in the
         * data.
         *
         * @method _serializeForm
         * @param {Node} form
         * @return {Object} key/value data of the form
         */
        _serializeForm: function (form) {
            var focusedNode = form.get('ownerDocument').get('activeElement'),
                data = {};

            if ( this._isSubmitButton(focusedNode, form) ) {
                data[focusedNode.getAttribute('name')] = "";
            }

            form.get('elements').each(function (field) {
                var name = field.getAttribute('name'),
                    type = field.get('type');

                if ( !name ) {
                    return;
                }

                /* jshint -W015 */
                switch (type) {
                    case 'button':
                    case 'reset':
                    case 'submit':
                        break;
                    case 'radio':
                    case 'checkbox':
                        if ( field.get('checked') ) {
                            data[name] = field.get('value');
                        }
                        break;
                    default:
                        // `.get('value')` returns the expected field value for
                        // inputs, select and even textarea.
                        data[name] = field.get('value');
                }
                /* jshint +W015 */
            });
            return data;
        },

        /**
         * Checks whether the given node is a valid submit button for the given
         * form.
         *
         * @method _isSubmitButton
         * @protected
         * @param {Node} node
         * @param {Node} form
         * @return {Boolean}
         */
        _isSubmitButton: function (node, form) {
            var localName, name, type;

            if ( !node || !form.contains(node) ) {
                return false;
            }
            name = node.getAttribute('name');
            if ( !name ) {
                return false;
            }
            localName = node.get('localName');
            type = node.getAttribute('type');
            return (
                localName === 'button' ||
                ( localName === 'input' && (type === 'submit' || type === 'image' ) )
            );
        },

        /**
         * Initializes the view to make sure the container will get the
         * ez-view-serversideview class
         *
         * @method initializer
         */
        initializer: function () {
            this.containerTemplate = '<div class="ez-view-serversideview"/>';

            this.on('activeChange', function () {
                this.after('htmlChange', this.render);
            });
        },

        /**
         * Renders the view in its container. It just puts the html attibute
         * content as the content of the view container
         *
         * @method render
         * @return {eZ.ServerSideView} the view it self
         */
        render: function () {
            this.get('container').setContent(this.get('html'));
            return this;
        },

        /**
         * Returns the string to use as the page title
         *
         * @method getTitle
         * @return {String}
         */
        getTitle: function () {
            return this.get('title');
        },
    }, {
        ATTRS: {
            /**
             * The title of the view
             *
             * @attribute title
             * @default ""
             * @type String
             */
            title: {
                value: ""
            },

            /**
             * The HTML content of the view
             *
             * @attribute html
             * @default ""
             * @type String
             */
            html: {
                value: ""
            },
        }
    });
});

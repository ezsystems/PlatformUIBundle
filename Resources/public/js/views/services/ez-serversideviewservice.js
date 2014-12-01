/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversideviewservice', function (Y) {
    "use strict";
    /**
     * Provides the server side view service class
     *
     * @method ez-serversideviewservice
     */
    Y.namespace('eZ');

    /**
     * The Server Side View Service class. It is meant to be used to load the
     * content of a server side view.
     *
     * @namespace eZ
     * @class ServerSideViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.ServerSideViewService = Y.Base.create('serverSideViewService', Y.eZ.ViewService, [], {
        initializer: function () {
            this.on('*:submitForm', this._handleFormSubmit);
        },

        /**
         * Handles the `submitForm` event by preventing the original form to be
         * submitted by the browser and by submitting the form with an AJAX
         * request.
         *
         * @method _handleFormSubmit
         * @protected
         * @param {EventFacade} e
         */
        _handleFormSubmit: function (e) {
            var form = e.form,
                app = this.get('app');

            app.set('loading', true);
            e.originalEvent.preventDefault();
            Y.io(form.getAttribute('action'), {
                method: form.getAttribute('method'),
                form: {
                    id: form,
                },
                on: {
                    success: function (tId, response) {
                        // TODO: in some cases, the server side form handling
                        // should generate a kind of custom redirection so that
                        // the redirection happens in PlatformUI rather than in
                        // the XmlHttpRequest object. This would allow to
                        // properly update the window title and the URL
                        // https://jira.ez.no/browse/EZP-23700
                        app.set('loading', false);
                        this._updateView(e.target, response);
                    },
                    failure: function () {
                        app.set('loading', false);
                        this._error('Failed to load the form');
                    },
                },
                context: this,
            });
        },

        /**
         * Updates the view attributes with the provided HTTP response
         *
         * @method _updateView
         * @private
         * @param {eZ.ServerSideView} view
         * @param {Response} response
         */
        _updateView: function (view, response) {
            this._parseResponse(response);
            view.setAttrs({
                'title': this.get('title'),
                'html': this.get('html'),
            });
        },

        /**
         * Load the content and the title of the server side view using a PJAX
         * like strategy, ie the server is supposed to response with an HTML
         * like document containing a title and the html code to use. The
         * loading is done, the next callback is called with the service itself
         * in parameter. If an error occurs, an error event is triggered.
         *
         * @method _load
         * @protected
         * @param {Function} next
         */
        _load: function (next) {
            var uri = this.get('app').get('baseUri') + this.get('request').params.uri;

            Y.io(uri, {
                method: 'GET',
                on: {
                    success: function (tId, response) {
                        this._parseResponse(response);
                        next(this);
                    },
                    failure: function () {
                        this._error("Failed to load '" + uri + "'");
                    },
                },
                context: this,
            });
        },

        /**
         * Parses the server response
         *
         * @method _parseResponse
         * @protected
         * @param {Object} response
         */
        _parseResponse: function (response) {
            var frag = Y.Node.create(response.responseText),
                html, title;

            html = frag.one('[data-name="html"]');
            title = frag.one('[data-name="title"]');

            if ( html ) {
                this.set('html', this._rewrite(html).getContent());
            }
            if ( title ) {
                this.set('title', title.get('text'));
            }
        },

        /**
         * Rewrites the server side generated HTML so that it's browseable in
         * the PlatformUI application
         *
         * @method _rewrite
         * @protected
         * @param {Node} node
         * @return {Node}
         */
        _rewrite: function (node) {
            var app = this.get('app');

            node.all('a[href]').each(function (link) {
                var href = link.getAttribute('href');

                if (
                    href.charAt(0) === '#'
                    || ( link.hasAttribute('target') && link.getAttribute('target') !== '_self' )
                    || href.match(/^http(s)?:\/\//)
                ) {
                    return;
                }
                // Remoove unnecessary slashes
                href = href.replace(/^\/+/g, '');
                link.setAttribute('href', app.routeUri('adminGenericRoute', {uri: href}));
            });
            return node;
        },

        /**
         * Returns the title and the html code as an object
         *
         * @method _getViewParameters
         * @protected
         * @return {Object}
         */
        _getViewParameters: function () {
            return {
                title: this.get('title'),
                html: this.get('html'),
            };
        }
    }, {
        ATTRS: {
            /**
             * The title parsed from the pjax response.
             *
             * @attribute title
             * @default ""
             * @type String
             */
            title: {
                value: "",
            },

            /**
             * The html code parsed from the pjax response.
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

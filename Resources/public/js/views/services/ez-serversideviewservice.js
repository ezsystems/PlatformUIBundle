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

    var PJAX_DONE_REDIRECT = 205,
        PJAX_LOCATION_HEADER = 'PJAX-Location',
        DEFAULT_HEADERS = {'X-PJAX': 'true'};

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
                headers: Y.merge(DEFAULT_HEADERS, {'Content-Type': form.get('encoding')}),
                data: e.formData,
                on: {
                    success: Y.bind(this._handleFormSubmitResponse, this, e.target),
                    failure: this._handleLoadFailure,
                },
                context: this,
            });
        },

        /**
         * Handles the response of a form submission. It detects if a
         * redirection needs to happen in the application.
         *
         * @method _handleFormSubmitResponse
         * @protected
         * @param {Y.View} view
         * @param {String} tId the transaction id
         * @param {XMLHttpRequest} response
         */
        _handleFormSubmitResponse: function (view, tId, response) {
            var app = this.get('app'),
                pjaxLocation = response.getResponseHeader(PJAX_LOCATION_HEADER);

            if ( response.status === PJAX_DONE_REDIRECT && pjaxLocation ) {
                app.navigate(this._getAdminRouteUri(pjaxLocation));
            } else {
                app.set('loading', false);
                this._updateView(view, response);
            }
        },

        /**
         * Handles the loading error.
         *
         * @method _handleLoadFailure
         * @param {String} tId
         * @param {XMLHttpRequest} response
         * @protected
         */
        _handleLoadFailure: function (tId, response) {
            var frag = Y.Node.create(response.responseText),
                notificationCount,
                errorMsg = '';

            this.get('app').set('loading', false);
            notificationCount = this._parseNotifications(frag);
            if ( notificationCount === 0 ) {
                errorMsg = "Failed to load '" + response.responseURL + "'";
            }
            this._error(errorMsg);
        },

        /**
         * Parses the notification node(s) in the PJAX response and sends the
         * corresponding notify events.
         *
         * @method _parseNotifications
         * @param {Y.Node} docFragment
         * @return {Number} the number of notifications
         * @protected
         */
        _parseNotifications: function (docFragment) {
            var notifications = docFragment.all('[data-name="notification"] li');

            notifications.each(this._notifyUser, this);
            return notifications.size();
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
            var uri = this.get('app').get('apiRoot') + this.get('request').params.uri;

            Y.io(uri, {
                method: 'GET',
                headers: DEFAULT_HEADERS,
                on: {
                    success: function (tId, response) {
                        this._parseResponse(response);
                        next(this);
                    },
                    failure: this._handleLoadFailure,
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

            this._parseNotifications(frag);
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
            node.all('a[href]').each(function (link) {
                if ( !this._isPjaxLink(link) ) {
                    return;
                }
                link.setAttribute('href', this._getAdminRouteUri(link.getAttribute('href')));
            }, this);
            return node;
        },

        /**
         * Returns the URI in PlatformUI App from the PJAX URI
         *
         * @method _getAdminRouteUri
         * @protected
         * @param {String} uri
         * @return {String}
         */
        _getAdminRouteUri: function (uri) {
            var app = this.get('app'),
                regexp = new RegExp('^' + app.get('apiRoot'));

            return app.routeUri('adminGenericRoute', {uri: uri.replace(regexp, '')});
        },

        /**
         * Checks whether the link can be transformed in a PJAX link.
         *
         * @method _isPjaxLink
         * @protected
         * @param {Y.Node} link
         * @return {Boolean}
         */
        _isPjaxLink: function (link) {
            var href = link.getAttribute('href');

            return (
                href.charAt(0) !== '#'
                && ( !link.hasAttribute('target') || link.getAttribute('target') === '_self' )
                && !href.match(/^http(s)?:\/\//)
            );
        },

        /**
         * Fires notify event based on a notification node in the PJAX response.
         *
         * @method _notifyUser
         * @protected
         * @param {Node} node
         */
        _notifyUser: function (node) {
            var app = this.get('app'),
                timeout = 5;

            if (node.getAttribute('data-state') === 'error') {
                timeout = 0;
            }

            // the app is not yet a bubble target of the view service,
            // so we are using the app to fire the event
            // see https://jira.ez.no/browse/EZP-23013
            app.fire('notify', {
                notification: {
                    text: node.getContent(),
                    state: node.getAttribute('data-state'),
                    timeout: timeout
                }
            });
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

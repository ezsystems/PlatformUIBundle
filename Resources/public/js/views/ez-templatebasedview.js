/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-templatebasedview', function (Y) {
    "use strict";
    /**
     * Provides the Template Based view
     *
     * @module ez-templatebasedview
     */
    Y.namespace('eZ');

    var TPL_ELEM_SUFFIX = "-ez-template";

    /**
     * Template based view. An abstract class that provides helpers to deal with
     * view rendered with templates.
     *
     * @namespace eZ
     * @class TemplateBasedView
     * @extends View
     */
    Y.eZ.TemplateBasedView = Y.Base.create('templateBasedView', Y.eZ.View, [], {
        /**
         * Returns the name of the class. This name is used to retrieve the
         * correct template
         *
         * @method _getName
         * @protected
         * @return String
         */
        _getName: function () {
            return this.constructor.NAME;
        },

        /**
         * Generates the class name of a view from its name
         *
         * @method _generateViewClassName
         * @protected
         * @param {String} name
         * @return String
         */
        _generateViewClassName: function (name) {
            return Y.eZ.TemplateBasedView.VIEW_PREFIX + name.toLowerCase();
        },

        /**
         * Initializes the template based view object:
         *
         *   * filles the `template` property (see _setTemplate)
         *
         *   * defines the containerTemplate property so that it contains a
         *     class based on the name of the view object
         *
         * @method initializer
         */
        initializer: function () {
            this._setTemplate();
            this.containerTemplate = '<div class="' + this._generateViewClassName(this._getName()) + '"/>';
        },

        /**
         * Initializes the `template` property of the view. The template is
         * searched in the template registry and then in the DOM. The id of the
         * template (both in the registry and in the DOM) is the name of the
         * view in lowercase with the suffix `-ez-template`.
         *
         * @method _setTemplate
         * @protected
         */
        _setTemplate: function () {
            var tplId = this._getName().toLowerCase() + TPL_ELEM_SUFFIX,
                tpl = Y.Template.get(tplId),
                tplEl, engine;

            if ( tpl ) {
                this.template = tpl;
                return;
            } else {
                tplEl = Y.one('#' + tplId);
                if ( tplEl ) {
                    engine = new Y.Template(Y.Handlebars);
                    this.template = engine.compile(tplEl.getHTML());
                    return;
                }
            }

            console.warn("No template found for the view '" + this._getName() + "'");
            console.warn("tried template registry with id '" + tplId + "' and the DOM element #" + tplId);
            this.template = function () { return ''; };
        }
    }, {
        /**
         * the prefix to generate the view class name
         *
         * @property VIEW_PREFIX
         * @static
         * @protected
         */
        VIEW_PREFIX: "ez-view-",

        /**
         * Registers a partial template which is registered in the template
         * registry. This method is meant to be called in the initializer
         * method of a view compontent that requires a given partial. It takes
         * care of not defining/overwriting an existing partial.
         *
         * @static
         * @method registerPartial
         * @param {String} partialName
         * @param {String} tplId
         */
        registerPartial: function (partialName, tplId) {
            var tpl;

            if ( Y.Handlebars.partials[partialName] ) {
                return;
            }
            tpl = Y.Template.get(tplId);
            if ( tpl ) {
                Y.Handlebars.registerPartial(partialName, tpl);
                return ;
            }
            console.warn('Unable to find the partial template with id "' + tplId + "' in the registry");
        },
    });
});

YUI.add('ez-templatebasedview', function (Y) {
    "use strict";
    /**
     * Provides the Template Based view
     * 
     * @module ez-templatebasedview
     */

    Y.namespace('eZ');

    var TPL_ELEM_SUFFIX = "-ez-template",
        VIEW_PREFIX = "ez-view-";

    /**
     * Template based view. An abstract class that provides helpers to deal with
     * view rendered with templates.
     *
     * @namespace eZ
     * @class TemplateBasedView
     * @extends View
     */
    Y.eZ.TemplateBasedView = Y.Base.create('templateBasedView', Y.View, [], {

        /**
         * Initializes the template based view object:
         *
         *   * the template property is filled with the content of the element
         *     which id is the name of view in the lower case followed by
         *     "-ez-template". If this element is not found, the template property
         *     is filled with a function that returns an empty string
         *   * defines the containerTemplate property so that it contains a
         *     class based on the name of the view object
         *
         * @method initializer
         */
        initializer: function () {
            var name = this.constructor.NAME,
                tplEl = Y.one('#' + name.toLowerCase() + TPL_ELEM_SUFFIX);

            this.template = function () { return ''; };
            if ( tplEl ) {
                this.template = Y.Handlebars.compile(
                    tplEl.getHTML()
                );
            }
            this.containerTemplate = '<div class="' + VIEW_PREFIX + name.toLowerCase() + '"/>';
        }

    });

});

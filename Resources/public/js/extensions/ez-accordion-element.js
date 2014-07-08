/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-accordion-element', function (Y) {
    "use strict";
    /**
     * The accordion extension
     *
     * @module ez-accordion-element
     */

    Y.namespace('eZ');

    /**
     * Extension providing the `_collapse` method which allows to create an
     * accordion effect on elements with a nice transition on its height.
     *
     * @namespace eZ
     * @class AccordionElement
     * @extensionfor Y.View
     */
    var AccordionElement = function () {};

    /**
     * Collapse or uncollapse an element (transition on its height);
     *
     * @method _collapse
     * @protected
     * @param {Object} conf the configuration
     * @param {String} conf.collapsedClass the class to set/unset on the detectElement
     *                 node
     * @param {Node|HTMLElement|String} conf.collapseElement the DOM element
     *                                  which is collapsed/uncollapsed
     * @param {Node|HTMLElement|String} [conf.detectElement] the DOM element used
     *                                  to detect the current state, if not
     *                                  provided the `collapseElement` is used
     *                                  instead.
     * @param {String} [conf.collapsedHeight=0] the height of the collapseElement
     *                 when it is collapsed
     * @param {Number} [conf.duration=0.3] the transition duration
     * @param {String} [conf.easing=ease] the transition easing
     * @param {Function} [conf.callback] optional callback function called after the
     *                   element has collapsed/uncollapsed
     */
    AccordionElement.prototype._collapse = function (conf) {
        var collapseElement = Y.one(conf.collapseElement),
            detectElement = Y.one(conf.detectElement ? conf.detectElement : conf.collapseElement),
            collapsed = detectElement.hasClass(conf.collapsedClass);

        collapseElement.setStyle('overflow', 'hidden');
        collapseElement.transition({
            height: function () {
                if ( collapsed ) {
                    return collapseElement.get('scrollHeight') + 'px';
                } else {
                    return conf.collapsedHeight ? conf.collapsedHeight : 0;
                }
            },
            duration: conf.duration ? conf.duration : 0.3,
            easing: conf.easing ? conf.easing : 'ease'
        }, function () {
            if ( collapsed ) {
                collapseElement.removeAttribute('style');
            }
            detectElement.toggleClass(conf.collapsedClass);
            if ( conf.callback ) {
                conf.callback.call(this);
            }
        });
    };

    Y.eZ.AccordionElement = AccordionElement;
});

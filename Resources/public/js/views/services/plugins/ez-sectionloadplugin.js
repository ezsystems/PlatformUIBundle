/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sectionloadplugin', function (Y) {
    "use strict";
    /**
     * Provides the section load plugin
     *
     * @module ez-sectionloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object section load plugin.
     *
     * In order to use it you need to fire the `loadSection` event with two parameters:
     *  - `content` the content containing the section to be loaded
     *  - `callback` the callback
     *
     * @namespace eZ.Plugin
     * @class SectionLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.SectionLoad = Y.Base.create('sectionloadplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:loadSection', this._loadSection);
        },

        /**
         * Loads a Section. Once this is done, it sets the section in
         * the attribute defined in the event parameter of the event target.
         * @protected
         * @method _loadSection
         * @param {Object} e loadSection event facade
         */
        _loadSection: function (e) {
            var loadOptions = {api: this.get('host').get('capi')};
            
            e.content.loadSection(loadOptions, e.callback);
        },
    }, {
        NS: 'sectionLoad',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.SectionLoad, ['locationViewViewService']
    );
});

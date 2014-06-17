YUI.add('ez-mycontentblockitemview', function (Y) {
    'use strict';

    /**
     * Provides the My Content Block Item View class
     *
     * @module ez-mycontentblockitemview
     */
    Y.namespace('eZ');

    /**
     * The My Content Block Item view
     *
     * @namespace eZ
     * @class MyContentBlockItemView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.MyContentBlockItemView = Y.Base.create('myContentBlockItemView', Y.eZ.TemplateBasedView, [], {
        /**
         * Initializer is called upon view's init
         * redefines containerTemplate view property
         *
         * @method initializer
         */
        initializer : function () {
            this.containerTemplate = '<tr class="' + this._generateViewClassName(this.name) + '"/>';

            this.after('modelChange', function () {
                this.fire('get:contenttype', this.get('model').getAttrs().VersionInfo.Content._href);
            });

            this.after('contentTypeChange', function () {
                this._renderItem();
            });
        },
        _renderItem : function () {
            var cType = this.get('contentType'),
                model = this.get('model'),
                modelAttrs = model.getAttrs().VersionInfo,
                datePublished = Y.Date.format(new Date(modelAttrs.creationDate), { format : '%m/%d/%Y %r' });

            this.get('container').setHTML(this.template({
                title           : modelAttrs.names.value[0]['#text'],
                datePublished   : datePublished,
                type            : cType.get('names')[cType.get('mainLanguageCode')],
                url             : '/content/location/'
            }));

            return this;
        }
    }, {
        ATTRS : {
            contentType : {
                valueFn : function () {
                    return new Y.eZ.ContentType();
                }
            }
        }
    });
});
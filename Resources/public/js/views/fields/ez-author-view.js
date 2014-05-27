YUI.add('ez-author-view', function (Y) {
    "use strict";
    /**
     * Provides the Author View class
     *
     * @module ez-author-view
     */
    Y.namespace('eZ');

    /**
     * The author view
     *
     * @namespace eZ
     * @class AuthorView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.AuthorView = Y.Base.create('authorView', Y.eZ.FieldView, [], {
    });

    Y.eZ.FieldView.registerFieldView('ezauthor', Y.eZ.AuthorView);
});

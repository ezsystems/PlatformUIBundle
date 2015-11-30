/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-richtext-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the RichText (ezrichtext) fields
     *
     * @module ez-richtext-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezrichtext',
        L = Y.Lang,
        FOCUS_CLASS = 'is-focused',
        EDITOR_FOCUSED_CLASS = 'is-editor-focused',
        EDITABLE_CLASS = 'ez-richtext-editable',
        AlloyEditor = Y.eZ.AlloyEditor,
        ToolbarConfig = Y.eZ.AlloyEditorToolbarConfig;

    /**
     * Rich Text edit view
     *
     * @namespace eZ
     * @class RichTextEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.RichTextEditView = Y.Base.create('richTextEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-richtext-switch-focus': {
                'tap': '_setFocusMode',
            },
            '.ez-richtext-save-and-return': {
                'tap': '_unsetFocusMode',
            }
        },

        initializer: function () {
            var config = this.get('config');

            this._handleFieldDescriptionVisibility = false;
            if ( config && config.rootInfo && config.rootInfo.ckeditorPluginPath ) {
                this._set('ckeditorPluginPath', config.rootInfo.ckeditorPluginPath);
            }
            this.after('activeChange', function (e) {
                if ( this.get('active') ) {
                    this._initEditor();
                } else {
                    this.get('editor').destroy();
                }
            });
            this.after('focusModeChange', this._uiFocusMode);
        },

        /**
         * `focusModeChange` event handler, it adds or removes the focused
         * class on the view container.
         *
         * @method _uiFocusMode
         * @protected
         */
        _uiFocusMode: function () {
            var container = this.get('container');

            if ( this.get('focusMode') ) {
                container.addClass(FOCUS_CLASS);
            } else {
                container.removeClass(FOCUS_CLASS);
            }
        },

        /**
         * tap event handler on the focus button.
         *
         * @method _setFocusMode
         * @protected
         * @param {EventFacade} e
         */
        _setFocusMode: function (e) {
            e.preventDefault();
            this._set('focusMode', true);
        },

        /**
         * tap event handler on the save and return button.
         *
         * @method _unsetFocusMode
         * @protected
         * @param {EventFacade} e
         */
        _unsetFocusMode: function (e) {
            e.preventDefault();
            this._set('focusMode', false);
        },

        /**
         * Registers the plugin which name is given in the given plugin dir.
         *
         * @method _registerExternalCKEditorPlugin
         * @protected
         */
        _registerExternalCKEditorPlugin: function (pluginName, pluginDir) {
            CKEDITOR.plugins.addExternal(pluginName, this.get('ckeditorPluginPath') + '/' + pluginDir);
        },

        /**
         * Initializes the editor
         *
         * @protected
         * @method _initEditor
         */
        _initEditor: function () {
            var editor, nativeEd, valid, setEditorFocused, unsetEditorFocused;

            this._registerExternalCKEditorPlugin('widget', 'widget/');
            this._registerExternalCKEditorPlugin('lineutils', 'lineutils/');
            editor = AlloyEditor.editable(
                this.get('container').one('.ez-richtext-editor').getDOMNode(), {
                    toolbars: this.get('toolbarsConfig'),
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezaddcontent,widget,ezembed,ezremoveblock,ezfocusblock',
                    eZ: {
                        editableRegion: '.' + EDITABLE_CLASS,
                    },
                }
            );
            nativeEd = editor.get('nativeEditor');
            valid = Y.bind(this.validate, this);
            setEditorFocused = Y.bind(this._uiHandleEditorFocus, this, true);
            unsetEditorFocused = Y.bind(this._uiHandleEditorFocus, this, false);

            Y.Array.each(this.get('forwardEvents'), function (evtName) {
                nativeEd.on(evtName, Y.bind(this._forwardEditorEvent, this));
            }, this);

            nativeEd.on('blur', valid);
            nativeEd.on('focus', valid);
            nativeEd.on('change', valid);
            nativeEd.on('focus', setEditorFocused);
            nativeEd.on('blur', unsetEditorFocused);
            this._set('editor', editor);
        },

        /**
         * Forwards the given event to the YUI stack
         *
         * @method _forwardEditorEvent
         * @param {Object} e the CKEditor event info
         * @protected
         */
        _forwardEditorEvent: function (e) {
            this.fire(e.name, e.data);
        },

        /**
         * Adds or removes the editor focused class on the view container.
         *
         * @method _uiHandleEditorFocus
         * @param {Boolean} focus
         */
        _uiHandleEditorFocus: function (focus) {
            var container = this.get('container');

            if ( focus ) {
                container.addClass(EDITOR_FOCUSED_CLASS);
            } else {
                container.removeClass(EDITOR_FOCUSED_CLASS);
            }
        },

        validate: function () {
            if ( !this.get('fieldDefinition').isRequired ) {
                this.set('errorStatus', false);
                return;
            }
            if ( this._isEmpty() ) {
                this.set('errorStatus', "This field is required");
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Checks whether the field is empty. The field is considered empty if:
         *   * there's no section element
         *   * or the section element has no child
         *   * or the section element has only child without content
         *
         * @method _isEmpty
         * @protected
         * @return {Boolean}
         */
        _isEmpty: function () {
            var section = Y.Node.create(this._getXHTML5EditValue()),
                hasChildNodes = function (element) {
                    return !!element.get('children').size();
                },
                hasChildWithContent = function (element) {
                    return element.get('children').some(function (node) {
                        return L.trim(node.get('text')) !== '';
                    });
                };

            return !section || !hasChildNodes(section) || !hasChildWithContent(section);
        },

        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired,
                "xhtml": this._serializeFieldValue(),
                "editableClass": EDITABLE_CLASS,
            };
        },

        /**
         * Returns a DocumentFragment object or null if the parser failed to
         * load the xhtml5edit version of the rich text field. The document
         * fragment only contains the content of the root <section> element.
         *
         * @method _getHTMLDocumentFragment
         * @return {DocumentFragment}
         */
        _getHTMLDocumentFragment: function () {
            var fragment = Y.config.doc.createDocumentFragment(),
                root = Y.config.doc.createElement('div'),
                doc = (new DOMParser()).parseFromString(this.get('field').fieldValue.xhtml5edit, "text/xml"),
                i;

            if ( !doc || !doc.documentElement || doc.querySelector("parsererror") ) {
                console.warn(
                    "Unable to parse the content of the RichText field #" + this.get('field').id
                );
                return null;
            }

            fragment.appendChild(root);
            for (i = 0; i != doc.documentElement.childNodes.length; i++) {
                root.appendChild(doc.documentElement.childNodes.item(i).cloneNode(true));
            }
            return fragment;
        },

        /**
         * Serializes the Document to a string
         *
         * @method _serializeFieldValue
         * @protected
         * @return {String}
         */
        _serializeFieldValue: function () {
            var doc = this._getHTMLDocumentFragment(), section;

            if ( !doc ) {
                return "";
            }
            section = doc.childNodes.item(0);
            if ( !section.hasChildNodes() ) {
                // making sure to have at least a paragraph element
                // otherwise CKEditor adds a br to make sure the editor can put
                // the caret inside the element.
                doc.childNodes.item(0).appendChild(Y.config.doc.createElement('p'));
            }
            return section.innerHTML;
        },

        /**
         * Returns the field value suitable for the REST API based on the
         * current input.
         *
         * @method _getFieldValue
         * @protected
         * @return String
         */
        _getFieldValue: function () {
            return {xml: this._getXHTML5EditValue()};
        },

        /**
         * Returns the content of the editor in the XHTML5Edit format. The
         * actual editor's content is passed through a set of
         * EditorContentProcessors.
         *
         * @method _getXHTML5EditValue
         * @protected
         * @return {String}
         */
        _getXHTML5EditValue: function () {
            var data = this.get('editor').get('nativeEditor').getData();

            Y.Array.each(this.get('editorContentProcessors'), function (processor) {
                data = processor.process(data);
            });
            return data;
        },
    }, {
        ATTRS: {
            /**
             * Stores the focus mode state. When true, the rich text UI is
             * supposed to be fullscreen with an action bar on the right.
             *
             * @attribute focusMode
             * @type {Boolean}
             * @readOnly
             */
            focusMode: {
                value: false,
                readOnly: true,
            },

            /**
             * The AlloyEditor
             *
             * @attribute editor
             * @type AlloyEditor.Core
             */
            editor: {
                value: null,
                readOnly: true,
            },

            /**
             * AlloyEditor toolbar configuration
             *
             * @attribute toolbarsConfig
             * @type {Object}
             */
            toolbarsConfig: {
                value: {
                    styles: {
                        selections: [
                            ToolbarConfig.Link,
                            ToolbarConfig.Text,
                            ToolbarConfig.Table,
                            ToolbarConfig.Heading,
                            ToolbarConfig.Paragraph,
                            ToolbarConfig.Image,
                            ToolbarConfig.Embed,
                        ],
                        tabIndex: 1
                    },
                    add: {
                        buttons: ['ezheading', 'ezparagraph', 'ezimage', 'ezembed'],
                        tabIndex: 2,
                    },
                }
            },

            /**
             * The path to use to load the CKEditor plugins
             *
             * @attribute ckeditorPluginPath
             * @readOnly
             * @type {String}
             * @default '/bundles/ezplatformuiassets/vendors'
             */
            ckeditorPluginPath: {
                value: '/bundles/ezplatformuiassets/vendors',
                readOnly: true,
            },

            /**
             * Editor events to forward to the YUI stack
             *
             * @attribute forwardEvents
             * @readOnly
             * @type {Array}
             * @default ['contentDiscover', 'loadImageVariation']
             */
            forwardEvents: {
                value: ['contentDiscover', 'loadImageVariation'],
                readOnly: true,
            },

            /**
             * Hold the list of editor content processors. Those components
             * should have a `process` method and are there to clean up the
             * editor content before using it through REST.
             *
             * @attribute editorContentProcessors
             * @type Array of {eZ.EditorContentProcessor}
             */
            editorContentProcessors: {
                valueFn: function () {
                    return [
                        new Y.eZ.EditorContentProcessorRemoveIds(),
                        new Y.eZ.EditorContentProcessorXHTML5Edit(),
                    ];
                },
            },
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RichTextEditView
    );
});

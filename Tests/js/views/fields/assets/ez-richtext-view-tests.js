/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-view-tests', function (Y) {
    var registerTest,
        emptyTest, notEmptyTest, invalidTest, fillEmbedTest, processorTest,
        defaultProcessorsTest,
        Assert = Y.Assert, Mock = Y.Mock,
        EMPTY_XML, INVALD_XML, NOTEMPTY_XML, EMBED_XML;

    EMPTY_XML = '<?xml version="1.0" encoding="UTF-8"?>';
    EMPTY_XML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit"/>';

    INVALD_XML = "I'm invalid";

    NOTEMPTY_XML = '<?xml version="1.0" encoding="UTF-8"?>';
    NOTEMPTY_XML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit">';
    NOTEMPTY_XML += '<p>I\'m not empty</p></section>';

    EMBED_XML = '<?xml version="1.0" encoding="UTF-8"?>';
    EMBED_XML += '<section xmlns="http://ez.no/namespaces/ezpublish5/xhtml5/edit">';
    EMBED_XML += '<div class="empty" data-ezelement="ezembed"></div>';
    EMBED_XML += '<div class="not-empty" data-ezelement="ezembed">not empty</div></section>';

    emptyTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ RichText View empty field tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: 'ezrichtext', identifier: 'some_identifier'};
                this.field = {id: 42, fieldValue: {xhtml5edit: EMPTY_XML}};
                this.isEmpty = true;
                this.view = new Y.eZ.RichTextView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    processors: [],
                });
            },

            "Should set the parseError variable to false": function () {
                var origTpl = this.view.template;

                this.view.template = function (variables) {
                    Assert.isFalse(
                        variables.parseError,
                        "parseError should be false"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    notEmptyTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ RichText View not empty field tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: 'ezrichtext', identifier: 'some_identifier'};
                this.field = {id: 42, fieldValue: {xhtml5edit: NOTEMPTY_XML}};
                this.isEmpty = false;
                this.view = new Y.eZ.RichTextView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    processors: [],
                });
            },

            "Should set the parseError variable to false": function () {
                var origTpl = this.view.template;

                this.view.template = function (variables) {
                    Assert.isFalse(
                        variables.parseError,
                        "parseError should be false"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    invalidTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ RichText View invalid xml field tests",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {fieldType: 'ezrichtext', identifier: 'some_identifier'};
                this.field = {id: 42, fieldValue: {xhtml5edit: INVALD_XML}};
                this.isEmpty = null;
                this.view = new Y.eZ.RichTextView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    processors: [],
                });
            },

            "Should set the parseError variable to true": function () {
                var origTpl = this.view.template;

                this.view.template = function (variables) {
                    Assert.isTrue(
                        variables.parseError,
                        "parseError should be true"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    fillEmbedTest = new Y.Test.Case({
        name: "eZ RichText View fill embed tests",

        setUp: function () {
            this.fieldDefinition = {fieldType: 'ezrichtext', identifier: 'some_identifier'};
            this.field = {id: 42, fieldValue: {xhtml5edit: EMBED_XML}};
            this.view = new Y.eZ.RichTextView({
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                processors: [],
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should fill the empty embed": function () {
            var container = this.view.get('container');

            this.view.render();

            Assert.areEqual(
                " ", container.one('.empty').getContent(),
                "The empty embed should have been filled"
            );
        },

        "Should leave non empty embed": function () {
            var container = this.view.get('container');

            this.view.render();

            Assert.areNotEqual(
                " ", container.one('.not-empty').getContent(),
                "The empty embed should have been filled"
            );
        },
    });

    processorTest = new Y.Test.Case({
        name: "eZ RichText View process on activeChange tests",

        setUp: function () {
            this.fieldDefinition = {fieldType: 'ezrichtext', identifier: 'some_identifier'};
            this.field = {id: 42, fieldValue: {xhtml5edit: EMBED_XML}};
            this.processorMock = new Mock();
            this.view = new Y.eZ.RichTextView({
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                processors: [{
                    priority: 42,
                    processor: this.processorMock,
                }]
            });
            Mock.expect(this.processorMock, {
                method: 'process',
                args: [this.view, Mock.Value.Object],
                run: Y.bind(function (view, event) {
                    Assert.areSame(
                        view, event.target,
                        "The activeChange event facade should be passed"
                    );
                    Assert.areSame(
                        view.constructor.NAME + ':activeChange', event.type,
                        "The activeChange event facade should be passed"
                    );
                }, this),
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should process the view on activeChange": function () {
            this.view.set('active', true);
            Mock.verify(this.processorMock);
        },
    });

    defaultProcessorsTest = new Y.Test.Case({
        name: "eZ RichText View process on activeChange tests",

        setUp: function () {
            Y.eZ.RichTextEmbedContainer = function () {};
            Y.eZ.RichTextResolveEmbed = function () {};
            Y.eZ.RichTextResolveImage = function () {};
            this.fieldDefinition = {fieldType: 'ezrichtext', identifier: 'some_identifier'};
            this.field = {id: 42, fieldValue: {xhtml5edit: EMBED_XML}};
            this.view = new Y.eZ.RichTextView({
                fieldDefinition: this.fieldDefinition,
                field: this.field,
            });
        },

        tearDown: function () {
            delete Y.eZ.RichTextEmbedContainer;
            delete Y.eZ.RichTextResolveEmbed;
            delete Y.eZ.RichTextResolveImage;
            this.view.destroy();
        },

        "Should have 3 processors": function () {
            var processors = this.view.get('processors');

            Assert.areEqual(
                3, processors.length,
                "3 processors should be configured by default"
            );
            Assert.isInstanceOf(
                Y.eZ.RichTextEmbedContainer, processors[0].processor,
                "The processor should be an instance of Y.eZ.RichTextEmbedContainer"
            );
            Assert.isInstanceOf(
                Y.eZ.RichTextResolveImage, processors[1].processor,
                "The processor should be an instance of Y.eZ.RichTextResolveImage"
            );
            Assert.isInstanceOf(
                Y.eZ.RichTextResolveEmbed, processors[2].processor,
                "The processor should be an instance of Y.eZ.RichTextResolveEmbed"
            );
        },
    });

    Y.Test.Runner.setName("eZ RichText View tests");
    Y.Test.Runner.add(emptyTest);
    Y.Test.Runner.add(notEmptyTest);
    Y.Test.Runner.add(invalidTest);
    Y.Test.Runner.add(fillEmbedTest);
    Y.Test.Runner.add(processorTest);
    Y.Test.Runner.add(defaultProcessorsTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "RichText View registration test";
    registerTest.viewType = Y.eZ.RichTextView;
    registerTest.viewKey = "ezrichtext";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-richtext-view', 'ez-genericfieldview-tests']});

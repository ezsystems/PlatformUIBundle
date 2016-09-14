/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreatorview-tests', function (Y) {
    var renderView, destructorTest, activeForwardTest,
        Assert = Y.Assert;

    renderView = new Y.Test.Case({
        name: "eZ Content Creator View render test",

        setUp: function () {
            Y.eZ.ContentEditView = Y.Base.create('contentEditView', Y.View, [Y.View.NodeMap], {
                render: function () {
                    this.set('rendered', true);
                    return this;
                },
            });
            this.config = {
                contentType: {},
                content: {},
                version: {},
                owner: {},
                languageCode: 'fre-FR',
            };
            this.view = new Y.eZ.ContentCreatorView(this.config);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.ContentEditView;
        },

        "Should add the view class on the container": function () {
            Assert.isTrue(
                this.view.get('container').hasClass('ez-view-contentcreatorview'),
                "The view container should have the 'ez-view-contentcreatorview' class"
            );
        },

        "Should render and append the content edit view": function () {
            var editView = Y.eZ.ContentEditView.getByNode(
                    this.view.get('container').one('div')
                );

            Assert.isInstanceOf(
                Y.eZ.ContentEditView,
                editView,
                "A content edit view should have been instantiated"
            );
            Assert.isTrue(
                editView.get('rendered'),
                "The content edit view should have been rendered"
            );

            Y.Object.each(this.config, function (value, key) {
                Assert.areSame(
                    value,
                    editView.get(key),
                    "The '" + key + "' attribute value should come from the content creator view"
                );
            }, this);

            Assert.areSame(
                editView.get('owner'), editView.get('user'),
                "The owner and user attributes should have the same value"
            );
        },
    });

    destructorTest = new Y.Test.Case({
        name: "eZ Content Creator View destructor test",

        setUp: function () {
            Y.eZ.ContentEditView = Y.Base.create('contentEditView', Y.View, [Y.View.NodeMap], {});
            this.view = new Y.eZ.ContentCreatorView();
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.ContentEditView;
        },

        "Should destroy the content edit view": function () {
            var editView = Y.eZ.ContentEditView.getByNode(
                    this.view.get('container').one('div')
                );

            this.view.destroy();
            Assert.isTrue(
                editView.get('destroyed'),
                "The content edit view should have been destroyed"
            );
            editView.destroy();
        },
    });

    activeForwardTest = new Y.Test.Case({
        name: "eZ Content Creator View active forward test",

        setUp: function () {
            Y.eZ.ContentEditView = Y.Base.create('contentEditView', Y.View, [Y.View.NodeMap], {});
            this.view = new Y.eZ.ContentCreatorView();
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.ContentEditView;
        },

        "Should forward the active flag on the Content Edit View": function () {
            var editView = Y.eZ.ContentEditView.getByNode(
                    this.view.get('container').one('div')
                );

            this.view.set('active', true);
            Assert.isTrue(
                editView.get('active'),
                "The content edit view active flag should be true"
            );

            this.view.set('active', false);
            Assert.isFalse(
                editView.get('active'),
                "The content edit view active flag should be false"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Creator View tests");
    Y.Test.Runner.add(renderView);
    Y.Test.Runner.add(destructorTest);
    Y.Test.Runner.add(activeForwardTest);
}, '', {requires: ['test', 'base', 'view', 'view-node-map', 'ez-contentcreatorview']});

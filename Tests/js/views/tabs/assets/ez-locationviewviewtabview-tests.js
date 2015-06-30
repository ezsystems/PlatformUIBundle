/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewviewtabview-tests', function (Y) {
    var attributesTest, renderTest,
        Assert = Y.Assert;

    attributesTest = new Y.Test.Case({
        name: "eZ LocationViewViewTabView attributes test",
        setUp: function () {
            Y.eZ.RawContentView = Y.View;
            this.view = new Y.eZ.LocationViewViewTabView({
                content: {},
                location: {},
                contentType: {},
                config: {},
                languageCode: 'fre-FR',
            });
        },

        tearDown: function () {
            delete Y.eZ.RawContentView;
            this.view.destroy();
            delete this.view;
        },

        _readOnlyString: function (attr) {
            var value = this.view.get(attr);

            Assert.isString(
                this.view.get(attr),
                "The view should have a "+  attr
            );
            this.view.set(attr, value + 'somethingelse');
            Assert.areEqual(
                value, this.view.get(attr),
                "The " + attr + " should be readonly"
            );
        },

        "Should have a title": function () {
            this._readOnlyString('title');
        },

        "Should have a identifier": function () {
            this._readOnlyString('identifier');
        },

        _rawContentViewAttr: function (attr) {
            Assert.areSame(
                this.view.get(attr), this.view.get('rawContentView').get(attr),
                "The " + attr + " should be passed to the raw content view"
            );
        },

        "Should pass the content to the raw content view": function () {
            this._rawContentViewAttr('content');
        },

        "Should pass the location to the raw location view": function () {
            this._rawContentViewAttr('location');
        },

        "Should pass the contentType to the raw contentType view": function () {
            this._rawContentViewAttr('contentType');
        },

        "Should pass the config to the raw config view": function () {
            this._rawContentViewAttr('config');
        },

        "Should pass the languageCode to the raw languageCode view": function () {
            this._rawContentViewAttr('languageCode');
        },

        "Should set the view as a bubble target of the raw content view": function () {
            var evt = 'whatever', bubbled = false;

            this.view.on('*:' + evt, function () {
                bubbled = true;
            });
            this.view.get('rawContentView').fire(evt);
            Assert.isTrue(
                bubbled,
                "The view should be a bubble target of the raw content view"
            );
        }
    });

    renderTest = new Y.Test.Case({
        name: "eZ LocationViewViewTabView render test",
        setUp: function () {
            var that = this;

            this.rendered = false;
            Y.eZ.RawContentView = Y.Base.create('rawContentView', Y.View, [], {
                render: function () {
                    that.rendered = true;
                    return this;
                },
            });
            this.view = new Y.eZ.LocationViewViewTabView();
        },

        tearDown: function () {
            delete Y.eZ.RawContentView;
            this.view.destroy();
            delete this.view;
        },

        "Should render the raw content view": function () {
            this.view.render();

            Assert.isTrue(
                this.rendered,
                "The raw content view should have been rendered"
            );
            Assert.isTrue(
                this.view.get('container').one('.ez-rawcontentview-container').contains(
                    this.view.get('rawContentView').get('container')
                ),
                "The raw content view should be added to the container"
            );
        },
    });

    Y.Test.Runner.setName("eZ Location View View Tab View tests");
    Y.Test.Runner.add(attributesTest);
    Y.Test.Runner.add(renderTest);
}, '', {requires: ['test', 'ez-locationviewviewtabview']});

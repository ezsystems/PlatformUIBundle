/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-actionbarview-tests', function (Y) {
    var Assert = Y.Assert,
        viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Action Bar View test",

        setUp: function () {
            this.location = {};
            this.content = {};
            this.contentType = {};

            Y.eZ.CreateContentActionView = Y.Base.create('createContentActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {}, {
                contentTypeGroups: {},
                contentTypeSelectorView: {},
                contentType: {}
            });
            Y.eZ.TranslateActionView = Y.Base.create('translateActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {}, {
                location: {},
                content: {}
            });

            this.view = new Y.eZ.ActionBarView({
                location: this.location,
                content: this.content,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            delete Y.eZ.CreateContentActionView;
            delete Y.eZ.TranslateActionView;
            this.view.destroy();
        },

        "Should instantiate createContentActionView with contentType": function () {
            var createContentActionFound = false;

            for (var i = 0; i < this.view.get('actionsList').length; i++){
                if (this.view.get('actionsList')[i].get('actionId') === 'createContent'){
                    createContentActionFound = true;
                    Assert.areSame(
                        this.view.get('contentType'),
                        this.view.get('actionsList')[i].get('contentType'),
                        'The contentType should have been set to createContentActionView'
                    );
                }
            }

            Assert.isTrue(
                createContentActionFound,
                'The ActionBarView should contain createContent action'
            );
        },

        "Should instantiate translateActionView": function () {
            var translateActionFound = false;

            for (var i = 0; i < this.view.get('actionsList').length; i++){
                if (this.view.get('actionsList')[i].get('actionId') === 'translate'){
                    translateActionFound = true;
                    Assert.areSame(
                        this.view.get('location'),
                        this.view.get('actionsList')[i].get('location'),
                        'The location should have been set to translateActionView'
                    );
                    Assert.areSame(
                        this.view.get('content'),
                        this.view.get('actionsList')[i].get('content'),
                        'The content should have been set to translateActionView'
                    );
                }
            }

            Assert.isTrue(
                translateActionFound,
                'The ActionBarView should contain createContent action'
            );
        },
    });

    Y.Test.Runner.setName("eZ Action Bar View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-actionbarview']});

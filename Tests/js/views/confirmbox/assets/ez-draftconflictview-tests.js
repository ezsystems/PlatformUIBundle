/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-draftconflictview-tests', function (Y) {
    var renderTest, confirmEditTest, rowOptionTest,
        Assert = Y.Assert,
        Mock = Y.Mock,
        CLASS_ROW_SELECTED = 'is-row-selected',
        SELECTOR_ROW = '.ez-draft-conflict-list-row',
        SELECTOR_OUTSIDE = '.outside';

    renderTest = new Y.Test.Case({
        name: "eZ Draft Conflict View render test",

        setUp: function () {
            this.contentMock = new Mock();
            this.contentJSON = {};
            Mock.expect(this.contentMock, {
                method: "toJSON",
                args: [],
                returns: this.contentJSON,
            });

            this.contentTypeJSON = {};
            this.contentTypeMock = new Mock();
            Mock.expect(this.contentTypeMock, {
                method: "toJSON",
                args: [],
                returns: this.contentTypeJSON,
            });

            this.languageCode = "fre-FR";

            this.draftJSON = {};
            this.draftMock = new Mock();
            Mock.expect(this.draftMock, {
                method: "toJSON",
                args: [],
                returns: this.draftJSON,
            });

            this.view = new Y.eZ.DraftConflictView({
                container: '.container',
                content: this.contentMock,
                contentType: this.contentTypeMock,
                languageCode: this.languageCode,
                drafts: [this.draftMock],
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should render the view": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (variables) {
                templateCalled = true;

                Assert.areSame(
                    this.contentJSON, variables.content,
                    "The content should be available in the template"
                );
                Assert.areSame(
                    this.contentTypeJSON, variables.contentType,
                    "The content type should be available in the template"
                );
                Assert.areSame(
                    this.languageCode, variables.languageCode,
                    "The language should be available in the template"
                );
                Assert.areSame(
                    this.draftJSON, variables.drafts[0],
                    "The language should be available in the template"
                );

                return origTpl.apply(this, arguments);
            }, this);
            this.view.render();
            Assert.isTrue(
                templateCalled,
                "The template should have used to render the view"
            );
        },
    });

    confirmEditTest = new Y.Test.Case({
        name: "eZ Draft Conflict confirm edit test",

        setUp: function () {
            renderTest.setUp.call(this);
        },

        tearDown: function () {
            renderTest.tearDown.call(this);
        },

        "Should fire `confirm` when a confirm link is clicked": function () {
            var eventFired = false,
                confirmLink;

            this.view.on('*:confirm', Y.bind(function (e) {
                eventFired = true;

                Assert.areSame(
                    "route66",
                    e.route,
                    "Route provided to the event should match the href of the link"
                );
            }, this));

            this.view.render();

            confirmLink = this.view.get('container').one('.ez-draft-conflict-link');

            confirmLink.simulateGesture('tap', Y.bind(function () {
                this.resume(function (e) {
                    Assert.isTrue(
                        eventFired,
                        "The `confirm` event should have been fired"
                    );
                });
            }, this));
            this.wait();
        },
    });

    rowOptionTest = new Y.Test.Case({
        name: "eZ Draft Conflict row option test",

        setUp: function () {
            renderTest.setUp.call(this);

            this.view.set('drafts',[
                this._createDraftMock(42),
                this._createDraftMock(43),
            ]);
        },

        tearDown: function () {
            renderTest.tearDown.call(this);
        },

        _createDraftMock: function (versionNo) {
            var draftMock = new Mock();

            Mock.expect(draftMock, {
                method: "toJSON",
                args: [],
                returns: {versionNo: versionNo},
            });

            return draftMock;
        },

        'Should display row options after clicking on a row': function () {
            var view = this.view,
                row;

            view.render();

            row = view.get('container').one(SELECTOR_ROW);

            row.one('td').simulateGesture('tap', this.next(function () {
                Assert.isTrue(
                    row.hasClass(CLASS_ROW_SELECTED),
                    'The row should be selected'
                );
            }, this));

            this.wait();
        },

        'Should hide row options after clicking outside of a row': function () {
            var view = this.view,
                row;

            view.render();

            row = view.get('container').one(SELECTOR_ROW);

            row.one('td').simulateGesture('tap', this.next(function () {
                Y.one(SELECTOR_OUTSIDE).simulateGesture('tap', this.next(function () {
                    Assert.isFalse(
                        row.hasClass(CLASS_ROW_SELECTED),
                        'The row should not be selected'
                    );
                }, this));
                this.wait();
            }, this));

            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Draft Conflict View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(confirmEditTest);
    Y.Test.Runner.add(rowOptionTest);

}, '', {requires: ['test', 'node-event-simulate', 'ez-draftconflictview']});

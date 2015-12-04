/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverysearchview-tests', function (Y) {
    var resetTest, defaultSubViewTest, renderTest, unselectTest,
        multipleUpdateTest, onUnselectContentTest, paginationTest,
        selectContentTest, searchTest,
        Assert = Y.Assert, Mock = Y.Mock;

    resetTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Search reset tests',

        setUp: function () {
            this.selectedView = new Mock();
            Mock.expect(this.selectedView, {
                method: 'reset',
            });
            Mock.expect(this.selectedView, {
                method: 'setAttrs',
                args: [Mock.Value.Object]
            });
            Mock.expect(this.selectedView, {
                method: 'set',
                args: [Mock.Value.String, Mock.Value.Any]
            });
            Mock.expect(this.selectedView, {
                method: 'render',
                returns: this.selectedView
            });
            Mock.expect(this.selectedView, {
                method: 'get',
                args: [Mock.Value.String]
            });
            this.view = new Y.eZ.UniversalDiscoverySearchView({
                selectedView: this.selectedView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should keep and reset the selectedView": function () {
            this.view.reset();
            Assert.areSame(
                this.selectedView, this.view.get('selectedView'),
                "The selectedView should be kept"
            );
            Mock.verify(this.selectedView);
        },

        "Should keep the title and identifier": function () {
            var title = this.view.get('title'),
                identifier = this.view.get('identifier');

            this.view.reset();
            Assert.areEqual(
                title, this.view.get('title'),
                "The title should be kept intact"
            );
            Assert.areEqual(
                identifier, this.view.get('identifier'),
                "The identifier should be kept intact"
            );
            Mock.verify(this.selectedView);
        },
    });

    defaultSubViewTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Search default sub views tests',
                       
        setUp: function () {
            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {});
            this.view = new Y.eZ.UniversalDiscoverySearchView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoverySelectedView;
        },

        "selectedView should be an instance of eZ.UniversalDiscoverySelectedView": function () {
            Assert.isInstanceOf(
                Y.eZ.UniversalDiscoverySelectedView, this.view.get('selectedView'),
                "The selectedView attribute value should an instance of eZ.UniversalDiscoverySelectedView"
            );
        },

        "Should be a bubble target of the selectedView": function () {
            var bubble = false;

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            this.view.get('selectedView').fire('whatever');
            Assert.isTrue(bubble, "The event should bubble to the search view");
        },

        "Should set the selectedView's addConfirmButton": function () {
            Assert.isFalse(
                this.view.get('selectedView').get('addConfirmButton'),
                "The selectedView's addConfirmButton flag should be false"
            );
        },
    });

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Search render tests',
                       
        setUp: function () {
            var that = this;

            this.selectedViewRendered = false;
            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {
                render: function () {
                    that.selectedViewRendered = true;
                    return this;
                },
            });
            this.view = new Y.eZ.UniversalDiscoverySearchView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoverySelectedView;
        },

        "Should use the template": function () {
            var origTpl = this.view.template,
                templateCalled = false;

            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();

            Assert.isTrue(
                templateCalled, "The template should have been used to render the view"
            );
        },

        "Should render the selectedView": function () {
            var container = this.view.get('container'),
                selectedViewContainer = this.view.get('selectedView').get('container');

            this.view.render();

            Assert.isTrue(this.selectedViewRendered, "The selectedView should have been rendered");
            Assert.isTrue(
                container.contains(selectedViewContainer),
                "The rendered selectedView should be added to the search view"
            );
            Assert.isTrue(
                selectedViewContainer.get('parentNode').hasClass('ez-ud-search-selected'),
                "The selectedView should be added in the ez-ud-search-selected element"
            );
        },
    });

    unselectTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Search visibility change unselect tests',

        setUp: function () {
            this.selectedView = new Mock();
            this.treeView = new Mock();
            this.view = new Y.eZ.UniversalDiscoverySearchView({
                selectedView: this.selectedView,
                visible: true,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should fire the selectContent with a null selection": function () {
            var selectContent = false;

            Mock.expect(this.selectedView, {
                method: 'set',
                args: ['contentStruct', null],
            });
            this.view.on('selectContent', function (e) {
                selectContent = true;
                Assert.isNull(
                    e.selection,
                    "The selectContent event facade should contain a null selection"
                );
            });

            this.view.set('visible', false);
            Assert.isTrue(
                selectContent,
                "The selectContent event should have been fired"
            );
            Mock.verify(this.selectedView);
        },
    });

    multipleUpdateTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Search multiple update test',

        setUp: function () {
            this.selectedView = new Mock();
            this.view = new Y.eZ.UniversalDiscoverySearchView({
                selectedView: this.selectedView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should forward the multiple value to the selectedView": function () {
            var multipleValue = true;

            Mock.expect(this.selectedView, {
                method: 'setAttrs',
                args: [Mock.Value.Object],
                run: function (atrrs) {
                    Assert.areSame(
                        atrrs.addConfirmButton,
                        multipleValue,
                        "addConfirmButton attribute should be the same as `multiple` flag"
                    );
                }
            });
            this.view.set('multiple', multipleValue);
            Mock.verify(this.selectedView);
        },

        "Should forward the isSelectable function to the selectedView": function () {
            var isSelectable = function (contentStruct) {return true;};

            Mock.expect(this.selectedView, {
                method: 'setAttrs',
                args: [Mock.Value.Object],
                run: function (atrrs) {
                    Assert.areSame(
                        atrrs.isSelectable,
                        isSelectable,
                        "isSelectable function should be passed to the view"
                    );
                }
            });
            this.view.set('isSelectable', isSelectable);
            Mock.verify(this.selectedView);
        },
    });

    onUnselectContentTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Search onUnselectContentTest test',

        setUp: function () {
            this.selectedView = new Mock();
            this.view = new Y.eZ.UniversalDiscoverySearchView({
                selectedView: this.selectedView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should ignore an empty selectedView": function () {
            Mock.expect(this.selectedView, {
                method: 'get',
                args: ['contentStruct'],
                returns: null
            });
            this.view.onUnselectContent(42);
            Mock.verify(this.selectedView);
        },

        "Should ignore when the selectedView displays a different content": function () {
            var contentInfo = new Mock(),
                contentId = 42;

            Mock.expect(contentInfo, {
                method: 'get',
                args: ['id'],
                returns: (contentId + 1),
            });
            Mock.expect(this.selectedView, {
                method: 'get',
                args: ['contentStruct'],
                returns: {contentInfo: contentInfo},
            });
            this.view.onUnselectContent(contentId);
            Mock.verify(contentInfo);
            Mock.verify(this.selectedView);
        },

        "Should enable the button and reset the animated element": function () {
            var contentInfo = new Mock(),
                contentId = 42;

            Mock.expect(contentInfo, {
                method: 'get',
                args: ['id'],
                returns: contentId,
            });
            Mock.expect(this.selectedView, {
                method: 'get',
                args: ['contentStruct'],
                returns: {contentInfo: contentInfo},
            });
            Mock.expect(this.selectedView, {
                method: 'set',
                args: ['confirmButtonEnabled', true],
            });
            this.view.onUnselectContent(contentId);
            Mock.verify(contentInfo);
            Mock.verify(this.selectedView);
        },
    });

    paginationTest = new Y.Test.Case({
        name: "eZ Universal Discovery Search View pagination test",

        setUp: function () {
            this.searchResultCount = 49;
            this.lastOffset = 40;
            this.limit = 10;
            this.searchResultList = this._getFakeLocationStructs(this.limit);

            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {});

            this.view = new Y.eZ.UniversalDiscoverySearchView({
                searchText: 'Blue October',
                container: '.container',
                searchResultCount: this.searchResultCount,
                searchResultList: this.searchResultList,
                limit: this.limit,
            });

            this.view.get('container').once('tap', function (e) {
                Assert.isTrue(
                    !!e.prevented,
                    "The tap event should have been prevented"
                );
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getMock: function () {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'toJSON',
                args: [],
                returns: {}
            });

            return mock;
        },

        _getFakeLocationStructs: function (numberOfResults) {
            var results = [];

            for (var i=0; i<numberOfResults; i++) {
                results.push({location: this._getMock(), contentType: this._getMock()});
            }

            return results;
        },

        "Should navigate to the last page": function () {
            var c = this.view.get('container');

            this.view.render();

            c.one('[rel=last]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    this.lastOffset, this.view.get('offset'),
                    "The offset should be 40"
                );
            }, this));

            this.wait();
        },

        "Should navigate to the previous page": function () {
            var c = this.view.get('container'),
                initialOffset = 30;

            this.view.set('offset', initialOffset);
            this.view.render();

            c.one('[rel=prev]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    initialOffset - this.view.get('limit'), this.view.get('offset'),
                    "The offset should be " + (initialOffset - this.view.get('limit'))
                );
            }, this));

            this.wait();
        },

        "Should navigate to the next page": function () {
            var c = this.view.get('container'),
                initialOffset = 20;

            this.view.set('offset', initialOffset);
            this.view.render();

            c.one('[rel=next]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    initialOffset + this.view.get('limit'), this.view.get('offset'),
                    "The offset should be " + (initialOffset + this.view.get('limit'))
                );
            }, this));

            this.wait();
        },

        "Should navigate to the first page": function () {
            var c = this.view.get('container'),
                initialOffset = 20;

            this.view.set('offset', initialOffset);
            this.view.render();

            c.one('[rel=first]').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    0, this.view.get('offset'),
                    "The offset should be 0"
                );
            }, this));

            this.wait();
        },

        "Should ignore disabled link": function () {
            var c = this.view.get('container'),
                initialOffset = 20;

            this.view.set('offset', initialOffset);
            this.view.render();

            c.one('[rel=first]').addClass('is-disabled').simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    initialOffset, this.view.get('offset'),
                    "The offset should remain " + initialOffset
                );
            }, this));

            this.wait();
        },
    });

    selectContentTest = new Y.Test.Case({
        name: "eZ Universal Discovery Search View select content test",

        setUp: function () {
            this.contentInfo1JSON = {
                id: 'content-info-1'
            };
            this.contentInfo1Mock = this._getModelMock(this.contentInfo1JSON);
            this.location1JSON = {
                id: '/locations/1',
                contentInfo: this.contentInfo1Mock
            };
            this.location1Mock = this._getModelMock(this.location1JSON);
            this.contentType1JSON = {};
            this.contentType1Mock = this._getModelMock(this.contentType1JSON);
            this.locationStruct1 = {location: this.location1Mock, contentType:this.contentType1Mock };

            this.contentInfo2JSON = {
                id: 'content-info-2'
            };
            this.contentInfo2Mock = this._getModelMock(this.contentInfo2JSON);
            this.location2JSON = {
                id: '/locations/2',
                contentInfo: this.contentInfo2Mock
            };
            this.location2Mock = this._getModelMock(this.location2JSON);
            this.contentType2JSON = {};
            this.contentType2Mock = this._getModelMock(this.contentType2JSON);
            this.locationStruct2 = {location: this.location2Mock, contentType:this.contentType2Mock };
            this.searchResultList = [this.locationStruct1, this.locationStruct2];

            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {});

            this.view = new Y.eZ.UniversalDiscoverySearchView({
                container: '.container',
                searchResultCount: this.searchResultList.length,
                searchResultList: this.searchResultList,
            });
            this.view.render();
        },

        tearDown: function () {
            this.location1Mock.destroy();
            this.location2Mock.destroy();
            this.contentType1Mock.destroy();
            this.contentType2Mock.destroy();
            this.contentInfo1Mock.destroy();
            this.contentInfo2Mock.destroy();
            this.view.destroy();
            delete this.view;
        },

        _getModelMock: function (json) {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'toJSON',
                args: [],
                returns: json
            });
            Mock.expect(mock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (json[attr]===undefined) {
                        Y.fail("Trying to get '" + attr + "' attribute that is not provided with JSON to model mock");
                    } else {
                        return json[attr];
                    }
                }
            });

            return mock;
        },

        "Should fire `selectContent` event": function () {
            var c = this.view.get('container'),
                selectContentFired = false,
                button = c.one('.ez-ud-searchresult-preview-button[data-location-id="' + this.location1JSON.id + '"]');

            this.view.on('selectContent', function (e) {
                selectContentFired = true;
            });

            button.simulateGesture('tap', this.next(function () {
                Assert.isTrue(selectContentFired, 'The `selectContent` event should be fired');
            }, this));

            this.wait();
        },

        _contentStructTest: function (loadContent, expectedContent) {
            var c = this.view.get('container'),
                button = c.one('.ez-ud-searchresult-preview-button[data-location-id="' + this.location1JSON.id + '"]');

            button.simulateGesture('tap', this.next(function () {
                var cStruct = this.view.get('selectedView').get('contentStruct');

                Assert.isObject(cStruct, 'The content struct should be passed to the selected view');
                Assert.areSame(
                    cStruct.location,
                    this.location1Mock,
                    'The content struct should contain the selected location'
                );
                Assert.areSame(
                    cStruct.contentType,
                    this.contentType1Mock,
                    'The content struct should contain contentType'
                );
                Assert.areSame(
                    cStruct.contentInfo,
                    this.contentInfo1Mock,
                    'The content struct should contain contentInfo'
                );

                if (loadContent) {
                    Assert.areSame(
                        expectedContent,
                        cStruct.content,
                        'The content struct should contain content'
                    );
                }
            }, this));

            this.wait();
        },

        "Should pass selected contentCtruct to the selectedView": function () {
            this._contentStructTest(false);
        },

        "Should pass selected contentCtruct to the selectedView with content when loadContent set to TRUE": function () {
            var contentMock = this._getModelMock({}),
                searchResultList = this.view.get('searchResultList');

            this.view.set('loadContent', true);
            searchResultList[0].content = contentMock;
            this.view.set('searchResultList', searchResultList);

            this._contentStructTest(true, contentMock);
        },

        "Should highlight selected content": function () {
            var c = this.view.get('container'),
                button = c.one('.ez-ud-searchresult-preview-button[data-location-id="' + this.location1JSON.id + '"]');

            button.simulateGesture('tap', this.next(function () {
                Assert.isTrue(
                    c.one('.ez-searchresult-row[data-location-id="' + this.location1JSON.id + '"]').hasClass('is-selected'),
                    'The content that has been selected should be highlighted'
                );
            }, this));

            this.wait();
        },

        "Should highlight selected content and unhiglight content that is being unselected": function () {
            var c = this.view.get('container'),
                button1 = c.one('.ez-ud-searchresult-preview-button[data-location-id="' + this.location1JSON.id + '"]'),
                button2 = c.one('.ez-ud-searchresult-preview-button[data-location-id="' + this.location2JSON.id + '"]');

            button1.simulateGesture('tap', this.next(function () {
                Assert.isTrue(
                    c.one('.ez-searchresult-row[data-location-id="' + this.location1JSON.id + '"]').hasClass('is-selected'),
                    'The content that has been selected should be highlighted'
                );
                button2.simulateGesture('tap', this.next(function () {
                    Assert.isFalse(
                        c.one('.ez-searchresult-row[data-location-id="' + this.location1JSON.id + '"]').hasClass('is-selected'),
                        'The content that has been selected should be highlighted'
                    );
                    Assert.isTrue(
                        c.one('.ez-searchresult-row[data-location-id="' + this.location2JSON.id + '"]').hasClass('is-selected'),
                        'The content that has been selected should be highlighted'
                    );
                }, this));

                this.wait();
            }, this));

            this.wait();
        },
    });

    searchTest = new Y.Test.Case({
        name: "eZ Universal Discovery Search View search test",

        setUp: function () {
            this.searchText = 'test';

            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {});

            this.view = new Y.eZ.UniversalDiscoverySearchView({
                container: '.container',
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire `locationSearch` event and reset the page": function () {
            var c = this.view.get('container'),
                searchTextInput = c.one('.ez-ud-search-text'),
                searchButton = c.one('.ez-ud-search-button'),
                locationSearchFired = false,
                that = this;

            searchTextInput.set('value', this.searchText);

            this.view.on('locationSearch', function (e) {
                locationSearchFired = true;

                Assert.isTrue(e.loadContentType, "The loadContentType param should be set to TRUE");
                Assert.areSame(
                    e.search.criteria.FullTextCriterion,
                    that.searchText,
                    "The search text should be set as FullTextCriterion"
                );
                Assert.areEqual(
                    e.search.offset,
                    that.view.get('offset'),
                    "The offset should be passed to the search params"
                );
                Assert.areEqual(
                    e.search.limit,
                    that.view.get('limit'),
                    "The offset should be passed to the search params"
                );
            });

            searchButton.simulateGesture('tap', this.next(function () {
                Assert.isTrue(locationSearchFired, "The `locationSearch` event should be fired");
                Assert.areEqual(this.view.get('offset'), 0, "The offset should be changed to 0");
            }, this));

            this.wait();
        },

        "Should reset the view if provided search text is empty": function () {
            this.view.set('searchText', 'Grunwald 1410');
            this.view.set('searchText', '');

            Assert.areEqual(this.view.get('offset'), 0, "The offset attribute should be reset");
            Assert.areEqual(
                this.view.get('searchResultCount'),
                0,
                "The searchResultCount attribute should be reset"
            );
            Assert.areEqual(
                this.view.get('searchResultList').length,
                0,
                "The searchResultList attribute should be reset"
            );
        }
    });

    Y.Test.Runner.setName("eZ Universal Discovery Search View tests");
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(defaultSubViewTest);
    Y.Test.Runner.add(unselectTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(multipleUpdateTest);
    Y.Test.Runner.add(onUnselectContentTest);
    Y.Test.Runner.add(paginationTest);
    Y.Test.Runner.add(selectContentTest);
    Y.Test.Runner.add(searchTest);
}, '', {requires: ['test', 'view', 'node-event-simulate', 'ez-universaldiscoverysearchview']});

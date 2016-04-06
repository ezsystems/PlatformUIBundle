/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemgridview-tests', function (Y) {
    var renderTest, subitemSetterTest, loadSubitemsTest, gridItemTest,
        loadingStateTest, paginationUpdateTest, loadMoreTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Subitem Grid View render test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should render the view with the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Should pass the paging information to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    3, Y.Object.size(vars),
                    "The template should receive 3 variables"
                );
                Assert.areEqual(
                    this.location.get('childCount'),
                    vars.subitemCount,
                    "The template should receive the subitem counts"
                );
                Assert.areEqual(
                    this.view.get('limit'),
                    vars.limit,
                    "The template should receive the configured limit"
                );
                Assert.areEqual(
                    this.location.get('childCount'),
                    vars.displayCount,
                    "The template should receive the number of displayed elements"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should handle the case where there's more subitems than the limit": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = Y.bind(function (vars) {
                Assert.areEqual(
                    this.view.get('limit'),
                    vars.displayCount,
                    "The template should receive the number of displayed elements"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.location.set('childCount', this.view.get('limit') + 1);
            this.view.render();
        },

        "Should not render the view when the subitems are loaded": function () {
            this.view.render();
            this.view.set('subitems', []);
            this.view.get('container').append('<p class="test-stamp">Stamp</p>');
            this.view.render();

            Assert.isObject(
                this.view.get('container').one('.test-stamp'),
                "The view should not have been rerendered"
            );
        },
    });

    subitemSetterTest = new Y.Test.Case({
        name: "eZ Subitem Grid View subitems setter test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set the value": function () {
            var initialValue = [];

            this.view.set('subitems', initialValue);

            Assert.areSame(
                initialValue, this.view.get('subitems'),
                "The inital value should be set untouched"
            );
        },

        "Should concatenate the arrays": function () {
            var initialValue = [],
                subitem = {location: new Y.Model(), content: new Y.Model(), contentType: new Y.Model()},
                secondValue = [subitem];

            this.view.set('subitems', initialValue);
            this.view.set('subitems', secondValue);

            Assert.isArray(
                this.view.get('subitems'),
                "A new array should have been created"
            );
            Assert.areNotSame(
                initialValue, this.view.get('subitems'),
                "A new array should have been created"
            );
            Assert.areNotSame(
                secondValue, this.view.get('subitems'),
                "A new array should have been created"
            );
            Assert.isTrue(
                this.view.get('subitems').indexOf(subitem) !== -1,
                "The subitems attribute should contain the contain of the second value"
            );
        },
    });

    loadSubitemsTest = new Y.Test.Case({
        name: "eZ Subitem Grid View load subitems test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.location.set('childCount', this.view.get('limit') + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        _assertLocationSearchParams: function (evt) {
            Assert.areEqual(
                "subitems",
                evt.resultAttribute,
                "The result of the loading should be placed in the subitems attribute"
            );
            Assert.isTrue(
                evt.loadContentType,
                "The content type should be loaded"
            );
            Assert.isTrue(
                evt.loadContent,
                "The content should be loaded"
            );
            Assert.areEqual(
                evt.search.criteria.ParentLocationIdCriterion,
                this.location.get('locationId'),
                "The subitems of the location should be loaded"
            );
            Assert.areEqual(
                evt.search.offset,
                this.view.get('offset'),
                "The search event should contain the offset"
            );
            Assert.areEqual(
                evt.search.limit,
                this.view.get('limit'),
                "The search event should contain the limit"
            );
        },

        "Should fire the search event when becoming active": function () {
            var locationSearch = false;

            this.view.on('locationSearch', Y.bind(function (e) {
                this._assertLocationSearchParams(e);
                locationSearch = true;
            }, this));

            this.view.set('active', true);
            Assert.isTrue(
                locationSearch,
                "The locationSearch event should have been fired"
            );
        },

        "Should fire the search event when changing offset": function () {
            var locationSearch = false;

            this.view.on('locationSearch', Y.bind(function (e) {
                this._assertLocationSearchParams(e);
                locationSearch = true;
            }, this));

            this.view.set('offset', this.view.get('limit'));
            Assert.isTrue(
                locationSearch,
                "The locationSearch event should have been fired"
            );
        },

        "Should not fire the search event when becoming active if subitems are loaded": function () {
            var locationSearch = false;

            this.view.set('subitems', []);
            this.view.on('locationSearch', Y.bind(function (e) {
                locationSearch = true;
            }, this));

            this.view.set('active', true);
            Assert.isFalse(
                locationSearch,
                "The locationSearch event should not have been fired"
            );
        },
    });

    gridItemTest = new Y.Test.Case({
        name: "eZ Subitem Grid View grid items test",

        setUp: function () {
            this.location = new Y.Model({
                childCount: 5,                          
            });
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.view.render();
            this.view.set('active', true);
        },

        tearDown: function () {
            this.view.destroy();
        },

        _getSubItemStruct: function (baseId) {
            return {
                content: new Y.Model({id: 'content-' + baseId}),
                location: new Y.Model({id: 'location-' + baseId}),
                contentType: new Y.Model({id: 'contentType-' + baseId}),
            };
        },

        "Should append a grid item per subitem": function () {
            var subitems = [
                    this._getSubItemStruct(1),
                    this._getSubItemStruct(2),
                ],
                container = this.view.get('container'),
                gridItems,
                i = 1;

            this.view.set('subitems', subitems);
            gridItems = container.all('.ez-subitemgrid-item');

            Assert.areEqual(
                subitems.length,
                gridItems.size(),
                "There should be one grid item per subitem"
            );
            gridItems.each(function (gridContainer) {
                Assert.areEqual(
                    'content-' + i,
                    gridContainer.one('.content').getContent(),
                    "The grid item view template should receive the content"
                );
                Assert.areEqual(
                    'location-' + i,
                    gridContainer.one('.location').getContent(),
                    "The grid item view template should receive the location"
                );
                Assert.areEqual(
                    'contentType-' + i,
                    gridContainer.one('.contentType').getContent(),
                    "The grid item view template should receive the contentType"
                );
                
                i++;
            }, this);
        },
    });

    loadingStateTest = new Y.Test.Case({
        name: "eZ Subitem Grid View loading state test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.location.set('childCount', this.view.get('limit') + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should be in loading state": function () {
            this.view.set('offset', this.view.get('limit'));

            Assert.isTrue(
                this.view.get('container').hasClass('is-page-loading'),
                "The view should be in loading mode"
            );
        },

        "Should be in 'normal' state": function () {
            this.view.set('offset', this.view.get('limit'));
            this.view.set('subitems', []);

            Assert.isFalse(
                this.view.get('container').hasClass('is-page-loading'),
                "The view should be in loading mode"
            );
        },
    });

    paginationUpdateTest = new Y.Test.Case({
        name: "eZ Subitem Grid View pagination update test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should disable the load more button when offset is changing": function () {
            var container = this.view.get('container');

            container.one('.ez-subitemgrid-more').set('disabled', false);
            this.view.set('offset', this.view.get('limit'));

            Assert.isTrue(
                container.one('.ez-subitemgrid-more').get('disabled'),
                "The load more button should be disabled while loading content"
            );
        },

        "Should enable the load more button if there's more content to load": function () {
            var container = this.view.get('container'),
                offset = this.location.get('childCount') - 1;

            container.one('.ez-subitemgrid-more').set('disabled', false);
            this.view.set('offset', offset);
            this.view.set('subitems', this._getSubItemStructs(offset));

            Assert.isFalse(
                container.one('.ez-subitemgrid-more').get('disabled'),
                "The load more button should be enabled"
            );
        },

        "Should keep the load more button disabled": function () {
            var container = this.view.get('container'),
                offset = this.location.get('childCount') + 1;

            container.one('.ez-subitemgrid-more').set('disabled', false);
            this.view.set('offset', offset);
            this.view.set('subitems', this._getSubItemStructs(offset));

            Assert.isTrue(
                container.one('.ez-subitemgrid-more').get('disabled'),
                "The load more button should be disabled"
            );
        },

        _getSubItemStructs: function (count) {
            return (new Array(count)).map(function () {
                return {
                    content: new Y.Model(),
                    location: new Y.Model(),
                    contentType: new Y.Model(),
                };
            });
        },

        "Should update the displayed content count": function () {
            var container = this.view.get('container');

            this.view.set('offset', this.view.get('limit'));
            this.view.set('subitems', this._getSubItemStructs(this.view.get('limit')));
            Assert.areEqual(
                this.view.get('subitems').length,
                container.one('.ez-subitemgrid-display-count').getContent(),
                "The displayed content count should have been updated"
            );
        },

        _updateMoreCountTest: function (offset, expectedMoreCount) {
            var container = this.view.get('container');

            this.view.set('offset', offset);
            this.view.set('subitems', this._getSubItemStructs(offset));

            Assert.areEqual(
                expectedMoreCount,
                container.one('.ez-subitemgrid-more-count').getContent(),
                "The more content count should have been updated"
            );
        },

        "Should update the more count": function () {
            this._updateMoreCountTest(this.view.get('limit'), this.view.get('limit'));
        },

        "Should update the more count with the remaining content to load": function () {
            var offset = this.view.get('limit') * 2;

            this._updateMoreCountTest(
                offset,
                this.location.get('childCount') - offset
            );
        },

        "Should update the more count with the limit when there's no more content to load": function () {
            this._updateMoreCountTest(
                this.location.get('childCount'),
                this.view.get('limit')
            );
        },
    });

    loadMoreTest = new Y.Test.Case({
        name: "eZ Subitem Grid View pagination update test",

        setUp: function () {
            this.location = new Y.Model({locationId: 42});
            this.view = new Y.eZ.SubitemGridView({
                location: this.location,
                container: '.container',
            });
            this.location.set('childCount', this.view.get('limit') * 2 + 1);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should ignore tap when disabled": function () {
            var offset = this.view.get('offset'),
                button = this.view.get('container').one('.ez-subitemgrid-more');

            button.set('disabled', true);
            button.simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    offset, this.view.get('offset'),
                    "offset should remain unchanged"
                );
            }, this));
            this.wait();
        },

        "Should update the offset": function () {
            var offset = this.view.get('offset'),
                button = this.view.get('container').one('.ez-subitemgrid-more');

            button.set('disabled', false);
            button.simulateGesture('tap', this.next(function () {
                Assert.areEqual(
                    offset + this.view.get('limit'), this.view.get('offset'),
                    "offset should remain unchanged"
                );
            }, this));
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Subitem Grid View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(subitemSetterTest);
    Y.Test.Runner.add(loadSubitemsTest);
    Y.Test.Runner.add(gridItemTest);
    Y.Test.Runner.add(loadingStateTest);
    Y.Test.Runner.add(paginationUpdateTest);
    Y.Test.Runner.add(loadMoreTest);
}, '', {requires: ['test', 'model', 'node-event-simulate', 'ez-subitemgridview']});

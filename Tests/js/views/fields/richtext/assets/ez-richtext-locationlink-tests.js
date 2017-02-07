/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-locationlink-tests', function (Y) {
    var processTest,
        Assert = Y.Assert;

    processTest = new Y.Test.Case({
        name: "eZ RichText location link process test",

        setUp: function () {
            this.containerContent = Y.one('.container').getContent();
            this.processor = new Y.eZ.RichTextLocationLink();
            this.view = new Y.View({
                container: Y.one('.container'),
                field: {
                    id: "",
                }
            });
        },

        tearDown: function () {
            delete this.processor;
            this.view.get('container').setContent(this.containerContent);
            this.view.destroy();
            delete this.view;
        },

        "Should search for the linked Location": function () {
            var searchFired = false;

            this.view.on('locationSearch', function (e) {
                Assert.areEqual(
                    "42,4242",
                    e.search.filter.LocationIdCriterion,
                    ""
                );
                Assert.areEqual(
                    0, e.search.offset,
                    "The offset should be 0"
                );
                searchFired = true;
            });
            this.processor.process(this.view);

            Assert.isTrue(
                searchFired,
                "The locationSearch should have been fired"
            );
        },

        _getLocation: function (locationId, id, mainLanguageCode) {
            var location = new Y.Base(),
                contentInfo = new Y.Base();

            contentInfo.set('mainLanguageCode', mainLanguageCode);

            location.setAttrs({
                locationId: locationId,
                id: id,
                contentInfo: contentInfo,
            });

            return location;
        },

        "Should update the internal link": function () {
            var location42Info = {
                    locationId: '42',
                    id: '/1/42',
                    mainLanguageCode: 'fre-FR',
                },
                location4242Info = {
                    locationId: '4242',
                    id: '/1/4242',
                    mainLanguageCode: 'Bressan',
                },
                link42 = this.view.get('container').one('a[href="ezlocation://42"]'),
                link4242 = this.view.get('container').one('a[href="ezlocation://4242"]');

            this.view.on('locationSearch', Y.bind(function (e) {
                e.callback.call(this, false, [
                    {location: this._getLocation.apply(this, Y.Object.values(location42Info))},
                    {location: this._getLocation.apply(this, Y.Object.values(location4242Info))},
                ]);
            }, this));
            this.processor.process(this.view);

            Assert.areEqual(
                location42Info.id,
                link42.getAttribute('data-ez-rest-location-id'),
                "The rest Location id should be added on the link"
            );
            Assert.areEqual(
                location42Info.mainLanguageCode,
                link42.getAttribute('data-ez-main-language-code'),
                "The main language code should be added on the link"
            );
            Assert.areEqual(
                location4242Info.id,
                link4242.getAttribute('data-ez-rest-location-id'),
                "The rest Location id should be added on the link"
            );
            Assert.areEqual(
                location4242Info.mainLanguageCode,
                link4242.getAttribute('data-ez-main-language-code'),
                "The main language code should be added on the link"
            );
        },

        "Should leave the links in searching results in an error": function () {
            var link42 = this.view.get('container').one('a[href="ezlocation://42"]'),
                link4242 = this.view.get('container').one('a[href="ezlocation://4242"]');

            this.view.on('locationSearch', Y.bind(function (e) {
                e.callback.call(this, true, []);
            }, this));
            this.processor.process(this.view);

            Assert.isFalse(
                link42.hasAttribute('data-ez-rest-location-id'),
                "The link should remain intact"
            );
            Assert.isFalse(
                link42.hasAttribute('data-ez-main-language-code'),
                "The link should remain intact"
            );
            Assert.isFalse(
                link4242.hasAttribute('data-ez-rest-location-id'),
                "The link should remain intact"
            );
            Assert.isFalse(
                link4242.hasAttribute('data-ez-main-language-code'),
                "The link should remain intact"
            );
        },
    });

    Y.Test.Runner.setName("eZ RichText location link processor tests");
    Y.Test.Runner.add(processTest);
}, '', {requires: ['test', 'base', 'view', 'ez-richtext-locationlink']});

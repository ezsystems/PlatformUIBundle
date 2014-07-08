/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-maplocation-view-tests', function (Y) {
    var viewTest, registerTest, loadTest,
        stPauldeVarax = {fieldValue: {address: "St Paul de Varax", latitude: 46.099353, longitude: 5.12896}};

    function objectAssert(expected, actual, msg) {
        Y.Assert.areEqual(
            Y.Object.keys(expected).length,
            Y.Object.keys(actual).length,
            msg + " (Not the same number of keys)"
        );

        Y.Object.each(expected, function (val, i) {
            Y.Assert.areSame(
                expected[i],
                actual[i],
                msg + " (property " + i + " in the expected object)"
            );
        });

        Y.Object.each(actual, function (val, i) {
            Y.Assert.areSame(
                expected[i],
                actual[i],
                msg + " (property " + i + " in the actual object)"
            );
        });
    }

    loadTest = new Y.Test.Case({
        name: "eZ Map Location View map api loading test",

        setUp: function () {
            this.loaderMock = new Y.Mock();
            Y.Mock.expect(this.loaderMock, {
                method: 'load'
            });

            this.fieldDefinition = {fieldType: 'ezgmaplocation'};
            this.field = stPauldeVarax;
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should try to load the map API": function () {
            var view;

            view = new Y.eZ.MapLocationView({
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                mapAPILoader: this.loaderMock
            });
            view.render();

            Y.Mock.verify(this.loaderMock);
        },

        "Should set a class while loading the map API": function () {
            var view;

            view = new Y.eZ.MapLocationView({
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                mapAPILoader: this.loaderMock
            });
            view.render();

            Y.Assert.isTrue(
                view.get('container').hasClass('is-maplocationview-loading'),
                "The container should have the class 'is-maplocationview-loading' while loading the API"
            );
            view.destroy();
        },

        "Should handle the loading error": function () {
            var view, mock = this.loaderMock;

            Y.Mock.expect(this.loaderMock, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function],
                run: function (evt, func) {
                    if ( evt === 'mapAPIFailed' ) {
                        func.apply(mock);
                    }
                }
            });

            view = new Y.eZ.MapLocationView({
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                mapAPILoader: this.loaderMock
            });
            view.render();
            view.set('active', true);

            Y.Assert.isFalse(
                view.get('container').hasClass('is-maplocationview-loading'),
                "The container should NOT have the class 'is-maplocationview-loading'"
            );

            Y.Assert.isTrue(
                view.get('container').hasClass('is-maplocationview-loading-failed'),
                "The container should have the class 'is-maplocationview-loading-failed'"
            );

            Y.Assert.areNotEqual(
                "", view.get('container').one('.ez-maplocation-message').getContent(),
                "The view should generate an error message in case of loading error"
            );
            view.destroy();
        },

        "Should show the map": function () {
            var view, mock = this.loaderMock, google = {},
                map, info, infoOpen, clickCallback;

            window.google = google;
            google.maps = {};
            google.maps.LatLng = function (lat, lon) {
                this.lat = lat;
                this.lon = lon;
                Y.Assert.areSame(
                    stPauldeVarax.fieldValue.latitude, lat,
                    "The point should be created with the latitude in the field"
                );

                Y.Assert.areSame(
                    stPauldeVarax.fieldValue.longitude, lon,
                    "The point should be created with the longitude in the field"
                );
            };
            google.maps.InfoWindow = function (options) {
                info = true;
                Y.Assert.isTrue(
                    options.content.innerHTML.indexOf("data") != 1,
                    "The info window should contain the data rendered by the template"
                );
            };
            google.maps.InfoWindow.prototype.open = function () {
                infoOpen = true;
            };
            google.maps.Map = function (domNode, options) {
                map = true;
                Y.Assert.isTrue(
                    view.get('container').contains(domNode),
                    "The map should be rendered in the container"
                );
                Y.Assert.areSame(
                    stPauldeVarax.fieldValue.latitude, options.center.lat,
                    "The map should be centered on the point in the field"
                );

                Y.Assert.areSame(
                    stPauldeVarax.fieldValue.longitude, options.center.lon,
                    "The map should be centered on the point in the field"
                );
            };
            google.maps.Marker = function (options) {
                Y.Assert.areSame(
                    stPauldeVarax.fieldValue.latitude, options.position.lat,
                    "A marker should be added to the point in the field"
                );

                Y.Assert.areSame(
                    stPauldeVarax.fieldValue.longitude, options.position.lon,
                    "A marker should be added to the point in the field"
                );
            };
            google.maps.event = {};
            google.maps.event.addListener = function (elt, evt, cb) {
                clickCallback = cb;
                Y.Assert.isInstanceOf(google.maps.Marker, elt);
                Y.Assert.areEqual(evt, 'click', "A click handler on the marker should be added");
            };

            Y.Mock.expect(this.loaderMock, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function],
                run: function (evt, func) {
                    if ( evt === 'mapAPIReady' ) {
                        func.apply(mock);
                    }
                }
            });

            view = new Y.eZ.MapLocationView({
                fieldDefinition: this.fieldDefinition,
                field: this.field,
                mapAPILoader: this.loaderMock
            });
            view.render();
            view.set('active', true);

            Y.Assert.isFalse(
                view.get('container').hasClass('is-maplocationview-loading'),
                "The container should NOT have the class 'is-maplocationview-loading'"
            );
            Y.Assert.isTrue(map, "A map should have been added");
            Y.Assert.isTrue(info, "An info box should have been created");
            Y.Assert.isTrue(infoOpen, "The info box should be open");

            infoOpen = false;
            clickCallback.apply(view);
            Y.Assert.isTrue(infoOpen, "The info box should be open by the click handler");

            view.destroy();
            delete window.google;
        },


    });

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Map Location View test",

            setUp: function () {
                this.loaderMock = new Y.Mock();
                Y.Mock.expect(this.loaderMock, {
                    method: 'load'
                });
                Y.Mock.expect(this.loaderMock, {
                    method: 'on',
                    callCount: 2,
                    args: [Y.Mock.Value.String, Y.Mock.Value.Function],
                    runs: function (evt, callback) {
                        if ( evt !== 'mapAPIReady' && evt !== 'mapAPIFailed' ) {
                            Y.Assert.fail("The view should subscribe to mapAPIReady or mapAPIFailed events");
                        }
                    }
                });
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezgmaplocation'};
                this.field = {};
                this.isEmpty = true;
                this.view = new Y.eZ.MapLocationView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                    mapAPILoader: this.loaderMock
                });
            },

            tearDown: function () {
                this.view.destroy();
            },

            "Test default value of the map loader attribute": function () {
                var view;

                view = new Y.eZ.MapLocationView();
                Y.Assert.isUndefined(view.get('mapAPILoader'));

                Y.eZ.services = {};
                Y.eZ.services.mapAPILoader = this.loaderMock;
                view = new Y.eZ.MapLocationView();
                Y.Assert.areSame(
                    Y.eZ.services.mapAPILoader,
                    view.get('mapAPILoader'),
                    "The map location view should use the map api loader service if available"
                );

                delete Y.eZ.service;
            },

            "Test value without coordinates": function () {
                this._testValue(
                    {latitude: "", longitude: ""},
                    undefined,
                    "The value in the template should be undefined"
                );
            },

            "Test no field value": function () {
                this._testValue(
                    undefined, undefined,
                    "The value in the template should be undefined"
                );
            },

            "Test empty field value": function () {
                this._testValue(
                    {}, undefined,
                    "The value in the template should be undefined"
                );
            },

            "Test coordinates without address": function () {
                this._testValue(
                    {address: "", latitude: 46.099353, longitude: 5.12896},
                    {address: "", latitude: 46.099353, longitude: 5.12896},
                    "The field value should available in the template",
                    objectAssert
                );
            },

            "Test coordinates with address": function () {
                this._testValue(
                    stPauldeVarax.fieldValue,
                    {address: "St Paul de Varax", latitude: 46.099353, longitude: 5.12896},
                    "The field value should available in the template",
                    objectAssert
                );
            },

            "Test isEmpty with value without coordinates": function () {
                this._testIsEmpty(
                    {fieldValue: {latitude: "", longitude: ""}},
                    true,
                    "The field should considered empty"
                );
            },

            "Test isEmpty with no field value": function () {
                this._testIsEmpty(
                    {fieldValue: undefined}, true,
                    "The field should considered empty"
                );
            },

            "Test isEmpty with empty field value": function () {
                this._testIsEmpty(
                    {fieldValue: {}}, true,
                    "The field should considered empty"
                );
            },

            "Test isEmpty with coordinates without address": function () {
                this._testIsEmpty(
                    {fieldValue: {address: "", latitude: 46.099353, longitude: 5.12896}},
                    false,
                    "The field value should not be considered empty"
                );
            },

            "Test isEmpty with coordinates with address": function () {
                this._testIsEmpty(
                    stPauldeVarax,
                    false,
                    "The field value should not be considered empty"
                );
            },

        })
    );

    Y.Test.Runner.setName("eZ Map Location View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(loadTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Map Location View registration test";
    registerTest.viewType = Y.eZ.MapLocationView;
    registerTest.viewKey = "ezgmaplocation";

    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'ez-maplocation-view', 'ez-genericfieldview-tests']});

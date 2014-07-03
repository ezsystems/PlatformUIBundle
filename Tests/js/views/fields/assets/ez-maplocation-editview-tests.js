/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-maplocation-editview-tests', function (Y) {
    var container = Y.one('.container'),
        viewTest, APILoadingTest, noInitialValuesTest,
        findAddressTest, locateMeTest, registerTest, getFieldTest,
        content, contentType, version,
        mapLoaderLoadingSuccess,
        testAddress = "London",
        googleStub, geocoderInput,
        jsonContent = {}, jsonContentType = {}, jsonVersion = {},
        testDefaultLatitude = 20.00000000001,
        testDefaultLongitude = 40.0000000000001,
        testAddressLatitude = 50.00000001,
        testAddressLongitude = 70.0000001,
        testLocateMeLatitude = 60.000001,
        testLocateMeLongitude = 80.000001,
        currentMapCenterLat, currentMapCenterLng,
        currentMarkerLat, currentMarkerLng,
        field = {
            fieldValue: {
                latitude: testDefaultLatitude,
                longitude: testDefaultLongitude
            }
        };

    content = new Y.Mock();
    version = new Y.Mock();
    contentType = new Y.Mock();
    Y.Mock.expect(content, {
        method: 'toJSON',
        returns: jsonContent
    });
    Y.Mock.expect(version, {
        method: 'toJSON',
        returns: jsonVersion
    });
    Y.Mock.expect(contentType, {
        method: 'toJSON',
        returns: jsonContentType
    });

    mapLoaderLoadingSuccess = function () {
        var that = this;
        // setTimeout (even with 0 value) will be needed here because we are
        // going to use a node, which is not yet in the DOM
        setTimeout(function () {
            that.fire('mapAPIReady');
        }, 0);
    };

    // Composing google maps stub
    googleStub = {
        maps: {
            event: {
                addListener: function () {},
                addListenerOnce: function () {}
            },
            LatLng: function (latitude, longitude) {
                this.lat = function () {return latitude;};
                this.lng = function () {return longitude;};
            },
            Map: function(domNode, mapOptions) {
                this.mapOptions = mapOptions;
                this.setCenter = function (location) {
                    currentMapCenterLat = location.lat();
                    currentMapCenterLng = location.lng();
                };
            },
            Marker: function(options) {
                this.position = options.position;
                this.map = options.map;
                this.setPosition = function (location) {
                    currentMarkerLat = location.lat();
                    currentMarkerLng = location.lng();
                };
            },
            Geocoder: function () {
                return {
                    geocode: function (input, callback) {
                        geocoderInput = input;
                        callback([{
                                geometry: {
                                    location: {
                                        lat: function () {return testAddressLatitude;},
                                        lng: function () {return testAddressLongitude;}
                                    }
                                }
                            }],
                            "geocoderStatusOk"
                        );
                    }
                };
            },
            GeocoderStatus: {
                OK: "geocoderStatusOk",
                ZERO_RESULTS: "geocoderStatusZeroResults"
            }
        }
    };

    viewTest = new Y.Test.Case({
        name: "eZ Map Location View test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.mapLoaderLoad = Y.eZ.GoogleMapAPILoader.prototype.load;
            Y.eZ.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                version: version,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
        },

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required),
                origTpl = this.view.template;
            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(6, Y.Object.keys(variables).length, "The template should receive 6 variables");

                Y.Assert.areSame(
                    jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    jsonVersion, variables.version,
                    "The version should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    field, variables.field,
                    "The field should be available in the field edit view template"
                );

                Y.Assert.areSame(expectRequired, variables.isRequired);

                return origTpl.apply(this, arguments);
            };

            this.view.render();
        },

        "Test variables for required field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test variables for not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test correct map initialization on successfull maps API loading": function () {
            var fieldDefinition = this._getFieldDefinition(false),
                container = this.view.get('container'),
                map, marker;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);

            map = this.view.get('map');
            marker = this.view.get('marker');
            Y.Assert.isObject(map, "Map should be created");
            Y.Assert.isObject(marker, "Marker should be created");

            Y.Assert.areEqual(
                8, map.mapOptions.zoom,
                "The zoom of the map should be set to 8"
            );

            Y.Assert.areEqual(
                this.view.get('field').fieldValue.latitude,
                map.mapOptions.center.lat(),
                "The map should be centered on the point given by the field (latitude)"
            );
            Y.Assert.areEqual(
                this.view.get('field').fieldValue.longitude,
                map.mapOptions.center.lng(),
                "The map should be centered on the point given by the field (longitude)"
            );

            Y.Assert.areSame(
                map, marker.map,
                "A marker should be added to the map"
            );
            Y.Assert.areSame(
                map.mapOptions.center, marker.position,
                "The marker should be set on the map center"
            );

            Y.Assert.areEqual(
                container.one(".ez-maplocation-errors").getHTML(),
                "",
                "Errors output should be empty"
            );
        },

        "Test map API loader service usage": function () {
            Y.Assert.areSame(
                Y.eZ.services.mapAPILoader,
                this.view.get('mapAPILoader'),
                "The mapAPILoader attribute should be initialized with mapAPILoader service"
            );

            this.view.set('mapAPILoader', '');
            Y.Assert.areSame(
                Y.eZ.services.mapAPILoader,
                this.view.get('mapAPILoader'),
                "The mapAPILoader attribute should be readonly"
            );
        },
    });

    noInitialValuesTest = new Y.Test.Case({
        name: "eZ Map Location Edit View no initial values test",

        setUp: function () {
            this.mapLoaderLoad = Y.eZ.GoogleMapAPILoader.prototype.load;
            Y.eZ.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;
        },

        tearDown: function () {
            Y.eZ.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
            delete window.google;
        },

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        "Test correct map initialization without initial values": function () {
            var fieldDefinition = this._getFieldDefinition(false),
                view;

            field = {};

            view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                version: version,
                content: content,
                contentType: contentType
            });

            view.set('fieldDefinition', fieldDefinition);
            view.render();
            view.set('active', true);

            Y.Assert.isObject(view.get('map'), "Map should be created");
            Y.Assert.isObject(view.get('marker'), "Marker should be created");

            Y.Assert.areEqual(
                container.one('.ez-maplocation-longitude').getHTML(),
                0,
                "Template should be updated with default longitude value"
            );
            Y.Assert.areEqual(
                container.one('.ez-maplocation-latitude').getHTML(),
                0,
                "Template should be updated with default latitude value"
            );

            Y.Assert.areEqual(
                container.one(".ez-maplocation-errors").getHTML(),
                "",
                "Errors output should be empty"
            );

            view.destroy();
        }


    });

    findAddressTest = new Y.Test.Case({
        name: "eZ Map Location Edit View 'Find Address' feature test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            var fieldDefinition = this._getFieldDefinition(false);

            this.mapLoaderLoad = Y.eZ.GoogleMapAPILoader.prototype.load;
            this.mapLoaderIsAPILoaded = Y.eZ.GoogleMapAPILoader.prototype.isAPILoaded;

            Y.eZ.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            Y.eZ.GoogleMapAPILoader.prototype.isAPILoaded = function () {
                return true;
            };
            geocoderInput = {};
            window.google = googleStub;

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                version: version,
                content: content,
                contentType: contentType
            });

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);

            this.findAddressInput = container.one('.ez-maplocation-find-address-input input');
            this.findAddressButton = container.one('.ez-maplocation-find-address-button');
            this.findAddressErrors = container.one('.ez-maplocation-errors');
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
            Y.eZ.GoogleMapAPILoader.prototype.isAPILoaded = this.mapLoaderIsAPILoaded;
            delete window.google;
        },

        _testMapWasCenteredOnPoint: function (latitude, longitude) {
            Y.Assert.areEqual(
                currentMapCenterLat,
                latitude,
                "Map center should have provided latitude"
            );
            Y.Assert.areEqual(
                currentMapCenterLng,
                longitude,
                "Map center should have provided longitude"
            );
        },

        _testMarkerWasMovedIntoPoint: function (latitude, longitude) {
            Y.Assert.areEqual(
                currentMarkerLat,
                latitude,
                "Marker should have provided latitude"
            );
            Y.Assert.areEqual(
                currentMarkerLng,
                longitude,
                "Marker should have provided longitude"
            );
        },

        "Test 'Find Address' feature is calling the geocoder with correct params and map is updated accordingly on success": function () {
            var that = this;

            this.findAddressInput.set('value', testAddress);
            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", this.findAddressErrors.getHTML(),
                "Find address errors container is empty before the search attempt"
            );

            this.findAddressButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        geocoderInput.address,
                        testAddress,
                        "Test address should have been passed to the geocoder"
                    );

                    this._testMapWasCenteredOnPoint(testAddressLatitude, testAddressLongitude);
                    this._testMarkerWasMovedIntoPoint(testAddressLatitude, testAddressLongitude);

                    Y.Assert.areEqual(
                        "", this.findAddressErrors.getHTML(),
                        "Find address errors container is empty after the successfull search"
                    );
                });
            });
            this.wait();
        },

        "Test 'Find Address' feature is also called on pressing the 'Enter' key in the address input": function () {

            this.findAddressInput.set('value', testAddress);
            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", this.findAddressErrors.getHTML(),
                "Find address errors container is empty before the search attempt"
            );

            this.findAddressInput.simulate("keyup", { charCode: 14 }); // Not "Enter" key
            // The search should not have been started by some other key
            Y.Assert.areNotEqual(
                geocoderInput.address,
                testAddress,
                "Test address should not have been passed to the geocoder"
            );

            this.findAddressInput.simulate("keyup", { charCode: 13 }); //"Enter" key

            Y.Assert.areEqual(
                geocoderInput.address,
                testAddress,
                "Test address should have been passed to the geocoder"
            );

            this._testMapWasCenteredOnPoint(testAddressLatitude, testAddressLongitude);
            this._testMarkerWasMovedIntoPoint(testAddressLatitude, testAddressLongitude);

            Y.Assert.areEqual(
                "", this.findAddressErrors.getHTML(),
                "Find address errors container is empty after the successfull search"
            );
        },


        "Test 'Find Address' feature errors handling on ZERO_RESULTS error": function () {
            var that = this;

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", this.findAddressErrors.getHTML(),
                "Find address errors container is empty before the search attempt"
            );

            window.google.maps.Geocoder = function () {
                return {
                    geocode: function (input, callback) {
                        geocoderInput = input;
                        callback(
                            false,
                            "geocoderStatusZeroResults"
                        );
                    }
                };
            };

            this.findAddressButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areNotEqual(
                        "", this.findAddressErrors.getHTML(),
                        "Find address errors container is not empty"
                    );
                });
            });
            this.wait();
        },

        "Test geocoder errors handling on other errors": function () {
            var that = this;

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", this.findAddressErrors.getHTML(),
                "Find address errors container is empty before the search attempt"
            );

            window.google.maps.Geocoder = function () {
                return {
                    geocode: function (input, callback) {
                        geocoderInput = input;
                        callback(
                            false,
                            "geocoderStatusSomeOtherError"
                        );
                    }
                };
            };

            this.findAddressButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areNotEqual(
                        "", this.findAddressErrors.getHTML(),
                        "Find address errors container is not empty"
                    );
                });
            });
            this.wait();
        },

        "Test geocoder errors handling when maps API is not loaded": function () {
            var that = this;

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", this.findAddressErrors.getHTML(),
                "Find address errors container is empty before the search attempt"
            );

            Y.eZ.GoogleMapAPILoader.prototype.isAPILoaded = function () {
                return false;
            };

            this.findAddressButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areNotEqual(
                        "", this.findAddressErrors.getHTML(),
                        "Find address errors container is not empty"
                    );
                });
            });
            this.wait();
        }
    });

    locateMeTest = new Y.Test.Case({
        name: "eZ Map Location View 'Locate me' feature test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            var fieldDefinition = this._getFieldDefinition(false);

            this.mapLoaderLoad = Y.eZ.GoogleMapAPILoader.prototype.load;
            Y.eZ.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                version: version,
                content: content,
                contentType: contentType
            });

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);

            this.locateMeButton = container.one('.ez-maplocation-locate-me-button');
            this.locateMeErrors = container.one('.ez-maplocation-locate-me-errors');
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
            delete window.google;
        },

        _testMapWasCenteredOnPoint: function (latitude, longitude) {
            Y.Assert.areEqual(
                currentMapCenterLat,
                latitude,
                "Map center should have provided latitude"
            );
            Y.Assert.areEqual(
                currentMapCenterLng,
                longitude,
                "Map center should have provided longitude"
            );
        },

        _testMarkerWasMovedIntoPoint: function (latitude, longitude) {
            Y.Assert.areEqual(
                currentMarkerLat,
                latitude,
                "Marker should have provided latitude"
            );
            Y.Assert.areEqual(
                currentMarkerLng,
                longitude,
                "Marker should have provided longitude"
            );
        },

        "Test 'Locate me' feature is handling received results correctly on success": function () {
            var that = this;

            window.navigator = {
                geolocation: {
                    getCurrentPosition: function (successCallback, errorCallback) {
                        // Setting timeout to test loaders
                        setTimeout(function () {
                            successCallback({
                                coords: {
                                    latitude: testLocateMeLatitude,
                                    longitude: testLocateMeLongitude
                                }
                            });
                        }, 200);
                    }
                }
            };

            container = this.view.get('container');
            this.locateMeButton = container.one('.ez-maplocation-locate-me-button');
            this.locateMeErrors = container.one('.ez-maplocation-locate-me-errors');

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", this.locateMeErrors.getHTML(),
                "Locate Me errors container is empty before the geolocation attempt"
            );

            this.locateMeButton.simulateGesture('tap', function () {
                that.resume(function () {

                    Y.Assert.isTrue(this.locateMeButton.hasClass('is-loading'), "'Locate Me' button should show a loader");

                    this.wait(function () {

                        Y.Assert.isFalse(this.locateMeButton.hasClass('is-loading'), "'Locate Me' button should have hidden the loader");

                        this._testMapWasCenteredOnPoint(testLocateMeLatitude, testLocateMeLongitude);
                        this._testMarkerWasMovedIntoPoint(testLocateMeLatitude, testLocateMeLongitude);

                        Y.Assert.areEqual(
                            "", this.locateMeErrors.getHTML(),
                            "Find address errors container is empty after the successfull geolocation"
                        );

                    }, 300);

                });
            });
            this.wait();
        },

        "Test 'Locate me' feature is handling received errors correctly": function () {
            var that = this;

            window.navigator = {
                geolocation: {
                    getCurrentPosition: function (successCallback, errorCallback) {
                        // Setting timeout to test loaders
                        setTimeout(function () {
                            errorCallback();
                        }, 200);
                    }
                }
            };

            container = this.view.get('container');
            this.locateMeButton = container.one('.ez-maplocation-locate-me-button');
            this.locateMeErrors = container.one('.ez-maplocation-locate-me-errors');

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", this.locateMeErrors.getHTML(),
                "Locate Me errors container is empty before the geolocation attempt"
            );

            this.locateMeButton.simulateGesture('tap', function () {
                that.resume(function () {

                    Y.Assert.isTrue(this.locateMeButton.hasClass('is-loading'), "'Locate Me' button should show a loader");

                    this.wait(function () {

                        Y.Assert.isFalse(this.locateMeButton.hasClass('is-loading'), "'Locate Me' button should have hidden the loader");

                        Y.Assert.areNotEqual(
                            "", this.locateMeErrors.getHTML(),
                            "Find address errors container shold not be empty after the geolocation failure"
                        );
                    }, 300);
                });
            });
            this.wait();
        },

        "Test 'Locate me' feature is handling browser incompatibility correctly": function () {
            var that = this;

            window.navigator = {};
            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", this.locateMeErrors.getHTML(),
                "Locate Me errors container is empty before the geolocation attempt"
            );

            this.locateMeButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areNotEqual(
                        "", this.locateMeErrors.getHTML(),
                        "Find address errors container should not be empty if browser is incompatible"
                    );
                });
            });
            this.wait();
        }
    });

    APILoadingTest = new Y.Test.Case({
        name: "eZ Map Location View API Loading test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        _createAndRenderView: function () {
            var fieldDefinition = this._getFieldDefinition(false);

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                version: version,
                content: content,
                contentType: contentType
            });

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();
            this.view.set('active', true);
        },

        setUp: function () {
            this.mapLoaderLoad = Y.eZ.GoogleMapAPILoader.prototype.load;
            Y.eZ.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;
        },

        tearDown: function () {
            Y.eZ.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
            delete window.google;
        },

        "Test view showing loaders, until the map is loaded for the very first time": function () {
            this._createAndRenderView();

            container.all('.ez-maplocation-coordinates li').each(function (coordinateNode) {
                Y.Assert.isTrue(
                    coordinateNode.hasClass('is-loading'),
                    "Coordinates output node should show the loader while API is still loading"
                );
            });

            // Simulating first load of the map
            this.view._mapFirstLoad();

            container.all('.ez-maplocation-coordinates li').each(function (coordinateNode) {
                Y.Assert.isFalse(
                    coordinateNode.hasClass('is-loading'),
                    "Coordinates output node should hide the loader after successfull API loading"
                );
            });

            this.view.destroy();
        },

        "Test view disabling 'Find address' button, until the map is loaded for the very first time": function () {
            this._createAndRenderView();

            Y.Assert.isTrue(
                container.one('.ez-maplocation-find-address-button').hasClass('pure-button-disabled'),
                "'Find address' button should be disabled until the map is fully loaded"
            );

            // Simulating first load of the map
            this.view._mapFirstLoad();

            Y.Assert.isFalse(
                container.one('.ez-maplocation-find-address-button').hasClass('pure-button-disabled'),
                "'Find address' button should become enabled once the map is fully loaded"
            );

            this.view.destroy();
        },

        "Test view disabling 'Locate me' button, until the map is loaded and the browser supports geolocation API": function () {
            window.navigator = {
                geolocation: {}
            };

            this._createAndRenderView();

            Y.Assert.isTrue(
                container.one('.ez-maplocation-locate-me-button').hasClass('pure-button-disabled'),
                "'Locate me' button should be disabled until the map is fully loaded"
            );

            // Simulating first load of the map
            this.view._mapFirstLoad();

            Y.Assert.isFalse(
                container.one('.ez-maplocation-locate-me-button').hasClass('pure-button-disabled'),
                "'Locate me' button should become enabled once the map is fully loaded and browser supports geolocation API"
            );

            this.view.destroy();
        },

        "Test view leaves 'Locate me' button disabled, when the map is loaded, but the browser does NOT support geolocation API": function () {
            window.navigator = {};

            this._createAndRenderView();

            Y.Assert.isTrue(
                container.one('.ez-maplocation-locate-me-button').hasClass('pure-button-disabled'),
                "'Locate me' button should be disabled until the map is fully loaded"
            );

            // Simulating first load of the map
            this.view._mapFirstLoad();

            Y.Assert.isTrue(
                container.one('.ez-maplocation-locate-me-button').hasClass('pure-button-disabled'),
                "'Locate me' button should remain disabled if the browser does not support geolocation API"
            );

            this.view.destroy();
        },

        "Test view is handling errors correctly if map API is not loaded properly": function () {
            Y.eZ.GoogleMapAPILoader.prototype.load = function () {
                var that = this;
                // setTimeout (even with 0 value) will be needed here because we are
                // going to use a node, which is not yet in the DOM
                setTimeout(function () {
                    that.fire('mapAPIFailed');
                }, 0);
            };

            this._createAndRenderView();

            this.wait(function () {
                Y.Assert.areNotEqual(
                    "", container.one('.ez-maplocation-errors').getHTML(),
                    "Errors container is not empty when the maps API did not load."
                );

                this.view.destroy();
            }, 200);
        }

    });

    Y.Test.Runner.setName("eZ Map Location Edit View tests");

    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(noInitialValuesTest);
    Y.Test.Runner.add(findAddressTest);
    Y.Test.Runner.add(locateMeTest);
    Y.Test.Runner.add(APILoadingTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.MapLocationEditView,
            newValue: {address: 'St Paul de Varax', latitude: 46.099353, longitude: 5.12896},

            init: function () {
                this.mapAPILoader = Y.eZ.services.mapAPILoader;
                Y.eZ.services.mapAPILoader = new Y.Mock();
                Y.Mock.expect(Y.eZ.services.mapAPILoader, {
                    method: 'load',
                });
                Y.Mock.expect(Y.eZ.services.mapAPILoader, {
                    method: 'on',
                    args: [Y.Mock.Value.String, Y.Mock.Value.Function],
                });
            },

            destroy: function () {
                Y.eZ.services.mapAPILoader = this.mapAPILoader;
            },

            _setNewValue: function () {
                this.view.get('container').one('#ez-field-maplocation-address').set('value', this.newValue.address);
                this.view.set('location', {
                    latitude: this.newValue.latitude,
                    longitude: this.newValue.longitude
                });
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.areEqual(
                    Y.Object.keys(this.newValue).length,
                    Y.Object.keys(fieldValue).length,
                    msg
                );
                Y.Object.each(this.newValue, function (val, key) {
                    Y.Assert.areEqual(
                        val, fieldValue[key], msg
                    );
                });
            }
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Map Location Edit View registration test";
    registerTest.viewType = Y.eZ.MapLocationEditView;
    registerTest.viewKey = "ezgmaplocation";
    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'node-event-simulate', 'ez-maplocation-editview']});

YUI.add('ez-maplocation-editview-tests', function (Y) {
    var container = Y.one('.container'),
        viewTest, APILoadingTest, mapLoaderTest, noInitialValuesTest,
        findAddressTest, locateMeTest, registerTest,
        content, contentType,
        mapLoaderLoadingSuccess,
        testAddress = "London",
        googleStub, geocoderInput,
        jsonContent = {}, jsonContentType = {},
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
    contentType = new Y.Mock();
    Y.Mock.expect(content, {
        method: 'toJSON',
        returns: jsonContent
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
            Map: function() {
                return {
                    setCenter: function (location) {
                        currentMapCenterLat = location.lat();
                        currentMapCenterLng = location.lng();
                    }
                };
            },
            Marker: function() {
                return {
                    setPosition: function (location) {
                        currentMarkerLat = location.lat();
                        currentMarkerLng = location.lng();
                    }
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

    mapLoaderTest = new Y.Test.Case({
        name: "GoogleMapAPILoader tests",

        setUp: function () {
            this.mapLoader = new Y.eZ.MapLocationEditView.GoogleMapAPILoader();
            window.google = {};
        },

        tearDown: function () {
            delete this.mapLoader;
        },

        "Should correctly detect presence of the google maps API": function () {
            window.google = {
                maps: {}
            };

            Y.Assert.isTrue(
                this.mapLoader.isAPILoaded(),
                "GoogleMapAPILoader.isAPILoaded() method should return true, when maps API is present"
            );
        },

        "Should correctly detect absence of the google maps API": function () {
            window.google = {};

            Y.Assert.isFalse(
                this.mapLoader.isAPILoaded(),
                "GoogleMapAPILoader.isAPILoaded() method should return false, when maps API is not present"
            );
        },

        "Should fire 'mapAPIready' when trying to load maps API, but it is already loaded": function () {
            var mapLoadedFired = false,
                JSONPStub = function () {};

            window.google = {
                maps: {}
            };

            this.mapLoader.on('mapAPIReady', function () {
                mapLoadedFired = true;
            });

            this.mapLoader.load(JSONPStub);

            Y.Assert.isTrue(
                mapLoadedFired,
                "'mapAPIready' should have been fired during loading, when maps API is present"
            );
        },

        "Should call JSONRequestConstructor with correct arguments while trying to load map API": function () {
            var JSONRequestUrl = "",
                JSONRequestConfig = {},
                JSONPStub = function (requestUrl, requestConfig) {
                    JSONRequestUrl = requestUrl;
                    JSONRequestConfig = requestConfig;
                };

            this.mapLoader.load(JSONPStub);

            Y.Assert.areEqual(
                JSONRequestUrl,
                "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback={callback}",
                "Url argument should be correct"
            );

            Y.Assert.isObject(
                JSONRequestConfig.on.success,
                "Config argument should contain 'on.success' entry"
            );

            Y.Assert.isObject(
                JSONRequestConfig.on.failure,
                "Config argument should contain 'on.failure' entry"
            );
        },

        "Should fire 'mapAPIReady' when map API was loaded successfully": function () {
            var mapLoadedFired = false,
                JSONPStub = function (requestUrl, requestConfig) {
                    requestConfig.on.success();
                };

            this.mapLoader.on('mapAPIReady', function () {
                mapLoadedFired = true;
            });

            this.mapLoader.load(JSONPStub);

            Y.Assert.isTrue(
                mapLoadedFired,
                "'mapAPIready' should have been fired on successfull maps API load"
            );
        },

        "Should fire 'mapAPIFailed' when map API loading have failed": function () {
            var mapFailedFired = false,
                JSONPStub = function (requestUrl, requestConfig) {
                    requestConfig.on.failure();
                };

            this.mapLoader.on('mapAPIFailed', function () {
                mapFailedFired = true;
            });

            this.mapLoader.load(JSONPStub);

            Y.Assert.isTrue(
                mapFailedFired,
                "'mapAPIailed' should have been fired on maps API loading failure"
            );
        },

        "Should avoid concurrent loading": function () {
            var mapLoadedFired = false,
                JSONPStub = function (requestUrl, requestConfig) {
                    requestConfig.on.success();
                };

            this.mapLoader.on('mapAPIReady', function () {
                mapLoadedFired = true;
            });

            this.mapLoader._isLoading = true;
            this.mapLoader.load(JSONPStub);

            Y.Assert.isFalse(
                mapLoadedFired,
                "Loading should have been stopped if the '_isLoading' flag is set to true"
            );
        }


    });

    viewTest = new Y.Test.Case({
        name: "eZ Map Location View test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.mapLoaderLoad = Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load;
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
        },

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required),
                origTpl = this.view.template;
            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(5, Y.Object.keys(variables).length, "The template should receive 5 variables");

                Y.Assert.areSame(
                    jsonContent, variables.content,
                    "The content should be available in the field edit view template"
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
                container = this.view.get('container');
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            Y.Assert.isObject(this.view.get('map'));
            Y.Assert.isObject(this.view.get('marker'));

            Y.Assert.areEqual(
                container.one('.ez-maplocation-longitude').getHTML(),
                testDefaultLongitude,
                "Template should be updated with initial longitude value"
            );
            Y.Assert.areEqual(
                container.one('.ez-maplocation-latitude').getHTML(),
                testDefaultLatitude,
                "Template should be updated with initial latitude value"
            );

            Y.Assert.areEqual(
                container.one(".ez-maplocation-errors").getHTML(),
                "",
                "Errors output should be empty"
            );
        }
    });

    noInitialValuesTest = new Y.Test.Case({
        name: "eZ Map Location Edit View no initial values test",

        setUp: function () {
            this.mapLoaderLoad = Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load;
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;
        },

        tearDown: function () {
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;

        },

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        "Test correct map initialization without initial values": function () {
            var fieldDefinition = this._getFieldDefinition(false);

            field = {};

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            Y.Assert.isObject(this.view.get('map'));
            Y.Assert.isObject(this.view.get('marker'));

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

            this.view.destroy();
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
            this.mapLoaderLoad = Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load;
            this.mapLoaderIsAPILoaded = Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded;

            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded = function () {
                return true;
            };
            geocoderInput = {};
            window.google = googleStub;

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded = this.mapLoaderIsAPILoaded;
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
            var that = this,
                fieldDefinition = this._getFieldDefinition(false),
                container, findAddressInput, findAddressButton, findAddressErrors;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            container = this.view.get('container');
            findAddressInput = container.one('.ez-maplocation-find-address-input input');
            findAddressButton = container.one('.ez-maplocation-find-address-button');
            findAddressErrors = container.one('.ez-maplocation-errors');

            findAddressInput.set('value', testAddress);
            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", findAddressErrors.getHTML(),
                "Find address errors container is empty before the search attempt"
            );

            findAddressButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        geocoderInput.address,
                        testAddress,
                        "Test address should have been passed to the geocoder"
                    );

                    this._testMapWasCenteredOnPoint(testAddressLatitude, testAddressLongitude);
                    this._testMarkerWasMovedIntoPoint(testAddressLatitude, testAddressLongitude);

                    Y.Assert.areEqual(
                        "", findAddressErrors.getHTML(),
                        "Find address errors container is empty after the successfull search"
                    );
                });
            });
            this.wait();
        },

        "Test 'Find Address' feature is also called on pressing the 'Enter' key in the address input": function () {
            var fieldDefinition = this._getFieldDefinition(false),
                container, findAddressInput, findAddressButton, findAddressErrors;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            container = this.view.get('container');
            findAddressInput = container.one('.ez-maplocation-find-address-input input');
            findAddressButton = container.one('.ez-maplocation-find-address-button');
            findAddressErrors = container.one('.ez-maplocation-errors');

            findAddressInput.set('value', testAddress);
            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", findAddressErrors.getHTML(),
                "Find address errors container is empty before the search attempt"
            );

            findAddressInput.simulate("keyup", { charCode: 14 }); // Not "Enter" key
            // The search should not have been started by some other key
            Y.Assert.areNotEqual(
                geocoderInput.address,
                testAddress,
                "Test address should not have been passed to the geocoder"
            );

            findAddressInput.simulate("keyup", { charCode: 13 }); //"Enter" key

            Y.Assert.areEqual(
                geocoderInput.address,
                testAddress,
                "Test address should have been passed to the geocoder"
            );

            this._testMapWasCenteredOnPoint(testAddressLatitude, testAddressLongitude);
            this._testMarkerWasMovedIntoPoint(testAddressLatitude, testAddressLongitude);

            Y.Assert.areEqual(
                "", findAddressErrors.getHTML(),
                "Find address errors container is empty after the successfull search"
            );
        },


        "Test 'Find Address' feature errors handling on ZERO_RESULTS error": function () {
            var that = this,
                fieldDefinition = this._getFieldDefinition(false),
                container, findAddressButton, findAddressErrors;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            container = this.view.get('container');
            findAddressButton = container.one('.ez-maplocation-find-address-button');
            findAddressErrors = container.one('.ez-maplocation-errors');

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", findAddressErrors.getHTML(),
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

            findAddressButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areNotEqual(
                        "", findAddressErrors.getHTML(),
                        "Find address errors container is not empty"
                    );
                });
            });
            this.wait();
        },

        "Test geocoder errors handling on other errors": function () {
            var that = this,
                fieldDefinition = this._getFieldDefinition(false),
                container, findAddressButton, findAddressErrors;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            container = this.view.get('container');
            findAddressButton = container.one('.ez-maplocation-find-address-button');
            findAddressErrors = container.one('.ez-maplocation-errors');

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", findAddressErrors.getHTML(),
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

            findAddressButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areNotEqual(
                        "", findAddressErrors.getHTML(),
                        "Find address errors container is not empty"
                    );
                });
            });
            this.wait();
        },

        "Test geocoder errors handling when maps API is not loaded": function () {
            var that = this,
                fieldDefinition = this._getFieldDefinition(false),
                container, findAddressButton, findAddressErrors;
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            container = this.view.get('container');
            findAddressButton = container.one('.ez-maplocation-find-address-button');
            findAddressErrors = container.one('.ez-maplocation-errors');

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", findAddressErrors.getHTML(),
                "Find address errors container is empty before the search attempt"
            );

            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded = function () {
                return false;
            };

            findAddressButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areNotEqual(
                        "", findAddressErrors.getHTML(),
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
            this.mapLoaderLoad = Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load;
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
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
            var that = this,
                fieldDefinition = this._getFieldDefinition(false),
                container, locateMeButton, locateMeErrors;

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

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            container = this.view.get('container');
            locateMeButton = container.one('.ez-maplocation-locate-me-button');
            locateMeErrors = container.one('.ez-maplocation-locate-me-errors');

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", locateMeErrors.getHTML(),
                "Locate Me errors container is empty before the geolocation attempt"
            );

            locateMeButton.simulateGesture('tap', function () {
                that.resume(function () {

                    Y.Assert.isTrue(locateMeButton.hasClass('is-loading'), "'Locate Me' button should show a loader");

                    this.wait(function () {

                        Y.Assert.isFalse(locateMeButton.hasClass('is-loading'), "'Locate Me' button should have hidden the loader");

                        this._testMapWasCenteredOnPoint(testLocateMeLatitude, testLocateMeLongitude);
                        this._testMarkerWasMovedIntoPoint(testLocateMeLatitude, testLocateMeLongitude);

                        Y.Assert.areEqual(
                            "", locateMeErrors.getHTML(),
                            "Find address errors container is empty after the successfull geolocation"
                        );

                    }, 300);

                });
            });
            this.wait();
        },

        "Test 'Locate me' feature is handling received errors correctly": function () {
            var that = this,
                fieldDefinition = this._getFieldDefinition(false),
                container, locateMeButton, locateMeErrors;

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

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            container = this.view.get('container');
            locateMeButton = container.one('.ez-maplocation-locate-me-button');
            locateMeErrors = container.one('.ez-maplocation-locate-me-errors');

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", locateMeErrors.getHTML(),
                "Locate Me errors container is empty before the geolocation attempt"
            );

            locateMeButton.simulateGesture('tap', function () {
                that.resume(function () {

                    Y.Assert.isTrue(locateMeButton.hasClass('is-loading'), "'Locate Me' button should show a loader");

                    this.wait(function () {

                        Y.Assert.isFalse(locateMeButton.hasClass('is-loading'), "'Locate Me' button should have hidden the loader");

                        Y.Assert.areNotEqual(
                            "", locateMeErrors.getHTML(),
                            "Find address errors container shold not be empty after the geolocation failure"
                        );
                    }, 300);
                });
            });
            this.wait();
        },

        "Test 'Locate me' feature is handling browser incompatibility correctly": function () {
            var that = this,
                fieldDefinition = this._getFieldDefinition(false),
                container, locateMeButton, locateMeErrors;

            window.navigator = {};

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            container = this.view.get('container');
            locateMeButton = container.one('.ez-maplocation-locate-me-button');
            locateMeErrors = container.one('.ez-maplocation-locate-me-errors');

            this.view._mapFirstLoad();

            Y.Assert.areEqual(
                "", locateMeErrors.getHTML(),
                "Locate Me errors container is empty before the geolocation attempt"
            );

            locateMeButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areNotEqual(
                        "", locateMeErrors.getHTML(),
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

        setUp: function () {
            this.mapLoaderLoad = Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load;
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;
        },

        tearDown: function () {
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = this.mapLoaderLoad;
        },

        "Test view showing loaders, until the map is loaded for the very first time": function () {
            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });

            var fieldDefinition = this._getFieldDefinition(false);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

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
            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });

            var fieldDefinition = this._getFieldDefinition(false);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

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

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });

            var fieldDefinition = this._getFieldDefinition(false);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

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

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });

            var fieldDefinition = this._getFieldDefinition(false);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

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
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = function () {
                var that = this;
                // setTimeout (even with 0 value) will be needed here because we are
                // going to use a node, which is not yet in the DOM
                setTimeout(function () {
                    that.fire('mapAPIFailed');
                }, 0);
            };

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });

            var fieldDefinition = this._getFieldDefinition(false);
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

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
    Y.Test.Runner.add(mapLoaderTest);
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(noInitialValuesTest);
    Y.Test.Runner.add(findAddressTest);
    Y.Test.Runner.add(locateMeTest);
    Y.Test.Runner.add(APILoadingTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);

    registerTest.name = "Map Location Edit View registration test";
    registerTest.viewType = Y.eZ.MapLocationEditView;
    registerTest.viewKey = "ezgmaplocation";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'editviewregister-tests', 'node-event-simulate', 'ez-maplocation-editview']});

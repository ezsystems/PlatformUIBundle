YUI.add('ez-maplocation-editview-tests', function (Y) {
    var container = Y.one('.container'),
        viewTest, APILoadingTest, mapLoaderTest, registerTest,
        content, contentType,
        mapLoaderLoadingSuccess, mapLoaderLoadingFailure,
        mapLoaderAPILoaded, mapLoaderAPINotLoaded,
        geocodeSuccess, geocodeFailureZeroResults, geocodeFailure,
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
    mapLoaderLoadingFailure = function () {
        var that = this;
        // setTimeout (even with 0 value) will be needed here because we are
        // going to use a node, which is not yet in the DOM
        setTimeout(function () {
            that.fire('mapAPIFailed');
        }, 0);
    };
    mapLoaderAPILoaded = function () {
        return true;
    };
    mapLoaderAPINotLoaded = function () {
        return false;
    };
    geocodeSuccess = function (input, callback) {
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
    };
    geocodeFailureZeroResults = function (input, callback) {
        geocoderInput = input;
        callback(
            false,
            "geocoderStatusZeroResults"
        );
    };
    geocodeFailure = function (input, callback) {
        geocoderInput = input;
        callback(
            false,
            "geocoderStatusSomeOtherError"
        );
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
                    geocode: geocodeSuccess
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

        "Should correctly detect presence of the google maps API": function () {
            var mapLoader = new Y.eZ.MapLocationEditView.GoogleMapAPILoader();
            window.google = {
                maps: {}
            };

            Y.Assert.isTrue(
                mapLoader.isAPILoaded(),
                "GoogleMapAPILoader.isAPILoaded() method should return true, when maps API is present"
            );
        },

        "Should correctly detect absence of the google maps API": function () {
            var mapLoader = new Y.eZ.MapLocationEditView.GoogleMapAPILoader();
            window.google = {};

            Y.Assert.isFalse(
                mapLoader.isAPILoaded(),
                "GoogleMapAPILoader.isAPILoaded() method should return false, when maps API is not present"
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
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
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
        },

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required);
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

                return '<div class="ez-maplocation-map-container"></div>' +
                    '<ul>' +
                    '<li class="is-loading">Longitude: <strong class="ez-maplocation-longitude"></strong>' +
                    '<span class="ez-inline-loader"></span>' +
                    '</li>' +
                    '<li class="is-loading">Latitude: <strong class="ez-maplocation-latitude"></strong>' +
                    '<span class="ez-inline-loader"></span>' +
                    '</li>' +
                    '</ul>';
            };

            this.view.render();
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

            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded = mapLoaderAPILoaded;

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

            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded = mapLoaderAPILoaded;

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
                    geocode: geocodeFailureZeroResults
                };
            };
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded = mapLoaderAPILoaded;

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
                    geocode: geocodeFailure
                };
            };
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded = mapLoaderAPILoaded;

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

            window.google.maps.Geocoder = function () {
                return {
                    geocode: geocodeSuccess
                };
            };
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.isAPILoaded = mapLoaderAPINotLoaded;

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
        },


    });

    APILoadingTest = new Y.Test.Case({
        name: "eZ Map Location View API Loading test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;
            window.google = googleStub;
        },

        tearDown: function () {
            this.view.destroy();
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
        },

        "Test view is handling errors correctly if map API is not loaded properly": function () {
            Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingFailure;

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
            }, 200);
        },

    });

    Y.Test.Runner.setName("eZ Map Location Edit View tests");
    Y.Test.Runner.add(mapLoaderTest);
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(APILoadingTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);

    registerTest.name = "Map Location Edit View registration test";
    registerTest.viewType = Y.eZ.MapLocationEditView;
    registerTest.viewKey = "ezgmaplocation";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'editviewregister-tests', 'node-event-simulate', 'ez-maplocation-editview']});

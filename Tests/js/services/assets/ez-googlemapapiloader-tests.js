/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-googlemapapiloader-tests', function (Y) {
    var mapLoaderTest;

    mapLoaderTest = new Y.Test.Case({
        name: "GoogleMapAPILoader tests",

        setUp: function () {
            this.mapLoader = new Y.eZ.GoogleMapAPILoader();
            window.google = {};
        },

        tearDown: function () {
            delete this.mapLoader;
            delete window.google;
        },

        "Should export an instance under the Y.eZ.services namespace": function () {
            Y.Assert.isInstanceOf(
                Y.eZ.GoogleMapAPILoader,
                Y.eZ.services.mapAPILoader,
                "The ez-googlemapapiloader module should create an instance"
            );
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
            Y.Assert.isFalse(
                this.mapLoader.isAPILoaded(),
                "GoogleMapAPILoader.isAPILoaded() method should return false, when maps API is not present"
            );
        },

        "Should fire 'mapAPIready' when trying to load maps API, but it is already loaded": function () {
            var mapLoadedFired = false;

            window.google = {
                maps: {}
            };

            this.mapLoader = new Y.eZ.GoogleMapAPILoader();
            this.mapLoader.on('mapAPIReady', function () {
                mapLoadedFired = true;
            });

            this.mapLoader.load();

            Y.Assert.isTrue(
                mapLoadedFired,
                "'mapAPIready' should have been fired during loading, when maps API is present"
            );
        },

        "Should call JSONRequestConstructor with correct arguments while trying to load map API": function () {
            var JSONRequestUrl = "",
                JSONRequestConfig = {},
                JSONPStub = function (requestUrl, requestConfig) {
                    this.send = function () {};
                    JSONRequestUrl = requestUrl;
                    JSONRequestConfig = requestConfig;
                };

            this.mapLoader = new Y.eZ.GoogleMapAPILoader(JSONPStub);
            this.mapLoader.load();

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
                    this.send = function () {};
                    requestConfig.on.success();
                };

            this.mapLoader = new Y.eZ.GoogleMapAPILoader(JSONPStub);
            this.mapLoader.on('mapAPIReady', function () {
                mapLoadedFired = true;
            });

            this.mapLoader.load();

            Y.Assert.isTrue(
                mapLoadedFired,
                "'mapAPIready' should have been fired on successfull maps API load"
            );
        },

        "Should fire 'mapAPIFailed' when map API loading have failed": function () {
            var mapFailedFired = false,
                JSONPStub = function (requestUrl, requestConfig) {
                    this.send = function () {};
                    requestConfig.on.failure();
                };

            this.mapLoader = new Y.eZ.GoogleMapAPILoader(JSONPStub);
            this.mapLoader.on('mapAPIFailed', function () {
                mapFailedFired = true;
            });

            this.mapLoader.load();

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

            this.mapLoader = new Y.eZ.GoogleMapAPILoader(JSONPStub);
            this.mapLoader.on('mapAPIReady', function () {
                mapLoadedFired = true;
            });

            this.mapLoader._isLoading = true;
            this.mapLoader.load();

            Y.Assert.isFalse(
                mapLoadedFired,
                "Loading should have been stopped if the '_isLoading' flag is set to true"
            );
        }


    });

    Y.Test.Runner.setName("eZ Google Map API Loader tests");
    Y.Test.Runner.add(mapLoaderTest);

}, '', {requires: ['test', 'ez-googlemapapiloader']});

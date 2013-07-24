YUI.add('model-tests', function (Y) {

    Y.namespace('eZ');

    /**
     * Test methods used by the all model tests
     */
    var modelTests = {
        "Sync 'read' should load the content with CAPI": function () {
            var m = this.model,
                modelId = "/api/v2/ezp/model/mid",
                callback = function () { };

            Y.Mock.expect(this.capiMock, {
                method: this.capiGetService,
                returns: this.serviceMock
            });
            Y.Mock.expect(this.serviceMock, {
                method: this.serviceLoad,
                args: [
                    modelId,
                    callback
                ]
            });

            m.set('id', modelId);
            m.sync('read', {
                    api: this.capiMock
                }, callback
            );

            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.serviceMock);
        },

        "Sync action other than 'read' are not supported": function () {
            var m = this.model, called = false,
                callback = function (err) {
                    called = true;
                    Y.assert(err, "The 'err' param of the callback should be set to a truthy value");
                };

            m.sync('create', {api: this.capiMock}, callback);
            Y.assert(called, "The callback should have been called");
        },
        
        "parse should return null and fire the error event on JSON parse error": function () {
            var m = this.model,
                response, res = false,
                errorFired = false;

            response = {
                body: "{invalid json string"
            };

            m.on('error', function (e) {
                errorFired = true;

                Y.Assert.areEqual('parse', e.src, "'src' property should set to 'parse'");
                Y.Assert.isString(e.error, "'error' property should set to a string");
                Y.Assert.areSame(response, e.response, "'response' property should be set to the response that failed to be parsed");
            });

            res = m.parse(response);

            Y.Assert.isTrue(errorFired, "The error event should been fired");
            Y.Assert.isNull(res, "The result of parse should be null");
        },

        "parse should return a correctly parsed hash": function () {
            var m = this.model,
                response, res = false,
                errorFired = false, key, identifier, i, len, linksMap;

            response = {
                body: Y.JSON.stringify(this.loadResponse)
            };

            m.on('error', function (e) {
                errorFired = true;
            });

            res = m.parse(response);

            Y.Assert.isFalse(errorFired, "The error event should not have been fired");

            Y.Assert.areEqual(Y.Object.size(res), this.model.constructor.ATTRS_REST_MAP.length + 1);
            for (i = 0, len = this.model.constructor.ATTRS_REST_MAP.length; i != len; ++i) {
                key = this.model.constructor.ATTRS_REST_MAP[i];

                if ( Y.Lang.isString(key) ) {
                    identifier = key;
                } else if ( Y.Lang.isObject(key) ) {
                    identifier = Y.Object.keys(key)[0];
                    key = key[identifier];
                }
                Y.Assert.areEqual(
                    res[identifier],
                    this.loadResponse[this.rootProperty][key],
                    identifier + " should have been set to the value of this.loadResponse." +
                        this.rootProperty + "." + key + "('" +
                        this.loadResponse[this.rootProperty][key]  +"')"
                );
            }
            linksMap = this.model.constructor.LINKS_MAP ? this.model.constructor.LINKS_MAP : [];
            Y.Assert.areEqual(Y.Object.size(res.resources), linksMap.length, "resources length");
            for (i = 0, len = linksMap.length; i != len; ++i) {
                key = linksMap[i];
                Y.Assert.areEqual(
                    res.resources[key],
                    this.loadResponse[this.rootProperty][key]._href
                );
            }
        }
    };

    Y.eZ.ModelTest  = Y.mix(Y.Test.Case, modelTests, false, undefined, 4, true);

});

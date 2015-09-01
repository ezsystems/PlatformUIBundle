/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('model-tests', function (Y) {
    Y.namespace('eZ.Test');

    /**
     * Test methods used by the all model tests
     */
    var modelTests = {
        _getRootStructure: function () {
            var props = this.rootProperty.split("."),
                root = this.loadResponse, i = 0;

            for (i = 0; i != props.length; i++) {
                root = root[props[i]];
            }
            return root;
        },

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

        _testUnsupportedSyncOperation: function (operation) {
            var m = this.model, called = false,
                callback = function (err) {
                    called = true;
                    Y.assert(err, "The 'err' param of the callback should be set to a truthy value");
                };

            m.sync(operation, {api: this.capiMock}, callback);
            Y.assert(called, "The callback should have been called");
        },

        "Test unsupported sync action": function () {
            this._testUnsupportedSyncOperation('run');
        },

        "parse should return a correctly parsed hash": function () {
            var m = this.model,
                response, res = false,
                errorFired = false, key, identifier, i, len;

            response = {
                document: this.loadResponse
            };

            m.on('error', function (e) {
                errorFired = true;
            });

            res = m.parse(response);

            Y.Assert.isFalse(errorFired, "The error event should not have been fired");

            Y.Assert.areEqual(
                this.parsedAttributeNumber,
                Y.Object.size(res),
                "Parsed result doesn't match the provided attribute number"
            );
            for (i = 0, len = this.model.constructor.ATTRS_REST_MAP.length; i != len; ++i) {
                key = this.model.constructor.ATTRS_REST_MAP[i];

                if ( Y.Lang.isString(key) ) {
                    identifier = key;
                } else if ( Y.Lang.isObject(key) ) {
                    identifier = Y.Object.keys(key)[0];
                    key = key[identifier];
                }
                if ( Y.Lang.isObject(res[key]) ) {
                    // this not very clean but in this case this working as
                    // expect since we are testing a JSON parse method
                    Y.Assert.areEqual(
                        Y.JSON.stringify(res[key]),
                        Y.JSON.stringify(this._getRootStructure()[identifier]),
                        key + " should have been set to the value of this.loadResponse." +
                            this.rootProperty + "." + identifier
                    );
                } else {
                    Y.Assert.areEqual(
                        res[key],
                        this._getRootStructure()[identifier],
                        key + " should have been set to the value of this.loadResponse." +
                            this.rootProperty + "." + identifier + "('" +
                            this._getRootStructure()[identifier]  +"')"
                    );
                }
            }
        },

        "parse should set the correct links": function () {
            var m = this.model,
                response, res = false,
                errorFired = false, key, i, len, linksMap;

            response = {
                document: this.loadResponse
            };

            m.on('error', function (e) {
                errorFired = true;
            });

            res = m.parse(response);

            Y.Assert.isFalse(errorFired, "The error event should not have been fired");

            linksMap = this.model.constructor.LINKS_MAP ? this.model.constructor.LINKS_MAP: [];
            Y.Assert.areEqual(
                linksMap.length,
                Y.Object.size(res.resources),
                "resources length"
            );
            for (i = 0, len = linksMap.length; i != len; ++i) {
                key = linksMap[i];
                Y.Assert.areEqual(
                    res.resources[key],
                    this._getRootStructure()[key]._href
                );
            }
        }
    };

    Y.eZ.Test.ModelTests = modelTests;

});

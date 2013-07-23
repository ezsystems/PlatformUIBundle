YUI.add('ez-restmodel-tests', function (Y) {

    var modelTest,
        Model;

    Model = Y.Base.create('testModel', Y.eZ.RestModel, [], {
        parse: function (struct) {
            return this._parseStruct(struct);
        }

    }, {
        ATTRS: {
            name: {
                value: ""
            },
            newIdName: {
                value: 0
            },
            bool: {
                setter: '_setterBoolean',
                value: false
            },
            date: {
                setter: '_setterDate',
                value: new Date(0)
            },
            localized: {
                setter: '_setterLocalizedValue',
                value: {}
            }
        },
        ATTRS_REST_MAP: [
            "name", {"restId": "newIdName"}
        ],
        LINKS_MAP: [
            'Link1', 'Link2'
        ]
    });

    modelTest = new Y.Test.Case({
        name: "eZ Rest Model tests",

        setUp: function () {
            this.model = new Model();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should convert non boolean value into boolean": function () {
            var m = this.model;

            m.set('bool', 'true');
            Y.Assert.isTrue(m.get('bool'), "'true' should be transformed to true");
            m.set('bool', 'false');
            Y.Assert.isFalse(m.get('bool'), "'false' should be transformed to false");
            m.set('bool', {});
            Y.Assert.isFalse(m.get('bool'), "{} should be transformed to false");
        },

        "Should keep boolean value": function () {
            var m = this.model;

            m.set('bool', true);
            Y.Assert.isTrue(m.get('bool'), "bool should stay true");
            m.set('bool', false);
            Y.Assert.isFalse(m.get('bool'), "bool should stay false");
        },

        "Should keep date value": function () {
            var m = this.model,
                now = new Date();

            m.set('date', now);
            Y.Assert.areSame(m.get('date'), now);
        },

        "Should convert to date": function () {
            var m = this.model,
                ts = 1000000;

            m.set('date', ts);
            Y.Assert.isInstanceOf(Date, m.get('date'));
            Y.Assert.areEqual(+m.get('date'), ts);
        },

        "Should transform a localized value": function () {
            var m = this.model,
                val = {
                    value: [{
                        '_languageCode': 'fre-FR',
                        '#text': "La guerre des étoiles"
                    }, {
                        '_languageCode': 'eng-GB',
                        '#text': 'Star wars'
                    }]
                };
            m.set('localized', val);
            Y.Assert.areEqual(Y.Object.keys(m.get('localized')).length, 2, "Should have 2 localized value");
            Y.Assert.areEqual(m.get('localized')["eng-GB"], "Star wars");
            Y.Assert.areEqual(m.get('localized')["fre-FR"], "La guerre des étoiles");
        },

        "Should not set invalid localized value": function () {
            var m = this.model,
                val1 = 1,
                val2 = [{
                    '_languageCode': 'fre-FR',
                    '#text': "La guerre des étoiles"
                }, {
                    '_languageCode': 'eng-GB',
                    '#text': 'Star wars'
                }];
            m.set('localized', val1);
            Y.Assert.areEqual(Y.Object.keys(m.get('localized')).length, 0, "Should keep the default value");

            m.set('localized', val2);
            Y.Assert.areEqual(Y.Object.keys(m.get('localized')).length, 0, "Should keep the default value");
        },
        "Should map the rest struct": function () {
            var m = this.model,
                struct = {
                    "name": "My name",
                    "restId": 42,
                    "notParsed": false
                };

            m.setAttrs(m.parse(struct));
            Y.Assert.isUndefined(
                m.get('notParsed'),
                "'notParsed' property should not be parsed/imported"
            );
            Y.Assert.areSame(
                m.get('name'),
                struct.name,
                "'name' should be imported"
            );
            Y.Assert.areSame(
                m.get('newIdName'),
                struct.restId,
                "'restId' should be imported as newIdName"
            );
        },

        "Should import the links": function () {
            var m = this.model,
                struct = {
                    Link1: {
                        _href: "/link1"
                    },
                    Link2: {
                        _href: "/link2"
                    },
                    Link3: {
                        _href: "/link3"
                    }
                };
            m.setAttrs(m.parse(struct));

            Y.Assert.areEqual(
                Model.LINKS_MAP.length,
                Y.Object.size(m.get('resources')),
                "Should have " + Model.LINKS_MAP.length + " resources"
            );
            Y.Assert.areEqual(
                "/link1",
                m.get('resources').Link1,
                "Link1 does not have the correct value (/links1)"
            );
            Y.Assert.areEqual(
                "/link2",
                m.get('resources').Link2,
                "Link2 does not have the correct value (/links2)"
            );
            Y.Assert.isUndefined(
                m.get('resources').Link3,
                "Link3 should not be imported"
            );
        }
        

    });

    Y.Test.Runner.setName("eZ Rest Model tests");
    Y.Test.Runner.add(modelTest);

}, '0.0.1', {requires: ['test', 'ez-restmodel']});

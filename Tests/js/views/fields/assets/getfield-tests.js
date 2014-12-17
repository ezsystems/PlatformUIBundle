/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('getfield-tests', function (Y) {
    Y.namespace('eZ.Test');

    var L = Y.Lang;

    Y.eZ.Test.GetFieldTests = {
        name: "getField Tests",

        setUp: function () {
            if ( !this.content ) {
                this.content = new Y.Mock();
                Y.Mock.expect(this.content, {
                    method: 'toJSON',
                    returns: {}
                });
            }
            if ( !this.contentType ) {
                this.contentType = new Y.Mock();
                Y.Mock.expect(this.contentType, {
                    method: 'toJSON',
                    returns: {}
                });
            }
            if ( !this.version ) {
                this.version = new Y.Mock();
                Y.Mock.expect(this.version, {
                    method: 'toJSON',
                    returns: {}
                });
            }
            if ( L.isUndefined(this.fieldValue) ) {
                this.fieldValue = "";
            }

            this.view = new this.ViewConstructor({
                container: '.container',
                field: {
                    fieldDefinitionIdentifier: "name",
                    id: 186,
                    fieldValue: this.fieldValue,
                    languageCode: "eng-GB"
                },
                fieldDefinition: this.fieldDefinition,
                content: this.content,
                version: this.version,
                contentType: this.contentType
            });
            this._afterSetup();
        },

        _afterSetup: function () {
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            this._afterTearnDown();
        },

        _afterTearnDown: function () {
        },

        _assertCorrectFieldValue: function (fieldValue, msg) {
            Y.Assert.areSame(this.newValue, fieldValue, msg);
        },

        _setNewValue: function () {
            this.view.get('container').one('input').set('value', this.newValue);
        },

        "Test getField": function () {
            var updatedField;

            this.view.render();
            this._setNewValue();

            updatedField = this.view.getField();

            Y.Assert.areNotSame(
                this.view.get('field'), updatedField,
                "getField should 'clone' the original field"
            );

            Y.Object.each(this.view.get('field'), function (val, key) {
                if ( key !== 'fieldValue' ) {
                    Y.Assert.areEqual(
                        val, updatedField[key],
                        "The property " + key + " should be kept"
                    );
                } else {
                    this._assertCorrectFieldValue(
                        updatedField.fieldValue,
                        "The new value should be available in the fieldValue"
                    );
                }
            }, this);
        },

    };
});

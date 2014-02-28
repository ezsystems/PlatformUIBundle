YUI.add('getfield-tests', function (Y) {
    Y.namespace('eZ.Test');

    Y.eZ.Test.GetFieldTests = {
        name: "getField Tests",

        setUp: function () {
            var content, contentType;

            content = new Y.Mock();
            contentType = new Y.Mock();
            Y.Mock.expect(content, {
                method: 'toJSON',
                returns: {}
            });
            Y.Mock.expect(contentType, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new this.ViewConstructor({
                container: '.container',
                field: {
                    fieldDefinitionIdentifier: "name",
                    id: 186,
                    fieldValue: "",
                    languageCode: "eng-GB"
                },
                fieldDefinition: this.fieldDefinition,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
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

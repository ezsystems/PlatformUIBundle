YUI.add('ez-maplocation-editview-tests', function (Y) {
    var container, viewTest, registerTest,
        content, contentType,
        mapLoaderLoadingSuccess, mapLoaderLoadingFailure,
        jsonContent = {}, jsonContentType = {},
        field = {};

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
        console.log('should fire googleMapAPIReady');


        this.fire.call(this, 'googleMapAPIReady');


//        Y.eZ.MapLocationEditView.GoogleMapAPILoader.fire.call(this, 'googleMapAPIReady');
    };
    mapLoaderLoadingFailure = function () {
        console.log('should fire googleMapAPIFailed');
    }
    Y.eZ.MapLocationEditView.GoogleMapAPILoader.prototype.load = mapLoaderLoadingSuccess;

    viewTest = new Y.Test.Case({
        name: "eZ Map Location View test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {

            Y.one('body').append('<div class="container"></div>');
            container = Y.one('.container');

            this.view = new Y.eZ.MapLocationEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy({remove: true});
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

                return '';
            };
            this.view.render();
        },

        "Test variables for required URL field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test variables for not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test map initialization on successfull google maps API loading": function () {
            var fieldDefinition = this._getFieldDefinition(false);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();




        },

    });

    Y.Test.Runner.setName("eZ Map Location Edit View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);

    registerTest.name = "Map Location Edit View registration test";
    registerTest.viewType = Y.eZ.MapLocationEditView;
    registerTest.viewKey = "ezgmaplocation";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'editviewregister-tests', 'ez-maplocation-editview']});

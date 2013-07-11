YUI.add('ez-editorialapp-tests', function (Y) {

    var app, appTest, container = Y.one('.app'), docHeight = container.get('docHeight');

    app  = new Y.eZ.EditorialApp({
        container: '.app',
        viewContainer: '.view-container'
    });
    app.render();

    appTest = new Y.Test.Case({
        name: "eZ Editorial App tests",

        "Should open the application": function () {

            app.open({}, {}, function () { });
            Y.assert(
                container.hasClass('is-app-open'),
                "The app container should have the class is-app-open"
            );
            Y.Assert.areEqual(
                app.get('viewContainer').getStyle('height').replace('px', ''),
                docHeight,
                "The view container should have the same height as the document"
            );
        },

        "Should close the application": function () {
            app.close();

            this.wait(function () {
                Y.assert(
                    !container.hasClass('is-app-open'),
                    "The app container should not have the class is-app-open"
                );

                Y.Assert.areEqual(
                    container.getStyle('transform'),
                    'none',
                    "The container should have 'none' as transform"
                );

                Y.Assert.areEqual(
                    app.get('viewContainer').getStyle('height'),
                    'auto',
                    "The view container should have 'auto' as height"
                );
            }, 400);
        },

        "Should open again the application": function () {
            this["Should open the application"]();
        },


        "Should close again the application": function () {
            this["Should close the application"]();
        },

        "Should close the application when contentEditView:close event is fired": function () {
            app.open(null, null, function () { });

            app.fire('contentEditView:close');

            this.wait(function () {
                Y.assert(
                    !container.hasClass('is-app-open'),
                    "The app container should not have the class is-app-open"
                );
            }, 400);
        }
    });

    Y.Test.Runner.setName("eZ Editorial App tests");
    Y.Test.Runner.add(appTest);


}, '0.0.1', {requires: ['test', 'ez-editorialapp']});

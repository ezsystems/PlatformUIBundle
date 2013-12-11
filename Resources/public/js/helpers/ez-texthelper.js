YUI.add('ez-texthelper', function (Y) {
    var win = Y.config.win;

    Y.Handlebars.registerHelper('urlEncode', function (txt) {
        return win.encodeURIComponent(txt);
    });

});

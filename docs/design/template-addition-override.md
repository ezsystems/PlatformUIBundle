# Adding or overriding templates in the PlatformUI Application

* Author: Damien Pobel <dp@ez.no>
* Created: 2014-09-04
* JIRA: https://jira.ez.no/browse/EZP-23199
* Status: Draft

## Context

The PlatformUIBundle provides a web application based on the YUI Library. The
user interface is generated *via* a set of views. While it's not mandatory, every
view makes use of a string based templates which is stored in the HTML page.
Each template code is embedded in a `script̀` tag with a custom `type` attribute
and a forged `id` so that the application can load the correct template for a
given view.

Even though this is working, this strategy and the way it is implemented have
some limitations:

1. Scalability: There are currently 34 `script` tags in the *shell* page of the
   PlatformUI application and this list is growing with the new features. The
   version 1.0 of the application would easily require more than 100 templates
   and with some extensions this number will easily grow.
2. Twig vs. Handlebars: for now the Handlebars templates are stored as
   *verbatim* text in the Twig templates. This prevents us from [pre-compiling the
   templates](http://handlebarsjs.com/precompilation.html) to avoid this step in
   the browser and that's not very handy for the developer.
3. Extensibility: for now, there's no way to add new templates in the
   application and the only way to override an existing template is to make a
   bundle inheriting from the PlatformUIBundle
4. Performances: in addition to the pre-compiling issue mentioned above, by
   embedding the templates in the HTML page running the application, there's no
   way to have a reliable and efficient usage of the HTTP cache.


## Template as module

To solve (or open doors to solve) those issues, the templates should be defined
as YUI modules. This way the template can be added as a dependency of the
view(s) which need(s) it and it can be automatically loaded when required.

Example:

The `Y.eZ.BarView` component uses the following template code:

```jinja
{% verbatim %}
<menu class="ez-actions-list active-actions" tabindex="0">
</menu>
<button class="view-more-button is-hidden">{{ viewMoreText }}</button>
<menu class="ez-actions-list view-more-actions is-hidden">
</menu>
{% endverbatim %}
```

which is rendered in the shell page as:

```html
<script type="text/x-handlebars-template" id="barview-ez-template">
<menu class="ez-actions-list active-actions" tabindex="0">
</menu>
<button class="view-more-button is-hidden">{{ viewMoreText }}</button>
<menu class="ez-actions-list view-more-actions is-hidden">
</menu>
</script>
```

The application would use a YUI modules like:

```js
YUI.add('ez-barview-template', function (Y) {
    var templateCode = "<menu class="ez-actions-list active-actions" tabindex="0">\
</menu>\
<button class="view-more-button is-hidden">{{ viewMoreText }}</button>\
<menu class="ez-actions-list view-more-actions is-hidden">\
</menu>";

    Y.Template.register('barview-ez-template', templateCode);
});
```

and then the `ez-barview-template` module should be added as a dependency to the
`ez-barview` module (or any other that uses the same template).

Using this strategy solves the scalability, extensibility and a part of the
performances issues.

Remains the *Twig vs. Handlebars* issue which then becomes a *JavaScript vs.
Handlebars* issue with the same results.

## Automatic Handlebars to YUI module conversion

The operation of wrapping the Handlebars template in a YUI module can be done
automatically by adopting a strategy similar to what Assetic is doing to
optimize the CSS or the JavaScript files.

1. On the disk, the templates are stored as plain Handlebars templates
2. In the `yui.yml` file, the template module refers to the Handlebars template
   and the module is configured with `type: template`
3. While generating the template module URL, it is dynamically rewritten to
   `/template/handlebars/<module_name>.js`
    * in "dev" environment, this triggers a custom controller that automatically
      wraps the file content a YUI module
    * in "prod" environment, the YUI template module should be written on the
      disk
4. Optionally, in the "prod" environment and if the requirement are met (node
   and handlebars CLI are set up), the template can be pre-compiled.  


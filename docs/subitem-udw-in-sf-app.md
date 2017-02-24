# Reuse PlatformUI 1.x YUI based components in PlatformUI 2.x

* status: draft
* author: dp@ez.no

## Idea

Expose some YUI based component as WebComponents. Relying on 1.x code would then
be a temporary solution and progressively we can get rid of YUI based code while
still keeping the WebComponents. Said in other words, the custom element serves
as a public api (hiding implementation details for those consuming them).

### Example

```twig
{# Twig template to view a Content / Location #}
<h1>{{ content.name }}</h1>

<!-- ... -->

{# Here I want to render the subitem of the current Location #}
{# I just generate a ez-subitem with some attributes tag like any other HTML tag #}
<ez-subitem
    parent-location-id="{{ path( 'ezpublish_rest_loadLocation', location ) }}"
    ></ez-subitem-list>
```

### Reasonning

* Standardized technology
* From server side POV, easy to generate, since those would be a tag almost like
  any other. Attributes of the component would be the main public API of the
  element used to define its state.
* Completely hides the internal of the components so that the code can change
  easily provided we respect the component public API (attributes and exposed
  methods).

## Components

### Subitem

#### Features

* asynchronously load and display the subitems :)
* navigation (click on a Location to view it)
* edit priority

#### Interactions

* when changing Location's sort field and/or sort order, the list is updated

#### API

##### Markup

This component is mostly declarative. It only needs the parent Location id of
the subitem to render.

Since PlatformUI 1.x is based on the REST API, it only handles REST id ie
resource URL in the REST API for a given domain object. So in the easiest
solution would be to pass the *REST Location id* to the component, like:

```xml
<ez-subitem
    parent-location-id="/api/ezp/v2/content/locations/1/43/51/59/73/74"
    ></ez-subitem-list>
```

This URI can be easily generated with the Twig `path` template function.

If we find an easy and efficient way of doing that internally in the component,
the markup could become:

```xml
<ez-subitem parent-location-id="74"></ez-subitem-list>
```

##### Public API

The subitem list is supposed to be refreshed if the Location sort field and/or
sort order are changed. If this is happening without a full page refresh, the
`ez-subitem` has to provide a `refresh` public method for that, which could be
used in the following way:

```js
// Location sort order has just been updated with the REST API for instance
const subitem = document.querySelector('ez-subitem'); // or any other way to retrieve it

subitem.refresh();
```

### Universal Discovery Widget (UDW)

#### Features

* allow to pick a Content/Location in the Repository
* can be triggered from anywhere
* is supposed to appear on top of anything

Note: In the current implementation, the UDW is unique but some usecases kind of
require to be able to stack *UDW session* (See tasks list in
https://github.com/ezsystems/PlatformUIBundle/pull/674)

#### Interaction

* when the selection is confirmed by the editor, this selection should be used
  by a `confirmHandler` function. In 1.x, the selection contains 4 objects:
    1. the Location model
    1. the ContentInfo model
    1. the Content model
    1. the Content Type model
* if the editor cancels the *UDW session*, a `cancelHandler` function is
  supposed to be executed as well.

#### API

##### Calling the UDW

When designed as a Web Component, the UDW could be triggered in several ways:

1. As the 1.x version, UDW could be available in the page and it could listen
   for a custom event which would provide the configuration the UDW session and
   the `confirmHandler` and `cancelHandler` functions.
1. Alternatively, another component in the page (the app ?) could be responsible
   for dynamically create a UDW tag in the DOM under certain conditions (an
   event or by calling a public method) which could do something like:
   ```js
    let udw = document.createElement('ez-universaldiscoverywidget');

    udw.multiple = false;
    udw.startingLocationId = 42;
    udw.onconfirm = function (selection) {
        aConfirmHandleFunction.call(this, selection);
        udw.parentNode.remove(udw);
    };
    udw.oncancel = function () {
        aCancelHandlerFunction.apply(udw);
        udw.parentNode.remove(udw);
    };
    document.body.appendChild(udw);
    ```

The second strategy has the benefit of better defining the responsibility, it
would also ease the ability to have several stacked UDW running at the same
time. On the other hand, it's very different strategy compared to the 1.x UDW so
it might be challenging to adopt such approach.

##### UDW Selection

The UDW selection is provided to the confirm handler when the user confirms the
selection. In 1.x, a selection is an object containing 4 model objects. Those
objects are build based on a YUI model class so they can not be kept in the
process of getting rid of YUI. As a result, somewhere in the black boxing, those
model object will have to be transformed to a YUI free representation. This
representation could be a port of the Public API Value Object which would have
the benefit of the consistency with the PHP Public API.

## Technical considerations

### Where's the app object ?

The goal of this project is to extract some components (UDW, Subitem, ...) from
a larger system to make them act as if they were independant. But internally,
those components will still use the whole system ie the `eZ.PlatformUIApp` and
its dependencies. This brings the question of how the components exposed as
WebComponent will access the app.

Internally, we might need a *fake* app object to provide at least the JavaScript
REST Client instance and most likely others things ? Maybe, we also need to
replicate others types of components (View Services or even top level view).

Alternatively, maybe the complete `eZ.PlatformUIApp` could be embedded but in a
kind of *disabled* mode where it would only provide the necessary pieces for the
components to work without side effects.

In any case, this app object is central to every component, so we need to see
how those components can share such object unless each component has its own app
object.

## Implementation

### How does this work ?

#### eZ.PlatformUI instance

Behind the scene a `eZ.PlatformUI` object created like it is done when running
PlatformUI 1.x. This is done in an HTML document that is supposed to be imported
with an HTML import tag (`<link rel="import">`. This allows to make sure there's
only one app object shared by the components we integrate in the page.

The HTML document defining the app is dynamically generated by Symfony because
the app object needs some parameters (session info, various ids, ...). In the
current code base, it is available under `/webcomponents/ez-yui-app.html`. To
make sure the components work in any URI matching configuration, this should be
referenced with a relative URI, so if your component is defined in
`bundles/ezplatformui/webcomponents/ez-mycomponent.html`, the app document
should be imported with:

```html
<link rel="import" href="../../../webcomponents/ez-yui-app.html">
```

The app creation is asynchronous since the YUI components are still loaded with
the YUI loader. When the app is ready, it is registered under the global
namespace `eZ.YUI` together with the `Y` object which allows to access any
class defined in the YUI code base. To ease the detection of the app readyness,
a custom event called `ez:yui-app-ready` is dispatched by the app document on
the main document object. As a result, a component using the app behind the
scene should both check the global namespace and the event, that way it would
work no matter if the app is already created and ready or not. In terms of code,
this is done with something like:


```js
// somewhere in the component
if ( eZ.YUI ) {
    // app is ready and available under eZ.YUI.app
    this._doSomething();
    return;
}
// otherwise just wait for the app to be ready
document.addEventListener('ez:yui-app:ready', this._doSomething.bind(this));
```

For now, the app is the regular `eZ.PlatformUI` (with 2 new methods see below)
but to avoid side effects and uneeded features, the app would probably have to
be limited/cleaned up.

#### Render a view

For that purpose, the `eZ.PlatformUI` has a `renderView` method. It expects 4
parameters:

* the constructor function of the view to render
* the constructor function of the view service that will provide the parameters
  to the view
* a parameter object
* a callback that will be executed with an error parameter, the view service
  instance and the view instance.

This method somehow imitates what is happening when a route is matched in
`eZ.PlatformUI` and how the view service and view are instantiated. So the view
service will be instantiated, its `load` method will be executed, the view will
also be instantiated and it will receive the parameters returned by the view
service `getViewParameters`.

The parameter object should contain the request parameters the view service is
expecting to find the request. For instance, if a view service was written to
handle a request with an URL like `/route/:param1/:param2`, it expects the
request parameters to contain the parameters `param1` and `param2`. In such
case, `renderView` should be used in the following way:

```js
app.renderView(
    Y.eZ.MyView,
    Y.eZ.MyViewService,
    {param1: 'foo', param2: 'bar'},
    function (err, viewService, view) {
        if (err) {
            // there was an error
            return;
        }
        // view can be used and especially view.get('container') can imported
        // in the document. After that, most likely the view will need to be set
        // as active. This is supposed to be made after the view container has
        // been added to the DOM.
    }
);
```

#### Render a side view

In the app, a side view is a bit different from a *regular* view. As a result,
the app also gets a new method called `renderSideView` to render such a view. It
also expects 4 parameters which are similar to `renderView`. The main difference
is on the parameter object which in the case of a side view, is passed to the
side view service `parameters` attribute.

For the rest, `renderSideView` is used in the same way `renderView`.

#### Custom elements

The component we want to reuse are exposed as custom element called
`ez-something`. Those elements are build based on Polymer 2.0 which is preview.

### Subitem

For the subitem, the patch defines a `ez-subitem` custom element. This component
expects a `parent-location-id` to be set with the parent Location REST id:

```html
<ez-subitem parent-location-id="/api/ezp/v2/content/locations/1/2">
    Loading subitems...
</ez-subitem>
```

In the web component, this is basically translated into:

```js
app.renderView(
    Y.eZ.SubitemBoxView,
    Y.eZ.LocationViewViewService,
    params,
    this._attachView.bind(this)
);
```

We can use `eZ.LocationViewViewService` to *feed* the `eZ.SubitemBoxView`
because this view expects almost the same parameters as the
`eZ.LocationViewView` (the view for which `eZ.LocationViewViewService` was
written). But this is not optimal, mainly because this view service also loads
the parent Location path while this is not needed here. So for a real solution,
the custom view service should be created. This would also allow to pass the
Location id rather than the REST Location id.

To fully work, `eZ.SubitemBoxView` (actually some of its subviews) needed some
changes because the navigation to subitem relied on a regular link generated for
PlatformUI 1.x. The solution there was to catch click (*tap*) to transform those
to a `navigateTo` event containing the Content and Location YUI models. That
way, the `ez-subitem` can internally track such event and transform it to
another custom event (a DOM one this time), the Hybrid app can understand. This
operation also involves transforming the YUI model object to a YUI free
representation. For now, this is done with `toJSON`.

### UDW

For the UDW, the patch defines a `ez-universaldiscoverywidget` custom element.
Unlike the Subitem, this custom element is supposed to be dynamically created
only a UDW is needed. This component expects several attribute to be set and
actually most of the `ez-universaldiscoverywidget` is about transforming the
attributes so the YUI base `eZ.UniversalDiscoveryView` and
`eZ.UniversalDiscoveryViewService` can handle them.

### What is missing ?

This patch demonstrates it is possible to reuse YUI based component in a Symfony
based application. But it also raises several questions/missing elements:

* this was tested only in Chrome. For others browsers, some polyfill are needed
  but not yet added to the prototype.
* the SubitemBoxView needs a custom view service to only receive the parameters
  it needs.
* SubitemBoxView does not expose a `refresh` method as a result, it's not
  possible to refresh the Subitem list. Such method should be added so that
  `ez-subitem` can expose a `refresh` method.
* the YUI free representation of Content/Location (and others models maybe) has
  to be defined. A port of the PHP Pulic API ValueObject seem to be the right
  solution if that's technically possible.
* the integration of the UDW is incomplete and needs some additonal thinking to
  offer a better API (events instead of onconfirm, oncancel, is-selectable for
  instance).
* CSS: the stylesheets are added like it is done in PlatformUI 1.x. There are of
  course too many CSS files and doing that also means the component can not use
  the Shadow DOM while it could be a good solution to completely hide the
  implementation.

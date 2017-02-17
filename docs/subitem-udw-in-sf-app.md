# Reuse PlatformUI 1.x YUI based components in PlatformUI 2.x

* status: draft
* author: dp@ez.no

## Idea

Expose some YUI based component as WebComponents. Relying on 1.x code would then
be a temporary solution and progressively we can get rid of YUI based code while
still keeping the WebComponents. Other said, the custom element would become a
public API to use those components.

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

Internally, we might need a *fake* app object to provide at least the JavaScript
REST Client instance and most likely others things ? Maybe, we also need to
replicate others types of components (View Services or even top level view).

Alternatively, maybe the complete `eZ.PlatformUIApp` could be embedded but in a
kind of *disabled* mode where it would only provide the necessary pieces for the
components to work without side effects.

In any case, this app object is central to every component, so we need to see
how those components can share such object unless each component has its own app
object.

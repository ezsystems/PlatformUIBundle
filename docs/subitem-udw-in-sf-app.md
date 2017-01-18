# Reuse PlatformUI 1.x YUI based components in PlatformUI 2.x

* status: draft
* author: dp@ez.no

## Idea

Expose some YUI Based component in WebComponents. Relying on 1.x code would then
be a temporary solution and progressively we can get rid of YUI based code while
still keeping the WebComponents. Other said, the custom element would become a
public API to use those components.

### Example

```twig
{# Twig template to view a Content / Location #}
<h1>{{ content.name }}</h1>

<!-- ... -->

{# Here I want to render the subitem of the current Location #}
{# I just generate a ez-subitem-list with some attributes tag like any other HTML tag #}
<ez-subitem-list
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

### SubitemList

#### Features

* asynchronously load and display the subitems :)
* navigation (click on a Location to view it)
* display of thumbnails
* edit priority

#### Interactions

* when changing Location's sort field and/or sort order, the list is updated

#### API

TODO

#### Example

TODO

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
  by a `confirmHandler` function.
* if the editor cancels the *UDW session*, a `cancelHandler` function is
  supposed to be executed as well.

#### API

TODO

#### Example

TODO

### TreeActonView

#### Features

* display a Tree when clicked
* the Tree itself allows to navigate

#### Interaction

* at the moment, when a operation might change the tree structure (content
  removed, created, updated, moved, ...), the internal treee structure is
  completely discarded so that a new Tree is build and displayed.

Note: this is only needed if the page is not refreshed after the operation.

#### API

TODO

#### Example

TODO

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

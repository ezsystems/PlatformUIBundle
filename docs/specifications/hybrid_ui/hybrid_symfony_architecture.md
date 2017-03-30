# Hybrid Symfony architecture

## Hybrid approach

The Hybrid architecture covers the Admin User Interface client/server interactions.

It combines a symfony based backend application, that uses routes, controllers, twig templates,
with a lightweight frontend application. On the initial loading of the application,
the whole HTML as well as the assets will be loaded. Subsequent interactions will send
AJAX requests that _update_ the application's state.

## Backend architecture

### AppRenderer
The Symfony side of the architecture articulates around an `AppRenderer` and `HybridUiView`.

The `HybridUiView` will be built by the controller matched by the router. Like any MVC
View, it has a template and an array of parameters. In addition, it stores a title and
allows to enable toolbars.

As any MVC View, it will get rendered to a Response by the `ViewRendererListener`.
**This is actually broken. We need a HybridViewRenderer**.

On `kernel.response`, the Renderer will run sub-requests on the toolbars and navigationHub
controllers to get the Response for those elements.

Depending on the Request (update / full), the main response (rendered from the Hybrid View)
and the navigation hub and toolbar responses are combined either as a JSON response or a
regular one. The regular response is based on the `app.html.twig` template, that extends
`proto.html.twig`.

### Content views handling
Content views are handled by configuring a general override template and controller for the
admin siteaccess (see below).


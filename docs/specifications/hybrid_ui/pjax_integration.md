# Hybrid UI PJAX integration

## About PJAX

PJAX is the protocol used by PlatformUI to integrate Symfony features.

It relies on AJAX requests sent by the application with an `x-pjax` header, where
responses are structured HTML files:

```html
<div data-name="title">Response title</div>

<div data-name="html">
    <header class="ez-page-header">
        <nav class="ez-breadcrumbs">breadcrumb</nav>
        <h1 class="ez-page-header-name" data-icon="&#xe91f;">Header</h1>
    </header>
    <section class="extra-class ez-serverside-content">Server side content</section>
</div>

<ul data-name="notification">Notifications </ul>
```

On POST requests, it sends a `FormProcessingDoneResponse`, a variant of Symfony's
`RedirectResponse`.

## Integration into the hybrid app

Thanks to this structured HTML, PJAX can easily be transformed into an hybrid app response.
The title and response body (as well as notifications) can be parsed using DOM, and used as
the `mainContent` of an hybrid app response.

A [`PjaxResponseSubscriber`][pjax-response-subscriber-spec], subscribed to `KernelEvents::RESPONSE`.

On redirects, it will change the Response to a standard redirection.

On an actual Response, it will map it, using the [`PjaxResponseHybridViewMapper`][pjax-response-hybrid-view-mapper-spec], 
to a `PjaxView`, a variant of `HybridUiView`.

A `PjaxViewRenderer` will render `PjaxView` objects to a Response, so that it can be 
used by the `AppRenderer`.

[pjax-response-subscriber-spec]: ../../../spec/Hybrid/EventSubscriber/PjaxResponseSubscriberSpec.php
[pjax-response-hybrid-view-mapper-spec]: ../../../spec/Hybrid/EventSubscriber/PjaxResponseSubscriberSpec.php

## Questions
- Should we include the breadcrumb ?
- `FormProcessingDoneResponse` is transformed into a real redirection.
  Can we "hide" the POST and the redirection using the hybrid architecture ?
  On the Symfony side, we could easily get the redirect URL, and return the response
  as a JSON update directly instead of actually redirecting the browser. But can the frontend
  handle that ?

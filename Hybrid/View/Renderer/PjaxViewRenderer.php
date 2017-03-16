<?php

namespace EzSystems\PlatformUIBundle\Hybrid\View\Renderer;

use eZ\Publish\Core\MVC\Symfony\View\Renderer;
use eZ\Publish\Core\MVC\Symfony\View\View;
use EzSystems\PlatformUIBundle\Hybrid\View\PjaxView;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForControllerResultEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Renders an admin view to JSON.
 *
 * Unless the View has specific Hybrid UI handling, the View is rendered
 * as an `update`.
 */
class PjaxViewRenderer implements Renderer
{
    public function render(View $view)
    {
        if (!$view instanceof PjaxView) {
            throw new \Exception("Given argument is not a PjaxView");
        }

        return new Response($view->getContent());
    }
}

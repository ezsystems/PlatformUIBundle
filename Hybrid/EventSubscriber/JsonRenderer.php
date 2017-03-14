<?php

namespace EzSystems\PlatformUIBundle\Hybrid\EventSubscriber;

use eZ\Publish\Core\MVC\Symfony\View\Renderer;
use eZ\Publish\Core\MVC\Symfony\View\View;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;
use Symfony\Component\HttpKernel\Event\GetResponseForControllerResultEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Renders an admin view to JSON.
 *
 * Unless the View has specific Hybrid UI handling, the View is rendered
 * as an `update`.
 */
class JsonRenderer implements EventSubscriberInterface
{
    /**
     * @var \eZ\Publish\Core\MVC\Symfony\View\Renderer
     */
    private $templateRenderer;

    /**
     * @var \Symfony\Component\HttpFoundation\RequestMatcherInterface
     */
    private $adminRequestMatcher;

    public function __construct(
        Renderer $templateRenderer,
        RequestMatcherInterface $adminRequestMatcher
    ) {
        $this->adminRequestMatcher = $adminRequestMatcher;
    }

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::VIEW => [
                ['render', 5]
            ]
        ];
    }

    public function render(GetResponseForControllerResultEvent $event)
    {
        $request = $event->getRequest();

        if (!$this->adminRequestMatcher->matches($request)) {
            return;
        }

        if (!($view = $event->getControllerResult()) instanceof View) {
            return;
        }

        if ($request->attributes->get('_format') !== 'json') {
            return;
        }

        $data = [
            'update' => $this->templateRenderer->render($view),
        ];

        $event->setControllerResult(new JsonResponse($data));
    }
}

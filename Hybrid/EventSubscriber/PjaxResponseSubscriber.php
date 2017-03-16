<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Hybrid\EventSubscriber;

use eZ\Bundle\EzPublishCoreBundle\EventListener\ViewRendererListener;
use EzSystems\PlatformUIBundle\Http\PjaxRequestMatcher;
use EzSystems\PlatformUIBundle\Hybrid\Mapper\PjaxResponseHybridViewMapper;
use EzSystems\PlatformUIBundle\Hybrid\View\Renderer\PjaxViewRenderer;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Catches admin PJAX requests, and maps them to Hybrid views.
 */
class PjaxResponseSubscriber implements EventSubscriberInterface
{
    /**
     * @var \Symfony\Component\HttpFoundation\RequestMatcherInterface
     */
    private $adminRequestMatcher;

    /**
     * @var \Symfony\Component\HttpFoundation\RequestMatcherInterface
     */
    private $pjaxRequestMatcher;
    /**
     * @var \EzSystems\PlatformUIBundle\Hybrid\Mapper\PjaxResponseHybridViewMapper
     */
    private $responseMapper;
    /**
     * @var \EzSystems\PlatformUIBundle\Hybrid\View\Renderer\PjaxViewRenderer
     */
    private $viewRenderer;

    public static function getSubscribedEvents()
    {
        return [KernelEvents::RESPONSE => ['mapPjaxResponseToHybridResponse', 10]];
    }

    public function __construct(
        RequestMatcherInterface $adminRequestMatcher,
        RequestMatcherInterface $pjaxRequestMatcher,
        PjaxResponseHybridViewMapper $responseMapper,
        PjaxViewRenderer $viewRenderer
    ) {
        $this->adminRequestMatcher = $adminRequestMatcher;
        $this->pjaxRequestMatcher = $pjaxRequestMatcher;
        $this->responseMapper = $responseMapper;
        $this->viewRenderer = $viewRenderer;
    }

    public function mapPjaxResponseToHybridResponse(FilterResponseEvent $event)
    {
        $request = $event->getRequest();

        if (
            $event->getRequestType() !== HttpKernelInterface::MASTER_REQUEST ||
            !$this->adminRequestMatcher->matches($request) ||
            !$this->pjaxRequestMatcher->matches($request)
        ) {
            return;
        }

        $response = $event->getResponse();
        if ($response instanceof RedirectResponse) {
            $event->setResponse(
                new RedirectResponse($response->headers->get('PJAX-Location'))
            );
            $event->stopPropagation();
            return;
        }

        $pjaxView = $this->responseMapper->mapResponse($response);

        $request->attributes->set('view', $pjaxView);
        $event->setResponse($this->viewRenderer->render($pjaxView));
    }
}

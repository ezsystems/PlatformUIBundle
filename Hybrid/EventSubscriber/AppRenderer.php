<?php

namespace EzSystems\PlatformUIBundle\Hybrid\EventSubscriber;

use eZ\Publish\Core\MVC\Symfony\View\View;
use EzSystems\PlatformUIBundle\Hybrid\View\ToolbarsView;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Templating\EngineInterface;

class AppRenderer implements EventSubscriberInterface
{
    /**
     * @var \Symfony\Component\Templating\EngineInterface
     */
    private $templateEngine;

    /**
     * @var \Symfony\Component\HttpKernel\HttpKernelInterface
     */
    private $kernel;
    /**
     * @var \Symfony\Component\HttpFoundation\RequestMatcherInterface
     */
    private $adminRequestMatcher;

    public function __construct(
        EngineInterface $templateEngine,
        KernelInterface $kernel,
        RequestMatcherInterface $adminRequestMatcher
    )
    {
        $this->templateEngine = $templateEngine;
        $this->kernel = $kernel;
        $this->adminRequestMatcher = $adminRequestMatcher;
    }

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::RESPONSE => [
                ['renderApp', 5]
            ]
        ];
    }

    public function renderApp(FilterResponseEvent $event)
    {
        if ($event->getRequestType() !== HttpKernelInterface::MASTER_REQUEST) {
            return;
        }

        $request = $event->getRequest();

        if (!$this->adminRequestMatcher->matches($request)) {
            return;
        }

        if (!($view = $event->getRequest()->attributes->get('view')) instanceof View) {
            return;
        }

        $navigationHub = $this->getNavigationHub($request);

        // @todo it's an array of toolbars, man
        $toolbar = $this->getToolbars($request, $view);
        $content = $event->getResponse()->getContent();

        $event->setResponse(
            new Response(
                $this->templateEngine->render(
                    '@eZPlatformUI/Components/app.html.twig',
                    [
                        'navigationHub' => $navigationHub,
                        'toolbars' => $toolbar,
                        'mainContent' => $content,
                    ]
                )
            )
        );
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return string
     */
    private function getNavigationHub(Request $request)
    {
        $subRequest = $request->duplicate(
            [],
            null,
            [
                '_controller' => 'ezsystems.platformui.hybrid.controller.navigation_hub:showNavigationHubAction',
            ]
        );

        return $this->kernel
            ->handle($subRequest, HttpKernelInterface::SUB_REQUEST)
            ->getContent();
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return string
     */
    private function getToolbars(Request $request, View $view)
    {
        // @todo this will have to be serialized in order to work with ESIs
        $visibilities = [];
        if ($view instanceof ToolbarsView) {
            $visibilities = $view->getToolbarsConfiguration();
        }

        $subRequest = $request->duplicate(
            [],
            null,
            [
                '_controller' => 'ezsystems.platformui.hybrid.controller.toolbars:showToolbarsAction',
                'visibilities' => $visibilities,
            ]
        );

        return $this->kernel->handle(
            $subRequest,
            HttpKernelInterface::SUB_REQUEST
        )->getContent();
    }
}

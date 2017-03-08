<?php

/**
 * File containing the DashboardController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;
use eZ\Publish\API\Repository\Values\Content\Content;
use eZ\Publish\API\Repository\Values\Content\Location;
use EzSystems\PlatformUIBundle\Components\App;

class ProtoController extends Controller
{
    protected $app;

    public function __construct(App $app, RouterInterface $router)
    {
        $this->app = $app;
        $this->router = $router;
    }

    public function dashboardAction(Request $request)
    {
        $appConfig = $request->attributes->get('appConfig');
        $appConfig['title'] = 'Dashboard';
        $this->app->setConfig($appConfig);

        if ($request->headers->has('x-ajax-update')) {
            return JsonResponse::create($this->app);
        }

        return $this->render('eZPlatformUIBundle:PlatformUI:proto.html.twig', ['platformUIApp' => $this->app]);
    }

    public function locationViewAction(Request $request, Location $location)
    {
        $appConfig = $request->attributes->get('appConfig');
        $appConfig['title'] = $location->contentInfo->name;
        $appConfig['mainContent']['parameters']['location'] = $location;
        $this->app->setConfig($appConfig);

        if ($request->headers->has('x-ajax-update')) {
            return JsonResponse::create($this->app);
        }

        return $this->render('eZPlatformUIBundle:PlatformUI:proto.html.twig', ['platformUIApp' => $this->app]);
    }

    public function draftCreateAction(Request $request, Content $content)
    {
        $controller = $this->get('ez_content_edit');
        $controller->setPagelayout('EzPublishCoreBundle::viewbase_layout.html.twig');
        $response = $controller->createContentDraftAction($content->id, null, null, null, $request);
        if ($response instanceof RedirectResponse) {
            $parameters = $this->router->match($response->getTargetUrl());
            unset($parameters['_controller'], $parameters['_route']);
            $response->setTargetUrl(
                $this->router->generate('proto_content_edit', $parameters)
            );
            return $response;
        }
        $appConfig = $request->attributes->get('appConfig');
        $appConfig['title'] = '';
        $appConfig['mainContent']['result'] = $response->getContent();
        $this->app->setConfig($appConfig);

        if ($request->headers->has('x-ajax-update')) {
            return JsonResponse::create($this->app);
        }

        return $this->render('eZPlatformUIBundle:PlatformUI:proto.html.twig', ['platformUIApp' => $this->app]);
    }

    public function editContentDraftAction(Request $request, Content $content, $versionNo, $language)
    {
        $controller = $this->get('ez_content_edit');
        $controller->setPagelayout('EzPublishCoreBundle::viewbase_layout.html.twig');
        $response = $controller->editContentDraftAction($content->id, $versionNo, $request, $language);
        if ($response instanceof RedirectResponse) {
            $response->setTargetUrl(
                $this->router->generate(
                    'proto_viewLocation',
                    ['locationId' => $content->contentInfo->mainLocationId]
                )
            );
            return $response;
        }
        $appConfig = $request->attributes->get('appConfig');
        $appConfig['title'] = '';
        $appConfig['mainContent']['result'] = $response->getContent();
        $this->app->setConfig($appConfig);

        if ($request->headers->has('x-ajax-update')) {
            return JsonResponse::create($this->app);
        }

        return $this->render('eZPlatformUIBundle:PlatformUI:proto.html.twig', ['platformUIApp' => $this->app]);
    }
}

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
use eZ\Publish\API\Repository\Values\Content\Location;
use EzSystems\PlatformUIBundle\Components\App;

class ProtoController extends Controller
{
    protected $app;

    public function __construct(App $app)
    {
        $this->app = $app;
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
}

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
use EzSystems\PlatformUIBundle\Components\Component;
use eZ\Publish\API\Repository\Values\Content\Location;

class ProtoController extends Controller
{
    protected $discoveryBar;

    public function __construct(Component $discoveryBar)
    {
        $this->discoveryBar = $discoveryBar;
    }

    public function dashboardAction(Request $request)
    {
        $parameters = [
            'title' => 'Dashboard',
            'discoveryBar' => $this->discoveryBar,
            'content' => $this->renderView(
                'eZPlatformUIBundle:PlatformUI:dashboard.html.twig'
            ),
        ];
        if ($request->headers->has('x-ajax-update')) {
            return JsonResponse::create($parameters);
        }

        return $this->render('eZPlatformUIBundle:PlatformUI:proto.html.twig', $parameters);
    }

    public function locationViewAction(Request $request, Location $location)
    {
        $parameters = [
            'title' => $location->contentInfo->name,
            'discoveryBar' => $this->discoveryBar,
            'content' => $this->renderView(
                'eZPlatformUIBundle:PlatformUI:locationview.html.twig',
                ['location' => $location]
            ),
        ];
        if ($request->headers->has('x-ajax-update')) {
            return JsonResponse::create($parameters);
        }

        return $this->render('eZPlatformUIBundle:PlatformUI:proto.html.twig', $parameters);
    }
}

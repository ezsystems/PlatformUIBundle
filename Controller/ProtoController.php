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
use EzSystems\PlatformUIBundle\Components\Tree;
use EzSystems\PlatformUIBundle\Components\Search;
use EzSystems\PlatformUIBundle\Components\Trash;
use eZ\Publish\API\Repository\Values\Content\Location;

class ProtoController extends Controller
{
    public function dashboardAction(Request $request)
    {
        // should be injected or retrieved using a service
        // actionBarComponents should probably be replaced by an object/service
        // representing the discovery bar.
        $actionBarComponents = [
            new Search(),
            new Tree($request),
            new Trash(),
        ];
        $parameters = [
            'title' => 'Dashboard',
            'actionBarComponents' => $actionBarComponents,
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
        $actionBarComponents = [
            new Search(),
            new Tree($request),
            new Trash(),
        ];
        $parameters = [
            'title' => $location->contentInfo->name,
            'actionBarComponents' => $actionBarComponents,
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
